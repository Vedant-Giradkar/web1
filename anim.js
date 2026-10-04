// Animations: network background, typing tagline, scroll reveal, count-up, card tilt, progress bar, cursor glow.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll progress bar + cursor glow
  var bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var d = document.documentElement;
    bar.style.width = (d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100) + "%";
  }, { passive: true });
  var glow = document.createElement("div"); glow.className = "cursor-glow"; document.body.appendChild(glow);
  window.addEventListener("mousemove", function (e) {
    glow.style.opacity = 1; glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
  }, { passive: true });

  // Typing tagline
  var tag = document.querySelector(".hero .tag");
  if (tag) {
    var full = tag.textContent;
    if (reduce) { tag.classList.add("done"); } else {
      tag.textContent = ""; var i = 0;
      setTimeout(function type() {
        tag.textContent = full.slice(0, ++i);
        if (i < full.length) setTimeout(type, 60); else tag.classList.add("done");
      }, 900);
    }
  }

  // Scroll reveal (+ stagger) and count-up
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); io.unobserve(en.target);
      var b = en.target.querySelector(".stat b"); if (b) countUp(b);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll("h2, .card, .stat, .pub, .news li, .pi > *, .lead, .empty, .gallery figure").forEach(function (el) {
    el.classList.add("reveal");
    var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(sibs, 6) * 80 + "ms";
    io.observe(el);
  });
  function countUp(el) {
    var m = el.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m || reduce) return;
    var end = +m[2], t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + Math.round(end * e) + m[3];
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  window.addEventListener("hashchange", function () {
    document.querySelectorAll(".hero .btn, .hero h1").forEach(function (e) { e.style.animation = "none"; void e.offsetWidth; e.style.animation = ""; });
  });

  if (reduce) return;

  // 3D tilt on cards
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = "perspective(700px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg) translateY(-4px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });

  // Hero: drifting "virus" particles linked by lines, reacting to the mouse
  var hero = document.querySelector(".hero"); if (!hero) return;
  var cv = document.createElement("canvas"); hero.insertBefore(cv, hero.firstChild);
  var ctx = cv.getContext("2d"), W, H, pts = [], mouse = { x: -999, y: -999 }, running = true;
  function size() {
    W = cv.width = hero.offsetWidth; H = cv.height = hero.offsetHeight;
    var n = Math.min(90, Math.round(W * H / 14000)); pts = [];
    for (var k = 0; k < n; k++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: 2 + Math.random() * 3 });
  }
  size(); window.addEventListener("resize", size);
  hero.addEventListener("mousemove", function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener("mouseleave", function () { mouse.x = mouse.y = -999; });
  new IntersectionObserver(function (e) { running = e[0].isIntersecting && hero.offsetParent !== null; if (running) loop(); }).observe(hero);
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    pts.forEach(function (p, i) {
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) { p.x += dx / d * 1.5; p.y += dy / d * 1.5; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], l = Math.hypot(p.x - q.x, p.y - q.y);
        if (l < 130) { ctx.strokeStyle = "rgba(127,214,222," + (1 - l / 130) * .4 + ")"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      ctx.fillStyle = "rgba(127,214,222,.75)"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(127,214,222,.35)"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 3, 0, 6.283); ctx.stroke();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();
