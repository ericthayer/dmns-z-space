# Verification record — October 16, 2026

The inherited source was preserved in Git before verification (`9599df3`). Corrections and deliverables were added on top of that checkpoint. No source files were discarded or replaced by a different implementation.

## Automated gate

`npm run check` passes:

- Strict TypeScript and ESLint.
- 11 unit tests: route precedence, all transition branches, Denver calendar boundaries, notice expiry, exhibition status, invalid content, route uniqueness and selected-floor coordinates.
- 28 static routes plus the 404 document; 1,035 local links, assets and fragment targets checked.
- 24 generated token-pair contrast checks in After Hours and Daylight.
- 108 Playwright checks across Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2.
- Every requested route loads with JavaScript disabled. Identical unenhanced HTML passes axe with zero violations in all three engines; see the audit method in `browser-support.md`.
- Keyboard walkthrough, native dialog Escape/focus restoration, browser Back, shared transition type handoff, lateral/floor precedence, sealed threshold, filters, notice dismissal, concept form, responsive layouts, reduced-motion/Stillness keyframes, absent same-document API and denied storage.
- Native modules: 8.39 KB gzip per page; CSS: 8.64 KB gzip per page. The build fails the 30/35 KB budgets.
- Lighthouse mobile simulated audits pass the configured 95/100/100/100 score thresholds, LCP ≤ 2.5s and CLS ≤ .05. Exact values are in `performance.json`; these are not physical-device or field results.

The 60-second keyboard-only recording is `keyboard-walkthrough.webm`. No pointer clicks are used in its walkthrough. Screenshots were inspected at desktop and mobile sizes. WebKit on macOS uses Option+Tab for native link navigation.

## Changes found by verification

Accessible wordmark spacing/name; unique landmark labels; a minimap landmark; a 320px header overflow; selected-floor HUD synchronization; virtual sealed-hall coordinate handling; and the minimap overlapping newly focused content. These corrections preserve the specified MPA, light-DOM Custom Elements and native navigation architecture.

## Open verification and content work

- Physical Moto G Power/4G measurement and field INP ≤ 200ms remain unmeasured. Lighthouse's TBT is a lab diagnostic, not an INP result.
- Branded Safari, screen-reader speech output and a human WCAG 2.2 AA audit remain manual checks.
- Collection photography/object labels, event details and all visible `TODO: confirm with DMNS` content remain pending as requested for missing source material.
- The approved full land acknowledgment remains a marked placeholder with a direct link to DMNS's live footer. It has not been replaced with invented or paraphrased text.

The concept is packaged for Netlify. No public deployment, commerce integration or real newsletter submission was performed.
