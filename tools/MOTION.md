# Motion implementation

Incremental motion audit using [motion-web by feitangyuan](https://github.com/feitangyuan/motion-web), pinned to `5f4e40f1253e11e28850d08dce28b9b7e4320115`. Reference material is licensed [CC BY-NC 4.0](https://github.com/feitangyuan/motion-web/blob/5f4e40f1253e11e28850d08dce28b9b7e4320115/LICENSE). This personal, noncommercial portfolio adapts its timing, native enhancement and frame independent following guidance; it does not bundle the skill or example artwork.

The existing Hexo / AnZhiYu layout, navigation, project applications and article routes remain the page structure. Motion uses native CSS, IntersectionObserver, WAAPI and the existing canvas. No new runtime dependency or external CDN was added.

- Fast feedback: 200 ms; panels: 300 ms; entrance: 400–700 ms. Native menus retain the AnZhiYu 200 ms transition and the header its 300 ms transition, matching the restrained rhythm of https://subingwen.cn/cplusplus/.
- Hero: quiet ambient drift, plus progressive native scroll depth on desktop.
- Projects: image arrival and pointer driven depth. A shared, demand driven scheduler uses `1 - exp(-16 * dt)`, stops when settled and owns the transform without a competing CSS transition.
- Experience: image settling; headings / contribution rules draw in; text remains readable from the initial state.
- Navigation: blue current/hover pill, a 200 ms horizontal submenu with keyboard focus and Escape dismissal; blog: shared hover, reveal and depth language. The compact homepage links to separate content pages rather than using a second sticky section bar.
- Detail navigation: ordinary project pages, native article indices and article contents. There is no modal navigation or scroll lock.
- Animation is enabled by default, without a manual toggle or stored opt-out. OS reduced motion remains an accessibility fallback. Hidden documents / offscreen applications pause rendering; touch devices retain every action without pointer tilt.

Tokens and styling live in `source/portfolio-assets/motion.css`; global interaction scheduling in `source/js/lula-motion.js`; portfolio coordination in `site.js` and `portfolio-media.js`. Static output is reproducible with `npm ci` and `npm run build`.

The ten portfolio diagrams have separate semantic SVG layouts. `diagrams/scenes.js` contains radar, evidence flow, field matrix, handbook, document matching, dependency graph, evaluation cycle, trajectory comparison, consensus cluster and verification branches. A single paused GSAP timeline owns deterministic drawing and playback, so seeking backwards produces the same frame. Paths and lookup points are cached before playback. Diagram geometry represents the process; it does not simulate unverified product results.
