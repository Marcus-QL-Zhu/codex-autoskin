# Banshee reconciliation performance

The renderer caches verified Banshee shell identities and control signatures.
An unchanged five-second watchdog does not remove the structural gate or read
geometry. Native measurement probes and transcript child updates do not schedule
a global scan. Sidebar updates, composer control replacement, native menus,
control state/glyph changes, resize, changed routes, disconnected/reparented
surfaces, or changed surface classes invalidate the cache. Sidebar status-dot
class/style changes are also checked by the watchdog.

Invalidation uses the existing full native-versus-themed parity verification.
Calling `window.__CODEX_DREAM_SKIN_STATE__.ensure()` explicitly still forces that
verification. Legacy Dream themes continue using the original full pass. No
CSS, theme tokens, SVG artwork, or animation keyframes change in this patch.

Metrics available on `window.__CODEX_DREAM_SKIN_STATE__.metrics` include
`globalScans`, `cachedPasses`, and `ignoredMutationBatches`. Compare metric deltas
over equal observation windows, not their lifetime totals.

Local verification on 2026-09-12 (Codex 26.901, 240Hz display, visible task,
15 seconds each, CPU profiler disabled):

| Metric | Before | After |
| --- | ---: | ---: |
| Global scans | 57 | 0 |
| Long tasks over 50ms | 57 | 0 |
| rAF interval p99 | 91.7ms | 8.4ms |
| Style recalculation time | 7.039s | 0.660s |

These are one-machine observations, not guaranteed frame rates or measurements
of GPU hardware utilization. Animation callbacks are not presented-frame counts.
Relevant UI changes still intentionally incur a verification pass.

Validation covers existing static/native-parity tests, mutation-filter
regressions, ignored live BODY measurement probes, native model-menu open/close,
main/auxiliary renderer verification, and before/after appearance inspection.
The legacy top-control probe may not find a target on newer Codex builds because
its fixed accessible-label list does not match the current header; use the live
model-menu check and general native-control hit-test verification instead.

Run the offline tests with:

```powershell
node --test --experimental-test-isolation=none tests/banshee-static.test.mjs tests/renderer-safety.test.mjs tests/reconcile-performance.test.mjs
node scripts/injector.mjs --check
```

For live health checks, use `scripts/verify-dream-skin.ps1`. Do not reload or
restart an active user's app merely to benchmark it. Keep the prior installed
engine snapshot available for rollback.
