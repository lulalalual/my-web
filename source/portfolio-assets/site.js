import {mountMedia} from './portfolio-media.js';

const root = document.getElementById('portfolio-root');
if (root) {
  document.documentElement.classList.add('portfolio-view', 'js');
  const skip = root.querySelector('.portfolio-skip');
  if (skip) document.body.prepend(skip);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion() {
    const off = reduced.matches;
    document.documentElement.classList.toggle('no-motion', off);
    document.dispatchEvent(new CustomEvent('portfolio:motion', {detail: {off}}));
  }
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  const targets = root.querySelectorAll('.section-heading, .work-card, .experience-visual, .oss-grid article, .journal-heading, .contact-section');
  if ('IntersectionObserver' in window && !document.documentElement.classList.contains('no-motion')) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {entry.target.classList.add('revealed'); reveal.unobserve(entry.target);}
      });
    }, {threshold: 0.06});
    targets.forEach(target => {
      const index = [...target.parentElement.children].indexOf(target);
      target.style.setProperty('--reveal-delay', Math.min(index, 3) * 70 + 'ms');
      target.classList.add('reveal-pending'); reveal.observe(target);
    });
  }
  const ambient = root.querySelectorAll('.hero');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting)));
    ambient.forEach(target => observer.observe(target));
  } else ambient.forEach(target => target.classList.add('is-in-view'));

  const nav = root.querySelector('.section-nav');
  if (nav) {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    let current = '';
    function select(id) {
      if (current === id) return;
      current = id;
      links.forEach(link => {
        const active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      const active = links.find(link => link.classList.contains('active'));
      if (active && matchMedia('(max-width:760px)').matches) nav.scrollTo({left: active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2, behavior: 'auto'});
    }
    let navFrame;
    function updateSection() {
      navFrame = 0;
      const passed = sections.filter(section => section.getBoundingClientRect().top <= 220);
      const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      select((atEnd ? sections.at(-1) : passed.at(-1) || sections[0]).id);
      nav.style.setProperty('--reading-progress', String(Math.max(0, Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)))));
    }
    window.addEventListener('scroll', () => {if (!navFrame) navFrame = requestAnimationFrame(updateSection);}, {passive:true});
    const hash = location.hash.slice(1);
    select(({showcase:'work', about:'experience', explanations:'experience'})[hash] || hash || 'work');
    updateSection();
    nav.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const section = document.querySelector(link.getAttribute('href'));
      if (section) {select(section.id); section.setAttribute('tabindex', '-1'); section.focus({preventScroll: true});}
    });
  }
  const copy = root.querySelector('#copy-email');
  copy?.addEventListener('click', async () => {
    const status = root.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(copy.dataset.email);
      if (status) status.textContent = '邮箱已复制';
      copy.classList.add('copied');
    } catch {if (status) status.textContent = '可点击邮箱地址，使用邮件应用联系。';}
  });
  mountMedia(root);
}
