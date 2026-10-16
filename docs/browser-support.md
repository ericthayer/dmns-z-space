# Browser support and verification

Source research: October 15, 2026. Local verification: October 16, 2026, America/Denver. Version support below is documentation evidence; the local results are separate. See `engine-verification.json` for exact feature probes.

## Documented capabilities

| Capability | Chromium | Safari | Firefox |
|---|---:|---:|---:|
| Same-document VT, callback overload | 111+ | 18+ | 144+ |
| Types/options and active type selector | 125+ | 18.2+ | 147+ |
| `view-transition-class` | 125+ | 18.2+ | 144+ |
| Cross-document VT and pageswap/pagereveal VT | 126+ | 18.2+ | Unsupported |
| Scroll/view animation timelines | 115+ | 26+ | Static fallback in the locally tested 157 |

Primary sources: [Chrome cross-document lifecycle](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document), [Chrome same-document API](https://developer.chrome.com/docs/web-platform/view-transitions/same-document), [Safari 18.2 release notes](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/), [Safari 26 release notes](https://webkit.org/blog/17333/webkit-features-for-safari-26-0/), [Firefox 144 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/144), [Firefox 147 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/147), and [MDN compatibility data](https://github.com/mdn/browser-compat-data).

MDN's research snapshot listed Firefox 159 scroll timelines as upcoming. That is not used as evidence of installed or stable support. Global `navigation.activation` has a different support history from the transition events and is deliberately not required.

## Locally exercised engines

| Engine | Version | Same-document/types/classes | Cross-document | Scroll timelines | Observed Directory → hall |
|---|---|---|---|---|---|
| Playwright Chromium | 156.0.8078.4 | yes | yes | yes | `enter` |
| Playwright Firefox | 157.0 | yes | no | no | ordinary navigation + entrance fade |
| Playwright WebKit | 27.2 | yes | yes | yes | `enter` |

These are isolated, headless Playwright engines, not the user's everyday browser profile. Playwright WebKit is not the branded Safari application. On macOS its link-navigation walkthrough uses native Option+Tab; Chromium and Firefox use Tab. `npm run check` runs the same route, keyboard, responsive, preference and accessibility suite in all three engines.

The HTML without application JavaScript is loaded in a context with `javaScriptEnabled:false` and checked for visible semantic content. Axe itself requires JavaScript and timers, so a second context loads the identical server-rendered DOM with every application `.js` request blocked; the test compares `<main>` byte-for-byte before running axe. This audits the unenhanced HTML without allowing the app to upgrade it. There are no iframes or third-party scripts.

## Fallback ladder

- Native feature probes use `startViewTransition`, `view-transition-class`, the active-type selector, `onpageswap`/`onpagereveal`, `CSSViewTransitionRule`, and `animation-timeline: view()`; no user-agent sniffing.
- No cross-document support: real anchors load normally and `main` gets a 300ms opacity entrance. Same-document changes still use the available API.
- Old same-document implementations without the types overload: use the callback overload.
- No VT: direct updates and ordinary navigation. No scroll timelines: static, visible dioramas.
- Stillness/OS reduced motion: direct same-document updates and only a 150ms cross-document opacity fade. Tests inspect keyframes for transform/filter motion.
- Storage denial: guarded reads/writes preserve usable defaults and navigation.
- With JavaScript disabled: native links, floor sections, object `<details>`, live-service outbound links and museum copy remain accessible. Enhancement controls remain hidden or disabled.

## Verification boundaries

A physical Moto G Power, actual 4G network, branded Safari, screen-reader speech output and field INP data were not available. Lighthouse reports use an explicitly recorded mobile simulation. Automated axe coverage and keyboard tests support the accessibility target but do not certify WCAG conformance. Full motion footage is provided in `keyboard-walkthrough.webm`.
