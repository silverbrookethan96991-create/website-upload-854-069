function initPlayer(videoId, layerId, source) {
    const video = document.getElementById(videoId);
    const layer = document.getElementById(layerId);
    if (!video || !layer || !source) {
        return;
    }

    let ready = false;

    function attachSource() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        attachSource();
        layer.classList.add("hidden");
        video.controls = true;
        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                layer.classList.remove("hidden");
            });
        }
    }

    layer.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        layer.classList.add("hidden");
    });
}

(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        const toggle = document.querySelector(".mobile-toggle");
        const menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            const open = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const prev = document.querySelector("[data-hero-prev]");
        const next = document.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function schedule() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                schedule();
            });
        });
        schedule();
    }

    function setupCatalogFilters() {
        const pages = Array.from(document.querySelectorAll(".catalog-page"));
        pages.forEach(function (page) {
            const input = page.querySelector("[data-search-input]");
            const buttons = Array.from(page.querySelectorAll("[data-filter]"));
            const scope = page.nextElementSibling && page.nextElementSibling.classList.contains("catalog-page") ? page.nextElementSibling : page;
            const cards = Array.from(scope.querySelectorAll("[data-card]"));
            const empty = scope.querySelector("[data-empty-state]");
            let filter = "all";

            function apply() {
                const query = input ? input.value.trim().toLowerCase() : "";
                let shown = 0;
                cards.forEach(function (card) {
                    const text = (card.getAttribute("data-search") || "").toLowerCase();
                    const type = card.getAttribute("data-type") || "";
                    const matchText = !query || text.indexOf(query) !== -1;
                    const matchFilter = filter === "all" || type.indexOf(filter) !== -1;
                    const visible = matchText && matchFilter;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    filter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    onReady(function () {
        setupMobileMenu();
        setupHero();
        setupCatalogFilters();
    });
})();
