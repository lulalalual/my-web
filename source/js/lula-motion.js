(function () {
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
      window.requestAnimationFrame(callback);
      return;
    }
    window.setTimeout(callback, 16);
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
      var starCount = Math.max(90, Math.min(180, Math.round((width * height) / 18000)));
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
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(window.innerWidth || document.documentElement.clientWidth || 0, 1);
      height = Math.max(window.innerHeight || document.documentElement.clientHeight || 0, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      createStars();
    }

    function draw(time) {
      if (!width || !height) {
        raf = window.requestAnimationFrame(draw);
        return;
      }

      var delta = lastTime ? Math.min(34, time - lastTime) : 16;
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
    }

    resize();
    raf = window.requestAnimationFrame(draw);

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.__lulaStarfield = {
      canvas: canvas,
      resize: resize,
      destroy: function () {
        if (raf) {
          cancelFrame(raf);
          raf = 0;
        }
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }

  function mountTilt() {
    if (!window.matchMedia || window.matchMedia("(pointer: coarse)").matches) return;

    var cards = document.querySelectorAll("#recent-posts > .recent-post-item:not([data-lula-tilt]), .card-widget:not([data-lula-tilt]), .lula-project-card:not([data-lula-tilt]), .lula-column-card:not([data-lula-tilt])");
    cards.forEach(function (card) {
      var raf = 0;
      var targetX = 0;
      var targetY = 0;
      var currentX = 0;
      var currentY = 0;
      var isHovering = false;

      card.setAttribute("data-lula-tilt", "true");

      function render() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        if (Math.abs(targetX - currentX) < 0.03) currentX = targetX;
        if (Math.abs(targetY - currentY) < 0.03) currentY = targetY;

        card.style.setProperty("--tilt-x", currentX.toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", currentY.toFixed(2) + "deg");

        if (!isHovering && currentX === 0 && currentY === 0) {
          raf = 0;
          return;
        }

        raf = window.requestAnimationFrame(render);
      }

      function schedule() {
        if (raf) return;
        raf = window.requestAnimationFrame(render);
      }

      card.addEventListener("pointerenter", function () {
        isHovering = true;
        schedule();
      }, { passive: true });

      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        targetX = Math.max(-4.4, Math.min(4.4, py * -5.2));
        targetY = Math.max(-5.8, Math.min(5.8, px * 6.4));
        schedule();
      }, { passive: true });

      card.addEventListener("pointerleave", function () {
        isHovering = false;
        targetX = 0;
        targetY = 0;
        schedule();
      }, { passive: true });
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
    mountStarfield();
    mountReveal();
    mountHeader();
    mountTilt();
    mountRecentThumbs();
  }

  document.addEventListener("DOMContentLoaded", run);
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
