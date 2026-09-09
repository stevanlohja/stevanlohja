/* ============================================================
   stevanlohja.com — progressive enhancement only.
   Every section renders and reads correctly with JS disabled.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- theme ---------------- */
  var THEME_KEY = 'sl-theme';
  var themeBtn = $('#theme');

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to ' + (t === 'light' ? 'dark' : 'light') + ' theme');
    rerenderEmbeds();
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', 'Switch to ' + (currentTheme() === 'light' ? 'dark' : 'light') + ' theme');
    themeBtn.addEventListener('click', function () {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------------- mobile nav ---------------- */
  var burger = $('#burger');
  var navlinks = $('#navlinks');
  if (burger && navlinks) {
    burger.addEventListener('click', function () {
      var open = navlinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navlinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navlinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- sticky nav border ---------------- */
  var nav = $('#nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- scroll-spy ---------------- */
  var navAnchors = $$('.nav__links a');
  var spyTargets = navAnchors
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (spyTargets.length && 'IntersectionObserver' in window) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var bestId = null, best = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > best) { best = visible[id]; bestId = id; }
      });
      navAnchors.forEach(function (a) {
        var on = bestId && a.getAttribute('href') === '#' + bestId;
        if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-64px 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealables = $$('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var rv = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealables.forEach(function (el) { rv.observe(el); });
  }

  /* ---------------- metric count-up ---------------- */
  function renderMetric(el, val) {
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = prefix + val;
    if (suffix) {
      var u = document.createElement('span');
      u.className = 'u';
      u.textContent = suffix;
      el.appendChild(u);
    }
  }

  var counters = $$('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || target === 0) return;                // 0 is the point; never animate it
    var dur = 900, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      renderMetric(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else renderMetric(el, target);
    }
    renderMetric(el, 0);
    requestAnimationFrame(step);
  }

  if (!reduced && counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------------- generic filter ---------------- */
  function wireFilter(groupSel, attr, cardSel, cardAttr) {
    var group = $(groupSel);
    if (!group) return;
    var chips = $$('.chip', group);
    var cards = $$(cardSel);

    group.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.chip') : null;
      if (!chip || !group.contains(chip)) return;
      var val = chip.getAttribute(attr);

      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });

      var shown = 0;
      cards.forEach(function (card) {
        var raw = card.getAttribute(cardAttr) || '';
        var match = val === 'all' || raw.split(/\s+/).indexOf(val) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      group.setAttribute('aria-label', group.getAttribute('aria-label'));
      announce(shown + ' shown');
    });
  }

  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'sr';
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = msg;
  }

  /* Scoped to their own grids on purpose: the developer-relations section reuses .jcard,
     and an unscoped '.jcard' would let the project filter hide those cards too. */
  wireFilter('#pfilters', 'data-pf', '#pgrid .pcard', 'data-cat');
  wireFilter('#jfilters', 'data-jf', '#jgrid .jcard', 'data-tags');

  /* ---------------- lazy X / Twitter embeds ---------------- */
  var widgetsState = 'idle';      // idle | loading | ready | failed
  var widgetsQueue = [];
  var loadedTweets = {};          // id -> container

  function loadWidgets() {
    if (widgetsState === 'ready') return Promise.resolve();
    if (widgetsState === 'failed') return Promise.reject();
    if (widgetsState === 'loading') {
      return new Promise(function (res, rej) { widgetsQueue.push([res, rej]); });
    }
    widgetsState = 'loading';
    return new Promise(function (res, rej) {
      widgetsQueue.push([res, rej]);
      var s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.charset = 'utf-8';
      s.onload = function () {
        widgetsState = window.twttr && window.twttr.widgets ? 'ready' : 'failed';
        widgetsQueue.forEach(function (p) { widgetsState === 'ready' ? p[0]() : p[1](); });
        widgetsQueue = [];
      };
      s.onerror = function () {
        widgetsState = 'failed';
        widgetsQueue.forEach(function (p) { p[1](); });
        widgetsQueue = [];
      };
      document.head.appendChild(s);
    });
  }

  function renderTweet(id, box) {
    return window.twttr.widgets.createTweet(id, box, {
      theme: currentTheme(),
      dnt: true,
      conversation: 'none',
      align: 'left'
    });
  }

  /* X's wrapper is inserted as position:absolute; visibility:hidden; height:0 and only
     becomes visible once the iframe signals it is ready. If that never happens - the
     visitor blocks third-party frames, the post was deleted, the network is slow - the
     card would sit silently empty. So we wait for real height, then fall back visibly. */
  function waitVisible(box, ms) {
    return new Promise(function (resolve) {
      var waited = 0, tick = 250;
      (function poll() {
        var f = box.querySelector('iframe');
        if (f && f.getBoundingClientRect().height > 20) return resolve(true);
        waited += tick;
        if (waited >= ms) return resolve(false);
        setTimeout(poll, tick);
      })();
    });
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      Promise.resolve(promise),
      new Promise(function (res) { setTimeout(function () { res('timeout'); }, ms); })
    ]);
  }

  function rerenderEmbeds() {
    if (widgetsState !== 'ready') return;
    Object.keys(loadedTweets).forEach(function (id) {
      var box = loadedTweets[id];
      box.textContent = '';
      renderTweet(id, box);
    });
  }

  $$('[data-tweet]').forEach(function (btn) {
    var label = function (txt) { btn.lastChild.textContent = ' ' + txt; };

    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-tweet');
      var box = $('[data-embed-for="' + id + '"]');
      var link = btn.parentNode.querySelector('a[href*="/status/' + id + '"]');
      var url = link ? link.getAttribute('href') : 'https://x.com/i/status/' + id;
      if (!box) return;

      // collapse
      if (box.getAttribute('data-open') === '1') {
        box.textContent = '';
        box.removeAttribute('data-open');
        delete loadedTweets[id];
        label('Show post');
        return;
      }

      box.setAttribute('data-open', '1');
      box.innerHTML = '<p class="embed-load">Loading post from x.com\u2026</p>';
      label('Hide post');

      var fallback = function () {
        if (box.getAttribute('data-open') !== '1') return;
        box.innerHTML = '<p class="embed-load">Could not embed this post here \u2014 ' +
          '<a href="' + url + '" rel="noopener">read the announcement on x.com \u2197</a></p>';
        delete loadedTweets[id];
      };

      loadWidgets().then(function () {
        box.textContent = '';
        loadedTweets[id] = box;
        return withTimeout(renderTweet(id, box), 8000);
      }).then(function (res) {
        if (res === 'timeout' || !res) return fallback();
        return waitVisible(box, 6000).then(function (ok) { if (!ok) fallback(); });
      }).catch(fallback);
    });
  });

  /* ---------------- copy email ---------------- */
  var copyBtn = $('#copymail');
  var copyLabel = $('#copymail-label');
  if (copyBtn && copyLabel) {
    var revert;
    copyBtn.addEventListener('click', function () {
      var mail = copyBtn.getAttribute('data-mail');
      var done = function (ok) {
        copyLabel.textContent = ok ? 'Copied' : mail;
        clearTimeout(revert);
        revert = setTimeout(function () { copyLabel.textContent = 'Copy email'; }, ok ? 1800 : 6000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  /* ---------------- year ---------------- */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
