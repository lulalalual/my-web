(function () {
  function mount() {
    var panel = document.getElementById('card-toc');
    if (!panel || panel.dataset.tocControls || !panel.querySelector('.toc-link')) return;
    panel.dataset.tocControls = 'ready';
    panel.classList.remove('lula-reveal', 'is-visible', 'open');
    panel.classList.add('article-toc-panel');
    panel.style.removeProperty('transition-delay');
    panel.hidden = true;
    panel.setAttribute('role', 'navigation');
    panel.setAttribute('aria-label', '文章目录');
    document.body.append(panel);
    document.documentElement.classList.add('has-toc-controls');

    var toggle = document.createElement('button');
    toggle.id = 'article-toc-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="anzhiyufont anzhiyu-icon-list-ul" aria-hidden="true"></i><span>目录</span>';
    document.body.append(toggle);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toc-close';
    close.setAttribute('aria-label', '关闭文章目录');
    close.innerHTML = '<i class="anzhiyufont anzhiyu-icon-xmark" aria-hidden="true"></i>';
    (panel.querySelector('.item-headline') || panel).append(close);

    function setOpen(open, restoreFocus) {
      panel.hidden = !open;
      panel.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '收起文章目录' : '打开文章目录');
      if (open) panel.querySelector('.toc-link').focus({preventScroll:true});
      else if (restoreFocus) toggle.focus({preventScroll:true});
    }
    setOpen(false, false);
    toggle.addEventListener('click', function () { setOpen(panel.hidden, !panel.hidden); });
    close.addEventListener('click', function () { setOpen(false, true); });
    panel.addEventListener('click', function (event) {
      var link = event.target.closest('.toc-link');
      if (!link) return;
      var destination;
      try { destination = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch {}
      setOpen(false, false);
      if (!destination) return;
      if (!destination.hasAttribute('tabindex')) {
        destination.setAttribute('tabindex', '-1');
        destination.addEventListener('blur', function () { destination.removeAttribute('tabindex'); }, {once:true});
      }
      destination.focus({preventScroll:true});
    }, true);
    document.addEventListener('pointerdown', function (event) {
      if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false, false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || panel.hidden) return;
      setOpen(false, true);
      event.preventDefault();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  document.addEventListener('pjax:complete', mount);
})();
