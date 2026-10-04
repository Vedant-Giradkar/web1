(function () {
  var S = window.SITE;
  var PAGES = [
    ["home", "Home"], ["pi", "Principal Investigator"], ["research", "Research"],
    ["publications", "Publications"], ["team", "Team"], ["gallery", "Gallery"],
    ["join", "Join Us"], ["archives", "Archives"]
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function url(u) { return /^(https?:|mailto:|#|images\/|\.\/)/.test(u) ? esc(u) : "#"; }
  function img(src, cls, label) {
    return src ? '<div class="' + cls + '" style="background-image:url(\'' + esc(src) + '\')"></div>'
               : '<div class="' + cls + '">' + esc(label || "Photo") + '</div>';
  }

  document.title = S.name + " | " + S.fullName;

  var h = S.home;
  var views = {};

  views.home =
    '<section class="hero"' + (h.heroImage ? ' style="background-image:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),url(\'' + esc(h.heroImage) + '\')"' : '') + '>' +
      (S.logo ? '<img class="logo" src="' + esc(S.logo) + '" alt="">' : '') +
      '<h1>' + esc(S.name) + '</h1><div class="full">' + esc(S.fullName) + '</div>' +
      '<div class="tag">' + esc(S.tagline) + '</div>' +
      '<a class="btn" href="#join">Join Us</a></section>' +
    '<div class="container"><h2>About the Lab</h2><p class="lead">' + esc(h.intro) + '</p>' +
      '<div class="stats">' + h.stats.map(function (s) {
        return '<div class="stat"><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></div>';
      }).join("") + '</div></div>' +
    '<div class="alt"><div class="container"><h2>Latest News</h2><ul class="news">' +
      h.news.map(function (n) { return '<li><time>' + esc(n.date) + '</time>' + esc(n.text) + '</li>'; }).join("") +
    '</ul></div></div>';

  var p = S.pi;
  views.pi = '<div class="container"><h2>Principal Investigator</h2><div class="pi">' +
    img(p.photo, "img", "PI Photo") + '<div><h1>' + esc(p.name) + '</h1><p class="lead">' + esc(p.title) + '</p><br>' +
    p.bio.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join("") +
    '<h3>Education</h3><ul>' + p.education.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join("") + '</ul>' +
    '<div class="links">' + p.links.map(function (l) { return '<a href="' + url(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; }).join("") + '</div>' +
    '</div></div></div>';

  views.research = '<div class="container"><h2>Research</h2><div class="grid">' +
    S.research.map(function (r) {
      return '<div class="card">' + img(r.image, "img", "Image") + '<div class="body"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></div></div>';
    }).join("") + '</div></div>';

  var years = S.publications.map(function (x) { return x.year; })
    .filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return b - a; });
  views.publications = '<div class="container"><h2>Publications</h2><div class="filters">Filter by year: ' +
    '<select id="yearFilter"><option value="">All</option>' + years.map(function (y) { return '<option>' + y + '</option>'; }).join("") +
    '</select></div><div id="pubList"></div></div>';

  views.team = '<div class="container"><h2>Team</h2><div class="grid">' +
    S.team.map(function (m) {
      return '<div class="card person">' + img(m.photo, "img", "Photo") + '<div class="body"><h3>' + esc(m.name) + '</h3><div class="role">' + esc(m.role) + '</div>' +
        (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : '') + '</div></div>';
    }).join("") + '</div></div>';

  views.gallery = '<div class="container"><h2>Gallery</h2>' +
    (S.gallery.length ? '<div class="gallery">' + S.gallery.map(function (g) {
      return '<figure><img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '" loading="lazy"><figcaption>' + esc(g.caption) + '</figcaption></figure>';
    }).join("") + '</div>' : '<div class="empty">Photos coming soon.</div>') + '</div>';

  var j = S.joinUs;
  views.join = '<div class="container"><h2>Join Us</h2><p class="lead">' + esc(j.text) + '</p><br><div class="grid">' +
    j.positions.map(function (x) { return '<div class="card"><div class="body"><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div></div>'; }).join("") +
    '</div><br><p>' + esc(j.howToApply) + '</p><a class="btn" href="mailto:' + esc(S.email) + '">Email Us</a></div>';

  views.archives = '<div class="container"><h2>Archives</h2>' +
    S.archives.map(function (a) {
      return '<div class="pub"><span class="yr">' + esc(a.year) + '</span><a href="' + url(a.link) + '">' + esc(a.title) + '</a></div>';
    }).join("") + '</div>';

  document.getElementById("nav").innerHTML = PAGES.map(function (pg) {
    return '<a href="#' + pg[0] + '" data-p="' + pg[0] + '">' + pg[1] + '</a>';
  }).join("");
  document.getElementById("main").innerHTML = PAGES.map(function (pg) {
    return '<section class="page" id="page-' + pg[0] + '">' + views[pg[0]] + '</section>';
  }).join("");
  document.getElementById("footer").innerHTML =
    '<div class="contact">' + esc(S.address) + '<br><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a> · ' + esc(S.phone) + '</div>' +
    '&copy; ' + new Date().getFullYear() + ' ' + esc(S.name) + '. All rights reserved.';

  function renderPubs() {
    var y = document.getElementById("yearFilter").value;
    document.getElementById("pubList").innerHTML = S.publications
      .filter(function (x) { return !y || String(x.year) === y; })
      .map(function (x) {
        return '<div class="pub"><span class="yr">' + esc(x.year) + '</span><b>' + esc(x.title) + '</b>' +
          '<div class="meta">' + esc(x.authors) + ' — <i>' + esc(x.journal) + '</i> · <a href="' + url(x.link) + '" target="_blank" rel="noopener">Link</a></div></div>';
      }).join("") || '<div class="empty">No publications.</div>';
  }
  document.getElementById("yearFilter").addEventListener("change", renderPubs);
  renderPubs();

  function route() {
    var id = location.hash.slice(1);
    if (!views[id]) id = "home";
    PAGES.forEach(function (pg) {
      document.getElementById("page-" + pg[0]).classList.toggle("active", pg[0] === id);
    });
    document.querySelectorAll("#nav a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.p === id);
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
