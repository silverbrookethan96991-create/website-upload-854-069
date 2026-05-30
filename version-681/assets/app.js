(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const normalize = (value) => String(value || '').toLowerCase().trim();

  ready(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
      menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('is-open');
      });
    }

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    };

    previous?.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      restart();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        restart();
      });
    });

    showSlide(activeIndex);
    restart();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
      const input = scope.querySelector('[data-filter-input]');
      const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
      const cards = Array.from(scope.querySelectorAll('[data-card]'));
      const count = scope.querySelector('[data-filter-count]');

      if (scope.hasAttribute('data-read-query') && input) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
          input.value = query;
        }
      }

      const applyFilter = () => {
        const keyword = normalize(input?.value);
        const typeValue = normalize(scope.querySelector('[data-filter-select="type"]')?.value);
        const yearValue = normalize(scope.querySelector('[data-filter-select="year"]')?.value);
        let visible = 0;

        cards.forEach((card) => {
          const search = normalize(card.getAttribute('data-search'));
          const type = normalize(card.getAttribute('data-type'));
          const year = Number(card.getAttribute('data-year') || 0);
          const keywordMatch = !keyword || search.includes(keyword);
          const typeMatch = !typeValue || type.includes(typeValue);
          let yearMatch = true;

          if (yearValue === 'classic') {
            yearMatch = year > 0 && year < 2010;
          } else if (yearValue) {
            yearMatch = year >= Number(yearValue);
          }

          const shouldShow = keywordMatch && typeMatch && yearMatch;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      };

      input?.addEventListener('input', applyFilter);
      selects.forEach((select) => select.addEventListener('change', applyFilter));
      applyFilter();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach((shell) => {
      const video = shell.querySelector('video[data-src]');
      const overlay = shell.querySelector('.play-overlay');
      const errorBox = shell.querySelector('.player-error');
      let hlsInstance = null;
      let initialized = false;

      if (!video) {
        return;
      }

      const showError = (message) => {
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = message;
        }
      };

      const loadVideo = () => {
        const source = video.getAttribute('data-src');
        if (!source) {
          showError('当前影片暂无可用播放源。');
          return;
        }

        overlay?.setAttribute('hidden', 'hidden');

        if (initialized) {
          video.play().catch(() => undefined);
          return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => undefined);
          });
          hlsInstance.on(window.Hls.Events.ERROR, (_event, data) => {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showError('网络加载异常，正在尝试恢复播放。');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showError('媒体解析异常，正在尝试恢复播放。');
              hlsInstance.recoverMediaError();
            } else {
              showError('播放器初始化失败，请刷新页面后重试。');
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => undefined);
          }, { once: true });
        } else {
          showError('当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
        }
      };

      overlay?.addEventListener('click', loadVideo);
      video.addEventListener('play', () => {
        if (!initialized) {
          video.pause();
          loadVideo();
        }
      });

      window.addEventListener('pagehide', () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
