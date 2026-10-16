let projectRequest;
const projects = () => projectRequest ||= fetch('/portfolio-assets/projects.json').then(response => {
  if (!response.ok) throw new Error('Project metadata unavailable');
  return response.json();
}).then(items => {
  if (!Array.isArray(items) || items.some(item => !/^[a-z][a-z0-9-]*$/.test(item.id) || !item.demo?.startsWith('/demos/'))) throw new Error('Invalid project metadata');
  return items;
}).catch(error => {projectRequest = null; throw error;});
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
  function viewport() {frame.contentWindow?.postMessage({type: 'portfolio:viewport', visible: visible && !document.hidden}, location.origin);}
  function load(next = url, force = false) {
    if (!next?.startsWith('/') || next.startsWith('//')) return;
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
      const document = frame.contentDocument;
      if (!document?.body || /^(404|about:blank|chrome-error:)/.test(document.title) || document.URL.startsWith('chrome-error:')) throw new Error('Missing embed');
      const expected = new URL(url, location.href);
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
    window.addEventListener('pagehide', () => {loader.disconnect(); visibility.disconnect(); clearTimeout(timeout);}, {once: true});
  } else {visible = true; if (!shell.closest('[hidden]')) load();}
  document.addEventListener('visibilitychange', viewport);
  return {frame, load};
}

export function mountMedia(root) {
  const embeds = new Map([...root.querySelectorAll('[data-embed]')].map(shell => [shell, manageEmbed(shell)]));
  const shell = root.querySelector('#demo-panel');
  const live = embeds.get(shell);
  const session = root.querySelector('#showcase');
  let selected = shell?.dataset.projectId;
  async function activate(id, scroll = false) {
    const item = (await projects()).find(item => item.id === id);
    if (!item || !live) return;
    const changed = selected !== id;
    selected = id;
    session.hidden = false;
    root.querySelectorAll('.work-card').forEach(card => card.classList.toggle('is-active', card.dataset.project === id));
    root.querySelectorAll('.project-launch').forEach(link => {if (link.dataset.startProject === id) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');});
    live.frame.title = item.title + '原项目完整界面';
    live.load(item.demo);
    if (changed || scroll) {const url = new URL(location.href); url.searchParams.set('project', id); if (scroll) url.hash = 'showcase'; history.replaceState(null, '', url);}
    if (scroll) {
      root.querySelector('#showcase').scrollIntoView({behavior: document.documentElement.classList.contains('no-motion') ? 'instant' : 'smooth', block: 'start'});
      live.frame.focus({preventScroll: true});
    }
  }
  const requested = new URLSearchParams(location.search).get('project') || (location.hash === '#showcase' ? selected : null);
  if (requested && live) activate(requested, location.hash === '#showcase').catch(() => {});
  const expand = root.querySelector('#demo-fullscreen');
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

  const dialog = root.querySelector('#case-dialog');
  let opener;
  let previousOverflow;
  let dialogAnimation;
  function animateDialog(closing = false) {
    dialogAnimation?.cancel();
    if (!dialog?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    dialogAnimation = dialog.animate(closing
      ? [{opacity:1, transform:'translateY(0) scale(1)'}, {opacity:0, transform:'translateY(8px) scale(.99)'}]
      : [{opacity:0, transform:'translateY(16px) scale(.985)'}, {opacity:1, transform:'translateY(0) scale(1)'}],
      {duration:closing ? 150 : 320, easing:'cubic-bezier(.16,1,.3,1)'});
    return dialogAnimation;
  }
  let closingDialog = false;
  async function closeDialog() {
    if (!dialog?.open || closingDialog) return;
    closingDialog = true;
    try {await animateDialog(true)?.finished;} catch {}
    if (dialog.open) dialog.close();
    closingDialog = false;
  }
  root.addEventListener('click', async event => {
    const launch = event.target.closest('[data-start-project]');
    if (launch && live && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); if (dialog?.open) {opener = null; dialog.close();}
      activate(launch.dataset.startProject, true).catch(() => location.assign(launch.href)); return;
    }
    const link = event.target.closest('a[data-case]');
    if (!link || !dialog?.showModal || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    try {
      const item = (await projects()).find(item => item.id === link.dataset.case);
      if (!item) {location.assign(link.href); return;}
      opener = link;
      const chapters = item.story.map(([heading, text], index) => `<section class="case-chapter"><span>0${index + 1}</span><div><h3>${escape(heading)}</h3><p>${escape(text)}</p></div></section>`).join('');
      root.querySelector('#case-content').innerHTML = `<article class="dialog-case"><div class="dialog-intro"><h2 id="case-title">${escape(item.title)}</h2><div class="case-summary"><p><b>我的角色</b>${escape(item.role)}</p><p><b>交付说明</b>${escape(item.scope)}</p></div><div class="case-links"><a class="button primary" href="/?project=${escape(item.id)}#showcase" data-start-project="${escape(item.id)}">体验项目 →</a></div></div>${chapters}</article>`;
      previousOverflow = document.body.style.overflow; dialog.showModal(); dialog.scrollTop = 0; document.body.style.overflow = 'hidden';
      animateDialog();
    } catch {location.assign(link.href);}
  });
  dialog?.querySelector('.dialog-close')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('cancel', event => {event.preventDefault(); closeDialog();});
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
  });
  dialog?.addEventListener('close', () => {dialogAnimation?.cancel(); document.body.style.overflow = previousOverflow || ''; root.querySelector('#case-content').replaceChildren(); opener?.focus({preventScroll: true});});
}
