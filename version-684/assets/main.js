(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function auto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                auto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                auto();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                auto();
            });
        });

        show(0);
        auto();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var url = "./search.html";
            if (query) {
                url += "?q=" + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    var filterScope = document.querySelector("[data-filter-scope]");
    if (filterScope) {
        var keywordInput = filterScope.querySelector("[data-filter-keyword]");
        var regionSelect = filterScope.querySelector("[data-filter-region]");
        var typeSelect = filterScope.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll("[data-card]"));
        var empty = filterScope.querySelector("[data-empty]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function match(card, keyword, region, type) {
            var haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-tags") || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
            var cardRegion = card.getAttribute("data-region") || "";
            var cardType = card.getAttribute("data-type") || "";
            var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
            var regionOk = !region || cardRegion === region;
            var typeOk = !type || cardType === type;
            return keywordOk && regionOk && typeOk;
        }

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var ok = match(card, keyword, region, type);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [keywordInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }
})();
