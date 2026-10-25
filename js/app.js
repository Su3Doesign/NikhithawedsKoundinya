/* ==================================================================
   Nikhitha · Sai Koundinya: the invitation's behaviour.
   Plain scripts and no libraries, so it opens on old phones and
   tablets. Each scene is a tall section with a sticky stage; its
   progress is worked out from the scroll position. Anything that
   animates runs only while it is on screen.
   ================================================================== */
(function () {
  'use strict';
  var D = window.INVITE || {};
  var BOOK = window.Book || null;
  var doc = document, root = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function span(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } }
  var raf = window.requestAnimationFrame ? function (f) { return window.requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var MOTION = !RM;
  var LOW = (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 4;
  var DPR = Math.min(window.devicePixelRatio || 1, LOW ? 1 : 1.5);
  var IO = 'IntersectionObserver' in window;
  var PTR = 'onpointerdown' in window ? 'pointerdown' : ('ontouchstart' in window ? 'touchstart' : 'mousedown');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // a decorative picture that fails to load (an old browser without WebP) is hidden, not shown broken
  doc.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && !t.alt) t.style.visibility = 'hidden'; }, true);

  /* ---------------------------------------------------------------- details */
  var EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var TE_DAYS = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
  var EN_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var TE_MON = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var when = (function () {
    var m = String(D.muhurtham || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3], h = +m[4], mi = +m[5];
    return { t: Date.UTC(y, mo, d, h, mi) - 330 * 60000, y: y, mo: mo, d: d, h: h, mi: mi, wd: new Date(Date.UTC(y, mo, d)).getUTCDay() };
  })();
  var F = {};
  if (when) {
    F.dateShort = pad(when.d) + ' · ' + pad(when.mo + 1) + ' · ' + when.y;
    F.dateLong = when.d + ' ' + EN_MON[when.mo] + ' ' + when.y;
    F.dateLongTe = when.d + ' ' + TE_MON[when.mo] + ' ' + when.y;
    F.timeTe = (when.h < 12 ? 'ఉదయం ' : when.h < 16 ? 'మధ్యాహ్నం ' : when.h < 19 ? 'సాయంత్రం ' : 'రాత్రి ') + (when.h % 12 || 12) + ':' + pad(when.mi) + ' గంటలకు';
    F.weekday = EN_DAYS[when.wd];
    F.weekdayTe = TE_DAYS[when.wd];
    F.time = (when.h % 12 || 12) + ':' + pad(when.mi) + (when.h < 12 ? ' am' : ' pm');
  }
  var V = D.venue || {};
  if (V.name) F.venueName = V.name;
  if (V.nameTe) F.venueNameTe = V.nameTe;
  if (V.address) F.venueAddress = V.address;
  if (D.rsvp && D.rsvp.display) F.rsvpDisplay = D.rsvp.display;
  var EV = D.events || {};
  Object.keys(EV).forEach(function (id) {
    var e = EV[id] || {};
    var w = e.when || (id === 'vivaham' && when ? F.dateLong + ' · ' + F.time : '');
    var p = e.where || (id === 'vivaham' ? V.name : '');
    if (w) F['ev.' + id + '.when'] = w;
    if (p) F['ev.' + id + '.where'] = p;
    if (e.show === false) $$('[data-ev="' + id + '"]').forEach(function (li) { li.hidden = true; });
  });
  $$('[data-f]').forEach(function (el) {
    var v = F[el.getAttribute('data-f')];
    if (v) el.textContent = v;
    else if (!el.firstChild) el.hidden = true;          // nothing to say, and no placeholder: leave no gap
  });
  // with only a map link for the venue, show the buttons and not the empty name lines
  if (!V.name && !V.address && V.mapUrl) $$('.v-name, .v-adr').forEach(function (el) { el.hidden = true; });
  safe(function () {
    var pc = D.panchangam || {}, out = [];
    var SUF = { samvatsaram: ' నామ సంవత్సరం', masam: ' మాసం', paksham: ' పక్షం', tithi: '', nakshatram: ' నక్షత్రం', lagnam: ' లగ్నం' };
    ['samvatsaram', 'masam', 'paksham', 'tithi', 'nakshatram', 'lagnam'].forEach(function (k) {
      var v = String(pc[k] || '').trim();
      if (v) out.push(v.indexOf(SUF[k].trim()) === -1 ? v + SUF[k] : v);
    });
    if (out.length) { var el = $('#panch'); el.textContent = 'స్వస్తిశ్రీ చాంద్రమాన ' + out.join(' · '); el.hidden = false; }
  });

  function stamp(t) { var d = new Date(t); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
  function setLink(el, href) {
    if (!el) return;
    if (href) { el.href = href; el.removeAttribute('aria-disabled'); }
    else { el.setAttribute('aria-disabled', 'true'); el.removeAttribute('target'); el.removeAttribute('href'); }
  }
  var cal = when ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Wedding · Nikhitha & Sai Koundinya') +
    '&dates=' + stamp(when.t) + '/' + stamp(when.t + (D.durationHours || 3) * 3600000) +
    '&details=' + encodeURIComponent('Muhurtham at ' + F.time + ' IST.') +
    (V.name ? '&location=' + encodeURIComponent(V.name + (V.address ? ', ' + V.address : '')) : V.mapUrl ? '&location=' + encodeURIComponent(V.mapUrl) : '') : null;
  setLink($('#calMain'), cal); setLink($('#calBless'), cal);
  setLink($('#mapLink'), V.mapUrl || (V.name ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(V.name + ' ' + (V.address || '')) : null));
  var R = D.rsvp || {};
  setLink($('#rsvpLink'), R.whatsapp ? 'https://wa.me/' + String(R.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(R.message || '') : null);

  // the countdown shows once the muhurtham is fixed
  safe(function () {
    var box = $('#cd'), cells = $$('#cd b');
    if (!when || when.t < Date.now()) return;
    box.hidden = false;
    function tick() {
      var r = Math.floor((when.t - Date.now()) / 1000);
      if (r <= 0) { box.hidden = true; clearInterval(iv); return; }
      var v = [Math.floor(r / 86400), Math.floor(r / 3600) % 24, Math.floor(r / 60) % 60, r % 60];
      for (var i = 0; i < 4; i++) cells[i].textContent = pad(v[i]);
    }
    var iv = setInterval(tick, 1000); tick();
  });

  // the letter, in Telugu or English
  safe(function () {
    var bt = $$('.lang button'), te = $('.letter-te'), en = $('.letter-en');
    if (!bt.length || !te || !en) return;
    function set(l) {
      te.hidden = l !== 'te'; en.hidden = l !== 'en';
      bt.forEach(function (b) { var on = b.getAttribute('data-lang') === l; b.classList[on ? 'add' : 'remove']('on'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      (l === 'te' ? te : en).classList.add('in');
    }
    bt.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-lang')); }); });
    set('te');
  });

  /* ---------------------------------------------------------------- the signature */
  var sigs = [];
  function prepSig(host, id) {
    var svg = host.querySelector('svg');
    if (!svg) return null;
    var ps = $$('.sig-pen path', svg), lens = [];
    ps.forEach(function (p) {
      var L = 10;
      try { L = p.getTotalLength(); } catch (e) {}
      p.removeAttribute('pathLength');
      lens.push(L);
      if (MOTION) { p.style.strokeDasharray = L + ' ' + (L + 4); p.style.strokeDashoffset = L; }
    });
    var u = svg.querySelector('.sig-under'), dot = svg.querySelector('.sig-dot'), uL = 10;
    if (u) {
      try { uL = u.getTotalLength(); } catch (e) {}
      u.removeAttribute('pathLength');
      if (MOTION) { u.style.strokeDasharray = uL + ' ' + (uL + 4); u.style.strokeDashoffset = uL; }
    }
    if (dot && MOTION) { dot.style.opacity = '0'; }
    return { ps: ps, lens: lens, u: u, dot: dot, done: false };
  }
  function writeSig(s, total, delay) {
    if (!s || s.done || !MOTION) return;
    s.done = true;
    var sum = 0, t = delay || 0;
    s.lens.forEach(function (L) { sum += L; });
    s.ps.forEach(function (p, i) {
      var d = Math.max(24, total * s.lens[i] / sum);
      p.style.transition = 'stroke-dashoffset ' + Math.round(d) + 'ms linear ' + Math.round(t) + 'ms';
      t += d * 0.93;
    });
    if (s.u) s.u.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.6,0,.2,1) ' + Math.round(t) + 'ms';
    if (s.dot) s.dot.style.transition = 'opacity 400ms ease ' + Math.round(t + 800) + 'ms';
    raf(function () { raf(function () {
      s.ps.forEach(function (p) { p.style.strokeDashoffset = '0'; });
      if (s.u) s.u.style.strokeDashoffset = '0';
      if (s.dot) s.dot.style.opacity = '1';
    }); });
  }
  safe(function () {
    var x = new XMLHttpRequest();
    x.open('GET', 'img/art/signature.svg');
    x.onload = function () {
      if (x.status && x.status !== 200) return;
      var svg = x.responseText;
      if (svg.indexOf('<svg') === -1) return;
      safe(function () {
        var a = $('#sigOpen'), b = $('#sigEnd');
        if (!a.hasAttribute('data-static-signature')) { a.innerHTML = svg; sigs[0] = prepSig(a); }
        if (!b.hasAttribute('data-static-signature')) { b.innerHTML = svg.replace(/sigMaskA/g, 'sigMaskB'); sigs[1] = prepSig(b); }
        writeSig(sigs[0], 3200, 250);
        if (endSeen) writeSig(sigs[1], 2400, 300);
      });
    };
    x.send();
  });

  /* ---------------------------------------------------------------- the toranam: mango leaves and marigolds */
  safe(function () {
    var host = $('#toranam');
    function build() {
      var W = host.clientWidth, H = host.clientHeight;
      if (!W) return;
      var n = clamp(Math.round(W / 32), 9, 44), sag = Math.min(16, H * 0.18), y0 = 5;
      function y(x) { return y0 + sag * (1 - Math.pow((x - W / 2) / (W / 2), 2)); }
      var big = W > 700 ? 1.15 : 1, maxL = H - sag - y0 - 4;
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">';
      s += '<path d="M0 ' + y(0) + ' Q' + W / 2 + ' ' + (2 * y(W / 2) - y0) + ' ' + W + ' ' + y(W) + '" fill="none" stroke="#B8945A" stroke-width="1.4"/>';
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) * W / n, yy = y(x);
        if (i % 3 === 1) {
          var m = 24 * big;
          s += '<g transform="translate(' + x.toFixed(1) + ' ' + yy.toFixed(1) + ')"><path d="M0 0 V5" stroke="#B8945A" stroke-width="1"/><image href="img/art/marigold.png" xlink:href="img/art/marigold.png" x="' + (-m / 2) + '" y="4" width="' + m + '" height="' + m + '"/></g>';
        } else {
          var L = Math.min(maxL, (50 + ((i * 7) % 5) * 4) * big), w = L * 0.31, flip = i % 2 ? -1 : 1, rot = ((i * 13) % 7 - 3) * 1.5;
          s += '<g transform="translate(' + x.toFixed(1) + ' ' + yy.toFixed(1) + ') rotate(' + rot + ')"><image href="img/art/leaf.png" xlink:href="img/art/leaf.png" x="' + (-w / 2) + '" y="-3" width="' + w + '" height="' + L + '" transform="scale(' + flip + ' 1)"/></g>';
        }
      }
      host.innerHTML = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ') + '</svg>';
    }
    build();
    var lw = innerWidth;
    window.addEventListener('resize', function () { if (innerWidth !== lw) { lw = innerWidth; build(); } });
  });

  /* ---------------------------------------------------------------- scenes */
  var vh = window.innerHeight, vw = window.innerWidth, docH = 1;
  var scenes = [];
  function scene(id, fn, hooks) {
    var el = doc.getElementById(id);
    if (!el) return null;
    var s = { el: el, stage: $('.stage', el), len: parseFloat(el.getAttribute('data-len')) || 2, fn: fn, h: hooks || {}, p: -1, on: false };
    scenes.push(s);
    return s;
  }
  function layout() {
    var view = BOOK ? BOOK.viewport() : { height: window.innerHeight, width: window.innerWidth };
    vh = view.height; vw = view.width;
    root.style.setProperty('--vh', (vh * 0.01) + 'px');
    scenes.forEach(function (s) {
      var sceneHeight = BOOK ? BOOK.viewport(s.el.id).height : vh;
      if (MOTION) { s.el.style.height = Math.round((BOOK ? 1 : s.len) * sceneHeight) + 'px'; s.stage.style.height = sceneHeight + 'px'; }
    });
    scenes.forEach(function (s) { if (s.h.resize) safe(s.h.resize); });
    docH = Math.max(doc.body.scrollHeight, root.scrollHeight);
    update(true);
  }
  function update(force) {
    if (BOOK) { drawPage(BOOK.currentId(), BOOK.progress(), force); return; }
    var y = window.pageYOffset || root.scrollTop || 0;
    var tops = scenes.map(function (s) { return s.el.getBoundingClientRect().top + y; });
    scenes.forEach(function (s, i) {
      var top = tops[i], h = s.el.offsetHeight;
      var near = y + vh > top - vh * 0.5 && y < top + h + vh * 0.5;
      if (near !== s.on) { s.on = near; if (s.h.active) safe(function () { s.h.active(near); }); }
      if (!MOTION || (!near && !force)) return;
      var p = clamp((y - top) / Math.max(1, h - vh), 0, 1);
      if (p !== s.p || force) { s.p = p; safe(function () { s.fn(p); }); }
    });
    chrome(y);
  }
  function drawPage(id, progress, force) {
    scenes.forEach(function (s) {
      var active = s.el.id === id && !doc.hidden;
      if (active !== s.on) { s.on = active; if (s.h.active) safe(function () { s.h.active(active); }); }
      if (active && MOTION && (force || progress !== s.p)) {
        s.p = progress; safe(function () { s.fn(progress); });
      }
    });
  }

  /* 01 · the couple and the two supplied portraits, always uncropped */
  safe(function () {
    var portraits = $$('#portraitSequence .portrait-slide');
    if (!portraits.length) return;
    scene('couple', function (p) {
      var bride = smooth(span(p, 0.18, 0.32));
      var groom = smooth(span(p, 0.58, 0.72));
      var opacity = [1 - bride, bride * (1 - groom), groom];
      portraits.forEach(function (portrait, i) {
        portrait.style.opacity = opacity[i].toFixed(3);
        portrait.setAttribute('aria-hidden', opacity[i] < 0.5 ? 'true' : 'false');
      });
    });
  });

  /* 02 · three knots: the camera stops at each knot, then steps back */
  safe(function () {
    var view = $('#knView'), world = $('#knWorld'), nums = $$('.kn-n');
    var IW = 1200, IH = 2100, AXIS = 600, KN = [688, 511, 333], KTALL = 143, AT = [0.12, 0.32, 0.52];
    var f = 1, SW = 1, SH = 1, zk = 3, said = [false, false, false], nw = [0, 0, 0], nh = [0, 0, 0];
    function keys() {
      return [[0, KN[0] + 30, zk * 1.1], [0.07, KN[0], zk], [0.14, KN[0], zk], [0.27, KN[1], zk], [0.34, KN[1], zk],
        [0.47, KN[2], zk], [0.54, KN[2], zk], [0.86, IH * 0.5, 1], [1, IH * 0.5, 1]];
    }
    function cam(q) {
      var K = keys(), i = 0;
      while (i < K.length - 2 && q > K[i + 1][0]) i++;
      var a = K[i], b = K[i + 1], t = smooth((q - a[0]) / (b[0] - a[0]));
      return [a[1] + (b[1] - a[1]) * t, Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * t)];
    }
    scene('knots', function (p) {
      var c = cam(p), y = c[0], z = c[1], k = f * z;
      var tx = SW / 2 - AXIS * k, ty = SH / 2 - y * k;
      var tr = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + z.toFixed(4) + ')';
      world.style.webkitTransform = tr; world.style.transform = tr;
      var near = smooth((z - 1.6) / 1.2);
      nums.forEach(function (n, i) {
        var side = i === 1 ? -1 : 1;
        var nx = SW / 2 + side * 80 * k + (side < 0 ? -nw[i] : 0), ny = ty + KN[i] * k - nh[i] / 2;
        var t2 = 'translate(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px)';
        n.style.webkitTransform = t2; n.style.transform = t2;
        n.style.opacity = p > AT[i] ? near.toFixed(3) : '0';
        if (p > AT[i] && !said[i]) { said[i] = true; if (window.Music) Music.chime(0.35); }
        if (p < AT[i] - 0.03) said[i] = false;
      });
    }, { resize: function () {
      if (!MOTION) return;
      SW = view.clientWidth; SH = view.clientHeight;
      nums.forEach(function (n, i) { nw[i] = n.offsetWidth; nh[i] = n.offsetHeight; });
      f = Math.min(SW / IW, SH / IH) * 0.94;
      world.style.width = (IW * f).toFixed(1) + 'px'; world.style.height = (IH * f).toFixed(1) + 'px';
      zk = clamp(SH * 0.27 / (KTALL * f), 1.6, 5.5);
    } });
  });

  /* 03 · talambralu: a handful of rice with each line of the verse */
  var rice = null;
  safe(function () {
    if (!window.Talambralu || !window.Rice) return;
    var stage = $('#talambralu .stage'), cv = $('#talCv'), lines = $$('#verse li'), head = $('#talambralu .head'), verse = $('#verse'), tap = $('#talTap');
    rice = Talambralu.create(cv, { dpr: DPR, low: LOW });
    var tossed = [false, false, false, false], looping = false, until = 0;
    var TOSS = [[0.3, 0.6, 70, { y: 0.55, w: 0.1, r: 0.35 }], [0.7, 0.72, 80, { y: 0.55, w: 0.4, r: 0.05 }], [0.3, 0.86, 90, null], null];
    function n(k) { return Math.round(k * (LOW ? 0.6 : vw > 900 ? 1.4 : 1)); }
    function loop() { var t = now(), more = rice.tick(t); if (more || t < until) raf(loop); else looping = false; }
    function kick() { until = now() + 700; if (!looping) { looping = true; raf(loop); } }
    scene('talambralu', function (p) {
      lines.forEach(function (li, i) {
        var a0 = 0.04 + i * 0.22;
        var a = smooth(span(p, a0, a0 + 0.06)) * (i === 3 ? 1 : 1 - smooth(span(p, a0 + 0.17, a0 + 0.22)));
        li.style.opacity = a.toFixed(3);
        var tr = 'translateY(' + ((1 - a) * 12).toFixed(1) + 'px)';
        li.style.webkitTransform = tr; li.style.transform = tr;
        var at = a0 + 0.02;
        if (p > at && !tossed[i]) {
          tossed[i] = true;
          if (i < 3) rice.toss(TOSS[i][0], TOSS[i][1], n(TOSS[i][2]), TOSS[i][3]);
          else { rice.toss(0.27, 0.97, n(80)); rice.toss(0.73, 1, n(80), null, 140); }
          kick();
        }
        if (p < at - 0.04) tossed[i] = false;
      });
      tap.style.opacity = smooth(span(p, 0.8, 0.88)).toFixed(3);
    }, {
      resize: function () {
        rice.resize();
        var sr = stage.getBoundingClientRect(), hb = head.getBoundingClientRect(), vr = verse.getBoundingClientRect();
        rice.band(hb.bottom - sr.top + 10, vr.top - sr.top - 4);
      }
    });
    stage.addEventListener(PTR, function (e) {
      var pt = e.touches ? e.touches[0] : e;
      rice.tap(pt.clientX, pt.clientY); kick();
    }, { passive: true });
  });

  /* 04 · seven steps */
  safe(function () {
    var walk = $('#walk'), feet = $$('#walk .ft'), sakha = $('#saptapadi .sakha');
    scene('saptapadi', function (p) {
      feet.forEach(function (f, i) { f.classList[p > 0.06 + i * 0.1 ? 'add' : 'remove']('on'); });
      sakha.classList[p > 0.8 ? 'add' : 'remove']('on');
    }, { resize: function () {
      if (!MOTION) return;
      // seven prints up the stage, each sized so the column fits any screen
      var W = walk.clientWidth, H = walk.clientHeight, fw = Math.max(24, Math.min(60, H * 0.092)), dx = Math.min(W * 0.12, 64, fw * 1.25);
      feet.forEach(function (f, i) {
        var y = H * 0.86 - i * (H * 0.76 / 6), x = W / 2 + (i % 2 ? dx : -dx);
        f.style.width = fw.toFixed(1) + 'px';
        f.style.left = x.toFixed(1) + 'px'; f.style.top = y.toFixed(1) + 'px';
      });
    } });
  });

  /* 05 · Arundhati and Vasishtha become a dedication in their names */
  safe(function () {
    if (!window.Sky) return;
    var stage = $('#arundhati .stage'), cv = $('#sky'), head = $('#arundhati .head');
    var cap = $('#skyCap'), names = $('#starNames');
    var sky = Sky.create(cv, { dpr: DPR, low: LOW });
    var q = MOTION ? 0 : 1, live = false, looping = false, rang = false;
    var MAP = [[0, 0], [0.12, 0.27], [0.36, 0.56], [0.46, 0.6], [0.56, 0.74], [0.68, 0.8], [1, 0.8]];
    function skyP(x) {
      for (var i = 0; i < MAP.length - 1; i++) {
        var a = MAP[i], b = MAP[i + 1];
        if (x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
      return 0.8;
    }
    function paint(t) {
      sky.draw(skyP(q), t / 1000);
      var reveal = smooth(span(q, 0.62, 0.86));
      head.style.opacity = (1 - smooth(span(q, 0.16, 0.25))).toFixed(3);
      cap.style.opacity = (smooth(span(q, 0.28, 0.35)) * (1 - smooth(span(q, 0.5, 0.6)))).toFixed(3);
      cv.style.opacity = (1 - reveal * 0.76).toFixed(3);
      names.style.opacity = reveal.toFixed(3);
      names.style.transform = 'translateY(' + ((1 - reveal) * 12).toFixed(1) + 'px)';
      names.setAttribute('aria-hidden', reveal < 0.5 ? 'true' : 'false');
      if (q > 0.65 && !rang) { rang = true; if (window.Music) Music.chime(0.5); }
      if (q < 0.5) rang = false;
    }
    function loop(t) { paint(t); if (live) raf(loop); else looping = false; }
    function place() {
      sky.resize();
      sky.focus(stage.clientWidth * 0.5, stage.clientHeight * 0.38, Math.min(stage.clientWidth, stage.clientHeight) * 0.15);
      paint(now());
    }
    scene('arundhati', function (p) { q = p; if (!looping) paint(now()); }, {
      resize: place,
      active: function (on) { live = on && MOTION && !LOW; if (live && !looping) { looping = true; raf(loop); } }
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(place);
  });

  /* ---------------------------------------------------------------- fixed bits: progress, music, keep scrolling */
  var bar = $('#progress'), musicBtn = $('#music'), scrollControls = $('#autoScrollControls'), cue = $('#cue');
  var darkIds = ['knots', 'talambralu', 'arundhati', 'end'];
  var probeY = function () { return vh - 34; };
  var idle = 0;
  function chrome(y) {
    var p = clamp(y / Math.max(1, docH - vh), 0, 1);
    var t = 'scaleX(' + p.toFixed(4) + ')';
    bar.style.webkitTransform = t; bar.style.transform = t;
    // the music button reads on dark chapters too
    var probe = probeY(), dark = false;
    darkIds.forEach(function (id) { var el = doc.getElementById(id); if (!el) return; var r = el.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) dark = true; });
    musicBtn.classList[dark ? 'add' : 'remove']('dark');
    if (scrollControls) scrollControls.classList[dark ? 'add' : 'remove']('dark');
    // the words beside the button fold away once the guest has scrolled on
    if (y > vh * 0.6) musicBtn.classList.add('short');
  }
  function showCue(on) {
    if (BOOK) return;
    if (window.AutoScroll && AutoScroll.isOn()) on = false;
    if ((window.pageYOffset || 0) > vh * 0.5) cue.classList.add('small');
    cue.classList[on ? 'add' : 'remove']('on');
  }
  function cueCheck() {
    var y = window.pageYOffset || 0, end = doc.getElementById('end');
    var nearEnd = end ? end.getBoundingClientRect().top < vh * 0.9 : y + vh > docH - 200;
    showCue(!nearEnd);
  }
  window.addEventListener('scroll', function () {
    showCue(false);
    clearTimeout(idle);
    idle = setTimeout(cueCheck, 1500);
  }, { passive: true });
  setTimeout(cueCheck, 1800);

  safe(function () {
    if (!window.Music || !Music.supported()) { musicBtn.hidden = true; return; }
    musicBtn.hidden = false;
    musicBtn.classList.add('hint');
    Music.subscribe(function () {
      var on = Music.isOn(), pending = Music.isPending();
      musicBtn.classList[on ? 'add' : 'remove']('on');
      musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      musicBtn.setAttribute('aria-busy', pending ? 'true' : 'false');
      musicBtn.setAttribute('aria-label', pending ? 'Cancel loading music' : on ? 'Pause music' : 'Play music');
      musicBtn.title = pending ? 'Loading music…' : on ? 'Pause music' : 'Play music';
      $('.music-t', musicBtn).textContent = pending ? 'Loading music…' : on ? 'Pause music' : 'Tap for music';
      $('#musicStatus').textContent = Music.error();
    });
    musicBtn.addEventListener('click', function () {
      musicBtn.classList.remove('hint'); musicBtn.classList.add('used');
      Music.toggle();
    });
  });

  /* ---------------------------------------------------------------- reveal as things come into view */
  safe(function () {
    var els = $$('.rv');
    if (!MOTION || !IO) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  });

  /* ---------------------------------------------------------------- the muggu: one line round a 7 x 7 grid of dots */
  safe(function () {
    var svg = $('#mug'), again = $('#mugAgain');
    function make(n, seed) {
      var N = 2 * n, M = {}, st = seed;
      var rnd = function () { return (st = st * 16807 % 2147483647) / 2147483647; };
      var K = function (x, y) { return x + ',' + y; }, rot = function (p) { return [N - p[1], p[0]]; };
      function refl(x, y, dx, dy) { var m = M[K(x, y)]; if (x === 0 || x === N || m === 'v') dx = -dx; if (y === 0 || y === N || m === 'h') dy = -dy; return [dx, dy]; }
      function trace() {
        var id = {}, L = [];
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          if (id[K(x, y)] !== undefined) continue;
          var o = (x + y) % 2, p = [o ? x : x + 1, y], d = [o ? 1 : -1, 1], start = p + '|' + d, pts = [], guard = 0;
          do {
            id[K(Math.min(p[0], p[0] + d[0]), Math.min(p[1], p[1] + d[1]))] = L.length;
            pts.push(p); p = [p[0] + d[0], p[1] + d[1]]; d = refl(p[0], p[1], d[0], d[1]);
          } while (p + '|' + d !== start && ++guard < 5000);
          L.push(pts);
        }
        return [L, id];
      }
      for (var g = 0; g < 400; g++) {
        var tr = trace(), L = tr[0], id = tr[1];
        if (L.length === 1) return L[0];
        var c = [];
        for (var y = 1; y < N; y++) for (var x = 1; x < N; x++) if ((x + y) % 2 && !M[K(x, y)] && id[K(x, y)] !== id[K(x, y - 1)]) c.push([x, y]);
        if (!c.length) return null;
        var p = c[Math.floor(rnd() * c.length)], o = rnd() < 0.5 ? 'v' : 'h';
        for (var r = 0; r < 4; r++) { M[K(p[0], p[1])] = o; p = rot(p); o = o === 'v' ? 'h' : 'v'; }
      }
      return null;
    }
    var U = 20, seed = 7 + Math.floor(Math.random() * 40) * 4, drawn = false;
    function draw(animate) {
      var L = null;
      for (var sd = seed; !L && sd < seed + 400; sd += 4) L = make(7, sd);
      if (!L) return;
      var P = L.map(function (q) { return [q[0] * U, q[1] * U]; });
      var mid = function (a, b) { return (a[0] + b[0]) / 2 + ' ' + (a[1] + b[1]) / 2; };
      var d = 'M' + mid(P[P.length - 1], P[0]);
      P.forEach(function (q, i) { d += 'Q' + q[0] + ' ' + q[1] + ' ' + mid(q, P[(i + 1) % P.length]); });
      var h = '';
      for (var j = 0; j < 7; j++) for (var i = 0; i < 7; i++) h += '<circle cx="' + (2 * i + 1) * U + '" cy="' + (2 * j + 1) * U + '" r="3"/>';
      svg.innerHTML = h + '<path d="' + d + '"/>';
      if (!MOTION || !animate) return;
      var path = svg.querySelector('path'), len = 2000;
      try { len = path.getTotalLength(); } catch (e) {}
      path.style.strokeDasharray = len + ' ' + (len + 10);
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      raf(function () { raf(function () { path.style.transition = 'stroke-dashoffset 4.2s ease-in-out'; path.style.strokeDashoffset = '0'; }); });
    }
    draw(false);
    if (BOOK) {
      doc.addEventListener('bookpagechange', function () { if (BOOK.currentId() === 'when') draw(MOTION); });
    } else if (MOTION && IO) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !drawn) { drawn = true; draw(true); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(svg);
    }
    again.addEventListener('click', function () { seed += 4 * (1 + Math.floor(Math.random() * 30)); draw(true); });
  });

  /* ---------------------------------------------------------------- akshintalu, thrown from the button */
  safe(function () {
    var btn = $('#akBtn'), out = $('#akN'), cv = $('#burst'), n = 0, x = null, P = [], spr = null, looping = false, last = 0, dpr = 1;
    if (!window.Rice) { btn.hidden = true; return; }
    function size() { dpr = DPR; cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); spr = Rice.set(10, 4); }
    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 1 / 60); last = t;
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
      P = P.filter(function (p) { return (p.life -= dt) > 0; });
      P.forEach(function (p) {
        p.vy += 900 * dt; p.vx *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.f += p.vf * dt;
        Rice.draw(x, spr[p.k], dpr, p.x, p.y, p.a, p.f, p.sc, Math.min(1, p.life * 1.6));
      });
      if (P.length) raf(frame);
      else { looping = false; last = 0; cv.classList.remove('on'); }
    }
    btn.addEventListener('click', function () {
      if (!x) { x = cv.getContext('2d'); }
      cv.classList.add('on'); size();
      var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top;
      for (var i = 0; i < (LOW ? 50 : 90); i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, s = 260 + Math.random() * 520;
        P.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 200, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 14,
          f: Math.random() * 6.28, vf: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 9), sc: 0.85 + Math.random() * 0.4,
          life: 1.4 + Math.random() * 1.2, k: Rice.pick(Rice.MIX) });
      }
      if (!looping) { looping = true; raf(frame); }
      n++;
      out.innerHTML = '<span class="te" lang="te">అందాయి</span> · received' + (n > 1 ? ' ×' + n : '');
      if (window.Music) Music.chime(0.3);
    });
  });

  /* ---------------------------------------------------------------- శుభం */
  var endSeen = false;
  safe(function () {
    var sec = $('#end'), cv = $('#film'), x = cv.getContext('2d'), on = false, last = 0, W = 0, H = 0;
    function size() { W = Math.ceil(innerWidth / 3); H = Math.ceil(innerHeight / 3); cv.width = W; cv.height = H; }
    function grain() {
      var img = x.createImageData(W, H), d = img.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 26; }
      x.putImageData(img, 0, 0);
    }
    function loop(t) { if (!on) return; if (t - last > 80) { last = t; grain(); } raf(loop); }
    size(); grain();
    function seen() {
      if (!endSeen) { endSeen = true; writeSig(sigs[1], 2400, 300); }
    }
    if (BOOK) {
      doc.addEventListener('bookpagechange', function () {
        var vis = BOOK.currentId() === 'end' && !doc.hidden;
        if (vis) seen();
        if (vis && !on && MOTION && !LOW) { on = true; raf(loop); }
        if (!vis) on = false;
      });
      return;
    }
    if (!IO) { seen(); return; }
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis) seen();
      if (vis && !on && MOTION && !LOW) { on = true; raf(loop); }
      if (!vis) on = false;
    }, { threshold: 0.3 }).observe(sec);
    window.addEventListener('resize', function () { size(); grain(); });
  });

  /* ---------------------------------------------------------------- start */
  var lastW = vw, lastH = vh, rt = 0;
  window.addEventListener('resize', function () {
    var w = window.innerWidth, h = window.innerHeight;
    // a phone's toolbar sliding away changes the height a little: ignore that, or the page would jump
    if (BOOK || w !== lastW || Math.abs(h - lastH) > 140) { lastW = w; lastH = h; clearTimeout(rt); rt = setTimeout(layout, 150); }
  });
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    raf(function () { ticking = false; update(false); });
  }, { passive: true });
  window.addEventListener('load', layout);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layout);
  if (MOTION) root.className += ' motion';
  layout();
  if (BOOK) {
    doc.addEventListener('visibilitychange', function () { drawPage(BOOK.currentId(), BOOK.progress(), true); });
    BOOK.connect(drawPage, layout); return;
  }
  var target = location.hash && doc.getElementById(location.hash.slice(1));
  if (target) setTimeout(function () { window.scrollTo(0, target.getBoundingClientRect().top + (window.pageYOffset || 0)); }, 60);
  else window.scrollTo(0, 0);
})();
