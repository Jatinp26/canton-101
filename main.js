(function () {
  "use strict";
  var bar = document.getElementById("progressBar");
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
  var toc = document.getElementById("toc");
  var tocToggle = document.getElementById("tocToggle");
  if (tocToggle) {
    tocToggle.addEventListener("click", function () {
      var open = toc.classList.toggle("is-open");
      tocToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    toc.addEventListener("click", function (e) {
      if (e.target.closest(".toc__link") && window.innerWidth <= 900) {
        toc.classList.remove("is-open");
        tocToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc__link"));
  var sectionMap = tocLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sectionMap.length) {
    var visible = new Set();
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        var active = null;
        for (var i = 0; i < sectionMap.length; i++) {
          if (visible.has(sectionMap[i].el.id)) { active = sectionMap[i]; break; }
        }
        tocLinks.forEach(function (l) { l.classList.remove("is-active"); });
        if (active) active.link.classList.add("is-active");
      },
      { rootMargin: "-78px 0px -65% 0px", threshold: 0 }
    );
    sectionMap.forEach(function (s) { spy.observe(s.el); });
  }
  function showToast(msg) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-shown");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 1600);
  }

  document.querySelectorAll("[data-copy]").forEach(function (block) {
    var btn = block.querySelector(".copy-btn");
    var code = block.querySelector("code");
    if (!btn || !code) return;
    btn.addEventListener("click", function () {
      var text = code.innerText;
      var done = function () {
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        showToast("Copied to clipboard");
        setTimeout(function () {
          btn.textContent = "Copy";
          btn.classList.remove("is-copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
  var pathBtns = document.querySelectorAll(".pathpicker__btn");
  var steps = document.querySelectorAll(".step[data-step-for]");
  pathBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var path = btn.getAttribute("data-path");
      pathBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      steps.forEach(function (step) {
        var applies = step.getAttribute("data-step-for").split(" ");
        var dim = path !== "all" && applies.indexOf(path) === -1;
        step.classList.toggle("is-dimmed", dim);
      });
    });
  });
})();