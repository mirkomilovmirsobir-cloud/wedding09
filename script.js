(function () {
  "use strict";

  var cfg = window.WEDDING || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var fill = function (sel, value) {
    if (value === undefined || value === null) return;
    $$(sel).forEach(function (el) { el.textContent = value; });
  };

  /* ---------------- Content ---------------- */
  fill("[data-groom]", cfg.groom);
  fill("[data-bride]", cfg.bride);
  fill("[data-monogram]", cfg.monogram);
  fill("[data-date-short]", cfg.dateShort);
  fill("[data-date-long]", cfg.dateLong);
  fill("[data-day]", cfg.day);
  fill("[data-month]", cfg.month);
  fill("[data-year]", cfg.year);
  fill("[data-city]", cfg.city);
  fill("[data-venue]", cfg.venue);
  fill("[data-address]", cfg.address);
  fill("[data-rsvp-by]", cfg.rsvpBy);

  var together = $("[data-groom-first]");
  if (together) together.textContent = (cfg.groom || "") + " & " + (cfg.bride || "");

  document.title = (cfg.groom || "Wedding") + " & " + (cfg.bride || "");

  var mapLink = $("[data-map]");
  if (mapLink && cfg.mapQuery) {
    mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.mapQuery);
  }

  var waLink = $("[data-whatsapp]");
  if (waLink && cfg.whatsapp) {
    var msg = "Assalamu alaikum! I would love to confirm my attendance at the wedding of " +
      cfg.groom + " & " + cfg.bride + ".";
    waLink.href = "https://wa.me/" + String(cfg.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
  }

  var callLink = $("[data-call]");
  if (callLink && cfg.phone) {
    callLink.href = "tel:" + String(cfg.phone).replace(/[^\d+]/g, "");
  }

  /* ---------------- Schedule ---------------- */
  var timeline = $("#timeline");
  if (timeline && Array.isArray(cfg.schedule)) {
    timeline.innerHTML = cfg.schedule.map(function (item) {
      return '<li class="tl-item reveal">' +
        '<span class="tl-time">' + item.time + "</span>" +
        '<div class="tl-body"><h3>' + item.title + "</h3><p>" + item.text + "</p></div>" +
        "</li>";
    }).join("");
  }

  /* ---------------- Envelope ---------------- */
  var stage = $("#envelopeStage");
  var envWrap = $("#envWrap");
  var opened = false;

  function openInvitation() {
    if (opened || !stage) return;
    opened = true;
    stage.classList.add("is-opening");
    if (envWrap) envWrap.classList.add("is-open");
    document.body.classList.remove("is-locked");

    window.setTimeout(function () {
      stage.classList.add("is-done");
    }, 1800);

    window.setTimeout(function () {
      stage.style.display = "none";
    }, 3000);
  }

  ["#seal", "#envHint", "#envelope"].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener("click", openInvitation);
  });

  document.addEventListener("keydown", function (e) {
    if (!opened && (e.key === "Enter" || e.key === " " || e.key === "Escape")) openInvitation();
  });

  /* ---------------- Countdown ---------------- */
  function initCountdown() {
    var root = $("#countdown");
    var target = new Date(cfg.dateISO).getTime();
    if (!root || isNaN(target)) return;

    var cells = {
      days: $("[data-days]", root),
      hours: $("[data-hours]", root),
      minutes: $("[data-minutes]", root),
      seconds: $("[data-seconds]", root)
    };
    var note = $("[data-countdown-note]");
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };

    var timer = window.setInterval(tick, 1000);

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        window.clearInterval(timer);
        Object.keys(cells).forEach(function (k) { if (cells[k]) cells[k].textContent = "00"; });
        if (note) note.textContent = "Today is the day — see you there";
        return;
      }
      var s = Math.floor(diff / 1000);
      if (cells.days) cells.days.textContent = pad(Math.floor(s / 86400));
      if (cells.hours) cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      if (cells.minutes) cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      if (cells.seconds) cells.seconds.textContent = pad(s % 60);
    }

    tick();
  }

  /* ---------------- Scratch to reveal ---------------- */
  function initScratch() {
    var cards = $$("[data-scratch]");
    if (!cards.length) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function paint(card) {
      var canvas = $("canvas", card);
      if (!canvas) return;
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var w = rect.width;
      var h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#e9d7b0");
      grad.addColorStop(0.3, "#f8eed8");
      grad.addColorStop(0.55, "#ddc391");
      grad.addColorStop(0.8, "#f7ecd5");
      grad.addColorStop(1, "#cbab72");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.26;
      ctx.strokeStyle = "#fff9ea";
      ctx.lineWidth = 1;
      for (var x = -h; x < w + h; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#fffdf4";
      for (var i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.1 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      card.dataset.painted = "true";
    }

    function progress(canvas) {
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      if (!w || !h) return 0;
      var data = ctx.getImageData(0, 0, w, h).data;
      var clear = 0;
      var total = 0;
      var step = 24;
      for (var y = 0; y < h; y += step) {
        for (var x = 0; x < w; x += step) {
          total++;
          if (data[(y * w + x) * 4 + 3] < 40) clear++;
        }
      }
      return total ? clear / total : 0;
    }

    function reveal(card) {
      if (card.classList.contains("is-revealed")) return;
      card.classList.add("is-revealed");
    }

    cards.forEach(function (card) {
      var canvas = $("canvas", card);
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var drawing = false;
      var last = null;
      var radius = 20;

      function localPoint(e) {
        var r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function punch(x, y) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      function scratchTo(p) {
        if (!last) {
          punch(p.x, p.y);
        } else {
          var dx = p.x - last.x;
          var dy = p.y - last.y;
          var steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
          for (var i = 0; i <= steps; i++) {
            punch(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
          }
        }
        last = p;
      }

      canvas.addEventListener("pointerdown", function (e) {
        if (card.classList.contains("is-revealed")) return;
        drawing = true;
        last = null;
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        scratchTo(localPoint(e));
      });

      canvas.addEventListener("pointermove", function (e) {
        if (!drawing) return;
        scratchTo(localPoint(e));
        if (progress(canvas) > 0.35) {
          drawing = false;
          reveal(card);
        }
      });

      function end() {
        if (!drawing) return;
        drawing = false;
        last = null;
        if (progress(canvas) > 0.25) reveal(card);
      }

      canvas.addEventListener("pointerup", end);
      canvas.addEventListener("pointerleave", end);
      canvas.addEventListener("pointercancel", end);

      canvas.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          reveal(card);
        }
      });

      canvas.tabIndex = 0;
      canvas.setAttribute("role", "button");
      canvas.setAttribute("aria-label", "Scratch to reveal " + (card.dataset.label || "the date"));
    });

    function paintAll() {
      cards.forEach(function (card) {
        if (!card.classList.contains("is-revealed")) paint(card);
      });
    }

    paintAll();
    window.addEventListener("resize", paintAll);
  }

  /* ---------------- Petals ---------------- */
  function initPetals() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = $(".petals");
    if (!box) return;
    for (var i = 0; i < 16; i++) {
      var petal = document.createElement("span");
      petal.className = "petal";
      var size = 5 + Math.random() * 8;
      petal.style.cssText =
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "width:" + size.toFixed(1) + "px;height:" + (size * 1.15).toFixed(1) + "px;" +
        "--drift:" + (Math.random() * 90 - 45).toFixed(0) + "px;" +
        "animation-duration:" + (11 + Math.random() * 12).toFixed(1) + "s;" +
        "animation-delay:" + (-Math.random() * 20).toFixed(1) + "s;" +
        "opacity:" + (0.2 + Math.random() * 0.3).toFixed(2);
      box.appendChild(petal);
    }
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  initCountdown();
  initScratch();
  initPetals();
  initReveal();
})();
