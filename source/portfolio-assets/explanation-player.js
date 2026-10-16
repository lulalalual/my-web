const frame = document.getElementById('animation');
const select = document.getElementById('topics');
const seek = document.getElementById('seek');
const play = document.getElementById('play');
const feedback = document.getElementById('player-state');
const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const timeline = () => frame.contentWindow?.__timelines?.main;
let topics = [], selected = 0, playing = false, raf = 0, lastPaint = 0, lastStep = -1, visible = true;
document.documentElement.classList.toggle('compact', params.has('compact'));
const resize = new ResizeObserver(() => {frame.style.transform = `scale(${frame.parentElement.clientWidth / 1280})`;});
resize.observe(frame.parentElement);
function motionOff() {
  try {return reduced.matches || parent.document.documentElement.classList.contains('no-motion');} catch {return reduced.matches;}
}
function skin() {
  let theme = document.documentElement.dataset.theme || 'light';
  try {theme = parent.document.documentElement.dataset.theme || theme;} catch {}
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  if (frame.contentDocument?.documentElement) frame.contentDocument.documentElement.dataset.theme = document.documentElement.dataset.theme;
  if (motionOff()) pause();
  play.disabled = !timeline() || !topics.length || motionOff();
  feedback.textContent = motionOff() ? '动效已关闭，可逐步阅读' : '';
}
function pause() {
  playing = false; timeline()?.pause(); cancelAnimationFrame(raf); raf = 0;
  play.textContent = '播放动画 ▶'; play.setAttribute('aria-pressed', 'false');
}
function render(t) {
  const topic = topics[selected]; if (!topic) return;
  const step = Math.min(3, Math.floor(t / 3));
  document.getElementById('progress').textContent = `${t.toFixed(1)} / 12 秒`;
  seek.value = String(Math.round(t * 100)); seek.setAttribute('aria-valuetext', `${t.toFixed(1)} 秒，第 ${step + 1} 步`);
  if (step === lastStep) return;
  lastStep = step;
  document.getElementById('step-title').textContent = topic.steps[step][0];
  document.getElementById('description').textContent = topic.steps[step][2];
  document.querySelectorAll('[data-step]').forEach(button => {const active = Number(button.dataset.step) === step; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');});
}
function jump(t) {pause(); timeline()?.seek(selected * 12 + t, false); render(t);}
function choose(index) {
  pause(); selected = index; lastStep = -1;
  const topic = topics[index]; select.value = String(index);
  document.getElementById('status').textContent = topic.state;
  document.getElementById('topic-count').textContent = params.has('compact') ? topic.title : `${index + 1} / ${topics.length}`;
  const buttons = topic.steps.map((step, i) => {const button = document.createElement('button'); button.type = 'button'; button.dataset.step = i; button.textContent = `${i + 1} ${step[0]}`; button.addEventListener('click', () => jump(i * 3 + .15)); return button;});
  document.getElementById('steps').replaceChildren(...buttons);
  jump(.01); seek.disabled = !timeline(); skin();
}
function tick(now) {
  if (!playing) return;
  const t = timeline().time() - selected * 12;
  if (t >= 11.98) {jump(11.99); return;}
  if (now - lastPaint >= 100) {render(t); lastPaint = now;}
  raf = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (playing) {pause(); return;}
  const tl = timeline(); if (!tl || motionOff() || !visible || document.hidden) return;
  if (tl.time() - selected * 12 >= 11.98) {tl.seek(selected * 12 + .01, false); lastStep = -1; render(.01);}
  playing = true; lastPaint = 0; tl.play(); play.textContent = '暂停动画 Ⅱ'; play.setAttribute('aria-pressed', 'true'); raf = requestAnimationFrame(tick);
});
select.addEventListener('change', () => choose(Number(select.value)));
seek.addEventListener('input', () => jump(Number(seek.value) / 100));
frame.addEventListener('load', () => {skin(); if (topics.length) choose(selected); if (!timeline()) {feedback.textContent = '动画未能载入，可先阅读步骤文字。'; document.getElementById('reload').hidden = false;}});
document.getElementById('reload').addEventListener('click', () => location.reload());
fetch('topics.json').then(response => {if (!response.ok) throw new Error('Topics unavailable'); return response.json();}).then(data => {
  if (!Array.isArray(data) || !data.length || data.some(topic => !Array.isArray(topic.steps) || topic.steps.length !== 4)) throw new Error('Invalid topics');
  topics = data;
  select.replaceChildren(...data.map((topic, index) => new Option(topic.title, String(index)))); select.disabled = false;
  choose(Math.max(0, topics.findIndex(topic => topic.id === params.get('topic'))));
}).catch(() => {feedback.textContent = '主题暂时未能载入，请重试。'; document.getElementById('reload').hidden = false;});
window.addEventListener('message', event => {if (event.origin === location.origin && event.source === parent && event.data?.type === 'portfolio:viewport') {visible = event.data.visible === true; if (!visible) pause();}});
document.addEventListener('visibilitychange', () => {if (document.hidden) pause();});
reduced.addEventListener('change', skin);
let themeObserver, viewportObserver;
function connectObservers() {
  resize.observe(frame.parentElement);
  try {
  if (parent !== window) {
    themeObserver ||= new MutationObserver(skin); themeObserver.observe(parent.document.documentElement, {attributes: true, attributeFilter: ['data-theme', 'class']});
    parent.document.addEventListener('portfolio:motion', skin);
    if (frameElement && parent.IntersectionObserver) {viewportObserver ||= new parent.IntersectionObserver(entries => {visible = entries[0].isIntersecting; if (!visible) pause();}); viewportObserver.observe(frameElement);}
  }
  } catch {}
  skin();
}
connectObservers();
window.addEventListener('pagehide', () => {pause(); resize.disconnect(); themeObserver?.disconnect(); viewportObserver?.disconnect(); try {parent.document.removeEventListener('portfolio:motion', skin);} catch {}});
window.addEventListener('pageshow', event => {if (event.persisted) connectObservers();});
