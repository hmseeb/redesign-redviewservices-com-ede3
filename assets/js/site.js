/* ==========================================================================
   Redview Services Inc. — site scripts
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) return;

    function close() {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    header.querySelectorAll(".nav a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 940) close();
    });
  }

  /* ----------------------------------------------------------------------
     Sticky header shadow
     ---------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Current year
     ---------------------------------------------------------------------- */
  function initYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = y;
    });
  }

  /* ----------------------------------------------------------------------
     Forms — LeadrVision submission
     ---------------------------------------------------------------------- */
  function showStatus(form, type, title, message) {
    var box = form.querySelector(".form-status");
    if (!box) return;
    box.className =
      "form-status is-visible " +
      (type === "ok" ? "form-status--ok" : "form-status--err");
    var icon =
      type === "ok"
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>';
    box.innerHTML = icon + "<div><strong>" + title + "</strong>" + message + "</div>";
    box.setAttribute("role", "status");
  }

  function initForms() {
    var forms = document.querySelectorAll("form[data-leadr]");
    if (!forms.length) return;

    var href = window.location.href;
    var submitted =
      new URLSearchParams(window.location.search).get("submitted") === "1";

    forms.forEach(function (form) {
      /* Stamp the current page so visitors come back to the right place. */
      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = href;

      /* Confirmation after a plain (no-JS) HTML submission. */
      if (submitted) {
        showStatus(
          form,
          "ok",
          "Thanks, your message was sent.",
          "We’ve received your request and will be in touch shortly. Need us sooner? Call <a href=\"tel:+12132193986\">(213) 219-3986</a>."
        );
      }

      form.addEventListener("submit", function (event) {
        if (!window.fetch || !window.FormData) return; /* plain POST fallback */

        event.preventDefault();

        var button = form.querySelector('button[type="submit"]');
        var originalLabel = button ? button.innerHTML : "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Sending…";
        }

        var payload = {};
        new FormData(form).forEach(function (value, key) {
          if (typeof value === "string") payload[key] = value;
        });
        payload._page = href;

        fetch(form.getAttribute("action"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(function (response) {
            return response
              .json()
              .catch(function () {
                return {};
              })
              .then(function (data) {
                if (!response.ok || data.ok === false) throw new Error("failed");
                return data;
              });
          })
          .then(function () {
            form.reset();
            if (pageField) pageField.value = href;
            showStatus(
              form,
              "ok",
              "Thanks, your message was sent.",
              "We’ve received your request and will be in touch shortly. Need us sooner? Call <a href=\"tel:+12132193986\">(213) 219-3986</a>."
            );
            var box = form.querySelector(".form-status");
            if (box && box.scrollIntoView) {
              box.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          })
          .catch(function () {
            showStatus(
              form,
              "err",
              "That didn’t go through.",
              "Please try again, or reach us directly at <a href=\"tel:+12132193986\">(213) 219-3986</a> or <a href=\"mailto:contact@redviewservices.com\">contact@redviewservices.com</a>."
            );
          })
          .then(function () {
            if (button) {
              button.disabled = false;
              button.innerHTML = originalLabel;
            }
          });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    initNav();
    initStickyHeader();
    initReveal();
    initYear();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
