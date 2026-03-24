# SelectConnect Contract Audit

**Date**: March 24, 2026  
**File**: `contracts/SelectConnectProtocol.compact` (987 lines, 22 circuits)  
**Auditor**: Penny 🎀  
**Reference**: Midnight Compact syntax reference v0.16–0.18

---

## Summary

The contract has solid architecture and logic, but contains **multiple syntax issues** that will likely prevent compilation against the current Compact compiler. The issues fall into 5 categories:

| Category | Count | Severity | Description |
|----------|-------|----------|-------------|
| **API style mismatch** | ~80 occurrences | HIGH | Freestanding functions vs method syntax |
| **Counter access** | 5 occurrences | HIGH | `round` used as Field without `.read()` |
| **Missing/undocumented builtins** | 4 occurrences | HIGH | `toBytes()`, `%` operator, `getOrDefault()` |
| **Type name** | 1 occurrence | LOW | `Bool` vs `Boolean` |
| **MerkleTree limitations** | 2 occurrences | MEDIUM | `treeContains()` not available in circuits |

---

## Issue 1: Map/Set API — Freestanding vs Method Syntax (HIGH)

The contract uses **freestanding function syntax** throughout. The current Compact syntax reference documents **method syntax** on ADT types.

### What the contract does:
```compact
// Map operations
let value = get(card_states, cardId);              // ❌
insert(card_states, cardId, CardState.ACTIVE);     // ❌
remove(card_states, cardId);                       // ❌

// Set operations
assert(!contains(cards, cardId), "...");           // ❌
insert(cards, cardId);                             // ❌

// Map existence check
if (contains(sender_reputation, senderCommit))     // ❌

// Default value lookup
let (...) = getOrDefault(sender_reputation, senderCommit, (...)); // ❌
```

### What it should be:
```compact
// Map operations
let value = card_states.lookup(cardId);            // ✅
card_states.insert(cardId, CardState.ACTIVE);      // ✅
card_states.remove(cardId);                        // ✅

// Set operations
assert(!cards.member(cardId), "...");              // ✅
cards.insert(cardId);                              // ✅

// Map existence check
if (sender_reputation.member(senderCommit))        // ✅

// Default value lookup (getOrDefault doesn't exist)
if (sender_reputation.member(senderCommit)) {      // ✅
    let (...) = sender_reputation.lookup(senderCommit);
} else {
    // use default values
}
```

### Affected lines (~80 occurrences):

**`contains()` → `.member()`**: Lines 317, 356, 413, 420, 495, 611, 676, 683, 690, 822, 873, 878, 897, 924, 950, 959, 970, 978

**`get()` → `.lookup()`**: Lines 262, 343, 372, 376, 397, 434, 446, 477, 522, 554, 587, 612, 628, 660, 677, 684, 690, 709, 724, 741, 763, 767, 789, 823, 874, 879, 897, 928, 936, 944, 951, 972, 980

**`insert()` → `.insert()`**: Lines 320–332, 359, 380, 411, 416, 423, 449, 474, 508–509, 543, 562, 608, 614, 616, 649, 672, 679, 686, 693, 714, 730, 745, 771, 804–811, 841–847, 852–858, 888–894, 899

**`remove()` → `.remove()`**: Lines 357, 377, 410, 414, 421, 447, 478, 542, 561, 613, 648, 671, 677, 685, 692, 713, 729, 744, 768, 851, 887, 898

**`getOrDefault()` → `.member()` + `.lookup()`**: Lines 272–274, 897

---

## Issue 2: Counter Used as Field Without `.read()` (HIGH)

The `round` ledger variable is a `Counter` type. When passed to functions expecting `Bytes<32>` or `Field`, it needs `.read()` to extract the value first.

### What the contract does:
```compact
export ledger round: Counter;

// Used directly as a function argument
const adminId = deriveAdminId(round, secret);       // ❌ round is Counter, not Field
```

### What it should be:
```compact
const adminId = deriveAdminId(round.read(), secret); // ✅
```

### Affected lines:
- Line 261: `deriveAdminId(round, secret)` in `requireCardAdmin()`
- Line 313: `deriveAdminId(round, secret)` in `createCard()`
- Line 501: `deriveRecipientId(round, recipientSec)` in `generateAccessLink()`
- Line 529: `deriveRecipientId(round, recipientSec)` in `accessNextLevel()`

Also, `deriveAdminId` and `deriveRecipientId` declare `round: Field` as a parameter (lines 205, 214), but the actual `round` is `Counter`. Need to pass `round.read()` which returns `Uint<64>`, then cast if needed.

---

## Issue 3: `toBytes()` Not a Builtin (HIGH)

Line 255 uses `toBytes(value)` which is not in the Compact builtin function list.

```compact
circuit toBytes32(value: Uint<64>): Bytes<32> {
    let bytes = toBytes(value);          // ❌ toBytes() doesn't exist
    return pad(32, bytes) as Bytes<32>;
}
```

### Fix:
```compact
circuit toBytes32(value: Uint<64>): Bytes<32> {
    return (value as Field) as Bytes<32>;  // ✅ Two-step cast: Uint → Field → Bytes
}
```

---

## Issue 4: Modulo `%` Operator Not Documented (HIGH)

Line 912 uses the modulo operator which is **not documented** in the Compact language reference. Only `+`, `-`, `*` are documented arithmetic operators.

```compact
let codeNum = (toUint64(combined) % 90000u64) + 10000u64;  // ❌ % may not exist
```

### Impact:
This affects `generateRouteCode()` which is used by `generatePrivacyRoute()` and `accessViaPrivacyRoute()`. Since privacy routing is cut from the MVP anyway, this only blocks the full contract.

### Possible fix:
Move the modulo computation to a witness function (off-chain), then verify the result in the circuit.

---

## Issue 5: `treeInsert()` and `treeContains()` (MEDIUM)

Line 474 uses `treeInsert(reveal_tree, levelCommit)` and line 539 uses `treeContains(reveal_tree, levelCommit)`.

Per the syntax reference:
- `tree.insert(leaf)` — **works** in circuits ✅
- `tree.root()` — **NOT available** in circuits ❌

The `treeContains()` function is not documented at all. MerkleTree membership proofs typically require:
1. A witness to provide the Merkle proof path
2. In-circuit verification by recomputing the root from the leaf + path

### Fix for `treeInsert`:
```compact
reveal_tree.insert(levelCommit);  // ✅ Method syntax
```

### Fix for `treeContains`:
This requires a design change. The membership proof must be done via a witness:
```compact
witness getMerkleProof(leaf: Bytes<32>): Vector<10, Bytes<32>>;
// Then verify the proof in-circuit by recomputing the root
```

---

## Issue 6: `Bool` vs `Boolean` (LOW)

Line 305 uses `Bool` type. The Compact reference uses `Boolean`.

```compact
requiresBond: Bool,    // ❌ Should be Boolean
```

### Fix:
```compact
requiresBond: Boolean, // ✅
```

---

## Issue 7: Enum Casting to Bytes (MEDIUM)

Line 908 casts an enum directly to `Bytes<32>`:
```compact
(privacyLevel as Bytes<32>)  // ❌ Enum → Bytes is not in the cast table
```

Per the reference, enum can cast to `Field` (variant index). To get to `Bytes<32>`:
```compact
(privacyLevel as Field) as Bytes<32>  // ✅ Two-step: Enum → Field → Bytes
```

---

## Issue 8: Arithmetic Result Casting (MEDIUM)

Several lines perform arithmetic without casting the result back to the expected type:

```compact
return (minBond * multiplier) / 100u64;  // Line 283 — division not documented
currentLevel + 1u8                       // Line 479 — result type may be bounded
```

Arithmetic results in Compact produce bounded types that may need explicit casting:
```compact
return ((minBond * multiplier) / 100u64) as Uint<64>;  // Explicit cast
(currentLevel + 1u8) as Uint<8>                        // Explicit cast
```

Note: Division `/` is also not documented in the arithmetic operators.

---

## Recommendation

Rather than fixing all ~80 occurrences in the 987-line contract, I recommend:

1. **Create a clean MVP contract** (`SelectConnectMVP.compact`) with 8 essential circuits using correct syntax — this is the standalone product's starting point
2. **Keep the full contract as-is** for reference and future expansion
3. **Compile the MVP** to verify it works
4. **Incrementally port** circuits from full → MVP as needed

The MVP contract is in `contracts/SelectConnectMVP.compact`.

---

*Audit by: Penny 🎀 · March 24, 2026*
