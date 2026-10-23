/* ==================================================================
   Nikhitha · Sai Koundinya — the invitation's behaviour.
   Details first (so the page reads right without any motion), then the
   lamp, then each chapter's scroll choreography.
   ================================================================== */
(function () {
  'use strict';
  var D = window.INVITE || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  var root = document.documentElement;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var MOTION = !RM && !!(G && ST);
  var touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var wide = function () { return window.innerWidth >= 900; };
  if (MOTION) { root.classList.add('motion'); G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); }
  var lenis = null;
  var Snd = window.Sound || { set: function () { return false; }, bell: function () {}, isOn: function () { return false; } };

  /* ---------------------------------------------------------------- details */
  var EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var TE_DAYS = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
  var EN_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    F.weekday = EN_DAYS[when.wd];
    F.time = (when.h % 12 || 12) + ':' + pad(when.mi) + (when.h < 12 ? ' am' : ' pm');
    F['p.vaaram'] = TE_DAYS[when.wd];
  }
  var pc = D.panchangam || {}, SUF = { samvatsaram: ' నామ సంవత్సరం', masam: ' మాసం', paksham: ' పక్షం', lagnam: ' లగ్నం' };
  Object.keys(SUF).concat(['tithi', 'nakshatram']).forEach(function (k) {
    var v = (pc[k] || '').trim();
    if (!v) return;
    var s = SUF[k] || '';
    F['p.' + k] = s && v.indexOf(s.trim().split(' ')[0]) === -1 ? v + s : v;
  });
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
  $$('[data-f]').forEach(function (el) { var v = F[el.getAttribute('data-f')]; if (v) el.textContent = v; });

  function stamp(t) { var d = new Date(t); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
  function setLink(el, href) {
    if (!el) return;
    if (href) { el.href = href; el.removeAttribute('aria-disabled'); }
    else { el.setAttribute('aria-disabled', 'true'); el.removeAttribute('target'); }
  }
  var cal = when ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Vivaham · Nikhitha & Sai Koundinya') +
    '&dates=' + stamp(when.t) + '/' + stamp(when.t + (D.durationHours || 3) * 3600000) +
    '&details=' + encodeURIComponent('Muhurtham at ' + F.time + ' IST. With love, both families.') +
    (V.name ? '&location=' + encodeURIComponent(V.name + (V.address ? ', ' + V.address : '')) : '') : null;
  setLink($('#calMain'), cal); setLink($('#calBless'), cal);
  setLink($('#mapLink'), V.mapUrl || (V.name ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(V.name + ' ' + (V.address || '')) : null));
  var R = D.rsvp || {};
  setLink($('#rsvpLink'), R.whatsapp ? 'https://wa.me/' + String(R.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(R.message || '') : null);

  /* ---------------------------------------------------------------- countdown */
  (function () {
    var cells = $$('#cd b'), note = $('#cdNote');
    if (!when || !cells.length) return;
    note.textContent = 'Muhurtham ' + F.time + ' IST, ' + F.dateLong;
    function set(b, v) {
      var o = b.getAttribute('data-v') || '';
      if (o === v) return;
      b.setAttribute('data-v', v);
      if (o.length !== v.length) { b.innerHTML = v.split('').map(function (c) { return '<i>' + c + '</i>'; }).join(''); return; }
      v.split('').forEach(function (c, i) {
        if (c === o[i]) return;
        var e = b.children[i]; e.textContent = c;
        if (!RM && e.animate) e.animate([{ transform: 'translateY(-55%)', opacity: 0, filter: 'blur(2px)' }, { transform: 'none', opacity: 1, filter: 'none' }], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }
    function tick() {
      var r = Math.floor((when.t - Date.now()) / 1000);
      if (r <= 0) {
        $('.cd-cells').hidden = true;
        note.innerHTML = '<span lang="te">వివాహం జరిగింది</span> · They are married';
        clearInterval(iv); return;
      }
      [Math.floor(r / 86400), Math.floor(r / 3600) % 24, Math.floor(r / 60) % 60, r % 60].forEach(function (v, i) { set(cells[i], pad(v)); });
    }
    var iv = setInterval(tick, 1000); tick();
  })();

  /* ---------------------------------------------------------------- signature */
  var sigReady = fetch('img/art/signature.svg').then(function (r) { return r.ok ? r.text() : ''; }).then(function (svg) {
    if (!svg) return;
    $('#sigOpen').innerHTML = svg;
    $('#sigEnd').innerHTML = svg.replace(/sigMaskA/g, 'sigMaskB');
  }).catch(function () {});
  function writeSig(host, total, delay) {
    var svg = host && host.querySelector('svg');
    if (!svg || !MOTION) return;
    var ps = $$('.sig-pen path', svg);
    var L = ps.map(function (p) { return +p.getAttribute('data-l') || 10; });
    var sum = L.reduce(function (a, b) { return a + b; }, 0);
    var t = delay || 0;
    ps.forEach(function (p, i) {
      var d = total * L[i] / sum;
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: Math.max(24, d), delay: t, fill: 'forwards', easing: 'linear' });
      t += d * 0.93;
    });
    var u = svg.querySelector('.sig-under'), dot = svg.querySelector('.sig-dot');
    if (u) u.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: t, fill: 'forwards', easing: 'cubic-bezier(.6,0,.2,1)' });
    if (dot) dot.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 420, delay: t + 820, fill: 'forwards', easing: 'cubic-bezier(.3,1.6,.5,1)' });
  }

  /* ---------------------------------------------------------------- sound buttons */
  var soundBtns = $$('.sound');
  function syncSound() {
    var on = Snd.isOn();
    soundBtns.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.querySelector('span').textContent = on ? 'Tanpura on' : 'Tanpura off'; });
  }
  soundBtns.forEach(function (b) { b.addEventListener('click', function () { Snd.set(!Snd.isOn()); syncSound(); }); });

  /* ---------------------------------------------------------------- burst: a handful of talambralu over everything */
  var burst = (function () {
    var cv = $('#burst'), x = cv.getContext('2d'), P = [], raf = 0, dpr = 1, spr = null, last = 0;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; if (window.Rice) spr = Rice.set(10, 4); }
    size(); addEventListener('resize', size);
    function frame(now) {
      var dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60); last = now;
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
      P = P.filter(function (p) { return (p.life -= dt) > 0; });
      P.forEach(function (p) {
        p.vy += 900 * dt; p.vx *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.f += p.vf * dt;
        Rice.draw(x, spr[p.k], dpr, p.x, p.y, p.a, p.f, p.sc, Math.min(1, p.life * 1.6));
      });
      if (P.length) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); }
    }
    return function (cx, cy, n, up) {
      if (RM || !spr) return;
      for (var i = 0; i < (n || 60); i++) {
        var a = (up ? -Math.PI / 2 : 0) + (Math.random() - 0.5) * (up ? 1.6 : 6.28), s = 260 + Math.random() * 520;
        P.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (up ? 200 : 120), a: Math.random() * 6.28, va: (Math.random() - 0.5) * 14,
          f: Math.random() * 6.28, vf: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 9), sc: 0.85 + Math.random() * 0.4,
          life: 1.4 + Math.random() * 1.2, k: Rice.pick(Rice.MIX) });
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };
  })();

  /* ---------------------------------------------------------------- toranam */
  var toranam = (function () {
    var host = $('#toranam');
    if (!host) return null;
    var items = [], W = 0, raf = 0, vis = true, lastY = window.scrollY, wind = 0, ptr = null;
    function build() {
      W = host.clientWidth; var H = host.clientHeight;
      var n = clamp(Math.round(W / 30), 11, 46);
      var sag = Math.min(26, H * 0.2), y0 = 10;
      function y(x) { return y0 + sag * (1 - Math.pow((x - W / 2) / (W / 2), 2)); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">';
      s += '<path d="M0 ' + y(0) + ' Q' + W / 2 + ' ' + (2 * y(W / 2) - y0) + ' ' + W + ' ' + y(W) + '" fill="none" stroke="#B8945A" stroke-width="1.4"/>';
      s += '<path d="M0 ' + (y(0) + 1.5) + ' Q' + W / 2 + ' ' + (2 * y(W / 2) - y0 + 1.5) + ' ' + W + ' ' + (y(W) + 1.5) + '" fill="none" stroke="#E0A526" stroke-width="1" stroke-dasharray="3 3"/>';
      var big = W > 700 ? 1.18 : 1;
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) * W / n, yy = y(x);
        if (i % 3 === 1) {
          var m = 26 * big;
          s += '<g class="tl-i" data-x="' + x + '" data-y="' + yy + '"><path d="M0 0 V6" stroke="#B8945A" stroke-width="1"/><image href="img/art/marigold.webp" x="' + (-m / 2) + '" y="5" width="' + m + '" height="' + m + '"/></g>';
        } else {
          var L = (58 + ((i * 7) % 5) * 5) * big, w = L * 0.31, flip = i % 2 ? -1 : 1;
          s += '<g class="tl-i" data-x="' + x + '" data-y="' + yy + '"><image href="img/art/leaf.webp" x="' + (-w / 2) + '" y="-3" width="' + w + '" height="' + L + '" transform="scale(' + flip + ' 1)"/></g>';
        }
      }
      host.innerHTML = s + '</svg>';
      items = $$('.tl-i', host).map(function (g, i) {
        return { g: g, x: +g.getAttribute('data-x'), y: +g.getAttribute('data-y'), a: (Math.random() - 0.5) * 6, v: 0, ph: Math.random() * 6.28, k: 26 + Math.random() * 10 };
      });
      draw();
    }
    function draw() { items.forEach(function (it) { it.g.setAttribute('transform', 'translate(' + it.x.toFixed(1) + ' ' + it.y.toFixed(1) + ') rotate(' + it.a.toFixed(2) + ')'); }); }
    var last = performance.now();
    function step(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var sy = window.scrollY; wind += (sy - lastY) * 0.06; lastY = sy; wind *= 0.9;
      var t = now / 1000;
      items.forEach(function (it, i) {
        var f = Math.sin(t * 0.8 + it.ph) * 1.4 + wind * (0.7 + (i % 3) * 0.2);
        if (ptr) { var dx = ptr.x - it.x, dy = ptr.y - it.y; if (Math.abs(dx) < 40 && dy > -10 && dy < 90) f += ptr.vx * 0.5; }
        it.v += (-it.k * it.a - 2.6 * it.v + f * 18) * dt;
        it.a += it.v * dt;
      });
      draw();
      raf = vis && !RM ? requestAnimationFrame(step) : 0;
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis && !raf && !RM) { last = performance.now(); raf = requestAnimationFrame(step); } }).observe(host);
    var px = 0;
    $('#c0').addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top, vx: e.clientX - px }; px = e.clientX; }, { passive: true });
    $('#c0').addEventListener('pointerleave', function () { ptr = null; });
    var lw = window.innerWidth;
    addEventListener('resize', function () { if (Math.abs(window.innerWidth - lw) > 30) { lw = window.innerWidth; build(); } });
    build();
    return { build: build };
  })();

  /* ---------------------------------------------------------------- the lamp */
  var gate = $('#gate'), gateOpen = !!gate && getComputedStyle(gate).display !== 'none';
  var opening = [];
  function onOpen(fn) { if (gateOpen) opening.push(fn); else fn(); }
  if (gateOpen && location.hash && document.getElementById(location.hash.slice(1))) { gate.classList.add('gone'); gateOpen = false; }
  if (gateOpen) (function () {
    document.body.style.overflow = 'hidden';
    var btn = $('#lampBtn'), cv = $('#lampFlame'), glow = $('#gateGlow'), img = $('.lamp-diya', gate);
    var x = cv.getContext('2d'), lit = false, grow = 0, raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), fw = 0, fh = 0;
    function place() {
      var w = btn.clientWidth, h = img.clientHeight || w * 570 / 900;
      fw = w * 0.26; fh = w * 0.5;
      cv.style.width = fw + 'px'; cv.style.height = fh + 'px';
      // the wick sits at 90% across, 21.6% down the drawing
      cv.style.left = (w * 0.9 - fw / 2) + 'px';
      cv.style.top = (btn.clientHeight - h + h * 0.216 - fh * 0.9) + 'px';
      cv.width = fw * dpr; cv.height = fh * dpr;
    }
    function flame(t) {
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, fw, fh);
      var bx = fw / 2, by = fh * 0.9;
      if (!lit) {
        var e = 0.5 + 0.5 * Math.sin(t * 3);
        var g0 = x.createRadialGradient(bx, by, 0, bx, by, 8); g0.addColorStop(0, 'rgba(255,150,60,' + (0.5 + e * 0.4) + ')'); g0.addColorStop(1, 'rgba(255,120,40,0)');
        x.fillStyle = g0; x.beginPath(); x.arc(bx, by, 8, 0, 6.283); x.fill();
        return;
      }
      var h = fh * 0.78 * grow * (0.94 + 0.06 * Math.sin(t * 11) + 0.04 * Math.sin(t * 23.7));
      var w = fw * 0.2 * grow * (1 + 0.05 * Math.sin(t * 9.3));
      var sway = Math.sin(t * 2.3) * fw * 0.035 + Math.sin(t * 7.1) * fw * 0.012;
      var halo = x.createRadialGradient(bx, by - h * 0.45, 0, bx, by - h * 0.45, fw * 0.55);
      halo.addColorStop(0, 'rgba(255,190,90,' + 0.35 * grow + ')'); halo.addColorStop(1, 'rgba(255,150,60,0)');
      x.fillStyle = halo; x.fillRect(0, 0, fw, fh);
      x.beginPath();
      x.moveTo(bx, by);
      x.bezierCurveTo(bx - w * 1.1, by - h * 0.25, bx - w * 0.7 + sway * 0.4, by - h * 0.7, bx + sway, by - h);
      x.bezierCurveTo(bx + w * 0.7 + sway * 0.4, by - h * 0.7, bx + w * 1.1, by - h * 0.25, bx, by);
      var g = x.createLinearGradient(bx, by, bx, by - h);
      g.addColorStop(0, 'rgba(255,255,240,.95)'); g.addColorStop(0.25, 'rgba(255,226,140,.95)'); g.addColorStop(0.6, 'rgba(255,160,60,.85)'); g.addColorStop(1, 'rgba(230,90,30,0)');
      x.fillStyle = g; x.fill();
      x.beginPath(); x.ellipse(bx, by - h * 0.12, w * 0.32, h * 0.16, 0, 0, 6.283);
      x.fillStyle = 'rgba(120,150,255,' + 0.35 * grow + ')'; x.fill();
    }
    function loop(now) { flame(now / 1000); raf = requestAnimationFrame(loop); }
    place(); raf = requestAnimationFrame(loop);
    addEventListener('resize', place);
    function centre() {
      var r = cv.getBoundingClientRect();
      gate.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
      gate.style.setProperty('--my', (r.top + r.height * 0.7) + 'px');
    }
    btn.addEventListener('click', function () {
      if (lit) return;
      lit = true; gate.classList.add('lit'); centre();
      Snd.bell(0.9);
      var t0 = performance.now();
      (function g(now) {
        var k = clamp((now - t0) / 900, 0, 1); grow = 1 - Math.pow(1 - k, 3);
        glow.style.setProperty('--glow', String(0.2 + 0.8 * k)); gate.style.setProperty('--glow', String(0.2 + 0.8 * k));
        if (k < 1) requestAnimationFrame(g);
      })(t0);
      var diag = Math.hypot(innerWidth, innerHeight) * 1.1;
      setTimeout(function () {
        if (RM) { finish(); return; }
        var t1 = performance.now();
        (function h(now) {
          var k = clamp((now - t1) / 1500, 0, 1), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          gate.style.setProperty('--hole', (e * diag).toFixed(1) + 'px');
          if (k < 1) requestAnimationFrame(h); else finish();
        })(t1);
      }, RM ? 300 : 1250);
    });
    function finish() {
      cancelAnimationFrame(raf);
      gate.classList.add('gone');
      document.body.style.overflow = '';
      gateOpen = false;
      if (lenis) lenis.start();
      if (MOTION) ST.refresh();
      opening.splice(0).forEach(function (fn) { fn(); });
    }
  })();

  /* ---------------------------------------------------------------- smooth scroll */
  if (MOTION && !touch && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    if (gateOpen) lenis.stop();
    window.lenis = lenis;
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); var el = id.length > 1 && document.getElementById(id.slice(1));
      if (!el || a.getAttribute('aria-disabled') === 'true') { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------- the opening, once the lamp is lit */
  onOpen(function () {
    sigReady.then(function () { writeSig($('#sigOpen'), 3600, 300); });
    if (!MOTION) return;
    G.from('#toranam', { y: -26, opacity: 0, duration: 1.6, ease: 'power2.out' });
    G.from('.dab', { opacity: 0, scale: 0.6, duration: 1.4, stagger: 0.18, ease: 'power2.out', delay: 0.2 });
    G.from('.ch-open .lab, .shubha', { opacity: 0, y: 18, duration: 1.4, stagger: 0.2, ease: 'power2.out', delay: 0.15 });
    G.from('.open-sub, .cue', { opacity: 0, duration: 1.4, stagger: 0.3, delay: 4.2 });
  });

  if (!MOTION) {
    sigReady.then(function () {});
    staticSky();
    kolam();
    return;
  }

  /* ---------------------------------------------------------------- chrome: bar, thread, knots */
  var bar = $('#bar'), barCh = $('#barCh'), thread = $('#thread'), tfill = $('#threadFill');
  $$('main > section').forEach(function (sec) {
    // refreshPriority -1: measured after every pinned chapter has added its scroll length
    ST.create({ trigger: sec, start: 'top 54px', end: 'bottom 54px', refreshPriority: -1, onToggle: function (s) {
      if (!s.isActive) return;
      var dark = /night|kum|kallapi|dark/.test(sec.getAttribute('data-ground') || '');
      bar.classList.toggle('dark', dark); thread.classList.toggle('dark', dark);
      barCh.textContent = sec.getAttribute('data-ch') || '';
    } });
  });
  ST.create({ start: 0, end: 'max', onUpdate: function (s) { tfill.style.transform = (wide() ? 'scaleY(' : 'scaleX(') + s.progress.toFixed(4) + ')'; } });
  var knotAt = [['#c5', 'bottom'], ['#c8', 'center'], ['#c13', 'center']];
  var knotEls = $$('.knot');
  function placeKnots() {
    var max = ST.maxScroll(window) || 1;
    knotAt.forEach(function (k, i) {
      var el = $(k[0]); if (!el) return;
      var r = el.getBoundingClientRect(), y = window.scrollY + r.top + (k[1] === 'bottom' ? r.height : r.height / 2) - innerHeight / 2;
      knotEls[i].style.setProperty('--at', clamp(y / max, 0, 1).toFixed(4));
      knotEls[i]._at = y;
    });
  }
  ST.addEventListener('refresh', placeKnots);
  ST.create({ start: 0, end: 'max', onUpdate: function () { var y = window.scrollY; knotEls.forEach(function (k) { k.classList.toggle('tied', y >= (k._at || 1e9)); }); } });

  /* ---------------------------------------------------------------- 01 · invocation */
  G.fromTo('#ganesha', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: '#c1', start: 'top 75%', end: 'center 55%', scrub: 1 } });
  G.from('#c1 .om, #c1 .srirastu, #c1 .tr, #c1 .gloss, #c1 .small', { opacity: 0, y: 18, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '#c1', start: 'top 55%', end: 'center 45%', scrub: 1 } });

  /* ---------------------------------------------------------------- 02 · names; the photograph becomes a painting */
  (function () {
    var sec = $('#c2'), fill = $('#p2pFill'), art = $('#archArt');
    var paint = null;
    if (window.Paint) {
      var big = wide() || (window.devicePixelRatio || 1) > 1.5;
      paint = Paint.create($('#archGL'), { photo: big ? 'img/pair-silk-1086.webp' : 'img/pair-silk-720.webp', wash: 'img/paint/silk-wash-1086.webp', line: 'img/paint/silk-line-1086.webp' });
      paint.ready.then(function (ok) { if (ok) { sec.classList.add('gl'); paint.draw(); } else paint = null; });
    }
    G.from('.nm-a', { x: wide() ? -40 : 0, y: wide() ? 0 : 16, opacity: 0, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 70%' } });
    G.from('.nm-b', { x: wide() ? 40 : 0, y: wide() ? 0 : 16, opacity: 0, duration: 1.4, ease: 'power2.out', delay: 0.15, scrollTrigger: { trigger: sec, start: 'top 70%' } });
    G.from('.arch', { opacity: 0, y: 30, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 75%' } });
    ST.create({ trigger: '#namesPin', start: 'top top', end: '+=150%', pin: true, scrub: true, anticipatePin: 1,
      onUpdate: function (s) {
        var p = smooth((s.progress - 0.1) / 0.78);
        fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        if (paint && paint.ok) { paint.p = p; paint.draw(); } else art.style.opacity = p;
      },
      onRefresh: function () { if (paint && paint.ok) paint.resize(); } });
  })();

  /* ---------------------------------------------------------------- 03 · the letter, word by word */
  $$('[data-reveal]').forEach(function (col) {
    var words = [];
    var walker = document.createTreeWalker(col, NodeFilter.SHOW_TEXT, null);
    var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (!n.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span'); s.className = 'word'; s.textContent = part; frag.appendChild(s); words.push(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    G.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: col, start: 'top 78%', end: 'bottom 60%', scrub: 1 } });
  });
  G.from('.signoff, .footnote', { opacity: 0, y: 16, stagger: 0.2, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: '.signoff', start: 'top 88%' } });

  /* ---------------------------------------------------------------- 04 · cumin meets jaggery */
  G.timeline({ scrollTrigger: { trigger: '#muhPin', start: 'top top', end: '+=170%', pin: true, scrub: 1, anticipatePin: 1,
      onLeave: function () { Snd.bell(0.5); } } })
    .from('.jb-c', { xPercent: -230, rotation: -40, duration: 1, ease: 'power2.out' })
    .from('.jb-j', { xPercent: 230, rotation: 40, duration: 1, ease: 'power2.out' }, '<')
    .to('.jb-glow', { opacity: 1, scale: 1.1, duration: 0.5 })
    .to('.jb-c, .jb-j', { opacity: 0, duration: 0.5 }, '<')
    .fromTo('.jb-p', { opacity: 0, rotation: -30, scale: 0.92 }, { opacity: 1, rotation: 0, scale: 1, duration: 0.6 }, '<')
    .from('.muh-words > *', { opacity: 0, y: 24, stagger: 0.16, duration: 0.5 }, '-=.2');
  G.from('.panch dl > div', { opacity: 0, y: 14, stagger: 0.06, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.panch', start: 'top 82%' } });
  G.from('.cd', { opacity: 0, y: 20, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: '.cd', start: 'top 85%' } });

  /* ---------------------------------------------------------------- 05 · celebrations */
  G.fromTo('.tl-thread', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 70%', end: 'bottom 70%', scrub: 1 } });
  $$('#tl li').forEach(function (li) {
    G.from(li.children, { opacity: 0, y: 24, stagger: 0.12, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 84%' } });
  });

  /* ---------------------------------------------------------------- 06 · Kashi Yatra: off he goes, and back */
  G.timeline({ scrollTrigger: { trigger: '#kashi', start: 'top 80%', end: 'bottom 30%', scrub: 1 } })
    .to('.kashi-img', { x: 46, rotation: 7, duration: 1, ease: 'sine.inOut' })
    .to('.kashi-img', { x: -6, rotation: -3, duration: 1, ease: 'sine.inOut' })
    .to('.kashi-img', { x: 0, rotation: 0, duration: 0.5 });
  G.from('.vig', { opacity: 0, y: 30, stagger: 0.2, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: '.pre-grid', start: 'top 80%' } });

  /* ---------------------------------------------------------------- 07 · the cloth */
  (function () {
    if (!window.Tera) return;
    var cloth = Tera.create($('#teraGL'), $('#teraFrame'), $('#teraPin'), $('#teraFallback'), 'img/art/kalasham.webp');
    var after = $('#teraAfter'), hint = $('#teraHint'), active = false, raf = 0, rang = false;
    function loop(now) { cloth.draw(now / 1000); raf = active ? requestAnimationFrame(loop) : 0; }
    ST.create({ trigger: '#teraPin', start: 'top top', end: '+=210%', pin: true, scrub: true, anticipatePin: 1,
      onToggle: function (s) { active = s.isActive; if (active && !raf) raf = requestAnimationFrame(loop); },
      onUpdate: function (s) {
        var p = s.progress;
        cloth.p = smooth((p - 0.12) / 0.62);
        cloth.v = clamp(Math.abs(s.getVelocity()) / 2600, 0, 1);
        after.style.opacity = smooth((p - 0.7) / 0.14);
        hint.style.opacity = 1 - smooth(p / 0.1);
        if (p > 0.74 && !rang) { rang = true; Snd.bell(0.8); }
        if (!active) cloth.draw(performance.now() / 1000);
      },
      onRefresh: function () { cloth.resize(); } });
  })();

  /* ---------------------------------------------------------------- 08 · three knots */
  (function () {
    var pin = $('#knotsPin'), stage = $('#knStage'), world = $('#knWorld'), nums = $$('.kn-n'), glow = $('.kn-glow');
    // in img/art/mangal.webp (1200 x 2100): the three knots, first tied lowest, each about 143 px tall
    var IW = 1200, IH = 2100, AXIS = 600, KN = [688, 511, 333], KTALL = 143, AT = [0.1, 0.3, 0.5];
    var f = 1, SW = 1, SH = 1, zk = 4, done = [false, false, false], p = 0;
    function fit() {
      SW = stage.clientWidth; SH = stage.clientHeight;
      f = Math.min(SW / IW, SH / IH) * 0.94;
      world.style.width = (IW * f).toFixed(1) + 'px'; world.style.height = (IH * f).toFixed(1) + 'px';
      zk = clamp(SH * 0.27 / (KTALL * f), 1.8, 6);         // close enough that a knot is a quarter of the stage
    }
    // the camera: [progress, point in the image it centres on, zoom]
    function keys() {
      return [[0, KN[0] + 40, zk * 1.12], [0.07, KN[0], zk], [0.13, KN[0], zk], [0.27, KN[1], zk], [0.33, KN[1], zk],
        [0.47, KN[2], zk], [0.53, KN[2], zk], [0.86, IH * 0.5, 1], [1, IH * 0.5, 1]];
    }
    function cam(q) {
      var K = keys(), i = 0;
      while (i < K.length - 2 && q > K[i + 1][0]) i++;
      var a = K[i], b = K[i + 1], t = smooth((q - a[0]) / (b[0] - a[0]));
      return [a[1] + (b[1] - a[1]) * t, Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * t)];
    }
    function render() {
      var c = cam(p), y = c[0], z = c[1], k = f * z;
      var tx = SW / 2 - AXIS * k, ty = SH / 2 - y * k;
      world.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + z.toFixed(4) + ')';
      var near = smooth((z - 1.7) / 1.3);
      nums.forEach(function (n, i) {
        var on = p > AT[i];
        var side = i === 1 ? -1 : 1;
        var nx = SW / 2 + side * 78 * k + (side < 0 ? -n.offsetWidth : 0), ny = ty + KN[i] * k - n.offsetHeight / 2;
        n.style.transform = 'translate3d(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px,0)';
        n.style.opacity = (on ? near : 0).toFixed(3);
        n.style.justifyItems = side < 0 ? 'end' : 'start';
      });
    }
    function count(i) {
      Snd.bell(0.35);
      if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) try { navigator.vibrate(14); } catch (e) {}
      G.fromTo(glow, { opacity: 0.95, scale: 0.6 }, { opacity: 0, scale: 1.25, duration: 1.3, ease: 'power2.out', overwrite: true });
    }
    ST.create({ trigger: pin, start: 'top top', end: '+=240%', pin: true, scrub: true, anticipatePin: 1,
      onUpdate: function (s) {
        p = s.progress;
        AT.forEach(function (a, i) {
          if (p > a && !done[i]) { done[i] = true; count(i); }
          if (p < a - 0.03) done[i] = false;
        });
        render();
      },
      onRefresh: function () { fit(); render(); } });
    addEventListener('resize', function () { fit(); render(); });
  })();

  /* ---------------------------------------------------------------- 09 · talambralu */
  (function () {
    if (!window.Talambralu) return;
    var pin = $('#talPin'), lines = $$('#verse li'), hint = $('#talHint'), verse = $('#verse');
    var para = $('.tal-words .d'), sub = $('.tal-words .sub');
    var rice = Talambralu.create($('#talGL')), active = false, raf = 0, prog = 0, geo = { para: 0, sub: 0, verse: 1 };
    var thrown = [false, false, false, false];
    // hers from the left, his from the right, each a little higher; the last from both
    var TOSS = [[0.3, 0.6, 90, { y: 0.55, w: 0.1, r: 0.35 }], [0.7, 0.72, 100, { y: 0.55, w: 0.4, r: 0.05 }], [0.3, 0.86, 110, null]];
    function n(k) { return Math.round(k * (wide() ? 1.5 : 1)); }
    function measure() {
      var a = pin.getBoundingClientRect().top;
      geo.para = para.getBoundingClientRect().bottom - a;
      geo.sub = sub.getBoundingClientRect().bottom - a;
      geo.verse = verse.getBoundingClientRect().top - a;
    }
    function band() {
      var k = smooth((prog - 0.22) / 0.06);       // the paragraph makes room after the first line
      para.style.opacity = (1 - k).toFixed(3);
      rice.band(geo.para + (geo.sub - geo.para) * k + 8, geo.verse - 6);
    }
    function loop(now) { var more = rice.tick(now); raf = (active || more) ? requestAnimationFrame(loop) : 0; }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    ST.create({ trigger: pin, start: 'top top', end: '+=330%', pin: true, scrub: true, anticipatePin: 1,
      onToggle: function (s) { active = s.isActive; rice.drizzle(active && prog > 0.05); kick(); },
      onUpdate: function (s) {
        prog = s.progress;
        lines.forEach(function (li, i) {
          var a = smooth((prog - (0.02 + i * 0.235)) / 0.07) * (i === 3 ? 1 : 1 - smooth((prog - (0.2 + i * 0.235)) / 0.06));
          li.style.opacity = a.toFixed(3);
          li.style.transform = 'translateY(' + ((1 - a) * 14).toFixed(1) + 'px)';
        });
        hint.style.opacity = smooth((prog - 0.84) / 0.08);
        band();
        for (var i = 0; i < 4; i++) {
          var at = 0.035 + i * 0.235;
          if (prog > at && !thrown[i]) {
            thrown[i] = true;
            if (i < 3) rice.toss(TOSS[i][0], TOSS[i][1], n(TOSS[i][2]), TOSS[i][3]);
            else { rice.toss(0.27, 0.97, n(100)); rice.toss(0.73, 1, n(100), null, 140); }
            kick();
          }
          if (prog < at - 0.04) thrown[i] = false;
        }
        rice.drizzle(active && prog > 0.05);
      },
      onRefresh: function () { rice.resize(); measure(); band(); } });
    pin.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      rice.tap(e.clientX, e.clientY); kick();
    });
  })();

  /* ---------------------------------------------------------------- 10 · seven steps */
  (function () {
    var track = $('#sapTrack'), steps = $('#sapSteps'), sts = $$('.st', steps), dots = $$('#sapProg i'), lab = $('#sapProg b');
    var TE = ['౧', '౨', '౩', '౪', '౫', '౬', '౭'], cur = -1;
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var tw = G.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '#sapPin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function () {
          // which step is nearest the middle of the screen
          var mid = window.innerWidth / 2, best = -1, bd = 1e9;
          sts.forEach(function (st, i) { var r = st.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd && r.right > 0 && r.left < innerWidth) { bd = d; best = i; } });
          if (bd > window.innerWidth * 0.6) best = -1;
          if (best !== cur) {
            cur = best;
            dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
            lab.textContent = cur < 0 ? '' : TE[cur] + ' / ౭';
          }
        } } });
    G.fromTo('.sap-thread path', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: steps, containerAnimation: tw, start: 'left 70%', end: 'right 60%', scrub: true } });
    // each step presses in as it comes toward the middle, and stays
    sts.forEach(function (st) {
      var ft = $('.ft', st), words = $('div', st), n = $('.n', st), flip = st.classList.contains('r') ? -1 : 1;
      G.set(n, { xPercent: -50, yPercent: -50, x: 0, y: 0 });     // keep it centred while it scales
      G.set(ft, { rotation: 0, scaleX: flip, scaleY: 1 });          // a mirror, read by GSAP as a half turn otherwise
      var tl = G.timeline({ scrollTrigger: { trigger: st, containerAnimation: tw, start: 'left 100%', end: 'left 38%', scrub: true } });
      tl.fromTo(n, { opacity: 0, scale: 0.86 }, { opacity: 0.075, scale: 1, ease: 'none', duration: 1 }, 0)
        .fromTo(ft, { opacity: 0, rotation: 0, scaleX: flip * 1.25, scaleY: 1.25, y: -10 }, { opacity: 1, rotation: 0, scaleX: flip, scaleY: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 0.15)
        .fromTo(words, { opacity: 0, y: 18 }, { opacity: 1, y: 0, ease: 'power1.out', duration: 0.6 }, 0.4);
    });
    G.from('.sap-outro > *', { opacity: 0, y: 20, stagger: 0.18, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.sap-outro', containerAnimation: tw, start: 'left 72%', toggleActions: 'play none none reverse' } });
  })();

  /* ---------------------------------------------------------------- 11 · Arundhati, then the moon */
  (function () {
    if (!window.Sky) return;
    var pin = $('#skyPin'), sky = Sky.create($('#sky')), cap = $('#skyCap'), words = $('.sky-words'), moon = $('#moon');
    var disc = $('.moon-disc'), sil = $('.moon-sil'), lit = $('.moon-lit'), glow = $('.moon-glow'), spark = $('.moon-spark');
    var active = false, raf = 0, p = 0, rang = false;
    // the moon's centre and radius as fractions of the photograph (img/moon/lit.webp)
    var MX = 0.50065, MY = 0.2376, MR = 0.32928;
    function place() {
      var a = pin.getBoundingClientRect(), b = moon.getBoundingClientRect();
      sky.focus(b.left - a.left + b.width * MX, b.top - a.top + b.height * MY, b.width * MR);
    }
    function paint(now) {
      sky.draw(p, now / 1000);
      words.style.opacity = (1 - smooth((p - 0.27) / 0.06)).toFixed(3);
      cap.style.opacity = (smooth((p - 0.47) / 0.05) * (1 - smooth((p - 0.6) / 0.04))).toFixed(3);
      // the light opens from where their faces meet
      var b = clamp((p - 0.72) / 0.15, 0, 1), s = Math.max(0.001, 1 - Math.pow(1 - b, 3));
      disc.style.transform = 'scale(' + s.toFixed(4) + ')';
      disc.style.opacity = smooth(b / 0.1).toFixed(3);
      glow.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(4) + ')';
      glow.style.opacity = (smooth(b / 0.35) * (1 - 0.5 * smooth((p - 0.86) / 0.08))).toFixed(3);
      sil.style.opacity = smooth((p - 0.69) / 0.03).toFixed(3);
      lit.style.opacity = smooth((p - 0.86) / 0.1).toFixed(3);
      var fl = smooth((p - 0.685) / 0.04) * (1 - smooth((p - 0.75) / 0.07));
      spark.style.opacity = fl.toFixed(3);
      spark.style.transform = 'scale(' + (0.3 + fl * 0.9 + b * 1.6).toFixed(3) + ')';
      if (p > 0.72 && !rang) { rang = true; Snd.bell(0.6); }
      if (p < 0.6) rang = false;
    }
    function loop(now) { paint(now); raf = active ? requestAnimationFrame(loop) : 0; }
    ST.create({ trigger: pin, start: 'top top', end: '+=440%', pin: true, scrub: true, anticipatePin: 1,
      onToggle: function (s) { active = s.isActive; if (active && !raf) raf = requestAnimationFrame(loop); },
      onUpdate: function (s) { p = s.progress; if (!active) paint(performance.now()); },
      onRefresh: function () { sky.resize(); place(); paint(performance.now()); } });
    if (!touch) $('#c11').addEventListener('pointermove', function (e) { sky.pointer(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paint(performance.now()); });
  })();

  /* ---------------------------------------------------------------- 12 · the muggu */
  kolam();

  /* ---------------------------------------------------------------- 13 · blessing */
  G.fromTo('.pol', { rotation: 9, y: 60, opacity: 0 }, { rotation: -4, y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.pol', start: 'top 95%', end: 'top 45%', scrub: 1 } });
  G.from('.bless-words > *', { opacity: 0, y: 20, stagger: 0.1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.bless-words', start: 'top 82%' } });
  (function () {
    var n = 0, out = $('#akN');
    $('#akBtn').addEventListener('click', function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top, 90, true);
      n++; Snd.bell(0.3);
      out.innerHTML = '<span lang="te">అందాయి</span> · received' + (n > 1 ? ' ×' + n : '');
    });
    $('#rsvpLink').addEventListener('click', function (e) { var r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 50, true); });
  })();

  /* ---------------------------------------------------------------- శుభం */
  (function () {
    var sec = $('#end'), cv = $('#film'), x = cv.getContext('2d'), raf = 0, on = false, wrote = false;
    function size() { cv.width = Math.ceil(innerWidth / 2); cv.height = Math.ceil(innerHeight / 2); }
    size(); addEventListener('resize', size);
    function frame() {
      var w = cv.width, h = cv.height, img = x.createImageData(w, h), d = img.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 22; }
      x.putImageData(img, 0, 0);
      x.fillStyle = 'rgba(255,240,210,.25)';
      for (var k = 0; k < 2; k++) if (Math.random() < 0.5) x.fillRect(Math.random() * w, 0, 1, h);
      raf = on ? requestAnimationFrame(frame) : 0;
    }
    ST.create({ trigger: sec, start: 'top 60%', end: 'bottom top',
      onToggle: function (s) {
        on = s.isActive; sec.classList.toggle('rolling', on);
        if (on && !raf) raf = requestAnimationFrame(frame);
        if (on && !wrote) { wrote = true; sigReady.then(function () { writeSig($('#sigEnd'), 2600, 500); }); Snd.bell(0.6); }
      } });
    G.from('.subham-w', { opacity: 0, scale: 1.06, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 55%' } });
  })();

  addEventListener('load', function () {
    ST.refresh();
    // a link straight to a chapter: the pins have moved it since the browser jumped there
    var t = location.hash && document.getElementById(location.hash.slice(1));
    if (t) { var y = t.getBoundingClientRect().top + window.scrollY; if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });

  /* ================================================================ helpers that also run without motion */
  function staticSky() {
    if (!window.Sky) return;
    var sky = Sky.create($('#sky'));
    var draw = function () { sky.resize(); sky.draw(0.27, 0); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
    addEventListener('resize', draw);
  }

  /* the muggu: a sikku kolam, one closed line round a 7x7 grid of dots.
     Mirrors are placed with four-fold symmetry until the line closes on itself. */
  function kolam() {
    var s = $('#mug'); if (!s) return;
    function make(n, seed) {
      var N = 2 * n, M = new Map(), st = seed;
      var rnd = function () { return (st = st * 16807 % 2147483647) / 2147483647; };
      var K = function (x, y) { return x + ',' + y; }, rot = function (p) { return [N - p[1], p[0]]; };
      function refl(x, y, dx, dy) { var m = M.get(K(x, y)); if (x === 0 || x === N || m === 'v') dx = -dx; if (y === 0 || y === N || m === 'h') dy = -dy; return [dx, dy]; }
      function trace() {
        var id = new Map(), L = [];
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          if (id.has(K(x, y))) continue;
          var o = (x + y) % 2, p = [o ? x : x + 1, y], d = [o ? 1 : -1, 1], start = p + '|' + d, pts = [];
          do {
            id.set(K(Math.min(p[0], p[0] + d[0]), Math.min(p[1], p[1] + d[1])), L.length);
            pts.push(p); p = [p[0] + d[0], p[1] + d[1]]; d = refl(p[0], p[1], d[0], d[1]);
          } while (p + '|' + d !== start);
          L.push(pts);
        }
        return [L, id];
      }
      for (var g = 0; g < 400; g++) {
        var tr = trace(), L = tr[0], id = tr[1];
        if (L.length === 1) return L[0];
        var c = [];
        for (var y = 1; y < N; y++) for (var x = 1; x < N; x++) if ((x + y) % 2 && !M.has(K(x, y)) && id.get(K(x, y)) !== id.get(K(x, y - 1))) c.push([x, y]);
        if (!c.length) return null;
        var p = c[Math.floor(rnd() * c.length)], o = rnd() < 0.5 ? 'v' : 'h';
        for (var r = 0; r < 4; r++) { M.set(K(p[0], p[1]), o); p = rot(p); o = o === 'v' ? 'h' : 'v'; }
      }
      return null;
    }
    var U = 20, seed = 7 + Math.floor(Math.random() * 40) * 4, tween = null;
    function draw(animate) {
      var L = null; for (var sd = seed; !L && sd < seed + 400; sd += 4) L = make(7, sd);
      if (!L) return;
      var P = L.map(function (q) { return [q[0] * U, q[1] * U]; });
      var m = function (a, b) { return (a[0] + b[0]) / 2 + ' ' + (a[1] + b[1]) / 2; };
      var d = 'M' + m(P[P.length - 1], P[0]);
      P.forEach(function (q, i) { d += 'Q' + q[0] + ' ' + q[1] + ' ' + m(q, P[(i + 1) % P.length]); });
      var h = '';
      for (var j = 0; j < 7; j++) for (var i = 0; i < 7; i++) h += '<circle cx="' + (2 * i + 1) * U + '" cy="' + (2 * j + 1) * U + '" r="2.8"/>';
      s.innerHTML = h + '<path pathLength="1" d="' + d + '"/>';
      if (!MOTION) return;
      var path = $('path', s), dots = $$('circle', s);
      if (tween) { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); }
      if (animate) {
        G.fromTo(dots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: { each: 0.012, grid: [7, 7], from: 'center' } });
        tween = G.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 3.2, ease: 'power1.inOut', delay: 0.4 });
      } else {
        G.from(dots, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: { each: 0.025, grid: [7, 7], from: 'center' }, scrollTrigger: { trigger: s, start: 'top 85%' } });
        tween = G.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top 70%', end: 'bottom 35%', scrub: 1 } });
      }
    }
    draw(false);
    var again = $('#mugAgain');
    if (again) again.addEventListener('click', function () { seed += 4 * (1 + Math.floor(Math.random() * 30)); draw(true); });
  }
})();
