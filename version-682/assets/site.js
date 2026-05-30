(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    let index = slides.findIndex((slide) => slide.classList.contains("active"));

    if (index < 0) {
      index = 0;
    }

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => show(dotIndex));
    });

    if (slides.length > 1) {
      setInterval(() => show(index + 1), 5200);
    }
  });

  document.querySelectorAll("[data-filter-area]").forEach((area) => {
    const searchInput = area.querySelector(".js-search");
    const typeSelect = area.querySelector(".js-type-filter");
    const regionSelect = area.querySelector(".js-region-filter");
    const cards = Array.from(area.querySelectorAll(".movie-card"));
    const empty = area.querySelector(".empty-state");

    const applyFilter = () => {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const typeValue = typeSelect?.value || "";
      const regionValue = regionSelect?.value || "";
      let visible = 0;

      cards.forEach((card) => {
        const searchText = (card.dataset.search || "").toLowerCase();
        const typeText = card.dataset.type || "";
        const regionText = card.dataset.region || "";
        const queryMatched = !query || searchText.includes(query);
        const typeMatched = !typeValue || typeText.includes(typeValue);
        const regionMatched = !regionValue || regionText.includes(regionValue);
        const matched = queryMatched && typeMatched && regionMatched;

        card.style.display = matched ? "block" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? "block" : "none";
      }
    };

    [searchInput, typeSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });

  document.querySelectorAll("[data-player]").forEach((box) => {
    const video = box.querySelector("video");
    const playButton = box.querySelector(".player-play");
    const status = box.parentElement?.querySelector(".player-status");
    const source = box.dataset.src;
    let loaded = false;
    let hlsInstance = null;

    const setStatus = (text) => {
      if (status) {
        status.textContent = text;
      }
    };

    const loadStream = () => {
      if (!video || !source || loaded) {
        return;
      }

      loaded = true;
      setStatus("正在加载影片...");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setStatus("影片已就绪");
        });
        hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setStatus("播放加载失败，请稍后再试");
            hlsInstance.destroy();
            hlsInstance = null;
            loaded = false;
          }
        });
      } else {
        video.src = source;
        video.addEventListener("loadedmetadata", () => setStatus("影片已就绪"), { once: true });
      }
    };

    const start = async () => {
      if (!video) {
        return;
      }

      loadStream();
      box.classList.add("is-active");
      video.setAttribute("controls", "controls");

      try {
        await video.play();
        setStatus("正在播放");
      } catch (error) {
        setStatus("点击视频控件即可继续播放");
      }
    };

    if (playButton) {
      playButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    box.addEventListener("click", (event) => {
      if (event.target === video && box.classList.contains("is-active")) {
        return;
      }
      start();
    });
  });
})();
