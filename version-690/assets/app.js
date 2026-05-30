(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(current);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var container = scope.parentElement || document;
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      function apply() {
        var keyword = text(input && input.value);
        var regionValue = text(region && region.value);
        var typeValue = text(type && type.value);
        var yearValue = text(year && year.value);
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var cardRegion = text(card.getAttribute("data-region"));
          var cardType = text(card.getAttribute("data-type"));
          var cardYear = text(card.getAttribute("data-year"));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }
      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-play-trigger]");
      var url = shell.getAttribute("data-video");
      var initialized = false;
      var hlsInstance = null;
      function loadAndPlay() {
        if (!video || !url) {
          return;
        }
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
        video.controls = true;
        if (!initialized) {
          initialized = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            if (window.Hls.Events && hlsInstance.on) {
              hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
              });
            } else {
              video.play().catch(function () {});
            }
          } else {
            video.src = url;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }
      if (trigger) {
        trigger.addEventListener("click", loadAndPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            loadAndPlay();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
