/* One section is always one leaf. Fit the complete section to the paper;
   never split its content into additional pages or introduce inner scrolling. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var set = doc.getElementById('bookSet'), main = doc.getElementById('invitation');
  if (!set || !main || !window.requestAnimationFrame) return;
  var chapters = [
    ['top', 'The invitation', 'శుభలేఖ', 9],
    ['couple', 'Nikhitha & Sai Koundinya', 'వధూవరులు', 12],
    ['letter', 'With love, our families', 'ఆహ్వానం', 18],
    ['when', 'When & where', 'సుముహూర్తం', 15],
    ['events', 'The celebrations', 'వేడుకలు', 15],
    ['knots', 'Three sacred knots', 'మూడు ముళ్ళు', 16],
    ['talambralu', 'A shower of blessings', 'తలంబ్రాలు', 22],
    ['saptapadi', 'Seven steps together', 'సప్తపది', 14],
    ['arundhati', 'Written in the stars', 'అరుంధతి', 24],
    ['rsvp', 'Your blessings', 'మీ ఆశీస్సులతో', 14],
    ['end', 'A beautiful beginning', 'శుభం', 9]
  ];
  // Use the document's actual IDs, including the existing RSVP section.
  chapters = chapters.filter(function (chapter) {
    var section = doc.getElementById(chapter[0]);
    return section && !section.hidden;
  });
  var pages = [], index = 0, renderer = null, layout = null, busy = false;
  var reflowTimer = 0, pendingReflow = false;
  var frame = 0, last = null, elapsed = 0, reading = false, readElapsed = 0, pausedEffects = false;
  var presence = window.InvitationPresence, turnAnimation = null, finished = false;
  var autoStartPending = ((window.INVITE || {}).autoScroll || {}).startAutomatically !== false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prev = doc.getElementById('previousPage'), next = doc.getElementById('nextPage');
  var select = doc.getElementById('chapterSelect'), count = doc.getElementById('pageCount');
  var play = doc.getElementById('autoScroll'), playLabel = doc.getElementById('autoScrollLabel');
  var controls = doc.getElementById('autoScrollControls'), speed = doc.getElementById('autoScrollSpeed');
  var status = doc.getElementById('bookStatus'), progress = doc.getElementById('progress');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function notify() { var e = doc.createEvent('Event'); e.initEvent('bookpagechange', false, false); doc.dispatchEvent(e); }
  function interactive(target) { return !!target.closest('a,button,select,input,textarea,[contenteditable]'); }

  function makePage(section, chapter) {
    var leaf = doc.createElement('div'); leaf.className = 'book-leaf';
    leaf.setAttribute('data-chapter', chapter[0]);
    leaf.setAttribute('aria-hidden', 'true'); leaf.setAttribute('inert', '');
    var front = doc.createElement('div'); front.className = 'leaf-front';
    var heading = doc.createElement('p'); heading.className = 'page-heading'; heading.setAttribute('aria-hidden', 'true');
    heading.innerHTML = '<span>Nikhitha &amp; Sai Koundinya</span><span lang="te">' + chapter[2] + '</span>';
    var content = doc.createElement('div'); content.className = 'page-content'; content.tabIndex = 0;
    content.setAttribute('role', 'region'); content.setAttribute('aria-label', chapter[1]);
    var isScene = section.classList.contains('scene'), fit = null;
    if ((!isScene && chapter[0] !== 'top' && chapter[0] !== 'end') || (reduced.matches && chapter[0] === 'talambralu')) {
      fit = doc.createElement('div'); fit.className = 'page-fit';
      content.classList.add('has-fit'); fit.appendChild(section); content.appendChild(fit);
    } else content.appendChild(section);
    var footer = doc.createElement('p'); footer.className = 'page-foot'; footer.textContent = ''; footer.setAttribute('aria-hidden', 'true');
    var back = doc.createElement('div'); back.className = 'leaf-back'; back.setAttribute('aria-hidden', 'true');
    front.appendChild(heading); front.appendChild(content); front.appendChild(footer);
    var corners = doc.createElement('span'); corners.className = 'pasupu-corners'; corners.setAttribute('aria-hidden', 'true');
    corners.innerHTML = '<i></i><i></i><i></i><i></i>'; front.appendChild(corners);
    var meter = null, replay = null;
    if (isScene && !reduced.matches) {
      var line = doc.createElement('div'); line.className = 'leaf-progress'; line.setAttribute('aria-hidden', 'true');
      meter = doc.createElement('i'); line.appendChild(meter); front.appendChild(line);
      replay = doc.createElement('button'); replay.type = 'button'; replay.className = 'scene-replay'; replay.textContent = 'Pause scene';
      replay.addEventListener('click', function () {
        if (elapsed >= chapter[3]) { elapsed = 0; pausedEffects = false; }
        else pausedEffects = !pausedEffects;
        updateSceneButton(); kick();
      });
      front.appendChild(replay);
    }
    leaf.appendChild(front); leaf.appendChild(back); main.appendChild(leaf);
    return { leaf: leaf, section: section, content: content, footer: footer, chapter: chapter, fit: fit,
      scene: isScene, meter: meter, replay: replay };
  }
  chapters.forEach(function (chapter) {
    var page = makePage(doc.getElementById(chapter[0]), chapter);
    pages.push(page);
  });
  if (!pages.length) return;
  doc.getElementById('bookPages').appendChild(main);
  root.classList.add('book-mode'); set.hidden = false;

  function refreshContents() {
    select.textContent = '';
    pages.forEach(function (p, i) {
      p.footer.textContent = pad(i + 1);
      var option = doc.createElement('option'); option.value = i;
      option.textContent = pad(i + 1) + ' · ' + p.chapter[1];
      select.appendChild(option);
    });
  }
  function findPage(id) {
    for (var i = 0; i < pages.length; i++) if (pages[i].chapter[0] === id) return i;
    return -1;
  }
  function fitPages() {
    if (!renderer) return;
    if (busy) { pendingReflow = true; return; }
    pendingReflow = false;
    root.classList.add('book-measuring');
    pages.forEach(function (p) {
      if (!p.fit) return;
      var width = p.content.clientWidth, height = p.content.clientHeight;
      if (!width || !height) return;
      // Reflow at the complete paper width, even when a short screen needs smaller
      // type. Scaling a fixed-width card used to leave large empty side margins.
      // Nodes stay in their section: one leaf, no duplicated or hidden wording.
      p.fit.style.width = width + 'px'; p.fit.style.height = 'auto';
      p.section.style.transform = 'none'; p.section.style.position = 'relative';
      p.section.style.height = 'auto'; p.section.style.minHeight = '0';
      function measuredHeight(scale) {
        p.section.style.width = (width / scale) + 'px';
        return p.section.offsetHeight * scale;
      }
      var available = height - 2, scale = 1;
      if (measuredHeight(1) > available) {
        var low = 0.1, high = 1;
        for (var step = 0; step < 12; step++) {
          var candidate = (low + high) / 2;
          if (measuredHeight(candidate) <= available) low = candidate;
          else high = candidate;
        }
        scale = low;
      }
      var fittedHeight = measuredHeight(scale);
      if (p.chapter[0] === 'letter') {
        fittedHeight = available;
        p.section.style.height = (available / scale) + 'px';
      }
      p.fit.style.height = fittedHeight + 'px';
      p.section.style.position = 'absolute'; p.section.style.transform = 'scale(' + scale + ')';
      p.leaf.setAttribute('data-fit-scale', scale.toFixed(3));
    });
    root.classList.remove('book-measuring');
    if (layout) layout();
  }
  function scheduleReflow() {
    clearTimeout(reflowTimer);
    reflowTimer = setTimeout(fitPages, 120);
  }
  window.addEventListener('resize', scheduleReflow);
  window.addEventListener('load', scheduleReflow);
  if (window.ResizeObserver) {
    var fitObserver = new ResizeObserver(scheduleReflow);
    pages.forEach(function (p) { if (p.fit) fitObserver.observe(p.section); });
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(scheduleReflow);
  refreshContents();

  function updateSceneButton() {
    var p = pages[index];
    if (p.replay) p.replay.textContent = elapsed >= p.chapter[3] ? 'Replay scene' : pausedEffects ? 'Play scene' : 'Pause scene';
  }
  function sync() {
    prev.disabled = busy || index === 0; next.disabled = busy;
    next.setAttribute('aria-label', index === pages.length - 1 ? 'Back to the first page' : 'Next page');
    next.firstElementChild.textContent = index === pages.length - 1 ? '↺' : '→';
    select.value = String(index); select.disabled = busy;
    count.textContent = pad(index + 1) + ' / ' + pad(pages.length);
    controls.classList[reading && !finished ? 'add' : 'remove']('on');
    play.setAttribute('aria-pressed', reading && !finished ? 'true' : 'false');
    play.setAttribute('aria-label', finished ? 'Read the invitation again' : reading ? 'Pause automatic page turning' : 'Start automatic page turning');
    playLabel.textContent = finished ? 'Read again' : reading ? 'Pause' : 'Auto-read';
    updateSceneButton();
  }
  function pauseReading(message) {
    autoStartPending = false;
    reading = false; sync();
    if (message) status.textContent = message;
  }
  function startReading() {
    autoStartPending = false; reading = true; pausedEffects = false; last = null;
    if (finished) go(0);
    status.textContent = 'Auto-read started. Use the Pause button to stop. The invitation waits while you are away and continues when you return.';
    sync(); kick();
  }
  function autoStart() {
    if (autoStartPending && renderer && !presence.isAway()) startReading();
  }
  function preload(i) {
    var p = pages[i]; if (!p) return;
    Array.prototype.forEach.call(p.section.querySelectorAll('img'), function (img) { img.loading = 'eager'; });
  }
  function activate(i, announce) {
    index = i; elapsed = 0; readElapsed = 0; last = null; pausedEffects = false; finished = false;
    var p = pages[index];
    if (renderer) renderer(p.chapter[0], reduced.matches ? 1 : 0);
    if (layout) layout();
    Array.prototype.forEach.call(p.section.querySelectorAll('.rv'), function (el) { el.classList.remove('in'); });
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
      Array.prototype.forEach.call(p.section.querySelectorAll('.rv'), function (el) { el.classList.add('in'); });
    }); });
    preload(index); preload(index + 1);
    if (announce) status.textContent = 'Page ' + (index + 1) + ' of ' + pages.length + '. ' + p.chapter[1] + '.';
    doc.title = 'Nikhitha & Sai Koundinya · ' + p.chapter[1];
    progress.style.transform = 'scaleX(' + ((index + 1) / pages.length) + ')';
    sync(); notify(); kick();
  }
  function go(to, updateHash) {
    if (busy || to < 0 || to >= pages.length || to === index) return;
    // Navigation selects a new page; only the dedicated Pause button changes
    // whether its reading timer runs. Give the new page its full reading time.
    var old = pages[index], incoming = pages[to], forward = to > index;
    busy = true;
    // Move focus out before making the departing page inaccessible.
    if (old.leaf.contains(doc.activeElement)) play.focus({ preventScroll: true });
    old.leaf.setAttribute('aria-hidden', 'true'); old.leaf.setAttribute('inert', ''); old.leaf.classList.remove('is-current');
    incoming.leaf.removeAttribute('inert'); incoming.leaf.setAttribute('aria-hidden', 'false'); incoming.leaf.classList.add('is-current');
    var turning = forward ? old.leaf : incoming.leaf;
    turning.classList.add('is-turning');
    if (updateHash !== false) history.replaceState(null, '', '#' + incoming.chapter[0]);
    activate(to, true);
    function done() {
      turnAnimation = null;
      turning.classList.remove('is-turning'); turning.style.transform = ''; turning.style.transition = '';
      busy = false; last = null; sync(); kick();
      if (pendingReflow) scheduleReflow();
    }
    if (reduced.matches || !turning.animate) { done(); return; }
    // Lift the outer edge and let its shadow travel across the paper. Keep one
    // intact sheet and an empty reverse, so text is never cloned or mirrored.
    var animation = turning.animate([
      { transform: forward ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(-170deg) rotateX(0deg)', boxShadow: '0 2px 3px #492b1210' },
      { transform: forward ? 'translateZ(18px) rotateY(-38deg) rotateX(1.8deg)' : 'translateZ(26px) rotateY(-85deg) rotateX(2.5deg)', boxShadow: '18px 14px 28px #492b122c', offset: forward ? 0.25 : 0.48 },
      { transform: forward ? 'translateZ(26px) rotateY(-85deg) rotateX(2.5deg)' : 'translateZ(18px) rotateY(-38deg) rotateX(1.8deg)', boxShadow: '10px 18px 36px #492b123b', offset: forward ? 0.52 : 0.75 },
      { transform: forward ? 'rotateY(-170deg) rotateX(0deg)' : 'rotateY(0deg) rotateX(0deg)', boxShadow: '0 2px 3px #492b1210' }
    ], { duration: 1050, easing: 'cubic-bezier(.3,.05,.2,1)', fill: 'forwards' });
    animation.onfinish = function () { animation.oncancel = null; animation.cancel(); done(); };
    animation.oncancel = function () { if (busy) done(); };
    turnAnimation = animation;
    if (presence.isAway()) animation.pause();
  }
  function tick(time) {
    frame = 0;
    if (presence.isAway() || busy) { last = null; return; }
    var p = pages[index], dt = last === null ? 0 : Math.min((time - last) / 1000, 0.06);
    last = time;
    var multiplier = Number(speed.value) || 1;
    if (p.scene && !reduced.matches && !pausedEffects && elapsed < p.chapter[3]) {
      elapsed = Math.min(p.chapter[3], elapsed + dt * multiplier);
      var q = elapsed / p.chapter[3];
      if (renderer) renderer(p.chapter[0], q);
      if (p.meter) p.meter.style.transform = 'scaleX(' + q + ')';
      updateSceneButton();
    }
    if (reading && !finished) {
      readElapsed += dt * multiplier;
      var readTime = p.chapter[3];
      // Scene pause/replay controls affect the artwork, not the page's timer.
      if (readElapsed >= readTime + 2) {
        if (index < pages.length - 1) { go(index + 1); return; }
        finished = true; sync();
        status.textContent = 'You have reached the end of the invitation. Choose Read again or use the return arrow to begin again.';
      }
    }
    if ((reading && !finished) || (p.scene && !reduced.matches && !pausedEffects && elapsed < p.chapter[3])) kick();
    else last = null;
  }
  function kick() { if (!frame && !busy && !presence.isAway()) frame = window.requestAnimationFrame(tick); }
  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index === pages.length - 1 ? 0 : index + 1); });
  select.addEventListener('change', function () { go(Number(select.value)); });
  play.addEventListener('click', function () {
    if (reading && !finished) pauseReading('Auto-read paused.');
    else startReading();
  });
  speed.setAttribute('aria-label', 'Reading and scene speed');
  controls.setAttribute('aria-label', 'Automatic page turning'); controls.hidden = false;
  speed.addEventListener('change', function () { last = null; });
  main.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.hasAttribute('aria-disabled')) return;
    var id = anchor.getAttribute('href').slice(1);
    for (var i = 0; i < pages.length; i++) if (pages[i].chapter[0] === id) { e.preventDefault(); go(i); break; }
  });
  var gesture = null;
  main.addEventListener('touchstart', function (e) {
    // A swipe changes the page without changing the auto-read setting.
    if (e.touches.length === 1 && !interactive(e.target)) gesture = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    else gesture = null;
  }, { passive: true });
  main.addEventListener('touchend', function (e) {
    if (!gesture || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - gesture.x, dy = e.changedTouches[0].clientY - gesture.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.6) go(index + (dx < 0 ? 1 : -1));
    gesture = null;
  }, { passive: true });
  doc.addEventListener('keydown', function (e) {
    if (interactive(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(index + (e.key === 'ArrowRight' ? 1 : -1)); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); go(e.key === 'Home' ? 0 : pages.length - 1); }
  });
  presence.subscribe(function (away) {
    last = null;
    if (away) {
      window.cancelAnimationFrame(frame); frame = 0;
      if (turnAnimation) turnAnimation.pause();
    } else {
      if (turnAnimation) turnAnimation.play();
      autoStart(); kick();
    }
  });
  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1), target = findPage(id);
    if (target >= 0) go(target, false);
  });
  function motionChanged() {
    if (turnAnimation && reduced.matches) turnAnimation.finish();
    if (renderer) renderer(pages[index].chapter[0], reduced.matches ? 1 : Math.min(1, elapsed / pages[index].chapter[3]));
    updateSceneButton(); scheduleReflow(); kick();
  }
  if (reduced.addEventListener) reduced.addEventListener('change', motionChanged);
  else reduced.addListener(motionChanged);
  window.Book = {
    currentId: function () { return pages[index].chapter[0]; },
    progress: function () { return reduced.matches ? 1 : Math.min(1, elapsed / pages[index].chapter[3]); },
    viewport: function (id) {
      var target = id ? findPage(id) : index, p = pages[target >= 0 ? target : index];
      return { width: p.content.clientWidth, height: p.content.clientHeight };
    },
    connect: function (draw, resize) { renderer = draw; layout = resize; fitPages(); activate(index, false); autoStart(); },
    go: function (id) { var target = findPage(id); if (target >= 0) go(target); },
    isReading: function () { return reading; }
  };
  window.AutoScroll = { isOn: function () { return reading; } };
  var initial = findPage(location.hash.slice(1));
  index = initial >= 0 ? initial : 0;
  pages[index].leaf.classList.add('is-current'); pages[index].leaf.removeAttribute('inert'); pages[index].leaf.setAttribute('aria-hidden', 'false');
  preload(index); preload(index + 1); sync();
})();
