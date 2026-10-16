# After Hours motion specification

Implemented and verified on October 16, 2026. All choreography lives in `src/styles/transitions.css`; scroll-linked motion lives in `src/styles/scroll.css`. JavaScript selects types and participants, then CSS animates. There is no client router.

| Type | Outgoing root | Incoming root | Duration | Easing | Stillness / OS reduced motion |
|---|---|---|---:|---|---|
| `enter` | scale 1 → 1.35, opacity 1 → 0, blur 0 → 6px | scale .82 → 1, opacity 0 → 1, brightness .4 → 1 | 720ms | cubic-bezier(.2,.7,.1,1) | 150ms opacity crossfade |
| `exit` | scale 1 → .82, brightness 1 → .4, opacity 1 → 0 | scale 1.2 → 1, opacity 0 → 1 | 600ms | same | 150ms opacity crossfade |
| `lateral-r` | translateX 0 → −30vw, rotateY 0 → −8°, fade out | translateX +30vw → 0, rotateY +8° → 0, fade in | 640ms | same | 150ms opacity crossfade |
| `lateral-l` | translateX 0 → +30vw, rotateY 0 → +8°, fade out | translateX −30vw → 0, rotateY −8° → 0, fade in | 640ms | same | 150ms opacity crossfade |
| `ascend` | translateY 0 → −40vh, fade out | translateY +40vh → 0, fade in | 700ms | same | 150ms opacity crossfade |
| `descend` | translateY 0 → +40vh, fade out | translateY −40vh → 0, fade in | 700ms | same | 150ms opacity crossfade |
| `reload` | 150ms fade / unchanged URL normally does not transition | 150ms fade | 150ms | linear / UA crossfade | 150ms opacity crossfade |
| Sealed threshold `enter` | scale 1 → 1.06, fade out | scale .96 → 1, opacity .4 → 1 | 360ms | same | 150ms opacity crossfade |
| Vitrine dialog | dynamically named thumbnail → dialog plate | inverse on close | 720ms shared element + enter/exit root | same | immediate state update; native dialog focus |
| Floor selector | `ascend` or `descend` root | floor content replaces in place | 700ms | same | immediate update |
| Filters | dynamically named persistent entries reflow; leaving entries fade | arriving entries fade | 720ms geometry, 300ms opacity | same / ease | immediate update |

The floor-first pure resolver is authoritative. Floor delta wins, then depth delta, then corridor x delta. Equal position is `reload`. Unit tests cover every branch and precedence. About and Support opt out of floor/lateral theatrics and use depth enter/exit or a short fade.

## Coordinate decisions

- `/halls/` starts on F1. A selected floor is represented by `/halls/?floor=3`, for example. This becomes the Directory's effective coordinate, so Floor 3 Directory → Prehistoric Journey is `enter`, and browser Back is `exit`. The selected floor is restored from the URL without session-specific route data.
- Space Odyssey → Prehistoric Journey is `ascend`. Prehistoric Journey → Egyptian Mummies is `lateral-l`. A hall above F1 → Atrium is `descend`, following the required precedence even though the brief describes all Atrium returns as `exit`.
- Gems and Minerals' physical floor is unconfirmed. The Directory shows it outside the numbered floor panels. Its query floor is a **virtual threshold** inherited from the selected floor, allowing a short `enter` without claiming a museum location. The page and minimap explicitly say its floor is unconfirmed.
- Wildlife Halls has F2 and F3 routes, joined by ordinary stair links.

## Participants and lifecycle

The full-width sticky header, ticket CTA and pinned minimap use persistent names. Their old snapshots are hidden and their new snapshots remain still. Stair rails are a separate decorative layer moving 80vh, twice the floor movement.

Only `pageswap` / `pagereveal` assign hall image/title names. The outgoing handler reads `event.activation.entry.url`, resolves positions and saves a guarded, destination-keyed session handoff. Both handlers add the same type. The clicked anchor's center supplies `--vt-origin-x/y`; keyboard activation uses the same anchor geometry. Native Back uses an inverse type and finds the matching Directory card. Both documents clear temporary names after `finished`, including rejected/aborted snapshots. Handoffs expire after 15 seconds.

The head module uses `blocking="render"` so `pagereveal` is installed before rendering. Detail pages also use `rel="expect"` for `#hall-hero`. Link activation remains browser navigation. Clicking another link skips an active transition. Snapshot pseudo-elements do not intercept pointer events.

## Scroll and safety

Feature-gated `view()` timelines apply brightness and scale .94 → 1 to the hero, move a warm radial spotlight, translate the diorama backdrop by 45px, translate the specimen plate by 48px, and bring wall labels from scale .94 / opacity .6 to full size. The animation shorthand precedes `animation-timeline`. Static content is fully visible without these enhancements.

The arrival headline fades from .55 opacity to 1 over 1400ms. Location dots breathe once every 3 seconds. There is no strobing, audio, roll, camera shake, WebGL or multi-axis rotation. Root scale never exceeds 1.35. Only transform, opacity and filter are animated; static decorative gradients and masks do not animate paint properties.

Reduced motion and Stillness disable every document animation and transition, plus all shared-group geometry animations, including the browser's implicit transforms. Cross-document snapshots use only 150ms opacity fades. Same-document helpers run updates directly under either preference. Reduced transparency removes translucent construction treatments and uses solid dialog surfaces.

Floor changes place the selected floor heading below the persistent header, then focus it. Other same-document updates focus the new heading after completion and announce through `#status`, inside the single polite live region. Native dialogs trap focus, close with Escape and restore the opener. Cross-document focus follows the browser's normal behavior.
