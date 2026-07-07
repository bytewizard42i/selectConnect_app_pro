# DIF Relevance for selectConnect

> **Canonical source**: [`/home/js/DIDzMonolith/monolith-docs/DIF_KNOWLEDGE_BASE.md`](/home/js/DIDzMonolith/monolith-docs/DIF_KNOWLEDGE_BASE.md)
>
> This file is a short pointer. The deep content (specs, ecosystem, integration patterns, anti-patterns) lives in the canonical knowledge base. Refresh this file only when selectConnect's DIF needs materially change.

## Why DIF matters for selectConnect

selectConnect progressive disclosure model is the exact use case Presentation Exchange was designed for. Each disclosure step maps to a PresentationDefinition plus a PresentationSubmission. This is the strongest direct alignment in the entire DIDzMonolith family.

## DIF specs to adopt

- **Presentation Exchange**: native data format for the progressive reveal protocol
- **WACI-DIDComm**: wallet-to-counterparty credential flow during reveal steps
- **BBS+ Signatures**: selective disclosure within a single credential reveal step
- **DIDComm v2**: secure channel between selectConnect users
- **Credential Manifest**: when a reveal step requires the counterparty to also provide a credential

## Integration patterns from the canonical doc

- Pattern B (Presentation Exchange for credential proofs), direct fit
- Pattern C (DIDComm v2 for messaging)
- Pattern E (BBS+ for selective disclosure)

## Concrete next steps

1. Map selectConnect reveal steps onto Presentation Exchange data shapes (high-leverage refactor).
2. Use BBS+ for credentials that span multiple reveal steps.
3. Adopt WACI-DIDComm for the mobile wallet flow.
4. Consider contributing back to the Presentation Exchange spec since selectConnect is a non-trivial real-world implementation.

## Last refreshed

May 24, 2026 from DIF homepage and GitHub org listing.
