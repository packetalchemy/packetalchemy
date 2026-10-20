/* PacketAlchemy motion: scroll-reveal + animated stat counters.
   No-JS or reduced-motion visitors always see the final state. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !reduce && "IntersectionObserver" in window) {
    revealEls.forEach(function (el) {
      el.classList.add("reveal-init");
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---- Animated counters ---- */
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) {
      el.textContent = target + suffix;
      return;
    }
    var dur = 1300;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              runCount(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) {
        cio.observe(el);
      });
    }
  }
})();
