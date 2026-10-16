import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'source');
const assets = path.join(source, 'portfolio-assets');
const readJSON = async name => JSON.parse(await readFile(path.join(assets, name), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const [projects, contributions, journal] = await Promise.all(['projects.json', 'opensource.json', 'journal.json'].map(readJSON));
const ids = new Set();
for (const item of projects) {
  if (!/^[a-z][a-z0-9-]*$/.test(item.id) || ids.has(item.id) || !item.demo?.startsWith('/demos/') || !Array.isArray(item.story)) throw new Error('Invalid project data');
  ids.add(item.id);
}
const cover = item => {
  if (!/^[a-z0-9-]+$/.test(item.cover)) throw new Error('Invalid cover name');
  const variants = [480, 800].filter(width => existsSync(path.join(assets, `responsive/${item.cover}-${width}.webp`))).map(width => `/portfolio-assets/responsive/${item.cover}-${width}.webp ${width}w`);
  const width = item.coverWidth || 1200, height = item.coverHeight || 800;
  variants.push(`/portfolio-assets/${item.cover}.webp ${width}w`);
  return `<img src="/portfolio-assets/${escape(item.cover)}.webp" srcset="${variants.join(', ')}" sizes="(max-width:760px) calc(100vw - 32px), (max-width:1440px) calc((100vw - 80px)/2), 620px" alt="${escape(item.title)}${item.id === 'defense' ? '原项目运行截图' : '的概念封面'}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
};
const cards = projects.map(item => `<article class="work-card" data-project="${item.id}">
  <a class="project-cover-link work-visual" href="/work/${item.id}/" aria-label="${escape(item.title)}：项目说明">${cover(item)}</a>
  <div class="card-info"><h3>${escape(item.title)}</h3><p>${escape(item.intro)}</p>
  <div class="project-actions"><a href="/work/${item.id}/" class="project-detail-link">项目说明 ↗</a><a href="/?project=${item.id}#showcase" class="project-launch" data-start-project="${item.id}" aria-controls="showcase">体验项目 →</a></div></div></article>`).join('\n');
const oss = contributions.map(item => {
  if (!item.url.startsWith('https://github.com/')) throw new Error('Invalid contribution URL');
  return `<article><span class="sample-badge">${escape(item.status)}</span><h3><a href="${escape(item.url)}" target="_blank" rel="noopener">${escape(item.name)} <span aria-hidden="true">↗</span></a></h3><p>${escape(item.description)}</p><small>${escape(item.validation)}</small></article>`;
}).join('\n');
const articles = journal.map(item => {
  if (!item.url.startsWith('/posts/')) throw new Error('Invalid article URL');
  return `<a class="journal-entry" href="${escape(item.url)}"><h3>${escape(item.title)}</h3><span aria-hidden="true">↗</span></a>`;
}).join('\n');
const template = await readFile(path.join(root, 'tools/templates/portfolio-home.html'), 'utf8');
let home = template;
if (!projects.length) throw new Error('At least one project is required');
for (const [token, value] of Object.entries({PROJECT_CARDS: cards, OSS_CARDS: oss, JOURNAL: articles, FIRST_PROJECT_ID: projects[0].id, FIRST_TITLE: escape(projects[0].title), FIRST_NOTE: escape(projects[0].demoNote || projects[0].scope), FIRST_DEMO: escape(projects[0].demo)})) home = home.replaceAll(`{{${token}}}`, value);
if (/\{\{[A-Z_]+\}\}/.test(home)) throw new Error('Unresolved portfolio template');
await writeFile(path.join(source, 'index.html'), home);
for (const item of projects) {
  const directory = path.join(source, 'work', item.id);
  await mkdir(directory, {recursive: true});
  const chapters = item.story.map(([title, text], index) => `<section class="case-chapter"><span>0${index + 1}</span><div><h2>${escape(title)}</h2><p>${escape(text)}</p></div></section>`).join('\n');
  const body = `---\ntitle: ${item.title}\nlayout: portfolio\naside: false\ncomments: false\ntop_img: false\ntype: portfolio\n---\n<div class="case-page section-wrap"><a class="back-link" href="/#work">← 返回项目</a><h1>${escape(item.title)}</h1><p class="case-intro">${escape(item.intro)}</p><div class="case-summary"><p><b>我的角色</b>${escape(item.role)}</p><p><b>交付说明</b>${escape(item.scope)}</p></div><section class="case-live" aria-label="${escape(item.title)}完整体验"><div class="demo-shell" data-embed data-project-id="${item.id}"><div class="embed-status" role="status"><span class="loading-mark" aria-hidden="true"></span><span data-embed-message>正在准备项目…</span><button type="button" data-embed-retry hidden>重试</button></div><iframe title="${escape(item.title)}原项目完整界面" data-src="${escape(item.demo)}" allow="fullscreen; clipboard-write"></iframe><noscript><style>[data-embed] iframe,.embed-status{display:none!important}.case-live .demo-shell{height:auto;min-height:100px;padding:24px}</style><a href="${escape(item.demo)}">进入${escape(item.title)}完整应用 →</a></noscript></div></section>${chapters}<a class="text-link" href="/#work">返回项目 →</a></div>`;
  await writeFile(path.join(directory, 'index.html'), body);
}
console.log(`Portfolio: ${projects.length} projects, ${contributions.length} contributions, ${journal.length} selected articles.`);
for (const folder of ['diagrams', 'knowledge']) {
  const directory = path.join(assets, folder);
  const topics = JSON.parse(await readFile(path.join(directory, 'topics.json'), 'utf8'));
  if (!Array.isArray(topics) || !topics.length || topics.some(topic => !Array.isArray(topic.steps) || topic.steps.length !== 4)) throw new Error('Invalid explanation topics');
  const file = path.join(directory, 'composition.html');
  if (folder === 'diagrams') {
    const design = await readFile(path.join(root, 'tools/templates/portfolio-diagram.html'), 'utf8');
    const fonts = (await readFile(path.join(assets, 'fonts/site-font.css'), 'utf8')).match(/@font-face\{[^}]+\}/g).join('\n').replaceAll('url("./', 'url("/portfolio-assets/fonts/');
    await writeFile(file, design.replace('{{FONTS}}', () => fonts).replace('{{TOPICS}}', () => JSON.stringify(topics)));
    continue;
  }
  const original = await readFile(file, 'utf8');
  const embedded = original.match(/const TOPICS=([\s\S]*?);window\.__timelines/);
  if (!embedded) throw new Error('Explanation composition contract changed');
  if (JSON.stringify(JSON.parse(embedded[1])) !== JSON.stringify(topics)) {
    const duration = topics.length * 12;
    const updated = original.replace(embedded[0], () => `const TOPICS=${JSON.stringify(topics)};window.__timelines`)
      .replace(/data-duration="[\d.]+"/, `data-duration="${duration}"`)
      .replace(/Math.min\([\d.]+,tl.time\(\)\)/, `Math.min(${duration - .001},tl.time())`)
      .replace(/v:\d+,duration:\d+/, `v:${duration},duration:${duration}`);
    await writeFile(file, updated);
  }
}
