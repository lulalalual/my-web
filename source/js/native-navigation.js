(function () {
  if (!window.pjax) {
    window.pjax = {
      loadUrl: function (url) { window.location.assign(url); },
      reload: function () { window.location.reload(); }
    };
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fitDiagrams);
  else fitDiagrams();
})();
