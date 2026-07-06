# SelectConnect — Engine Reference

> Pointer to the shared Compact modules that SelectConnect imports.

## Source

**Repo**: `midnight-modules` (`/home/js/DIDzMonolith/midnight-modules`)
**Catalog**: `midnight-modules/docs/MODULES_CATALOG.md`

## Modules SelectConnect uses

| Module | Status | How SelectConnect uses it |
|--------|--------|---------------------------|
| `scoped-grant` | v2, compiled 0.31.1 | Contact sharing grants with per_action_cap + cumulative_cap |
| `commitment` | available | Contact card commitments (privacy-preserving) |
| `nullifier` | available | Anti-abuse: prevent double-claiming bonds |
| `merkle-membership` | available | Progressive reveal access control |

## Import pattern

```compact
import { scoped_grant_v2 } from "../midnight-modules/modules/scoped-grant/scoped_grant_v2";
```

## Status

SelectConnect v2 contracts (`contact_grant.compact`, `abuse_escrow.compact`) were
rebuilt on the engine with 3 security fixes. See `docs/DIDZ_ENGINE_INTEGRATION.md`.
