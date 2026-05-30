(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (slides.length) {
            show(0);
            start();
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
    }

    var filterForm = document.querySelector('[data-filter]');
    if (filterForm) {
        var keyword = filterForm.querySelector('[data-filter-keyword]');
        var type = filterForm.querySelector('[data-filter-type]');
        var year = filterForm.querySelector('[data-filter-year]');
        var region = filterForm.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var empty = document.querySelector('[data-empty]');

        function filterCards() {
            var k = keyword ? keyword.value.trim().toLowerCase() : '';
            var t = type ? type.value : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var ok = true;
                if (k && card.getAttribute('data-title').indexOf(k) === -1) {
                    ok = false;
                }
                if (t && card.getAttribute('data-type') !== t) {
                    ok = false;
                }
                if (y && card.getAttribute('data-year') !== y) {
                    ok = false;
                }
                if (r && card.getAttribute('data-region') !== r) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [keyword, type, year, region].forEach(function (el) {
            if (el) {
                el.addEventListener('input', filterCards);
                el.addEventListener('change', filterCards);
            }
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-button]');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;
        var initialized = false;

        function nativePlayable() {
            return video && video.canPlayType('application/vnd.apple.mpegurl');
        }

        function attach() {
            if (!video || !stream || initialized) {
                return;
            }
            initialized = true;

            if (nativePlayable()) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            }
        }

        function play() {
            attach();
            if (video) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        window.setTimeout(function () {
                            video.play().catch(function () {});
                        }, 400);
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                attach();
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
