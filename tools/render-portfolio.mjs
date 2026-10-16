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
  if (!/^[a-z][a-z0-9-]*$/.test(item.id) || ids.has(item.id) || (item.demo && !item.demo.startsWith('/demos/')) || !Array.isArray(item.story)) throw new Error('Invalid project data');
  ids.add(item.id);
}
const cover = (item, sizes = '(max-width:760px) calc(100vw - 32px), (max-width:1440px) calc((100vw - 80px)/2), 620px') => {
  if (!/^[a-z0-9-]+$/.test(item.cover)) throw new Error('Invalid cover name');
  const variants = [480, 800].filter(width => existsSync(path.join(assets, `responsive/${item.cover}-${width}.webp`))).map(width => `/portfolio-assets/responsive/${item.cover}-${width}.webp ${width}w`);
  const width = item.coverWidth || 1200, height = item.coverHeight || 800;
  variants.push(`/portfolio-assets/${item.cover}.webp ${width}w`);
  return `<img src="/portfolio-assets/${escape(item.cover)}.webp" srcset="${variants.join(', ')}" sizes="${sizes}" alt="${escape(item.coverAlt || `${item.title}${item.id === 'defense' ? '原项目运行截图' : '的概念封面'}`)}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
};
const icon = name => `<i class="anzhiyufont anzhiyu-icon-${/^[a-z0-9-]+$/.test(name || '') ? name : 'folder-open'}" aria-hidden="true"></i>`;
const chapterIcon = title => /验证|预检|来源|公开|原始|数据导出/.test(title) ? 'circle-check' : /检索|文档|偏好/.test(title) ? 'book-open' : /状态|生命周期|任务|职责|路由/.test(title) ? 'shapes' : /评测|奖励|权重|参数/.test(title) ? 'chart-line' : /流式|接口|桥接/.test(title) ? 'stream' : /持久化|恢复/.test(title) ? 'file-lines' : 'keyboard';
const technologyIcon = tag => /DAG|Evaluation|SHA|TF-IDF/.test(tag) ? 'shapes' : /FFmpeg|SDL|Emscripten|WebAssembly/.test(tag) ? 'play' : /SSE|IPC|CDP/.test(tag) ? 'link' : /Worker/.test(tag) ? 'bolt' : /localStorage|Markdown/.test(tag) ? 'file-lines' : 'keyboard';
const projectCard = item => `<article class="work-card" data-project="${item.id}">
  <a class="project-cover-link work-visual" href="/work/${item.id}/" aria-label="${escape(item.title)}：项目说明">${cover(item)}</a>
  <div class="card-info"><h3>${icon(item.icon)}${escape(item.title)}</h3><p>${escape(item.intro)}</p>
  <div class="project-actions"><a href="/work/${item.id}/" class="project-detail-link">${icon('file-lines')}技术说明</a>${item.demo ? `<a href="/?project=${item.id}#showcase" class="project-launch" data-start-project="${item.id}" aria-controls="showcase">${icon('play')}体验项目</a>` : ''}</div></div></article>`;
const cards = projects.filter(item => item.featured).map(projectCard).join('\n');
const toolCards = projects.filter(item => !item.featured).map(item => `<a class="tool-card" href="/work/${item.id}/"><div class="tool-cover">${cover(item)}</div><div class="tool-copy"><h3>${icon(item.icon)}${escape(item.title)}</h3><p>${escape(item.intro)}</p></div></a>`).join('\n');
const oss = contributions.map(item => {
  if (!item.url.startsWith('https://github.com/')) throw new Error('Invalid contribution URL');
  return `<article><a class="oss-cover" href="${escape(item.url)}" target="_blank" rel="noopener" aria-label="${escape(item.name)} 提交记录">${cover({...item,title:item.name,coverWidth:960,coverHeight:540},'(max-width:760px) calc(100vw - 72px), 380px')}</a><div class="oss-copy"><span class="sample-badge">${icon('link')}${escape(item.status)}</span><h3><a href="${escape(item.url)}" target="_blank" rel="noopener">${icon('github')}${escape(item.name)} <span aria-hidden="true">↗</span></a></h3><p>${escape(item.description)}</p><small>${icon('circle-check')}${escape(item.validation)}</small></div></article>`;
}).join('\n');
const articles = journal.map(item => {
  if (!item.url.startsWith('/posts/')) throw new Error('Invalid article URL');
  return `<a class="journal-entry" href="${escape(item.url)}"><h3>${escape(item.title)}</h3><span aria-hidden="true">↗</span></a>`;
}).join('\n');
const template = await readFile(path.join(root, 'tools/templates/portfolio-home.html'), 'utf8');
let home = template;
if (!projects.length) throw new Error('At least one project is required');
for (const [token, value] of Object.entries({PROJECT_CARDS: cards, ENGINEERING_CARDS:toolCards, OSS_CARDS: oss, JOURNAL: articles, FIRST_PROJECT_ID: projects[0].id, FIRST_TITLE: escape(projects[0].title), FIRST_NOTE: escape(projects[0].demoNote || projects[0].scope), FIRST_DEMO: escape(projects[0].demo)})) home = home.replaceAll(`{{${token}}}`, value);
if (/\{\{[A-Z_]+\}\}/.test(home)) throw new Error('Unresolved portfolio template');
await writeFile(path.join(source, 'index.html'), home);
async function writeSectionPage(slug, title, body) {
  const directory = path.join(source, slug);
  await mkdir(directory, {recursive: true});
  const header = `---\ntitle: ${title}\nlayout: portfolio\naside: false\ncomments: false\ntop_img: false\ntype: portfolio\ncover: /portfolio-assets/hero.webp\n---\n`;
  await writeFile(path.join(directory, 'index.html'), `${header}<div class="case-page section-wrap"><a class="back-link" href="/">${icon('arrow-left')} 首页</a><h1>${icon(slug==='opensource'?'github':slug==='practice'?'shapes':'folder-open')}${escape(title)}</h1>${body}</div>`);
}
await writeSectionPage('opensource', '开源贡献', `<div class="oss-grid">${oss}</div>`);
await writeSectionPage('practice', '方案与实践', `<section id="explanations" class="practice-player" aria-label="流程图解"><div class="demo-shell diagram-shell" data-embed><div class="embed-status" role="status"><span class="loading-mark" aria-hidden="true"></span><span data-embed-message>正在载入图解…</span><button type="button" data-embed-retry hidden>重试</button></div><iframe title="工作与项目流程图解" data-src="/portfolio-assets/diagrams/" data-auto-height allowfullscreen></iframe><noscript><a href="/portfolio-assets/diagrams/">进入流程图解 →</a></noscript></div></section>`);
await writeSectionPage('projects', '全部项目', `<div class="work-grid">${cards}</div><div id="engineering" class="engineering-index tool-grid">${toolCards}</div>`);
for (const item of projects) {
  const directory = path.join(source, 'work', item.id);
  await mkdir(directory, {recursive: true});
  const chapters = item.story.map(([title, text]) => `<section class="case-chapter"><span>${icon(chapterIcon(title))}</span><div><h2>${escape(title)}</h2><p>${escape(text)}</p></div></section>`).join('\n');
  let visual='';
  if(item.demo) visual=`<section class="case-live ${item.id==='evalops'?'report-live':''}" aria-label="${escape(item.title)}原始界面"><div class="demo-shell" data-embed data-project-id="${item.id}"><div class="embed-status" role="status"><span class="loading-mark" aria-hidden="true"></span><span data-embed-message>正在准备项目…</span><button type="button" data-embed-retry hidden>重试</button></div><iframe title="${escape(item.title)}原项目完整界面" data-src="${escape(item.demo)}" allow="fullscreen; clipboard-write"></iframe><noscript><style>[data-embed] iframe,.embed-status{display:none!important}.case-live .demo-shell{height:auto;min-height:100px;padding:24px}</style><a href="${escape(item.demo)}">进入${escape(item.title)}原始界面 →</a></noscript></div></section>`;
  if(item.screenshots) visual=`<section class="project-evidence" aria-label="原界面截图">${item.screenshots.map(s=>`<figure><a href="${escape(s.src)}" target="_blank" rel="noopener"><img src="${escape(s.src)}" width="${s.width}" height="${s.height}" alt="${escape(s.alt)}" loading="lazy"></a><figcaption>${escape(s.alt)}</figcaption></figure>`).join('')}</section>`;
  if(item.visual==='crawler') visual=`<section class="crawler-architecture" aria-label="采集技能与辅助脚本的结构示意"><h2>${icon('shapes')}实现结构</h2><div class="crawler-flow"><article>${icon('link')}<h3>技能路由</h3><p>页面特征 · 工具选择</p></article><span class="flow-connector" aria-hidden="true"></span><article>${icon('keyboard')}<h3>DOM 提取</h3><p>字段白名单 · Set 去重 · localStorage</p></article><span class="flow-connector" aria-hidden="true"></span><article>${icon('file-lines')}<h3>规则预检</h3><p>四类告警 · 结构化输出</p></article></div><div class="validation-table-wrap"><table class="validation-table"><caption>原预检脚本 · 合成夹具验证</caption><thead><tr><th>夹具</th><th>记录</th><th>结果</th></tr></thead><tbody><tr><td>干净样本</td><td>12 行</td><td>四类规则均未告警</td></tr><tr><td>重复与噪声样本</td><td>12 行</td><td>四类规则均触发</td></tr><tr><td>合法单来源样本</td><td>12 行</td><td>来源集中提示，交由人工复核</td></tr></tbody></table></div><a class="text-link" href="/portfolio-assets/crawler-validation.json" download>${icon('file-lines')}验证记录</a></section>`;
  const body = `---\ntitle: ${item.title}\nlayout: portfolio\naside: false\ncomments: false\ntop_img: false\ntype: portfolio\n---\n<div class="case-page section-wrap"><a class="back-link" href="/projects/">${icon('arrow-left')} 返回项目</a><h1>${icon(item.icon)}${escape(item.title)}</h1><p class="case-intro">${escape(item.intro)}</p><div class="project-stack">${item.tags.map(t=>`<span>${icon(technologyIcon(t))}${escape(t)}</span>`).join('')}</div><div class="case-cover">${cover(item)}</div><div class="case-summary"><p><b>${icon('keyboard')}开发方式</b>${escape(item.role)}</p><p><b>${icon('shapes')}技术实现</b>${escape(item.scope)}</p></div>${visual}${chapters}<a class="text-link" href="/projects/">${icon('arrow-left')}返回项目</a></div>`;
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
