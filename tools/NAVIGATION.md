# Navigation

The existing AnZhiYu layout owns navigation throughout the site. Inspiration: [爱编程的大丙 — C++](https://subingwen.cn/cplusplus/), especially its subject index, article table of contents and ordinary link navigation. Its content and artwork are not copied.

- Brand / works → homepage; real project descriptions → `/work/<id>/`.
- “体验项目” → one inline application session in the homepage, without leaving the page.
- Work history → `/experience/`; diagrams → `/practice/`; contributions → `/opensource/`.
- Subject → existing category URL → article → native contents / previous / next links.
- All articles → `/blog/`; its submenu contains archive and tags. The duplicate category strip above article cards is removed.
- Archive, category and tag URLs retain their original meanings.

The homepage is a compact project portal. Its four editorial links enter work history, diagrams, contributions and the blog directly. Two application cards and a horizontal rail of four engineering projects link to the six-item `/projects/` index. One shared application session remains on the homepage; long experience, diagram, contribution and blog sections are not stacked underneath it.

Navigation uses a blue current/hover pill and a horizontal outlined submenu, hidden until hover or keyboard focus and dismissed with Escape. Input mode determines which group is open. Narrow windows keep the primary row visible; touch first opens a group, then an ordinary child link navigates. Overflow stays within the submenu. Navigation stays in document flow and pushes content down while open. Redundant utility icons and the second article navigation strip are removed. Verified 16:9 covers fill the top of article cards; card height follows its contents. Existing `#experience`, `#explanations`, `#opensource`, `#journal` and `#contact` links redirect to matching pages; legacy `#about` opens the backend internship on `/experience/`. `#work`, `#showcase` and `?project=` retain their application meaning.

Project descriptions use ordinary links, without a second modal navigation model. Category pages are text indexes within the existing theme and sidebar. Work history uses one expanded topic at a time, with a direct link to the diagram page.
