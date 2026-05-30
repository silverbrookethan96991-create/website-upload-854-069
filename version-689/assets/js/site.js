(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function initFiltering() {
    var input = document.querySelector(".movie-search-input");
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    if (!input && chips.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    var activeFilter = "全部";

    if (input && keyword) {
      input.value = keyword;
    }

    function matchCard(card, term, chip) {
      var haystack = (card.getAttribute("data-haystack") || card.textContent || "").toLowerCase();
      var searchOk = !term || haystack.indexOf(term) !== -1;
      var chipOk = chip === "全部" || haystack.indexOf(chip.toLowerCase()) !== -1;
      return searchOk && chipOk;
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.children);
        cards.forEach(function (card) {
          card.classList.toggle("is-hidden-card", !matchCard(card, term, activeFilter));
        });
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      if (chip.getAttribute("data-filter") === activeFilter) {
        chip.classList.add("is-active");
      }
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var button = document.querySelector(".play-button");
    var instance;

    if (!video || !streamUrl) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function begin() {
      hideOverlay();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", streamUrl);
        }
        video.play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!instance) {
          instance = new window.Hls();
          instance.loadSource(streamUrl);
          instance.attachMedia(video);
          instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.play();
        }
        return;
      }

      if (!video.getAttribute("src")) {
        video.setAttribute("src", streamUrl);
      }
      video.play();
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFiltering();
  });
})();
