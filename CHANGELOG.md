# Changelog

## 0.1.0 — October 16, 2026

### Added

1. **Data and movement:** validated content JSON, route coordinates, Denver calendar date helpers and tested floor/depth/corridor precedence.
2. **Static museum:** 28 prerendered routes, semantic shell, typographic identity placeholder, local fonts and ordinary links that work without JavaScript.
3. **Cross-document movement:** enter/exit, lateral and floor choreographies, clicked doorway origins and persistent header/ticket/minimap layers.
4. **Shared objects:** temporary Directory-card/hero and exhibition-card/hero names, inverse browser-Back movement and cleanup after completion.
5. **Walking through halls:** feature-gated layered scroll timelines, radial lighting and wall labels, with fully visible static fallbacks.
6. **In-page changes:** native vitrine dialogs, URL-backed floor switching and exhibition/program filters with focus and announcements.
7. **Fallbacks:** Stillness persistence, OS motion preference, Daylight, storage guards, absent-API fallbacks, no-script content and date-bound dismissible notices.
8. **Verification and polish:** sealed renovation threshold, keyboard parity, generated contrast/budget reports, link checks, three-engine tests, Lighthouse audits and keyboard recording.

These entries record the delivered build order. The first inherited checkpoint had types/lint/unit/build passing; the complete `npm run check` gate was assembled and run during the verification pass, rather than retroactively claiming eight historical full-suite runs. Browser testing corrected the wordmark's accessible label, landmark names, 320px header overflow and selected-floor minimap state.
