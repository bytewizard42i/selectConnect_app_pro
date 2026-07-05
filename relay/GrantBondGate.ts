// ===== GrantBondGate: the relay's "grant + bond TOGETHER" enforcement =====
//
// WHAT THIS MODULE IS
//   The single decision point the SelectConnect relay MUST pass every message
//   through before delivering it. It enforces BOTH halves of the July 2026
//   architecture at once:
//
//     1. GRANT  (contact_grant.compact) — the sender holds a LIVE contact
//        grant for this card: not revoked, card still active, locked to this
//        exact sender, not expired.
//     2. BOND   (abuse_escrow.compact)  — IF the card's policy demands it,
//        the sender has a LIVE bond big enough for their reputation
//        (minimum + repeat-offender surcharge, mirroring post_bond's math).
//
//   Compact contracts cannot call each other yet (v1 compiler), so this gate
//   is the glue the contracts' own comments promise ("the relay is the glue",
//   contact_grant.compact line ~48).
//
// WHY IT IS DEPENDENCY-FREE
//   The old RelayService.ts (2025, kept for reference) imported an SDK that
//   never shipped and called circuits that no longer exist. This module
//   instead depends only on two tiny read-interfaces YOU implement against
//   whatever is real in your deployment (indexer queries, ledger state from
//   @midnight-ntwrk/midnight-js-contracts, or plain fixtures in tests).
//   That keeps the enforcement logic testable today and portable tomorrow.
//
// HOW TO READ THE NAMES
//   Every field below matches an `export ledger` declaration in the v2
//   contracts one-for-one (same snake_case name), so you can diff this file
//   against the .compact files and see exactly which on-chain fact each
//   check consumes.

// ---------------------------------------------------------------------------
// READ-INTERFACES (implement against your indexer / providers / test fixtures)
// ---------------------------------------------------------------------------

/** Hex-encoded Bytes<32> as it comes back from ledger state. */
export type Hex32 = string;

/**
 * Read-only view of contact_grant.compact's public ledger.
 * One method per ledger entry the gate needs — nothing more.
 */
export interface ContactGrantStateReader {
  /** `active_contact_grants.member(grantId)` — false means revoked/unknown. */
  isGrantActive(grantId: Hex32): Promise<boolean>;
  /** `grant_card.lookup(grantId)` — which card this grant belongs to. */
  getGrantCard(grantId: Hex32): Promise<Hex32>;
  /** `grant_recipient.lookup(grantId)` — the ONE key commitment it is locked to. */
  getGrantRecipient(grantId: Hex32): Promise<Hex32>;
  /** `grant_expiry.lookup(grantId)` — epoch after which the link is dead. */
  getGrantExpiryEpoch(grantId: Hex32): Promise<bigint>;
  /** `active_cards.member(cardId)` — deactivating a card kills all its grants. */
  isCardActive(cardId: Hex32): Promise<boolean>;
  /** `card_bond_required.lookup(cardId)` — the policy flag this gate enforces. */
  isBondRequired(cardId: Hex32): Promise<boolean>;
  /** `epoch.read()` — the contract's keeper-driven clock (NOT wall time). */
  getCurrentEpoch(): Promise<bigint>;
}

/**
 * Read-only view of abuse_escrow.compact's public ledger.
 */
export interface AbuseEscrowStateReader {
  /** `bonds.member(bondId)` — does this bond exist at all? */
  bondExists(bondId: Hex32): Promise<boolean>;
  /** `bond_card.lookup(bondId)` — the card the bond targets. */
  getBondCard(bondId: Hex32): Promise<Hex32>;
  /** `bond_sender.lookup(bondId)` — key commitment derived in-circuit (v2 fix). */
  getBondSender(bondId: Hex32): Promise<Hex32>;
  /** `bond_amount.lookup(bondId)` — what the sender actually posted. */
  getBondAmount(bondId: Hex32): Promise<bigint>;
  /** `bond_expiry_epoch.lookup(bondId)` — after this, the bond may be refunded. */
  getBondExpiryEpoch(bondId: Hex32): Promise<bigint>;
  /** `bond_refunded.lookup(bondId)` / `bond_slashed.lookup(bondId)` flags. */
  isBondRefunded(bondId: Hex32): Promise<boolean>;
  isBondSlashed(bondId: Hex32): Promise<boolean>;
  /** `card_min_bond_amount.lookup(cardId)` — escrow-side bond policy. */
  getCardMinBondAmount(cardId: Hex32): Promise<bigint>;
  /** `card_repeat_offender_surcharge.lookup(cardId)` — 0 disables pricing. */
  getCardRepeatOffenderSurcharge(cardId: Hex32): Promise<bigint>;
  /** `sender_slashed_count` with the same missing-key = 0 rule as the circuit. */
  getSenderSlashedCount(senderCommitment: Hex32): Promise<bigint>;
  /** The escrow contract's own `epoch.read()` (separate clock, same pattern). */
  getCurrentEpoch(): Promise<bigint>;
}

// ---------------------------------------------------------------------------
// VERDICTS — every rejection names the exact on-chain fact that failed
// ---------------------------------------------------------------------------

/** Machine-readable rejection reasons (stable strings, safe to log/alert on). */
export type GateRejection =
  | 'GRANT_REVOKED_OR_UNKNOWN'   // active_contact_grants lacks this id
  | 'GRANT_WRONG_CARD'           // grant exists but is for another card
  | 'GRANT_WRONG_SENDER'         // counterparty lock: not this sender's link
  | 'GRANT_EXPIRED'              // epoch >= grant_expiry
  | 'CARD_DEACTIVATED'           // active_cards lacks this card (cascade kill)
  | 'BOND_MISSING'               // card requires a bond, none supplied/found
  | 'BOND_WRONG_CARD'            // bond exists but targets another card
  | 'BOND_WRONG_SENDER'          // bond was posted by someone else
  | 'BOND_NOT_LIVE'              // already refunded or slashed
  | 'BOND_EXPIRED'               // escrow epoch >= bond_expiry_epoch
  | 'BOND_UNDERFUNDED';          // amount < min + slashes * surcharge

export interface GateVerdict {
  /** True only when EVERY applicable check passed. Deliver iff true. */
  allowed: boolean;
  /** Empty when allowed; otherwise every check that failed (not just the first —
   *  a sender fixing their situation deserves the full list in one round trip). */
  rejections: GateRejection[];
  /** Echo of what was checked, for structured logs / receipts. */
  checked: {
    grantId: Hex32;
    cardId: Hex32;
    senderCommitment: Hex32;
    bondRequired: boolean;
    bondId?: Hex32;
    /** The exact amount post_bond would demand from this sender right now. */
    requiredBondAmount?: bigint;
  };
}

// ---------------------------------------------------------------------------
// THE GATE
// ---------------------------------------------------------------------------

export interface DeliveryRequest {
  /** The contact grant the sender claims to hold (id from their wallet). */
  grantId: Hex32;
  /** The card being contacted. */
  cardId: Hex32;
  /** The sender's key commitment — H("midnight:mm:pk:", sk), same derivation
   *  as every DIDz engine contract. The relay learns it from the sender's
   *  authenticated session; it must equal BOTH grant_recipient and
   *  bond_sender for the request to pass. */
  senderCommitment: Hex32;
  /** The bond backing this contact, if the sender has one. Optional because
   *  bond-free cards exist; REQUIRED (checked) when the card demands bonds. */
  bondId?: Hex32;
}

export class GrantBondGate {
  constructor(
    private readonly grants: ContactGrantStateReader,
    private readonly escrow: AbuseEscrowStateReader
  ) {}

  /**
   * The one call the relay makes per message. Runs the grant rulebook
   * (mirroring contact_grant's check_reveal_allowed) and, when the card's
   * policy demands it, the bond rulebook (mirroring abuse_escrow's
   * check_bond_live + post_bond pricing) — and only says yes when BOTH pass.
   */
  async checkDelivery(req: DeliveryRequest): Promise<GateVerdict> {
    const rejections: GateRejection[] = [];

    // ---- HALF 1: the GRANT rulebook (contact_grant.compact) ----
    // Order mirrors check_reveal_allowed so on-chain and relay agree.

    const grantActive = await this.grants.isGrantActive(req.grantId);
    if (!grantActive) {
      rejections.push('GRANT_REVOKED_OR_UNKNOWN');
    } else {
      // Lookups only make sense for grants that exist (Map.lookup on a
      // missing key aborts in-circuit; here it would just be garbage).
      const grantCard = await this.grants.getGrantCard(req.grantId);
      if (grantCard !== req.cardId) rejections.push('GRANT_WRONG_CARD');

      const recipient = await this.grants.getGrantRecipient(req.grantId);
      if (recipient !== req.senderCommitment) rejections.push('GRANT_WRONG_SENDER');

      const grantEpoch = await this.grants.getCurrentEpoch();
      const expiry = await this.grants.getGrantExpiryEpoch(req.grantId);
      if (grantEpoch >= expiry) rejections.push('GRANT_EXPIRED');
    }

    const cardActive = await this.grants.isCardActive(req.cardId);
    if (!cardActive) rejections.push('CARD_DEACTIVATED');

    // ---- HALF 2: the BOND rulebook (abuse_escrow.compact), if demanded ----

    const bondRequired = cardActive
      ? await this.grants.isBondRequired(req.cardId)
      : false; // a dead card is already rejected; don't pile on bond noise

    let requiredBondAmount: bigint | undefined;

    if (bondRequired) {
      if (!req.bondId) {
        rejections.push('BOND_MISSING');
      } else if (!(await this.escrow.bondExists(req.bondId))) {
        rejections.push('BOND_MISSING');
      } else {
        const bondCard = await this.escrow.getBondCard(req.bondId);
        if (bondCard !== req.cardId) rejections.push('BOND_WRONG_CARD');

        const bondSender = await this.escrow.getBondSender(req.bondId);
        if (bondSender !== req.senderCommitment) rejections.push('BOND_WRONG_SENDER');

        // "Live" exactly as check_bond_live defines it: neither flag set.
        const refunded = await this.escrow.isBondRefunded(req.bondId);
        const slashed = await this.escrow.isBondSlashed(req.bondId);
        if (refunded || slashed) rejections.push('BOND_NOT_LIVE');

        // Expiry uses the ESCROW contract's epoch (separate keeper clock).
        const escrowEpoch = await this.escrow.getCurrentEpoch();
        const bondExpiry = await this.escrow.getBondExpiryEpoch(req.bondId);
        if (escrowEpoch >= bondExpiry) rejections.push('BOND_EXPIRED');

        // Dynamic pricing, IDENTICAL math to post_bond:
        //   required = card minimum + prior slashes * card surcharge.
        // Re-checked at delivery time so a sender slashed AFTER posting a
        // small bond cannot keep messaging on yesterday's cheap price.
        const minBond = await this.escrow.getCardMinBondAmount(req.cardId);
        const surcharge = await this.escrow.getCardRepeatOffenderSurcharge(req.cardId);
        const slashes = await this.escrow.getSenderSlashedCount(req.senderCommitment);
        requiredBondAmount = minBond + slashes * surcharge;

        const posted = await this.escrow.getBondAmount(req.bondId);
        if (posted < requiredBondAmount) rejections.push('BOND_UNDERFUNDED');
      }
    }

    return {
      allowed: rejections.length === 0,
      rejections,
      checked: {
        grantId: req.grantId,
        cardId: req.cardId,
        senderCommitment: req.senderCommitment,
        bondRequired,
        bondId: req.bondId,
        requiredBondAmount,
      },
    };
  }
}
