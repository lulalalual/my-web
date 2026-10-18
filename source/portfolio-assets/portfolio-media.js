import {resolveEmbedURL} from './project-sources.mjs';

let projectRequest;
const projects = () => projectRequest ||= fetch('/portfolio-assets/projects.json').then(response => {
  if (!response.ok) throw new Error('Project metadata unavailable');
  return response.json();
}).then(items => {
  if (!Array.isArray(items) || items.some(item => !/^[a-z][a-z0-9-]*$/.test(item.id) || (item.demo && !resolveEmbedURL(item.demo, location.href)))) throw new Error('Invalid project metadata');
  return items;
}).catch(error => {projectRequest = null; throw error;});

function manageEmbed(shell) {
  const frame = shell.querySelector('iframe');
  const message = shell.querySelector('[data-embed-message]');
  const retry = shell.querySelector('[data-embed-retry]');
  let timeout;
  let url = frame.dataset.src;
  let visible = false;
  shell.dataset.state = 'idle';
  function state(value, text) {
    shell.dataset.state = value;
    shell.setAttribute('aria-busy', String(value === 'loading'));
    if (message) message.textContent = text;
    if (retry) retry.hidden = value !== 'slow' && value !== 'error';
  }
  function viewport() {
    const target = resolveEmbedURL(url, location.href);
    if (target) frame.contentWindow?.postMessage({type: 'portfolio:viewport', visible: visible && !document.hidden}, target.origin);
  }
  function load(next = url, force = false) {
    const target = resolveEmbedURL(next, location.href);
    if (!target) return;
    const external = target.origin !== location.origin;
    shell.toggleAttribute('data-external-embed', external);
    if (external) frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-downloads allow-modals');
    else frame.removeAttribute('sandbox');
    url = next;
    frame.dataset.src = next;
    if (!force && frame.getAttribute('src') === next) return;
    clearTimeout(timeout);
    state('loading', '正在准备内容…');
    frame.src = next;
    timeout = setTimeout(() => state('slow', '载入时间较长，可稍候或重试。'), 15000);
  }
  frame.addEventListener('load', () => {
    if (!frame.getAttribute('src')) return;
    try {
      const expected = resolveEmbedURL(url, location.href);
      if (!expected) throw new Error('Invalid embed');
      if (expected.origin !== location.origin) {
        clearTimeout(timeout);
        state('ready', '内容已载入'); viewport();
        return;
      }
      const document = frame.contentDocument;
      if (!document?.body || /^(404|about:blank|chrome-error:)/.test(document.title) || document.URL.startsWith('chrome-error:')) throw new Error('Missing embed');
      const actual = new URL(document.URL);
      if (actual.pathname !== expected.pathname || actual.search !== expected.search) return;
      clearTimeout(timeout);
      state('ready', '内容已载入'); viewport();
    } catch {clearTimeout(timeout); state('error', '暂时未能载入，请重试。');}
  });
  frame.addEventListener('error', () => {clearTimeout(timeout); state('error', '暂时未能载入，请重试。');});
  retry?.addEventListener('click', () => load(url, true));
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {load(); loader.disconnect();}
    }, {rootMargin: '160px 0px'});
    loader.observe(shell);
    const visibility = new IntersectionObserver(entries => {visible = entries[0].isIntersecting; viewport();});
    visibility.observe(shell);
    window.addEventListener('pagehide', () => {visible = false; viewport(); loader.disconnect(); visibility.disconnect(); clearTimeout(timeout);});
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      if (!frame.getAttribute('src')) loader.observe(shell);
      visibility.observe(shell);
      if (shell.dataset.state === 'loading') timeout = setTimeout(() => state('slow', '载入时间较长，可稍候或重试。'), 15000);
    });
  } else {visible = true; if (!shell.closest('[hidden]')) load();}
  document.addEventListener('visibilitychange', viewport);
  return {frame, load};
}

function manageFullscreen(shell, expand) {
  if (!expand) return;
  let fullscreenOverflow;
  function collapse() {shell.classList.remove('expanded'); document.body.style.overflow = fullscreenOverflow || ''; syncFullscreen(); expand?.focus();}
  function syncFullscreen() {
    if (!expand) return;
    const open = document.fullscreenElement === shell || shell.classList.contains('expanded');
    expand.textContent = open ? '退出全屏 ↙' : '全屏体验 ↗'; expand.setAttribute('aria-pressed', String(open));
  }
  expand?.addEventListener('click', async () => {
    if (document.fullscreenElement) {try {await document.exitFullscreen();} catch {} return;}
    if (shell.classList.contains('expanded')) {collapse(); return;}
    try {if (document.fullscreenEnabled && shell.requestFullscreen) {await shell.requestFullscreen(); return;}} catch {}
    fullscreenOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; shell.classList.add('expanded'); syncFullscreen();
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && shell?.classList.contains('expanded')) collapse();});

}

export function mountMedia(root) {
  const embeds = new Map([...root.querySelectorAll('[data-embed]')].map(shell => [shell, manageEmbed(shell)]));
  const shell = root.querySelector('#demo-panel');
  const live = embeds.get(shell);
  const session = root.querySelector('#showcase');
  let selected = shell?.dataset.projectId;
  async function activate(id, scroll = false) {
    const item = (await projects()).find(item => item.id === id);
    if (!item?.demo || !live) return;
    const changed = selected !== id;
    selected = id;
    session.hidden = false;
    root.querySelectorAll('.work-card').forEach(card => card.classList.toggle('is-active', card.dataset.project === id));
    root.querySelectorAll('.project-launch').forEach(link => {if (link.dataset.startProject === id) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');});
    live.frame.title = item.title + '原项目完整界面';
    const note = shell.querySelector('.demo-caption p');
    if (note) note.textContent = item.demoNote || item.scope;
    live.load(item.demo);
    if (changed || scroll) {const url = new URL(location.href); url.searchParams.set('project', id); if (scroll) url.hash = 'showcase'; history.replaceState(null, '', url);}
    if (scroll) {
      root.querySelector('#showcase').scrollIntoView({behavior: document.documentElement.classList.contains('no-motion') ? 'instant' : 'smooth', block: 'start'});
      live.frame.focus({preventScroll: true});
    }
  }
  const requested = new URLSearchParams(location.search).get('project') || (location.hash === '#showcase' ? selected : null);
  if (requested && live) activate(requested, location.hash === '#showcase').catch(() => {});
  embeds.forEach((_, embedShell) => manageFullscreen(embedShell, embedShell.querySelector('[data-demo-fullscreen], #demo-fullscreen')));

  root.addEventListener('click', event => {
    const launch = event.target.closest('[data-start-project]');
    if (!launch || !live || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    activate(launch.dataset.startProject, true).catch(() => location.assign(launch.href));
  });
}
