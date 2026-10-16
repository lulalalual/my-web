# Navigation

The existing AnZhiYu layout owns navigation throughout the site. Inspiration: [爱编程的大丙 — C++](https://subingwen.cn/cplusplus/), especially its subject index, article table of contents and ordinary link navigation. Its content and artwork are not copied.

- Brand / works → homepage; real project descriptions → `/work/<id>/`.
- “体验项目” → one inline application session in the homepage, without leaving the page.
- Work history → `/experience/`; diagrams → `/practice/`; contributions → `/opensource/`.
- Subject → existing category URL → article → native contents / previous / next links.
- All articles → `/blog/`; the first blog category tab also returns here.
- Archive, category and tag URLs retain their original meanings.

The homepage is a compact project portal. Its four editorial links enter work history, diagrams, contributions and the blog directly. Only the project cards and shared original application session remain on the homepage; the long experience, diagram, contribution and blog sections are not stacked underneath it.

Desktop navigation uses a blue current/hover pill and a horizontal, outlined submenu. Submenus remain inside the viewport, retain ordinary links, open on keyboard focus and close with Escape. The latest pointer or keyboard interaction owns the open group, so an idle pointer cannot block keyboard access. Touch and mobile devices retain the native sidebar links. Existing homepage `#experience`, `#explanations`, `#opensource`, `#journal` and `#contact` links redirect to the matching page; legacy `#about` retains its original backend internship meaning and opens that topic on `/experience/`. `#work`, `#showcase` and `?project=` continue to address the original inline applications.

Project descriptions use ordinary links, without a second modal navigation model. Category pages are text indexes within the existing theme and sidebar. Work history uses one expanded topic at a time, with a direct link to the diagram page.
