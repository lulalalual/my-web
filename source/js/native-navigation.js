(function () {
  if (!window.pjax) {
    window.pjax = {
      loadUrl: function (url) { window.location.assign(url); },
      reload: function () { window.location.reload(); }
    };
  }
  function fitDiagrams() {
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
