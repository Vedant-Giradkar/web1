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

  // Hero title: made of particles that assemble, dissolve into dust and re-form (click or hover to scatter)
  var hero = document.querySelector(".hero"), h1 = hero && hero.querySelector("h1"); if (!h1) return;
  var bl = document.createElement("div"); bl.className = "blob"; hero.insertBefore(bl, hero.firstChild);
  var cv = document.createElement("canvas"); cv.className = "title-canvas"; h1.parentNode.insertBefore(cv, h1);
  h1.classList.add("sr-only");
  var ctx = cv.getContext("2d"), W, H, P = [], mouse = { x: -999, y: -999 }, mode = "in", modeT = 0, last = 0;
  var label = h1.textContent.trim();

  function build() {
    W = cv.width = Math.min(hero.clientWidth - 32, 1200);
    var fs = Math.min(W / (label.length * 0.62), 200); H = cv.height = Math.round(fs * 1.25);
    var o = document.createElement("canvas"); o.width = W; o.height = H; var c = o.getContext("2d");
    c.font = "900 " + fs + "px 'Segoe UI', Helvetica, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = fs * 0.04 + "px";
    c.fillStyle = "#fff"; c.fillText(label, W / 2, H / 2 + fs * 0.04);
    var d = c.getImageData(0, 0, W, H).data, step = Math.max(2, Math.round(fs / 55)); P = [];
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step)
      if (d[(y * W + x) * 4 + 3] > 128) P.push({ hx: x, hy: y, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s: step * 1.05, tint: Math.random() < .25 });
    mode = "in"; modeT = 0;
  }
  function scatter(power) { P.forEach(function (p) { var a = Math.random() * 6.283, v = (0.4 + Math.random()) * power; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - power * .25; }); }
  function setMode(m) { mode = m; modeT = 0; if (m === "dissolve") scatter(7); }
  build(); window.addEventListener("resize", build);
  cv.addEventListener("mousemove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * W / r.width; mouse.y = (e.clientY - r.top) * H / r.height; });
  cv.addEventListener("mouseleave", function () { mouse.x = mouse.y = -999; });
  cv.addEventListener("click", function () { if (mode === "hold") setMode("dissolve"); });

  var running = true;
  new IntersectionObserver(function (e) { var was = running; running = e[0].isIntersecting && hero.offsetParent !== null; if (running && !was) requestAnimationFrame(loop); }).observe(hero);
  function loop(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; modeT += dt;
    if (mode === "in" && modeT > 2.2) setMode("hold");
    else if (mode === "hold" && modeT > 7) setMode("dissolve");
    else if (mode === "dissolve" && modeT > 1.3) setMode("in");
    var k = mode === "dissolve" ? 0 : (mode === "in" ? 0.045 : 0.09), fr = mode === "dissolve" ? 0.97 : 0.84;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (mode === "dissolve") { p.vy -= 0.03; p.vx += 0.05; } // dust drifts up and to the side
      else { p.vx += (p.hx - p.x) * k; p.vy += (p.hy - p.y) * k; }
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 6400) { var d = Math.sqrt(d2) || 1, f = (80 - d) / 80 * 3; p.vx += dx / d * f; p.vy += dy / d * f; }
      p.vx *= fr; p.vy *= fr; p.x += p.vx; p.y += p.vy;
      ctx.fillStyle = p.tint ? "rgba(127,214,222,.95)" : "rgba(255,255,255,.95)";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
