(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var heroVisible = true;
  var heroObserver;
  function motionAllowed() {
    if (document.hidden || reducedMotion.matches || document.documentElement.classList.contains('no-motion')) return false;
    return true;
  }
  function starfieldAllowed() { return heroVisible && motionAllowed(); }
  function ensureProgress() {
    var progress = document.querySelector(".lula-pjax-progress");
    if (progress) return progress;

    progress = document.createElement("div");
    progress.className = "lula-pjax-progress";
    document.body.appendChild(progress);
    return progress;
  }

  function requestFrame(callback) {
    if ("requestAnimationFrame" in window) {
      return window.requestAnimationFrame(callback);
    }
    return window.setTimeout(callback, 16);
  }

  function cancelFrame(handle) {
    if ("cancelAnimationFrame" in window) {
      window.cancelAnimationFrame(handle);
      return;
    }
    window.clearTimeout(handle);
  }

  function mountReveal() {
    var targets = document.querySelectorAll("#recent-posts > .recent-post-item:not([data-lula-reveal]), .card-widget:not([data-lula-reveal]), .lula-project-card:not([data-lula-reveal]), .lula-column-card:not([data-lula-reveal])");
    targets.forEach(function (target, index) {
      target.setAttribute("data-lula-reveal", "true");
      target.classList.add("lula-reveal");
      target.style.transitionDelay = Math.min(index * 45, 260) + "ms";
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  function mountHeader() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    var ticking = false;
    var update = function () {
      if (window.scrollY > 12) {
        nav.classList.add("lula-nav-active");
      } else {
        nav.classList.remove("lula-nav-active");
      }
      ticking = false;
    };

    var schedule = function () {
      if (ticking) return;
      ticking = true;
      requestFrame(update);
    };

    if (window.__lulaHeaderSchedule) {
      window.removeEventListener("scroll", window.__lulaHeaderSchedule);
    }
    window.__lulaHeaderSchedule = schedule;

    update();
    window.addEventListener("scroll", schedule, { passive: true });
  }

  function mountStarfield() {
    if (!motionAllowed()) return;
    var state = window.__lulaStarfield;
    if (state && state.canvas && state.canvas.isConnected) {
      state.resize();
      return;
    }

    var host = document.getElementById("web_bg") || document.body;
    if (!host) return;

    var canvas = document.querySelector(".lula-starfield-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "lula-starfield-canvas";
      host.appendChild(canvas);
    }

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = 1;
    var width = 0;
    var height = 0;
    var raf = 0;
    var lastTime = 0;
    var stars = [];

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    function createStars() {
      var starCount = width < 760 ? 42 : Math.max(70, Math.min(120, Math.round((width * height) / 18000)));
      stars = Array.from({ length: starCount }, function () {
        return {
          x: randomBetween(0, width),
          y: randomBetween(0, height),
          size: randomBetween(0.6, 1.9),
          driftX: randomBetween(-18, -2.4),
          driftY: randomBetween(-1.8, 2.2),
          twinkle: randomBetween(0.4, 1),
          speed: randomBetween(0.52, 1.75),
          hue: Math.random() > 0.7 ? "warm" : "cool",
          phase: randomBetween(0, Math.PI * 2)
        };
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 2);
      width = Math.max(window.innerWidth || document.documentElement.clientWidth || 0, 1);
      height = Math.max(window.innerHeight || document.documentElement.clientHeight || 0, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      createStars();
    }

    function draw(time) {
      raf = 0;
      if (!starfieldAllowed()) return;
      if (!width || !height) {
        raf = window.requestAnimationFrame(draw);
        return;
      }

      if (lastTime && time - lastTime < (width < 760 ? 41 : 32)) {raf = window.requestAnimationFrame(draw); return;}
      var delta = lastTime ? Math.min(67, time - lastTime) : 16;
      lastTime = time;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.globalCompositeOperation = "screen";

      stars.forEach(function (star) {
        var step = delta * 0.016 * star.speed;
        star.x += star.driftX * step;
        star.y += star.driftY * step;

        if (star.x < -24) {
          star.x = width + randomBetween(8, 42);
          star.y = randomBetween(0, height);
        }
        if (star.y < -20) {
          star.y = height + 18;
        }
        if (star.y > height + 20) {
          star.y = -18;
        }

        var pulse = 0.45 + (Math.sin(time * 0.0012 * star.speed + star.phase) + 1) * 0.28;
        var glow = star.size * 5.4;
        var color = star.hue === "warm" ? "255, 214, 118" : "186, 214, 255";

        ctx.beginPath();
        ctx.fillStyle = "rgba(" + color + "," + (0.12 * pulse).toFixed(3) + ")";
        ctx.arc(star.x, star.y, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255," + (0.42 * pulse + 0.18).toFixed(3) + ")";
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = window.requestAnimationFrame(draw);
    }

    function onResize() {
      resize();
    }

    function onVisibilityChange() {
      lastTime = 0;
      if (raf) cancelFrame(raf);
      raf = starfieldAllowed() ? window.requestAnimationFrame(draw) : 0;
    }

    resize();
    raf = starfieldAllowed() ? window.requestAnimationFrame(draw) : 0;

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener('portfolio:motion', onVisibilityChange);
    reducedMotion.addEventListener('change', onVisibilityChange);

    window.__lulaStarfield = {
      canvas: canvas,
      resize: resize,
      sync: onVisibilityChange,
      get running() { return !!raf; },
      destroy: function () {
        if (raf) {
          cancelFrame(raf);
          raf = 0;
        }
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        document.removeEventListener('portfolio:motion', onVisibilityChange);
        reducedMotion.removeEventListener('change', onVisibilityChange);
      }
    };
  }

  var tiltQueue = new Set();
  var tiltFrame = 0;
  var tiltLast = 0;
  function paintTilt(now) {
    tiltFrame = 0;
    var dt = Math.min((now - (tiltLast || now - 16.67)) / 1000, 0.05);
    tiltLast = now;
    var alpha = 1 - Math.exp(-16 * dt);
    tiltQueue.forEach(function (state) {
      if (!motionAllowed() || !state.card.isConnected) {resetTilt(state); return;}
      state.x += (state.tx - state.x) * alpha;
      state.y += (state.ty - state.y) * alpha;
      if (Math.abs(state.tx - state.x) < 0.015) state.x = state.tx;
      if (Math.abs(state.ty - state.y) < 0.015) state.y = state.ty;
      state.card.style.setProperty('--tilt-x', state.x.toFixed(3) + 'deg');
      state.card.style.setProperty('--tilt-y', state.y.toFixed(3) + 'deg');
      if (state.x === state.tx && state.y === state.ty) {
        tiltQueue.delete(state);
        state.card.classList.remove('motion-tracking');
      }
    });
    if (tiltQueue.size) tiltFrame = requestFrame(paintTilt);
    else tiltLast = 0;
  }
  function resetTilt(state) {
    tiltQueue.delete(state);
    state.x = state.y = state.tx = state.ty = 0;
    state.card.style.setProperty('--tilt-x', '0deg');
    state.card.style.setProperty('--tilt-y', '0deg');
    state.card.classList.remove('motion-tracking');
  }
  function scheduleTilt(state) {
    tiltQueue.add(state);
    state.card.classList.add('motion-tracking');
    if (!tiltFrame) tiltFrame = requestFrame(paintTilt);
  }
  function mountTilt() {
    if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches || reducedMotion.matches) return;
    var cards = document.querySelectorAll('#recent-posts > .recent-post-item:not([data-lula-tilt]), .card-widget:not([data-lula-tilt]), .lula-project-card:not([data-lula-tilt]), .lula-column-card:not([data-lula-tilt]), #portfolio-root .work-card:not([data-lula-tilt])');
    cards.forEach(function (card) {
      var state = {card:card, x:0, y:0, tx:0, ty:0, rect:null};
      card.setAttribute('data-lula-tilt', 'true');
      card.addEventListener('pointerenter', function () {state.rect = card.getBoundingClientRect();}, {passive:true});
      card.addEventListener('pointermove', function (event) {
        if (!motionAllowed() || event.pointerType === 'touch') return;
        var rect = state.rect || card.getBoundingClientRect();
        state.tx = Math.max(-2.5, Math.min(2.5, ((event.clientY - rect.top) / rect.height - 0.5) * -4));
        state.ty = Math.max(-3, Math.min(3, ((event.clientX - rect.left) / rect.width - 0.5) * 5));
        scheduleTilt(state);
      }, {passive:true});
      function leave() {state.rect = null; state.tx = state.ty = 0; scheduleTilt(state);}
      card.addEventListener('pointerleave', leave, {passive:true});
      card.addEventListener('pointercancel', leave, {passive:true});
      document.addEventListener('portfolio:motion', function () {resetTilt(state);});
      document.addEventListener('visibilitychange', function () {if (document.hidden) resetTilt(state);});
      window.addEventListener('blur', function () {resetTilt(state);});
      window.addEventListener('scroll', function () {state.rect = null;}, {passive:true});
      reducedMotion.addEventListener('change', function () {resetTilt(state);});
    });
  }

  function mountPageTransition() {
    ensureProgress();
    document.body.classList.add("lula-ready");
    document.body.classList.remove("lula-pjax-leaving");
  }

  function mountRecentThumbs() {
    var thumbs = document.querySelectorAll("#aside-content .card-widget.card-recent-post .aside-list > .aside-list-item .thumbnail");
    thumbs.forEach(function (thumb) {
      var image = thumb.querySelector("img");
      if (!image) return;

      var syncThumb = function () {
        var src = image.currentSrc || image.getAttribute("src");
        if (!src) return;
        thumb.classList.add("has-lula-thumb");
        thumb.style.setProperty("--lula-thumb-bg", 'url("' + src + '")');
        thumb.style.backgroundImage = 'url("' + src + '")';
        thumb.style.backgroundSize = "168%";
        thumb.style.backgroundPosition = "center";
        thumb.style.backgroundRepeat = "no-repeat";
      };

      if (image.complete) {
        syncThumb();
      } else {
        image.addEventListener("load", syncThumb, { once: true });
      }
    });
  }

  function run() {
    requestFrame(mountPageTransition);
    if (heroObserver) heroObserver.disconnect();
    var hero = document.querySelector('#portfolio-root .hero');
    heroVisible = !hero || hero.getBoundingClientRect().bottom > 0;
    if (hero && 'IntersectionObserver' in window) {
      heroObserver = new IntersectionObserver(function (entries) {heroVisible = entries[0].isIntersecting; document.documentElement.classList.toggle('hero-out-of-view', !heroVisible); if (window.__lulaStarfield) window.__lulaStarfield.sync();});
      heroObserver.observe(hero);
    }
    syncMotion();
    mountReveal();
    mountHeader();
    mountTilt();
    mountRecentThumbs();
  }

  document.addEventListener("DOMContentLoaded", run);
  function syncMotion() {
    document.documentElement.classList.toggle('no-motion', reducedMotion.matches);
    document.documentElement.classList.toggle('motion-paused', document.hidden);
    if (window.__lulaStarfield) window.__lulaStarfield.sync();
    else mountStarfield();
  }
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('portfolio:motion', syncMotion);
  reducedMotion.addEventListener('change', function () { syncMotion(); if (!reducedMotion.matches) mountTilt(); });
  document.addEventListener("pjax:send", function () {
    var progress = ensureProgress();
    progress.classList.add("is-active");
    progress.style.transform = "scaleX(0.72)";
    document.body.classList.add("lula-pjax-leaving");
  });
  document.addEventListener("pjax:complete", function () {
    var progress = ensureProgress();
    progress.style.transform = "scaleX(1)";
    window.setTimeout(function () {
      progress.classList.remove("is-active");
      progress.style.transform = "scaleX(0)";
    }, 220);
    run();
  });
})();
