insert into projects (slug, title, summary, description, tech_stack, highlights, order_index, is_published)
values
  (
    'interview-master',
    '计算机面试大师',
    'AI 模拟面试与系统设计训练平台',
    'AI 驱动的全栈技术面试实战平台，包含流式交互、代码编辑、系统设计白板与复盘能力。',
    array['React', 'TypeScript', 'Vite', 'Tailwind', 'Zustand', 'Express'],
    array['Streaming UX', 'Monaco 编辑器', '系统设计白板', '能力雷达'],
    1,
    true
  ),
  (
    'tower-defense-duo',
    '塔防双人',
    '基于 C++ 与 SDL2 的双人塔防游戏',
    '双人协作塔防项目，包含敌人波次、塔类型、放置与升级机制以及完整的游戏资源系统。',
    array['C++', 'SDL2'],
    array['双人协作', '塔放置升级', '敌人波次系统', '资源管理'],
    2,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  tech_stack = excluded.tech_stack,
  highlights = excluded.highlights,
  order_index = excluded.order_index,
  is_published = excluded.is_published;

insert into site_settings (id, hero_title, hero_subtitle, social_links, project_order)
values
  (
    1,
    'An iPhone-styled 3D playground for projects and notes.',
    'Apple-inspired liquid glass, 3D toy-like motion, and owner-only content editing.',
    '[]'::jsonb,
    array['interview-master', 'tower-defense-duo']
  )
on conflict (id) do update
set
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  social_links = excluded.social_links,
  project_order = excluded.project_order;
