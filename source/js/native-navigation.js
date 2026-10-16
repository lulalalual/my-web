(function () {
  if (!window.pjax) {
    window.pjax = {
      loadUrl: function (url) { window.location.assign(url); },
      reload: function () { window.location.reload(); }
    };
  }
  function mountNativeMenus() {
    var nav = document.querySelector('#nav .menus_items');
    if (!nav || nav.dataset.nativeMenus) return;
    nav.dataset.nativeMenus = 'ready';
    var touchGroup = null;
    nav.addEventListener('pointermove', function (event) { if (event.pointerType !== 'touch') nav.dataset.menuInput = 'pointer'; }, {passive:true});
    nav.addEventListener('pointerleave', function (event) { if (event.pointerType === 'mouse') nav.dataset.menuInput = 'pointer'; });
    nav.addEventListener('keydown', function () { nav.dataset.menuInput = 'keyboard'; });
    document.addEventListener('pointerdown', function (event) {
      if (nav.contains(event.target)) return;
      touchGroup = null;
      nav.dataset.menuInput = 'pointer';
      if (nav.contains(document.activeElement)) document.activeElement.blur();
    });
    var groups = Array.from(nav.querySelectorAll(':scope > .menus_item'));
    var path = location.pathname;
    var current = /^\/categories\//.test(path) ? '专栏'
      : /^\/(about|comments)\//.test(path) ? '关于'
      : path === '/' || /^\/(work|projects|experience|practice|opensource)\//.test(path) ? '作品' : '文章';
    function fit(group) {
      var panel = group.querySelector(':scope > .menus_item_child');
      if (!panel) return;
      group.style.setProperty('--menu-shift', '0px');
      if (matchMedia('(max-width:768px)').matches) return;
      var rect = panel.getBoundingClientRect();
      if (!rect.width) return;
      var limit = document.documentElement.clientWidth - 16;
      var shift = rect.left < 16 ? 16 - rect.left : rect.right > limit ? limit - rect.right : 0;
      group.style.setProperty('--menu-shift', shift + 'px');
    }
    groups.forEach(function (group) {
      var link = group.querySelector(':scope > a.site-page');
      if (!link) return;
      link.addEventListener('click', function (event) {
        if (event.pointerType !== 'touch' || touchGroup === group) return;
        event.preventDefault();
        touchGroup = group;
        group.classList.remove('menu-dismissed');
        nav.dataset.menuInput = 'touch';
        link.focus({preventScroll:true});
        fit(group);
      });
      if (link.textContent.trim() === current) {
        group.classList.add('is-current');
        link.setAttribute('aria-current', 'true');
      }
      group.addEventListener('pointerenter', function () {
        nav.dataset.menuInput = 'pointer';
        group.classList.remove('menu-dismissed');
        fit(group);
      });
      group.addEventListener('focusin', function (event) {
        nav.dataset.menuInput = 'keyboard';
        if (!group.contains(event.relatedTarget)) group.classList.remove('menu-dismissed');
        fit(group);
      });
      group.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        group.classList.add('menu-dismissed');
        link.focus({preventScroll:true});
        event.preventDefault();
        event.stopPropagation();
      });
    });
    var scheduled = false;
    function fitAll() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { groups.forEach(fit); scheduled = false; });
    }
    window.addEventListener('resize', fitAll, {passive:true});
    window.addEventListener('pageshow', fitAll);
    if (document.fonts) document.fonts.ready.then(fitAll);
    fitAll();
  }
  function fitDiagrams() {
    var article = document.querySelector('#post #article-container');
    if (article && !document.querySelector('#post .reading-breadcrumb')) {
      var breadcrumb = document.createElement('nav');
      breadcrumb.className = 'reading-breadcrumb'; breadcrumb.setAttribute('aria-label','当前位置');
      var category = document.querySelector('#post-info a.post-meta-categories');
      [['首页','/'],['博客','/blog/']].forEach(function (item) {
        var link = document.createElement('a'); link.textContent = item[0]; link.href = item[1];
        breadcrumb.append(link, document.createTextNode(' / '));
      });
      if (category) breadcrumb.append(category.cloneNode(true));
      else {var all = document.createElement('a');all.href='/categories/';all.textContent='专栏';breadcrumb.append(all);}
      article.before(breadcrumb);
    }
    var categoryIcons = {'首页':'house-chimney','C++语法笔记':'keyboard','项目合集':'folder-open','技术笔记':'book-open','分布式系统':'cube','游戏开发':'dice-d20','算法笔记':'shapes','计算机八股文笔记':'book'};
    document.querySelectorAll('#catalog-list .catalog-list-item a').forEach(function (link) {
      if (link.querySelector('i,svg')) return;
      var icon = document.createElement('i');
      icon.className = 'anzhiyufont anzhiyu-icon-' + (categoryIcons[link.textContent.trim()] || 'file-lines');
      icon.setAttribute('aria-hidden', 'true');
      link.prepend(icon);
    });
    document.querySelectorAll('iframe[data-auto-height], iframe[src^="/portfolio-assets/diagrams/"], iframe[src^="/portfolio-assets/knowledge/"]').forEach(function (frame) {
      var observer;
      function fit() {
        if (observer) observer.disconnect();
        var content = frame.contentDocument && frame.contentDocument.querySelector('.layout');
        if (!content) return;
        function resize() {
          var height = Math.ceil(content.getBoundingClientRect().height) + 4;
          if (Math.abs(parseFloat(frame.style.height || '0') - height) > 1) frame.style.height = height + 'px';
        }
        resize();
        if (window.ResizeObserver) {
          observer = new ResizeObserver(resize);
          observer.observe(content);
        }
      }
      frame.addEventListener('load', fit);
      fit();
    });
  }
  function openLinkedExperience() {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('details[name="work-topic"]')) target.open = true;
  }
  window.addEventListener('hashchange', openLinkedExperience);
  function mount() { mountNativeMenus(); fitDiagrams(); openLinkedExperience(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
