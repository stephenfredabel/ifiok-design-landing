/*
 * Ifiok redesign preview: the only script in this folder.
 *
 * The pages are static snapshots of the real storefront (no Next.js runtime, no network calls).
 * This file restores the interactions that matter for a design review, with sample data only.
 * Anything that would need the real backend shows a small "Preview only" toast instead.
 *
 * Layout of this file:
 *   1. helpers (toast, storage, focus trap, theme)
 *   2. the floating view bar + the viewer (iframe with width presets)
 *   3. storefront home (sliders, panels, menus, add to cart, show more)
 *   3b. tablet menu drawer (the hamburger on tablet widths)
 *   4. cart page (needs-options dialog flow, quantities, totals)
 *   4b. checkout page (options card, guided flow, needs -> ready)
 *   5. staff carts page (tabs, drawer, reminder modal, settings switches)
 *   5b. staff tiles page (marketing tile editor: tools, shape, show on, collections)
 *   6. global fallbacks (inert links, forms, buttons) and boot
 *
 * Relative paths only, so it works under any base path (for example /ifiok-design-landing/preview/).
 */
(function () {
  'use strict';

  var D = document;
  var W = window;
  var EMBEDDED = W.self !== W.top; // true when shown inside viewer.html
  var PAGE = (D.body && D.body.getAttribute('data-pv')) || '';

  /* ---------------------------------------------------------------------------------------------
   * 1. Helpers
   * ------------------------------------------------------------------------------------------- */
  function $(sel, root) { return (root || D).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || D).querySelectorAll(sel)); }
  function el(tag, attrs, text) {
    var n = D.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function store(key, val) { // localStorage that never throws (private windows, blocked storage)
    try {
      if (val === undefined) return W.localStorage.getItem(key);
      W.localStorage.setItem(key, val);
    } catch (e) { /* ignore */ }
    return null;
  }
  function money(n) { return '₦' + Math.round(n).toLocaleString('en-US'); }
  function parseMoney(t) { return parseInt(String(t).replace(/[^0-9]/g, ''), 10) || 0; }

  // Preview chrome styles (bar, toast, notice). Kept here so the folder has a single script file.
  var css = [
    '.pv-bar{position:fixed;left:0;right:0;margin:0 auto;width:fit-content;bottom:14px;z-index:2147483000;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:center;max-width:calc(100vw - 24px);padding:6px 10px;border-radius:14px;background:rgba(15,23,42,.92);color:#e2e8f0;font:600 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35);backdrop-filter:blur(6px)}',
    '.pv-bar *{box-sizing:border-box}',
    '.pv-modal-open .pv-bar{display:none}', // never cover a drawer or dialog; close it with Esc to get the bar back
    '.pv-bar .pv-grp{display:flex;align-items:center;gap:4px}',
    '.pv-bar .pv-lbl{opacity:.6;font-weight:500;margin-right:2px}',
    '.pv-bar a,.pv-bar button{all:unset;cursor:pointer;padding:6px 9px;border-radius:8px;color:#e2e8f0;font:600 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;white-space:nowrap}',
    '.pv-bar a:hover,.pv-bar button:hover{background:rgba(255,255,255,.12)}',
    '.pv-bar a:focus-visible,.pv-bar button:focus-visible{outline:2px solid #5eead4;outline-offset:1px}',
    '.pv-bar [aria-current=true],.pv-bar [aria-pressed=true]{background:#0d9488;color:#fff}',
    '.pv-toast{position:fixed;left:50%;bottom:76px;transform:translate(-50%,12px);opacity:0;z-index:2147483001;max-width:min(92vw,420px);padding:10px 16px;border-radius:12px;background:#0f172a;color:#fff;font:500 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:opacity .2s,transform .2s;pointer-events:none;text-align:center}',
    '.pv-toast.pv-on{opacity:1;transform:translate(-50%,0)}',
    '.pv-notice{position:fixed;inset:0;z-index:2147483002;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.55)}',
    '.pv-notice[hidden]{display:none}',
    '.pv-notice-card{max-width:420px;width:100%;padding:24px;border-radius:16px;background:var(--surface-card,#fff);color:var(--text-primary,#0f172a);border:1px solid var(--border-default,#e2e8f0);box-shadow:0 20px 50px rgba(0,0,0,.35);font:400 14px/1.5 Inter,system-ui,sans-serif}',
    '.pv-notice-card h2{margin:0 0 8px;font-size:18px;font-weight:700}',
    '.pv-notice-card p{margin:0 0 16px;color:var(--text-secondary,#475569)}',
    '.pv-notice-card button{all:unset;cursor:pointer;padding:10px 18px;border-radius:10px;background:var(--brand-primary,#0d9488);color:#fff;font-weight:700;font-size:14px}',
    '.pv-notice-card button:focus-visible{outline:2px solid var(--brand-accent,#e1ac26);outline-offset:2px}',
    '.pv-opts{margin:4px 0 0;font-size:12px;color:var(--text-secondary,#475569)}',
    '.pv-err{margin:12px 0 0;font-size:13px;font-weight:600;color:#b91c1c}',
    '[data-theme=dark] .pv-err{color:#fca5a5}',
    '.pv-badge{position:absolute;right:-4px;top:-4px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 4px;border-radius:999px;font-size:10px;font-weight:700;color:#fff;background:var(--brand-accent,#e1ac26)}',
    '@media (prefers-reduced-motion:reduce){.pv-toast{transition:none}}'
  ].join('\n');
  var styleEl = el('style'); styleEl.textContent = css; D.head.appendChild(styleEl);

  // Toast: one reusable element.
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = el('div', { 'class': 'pv-toast', role: 'status', 'aria-live': 'polite' }); D.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    void toastEl.offsetWidth; // restart the transition
    toastEl.classList.add('pv-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('pv-on'); }, 2400);
  }
  // Go to another view. Inside the viewer the parent loads the capture that fits the chosen width.
  function goView(view, query) {
    var v = viewById(view);
    if (EMBEDDED) { try { W.parent.postMessage({ pvGo: v.id, pvQuery: query ? '&' + query.replace(/^\?/, '') : '' }, '*'); return; } catch (e) { /* fall through */ } }
    W.location.href = v.file + (query || '');
  }
  function previewOnly(what) { toast('Preview only: ' + (what || 'this is not connected in the static preview')); }

  // Theme: saved choice, else the OS preference. Applied as <html data-theme>, like the real site.
  function systemTheme() { return W.matchMedia && W.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function getTheme() { var t = store('pv-theme'); return t === 'dark' || t === 'light' ? t : systemTheme(); }
  function applyTheme(t) {
    D.documentElement.setAttribute('data-theme', t);
    D.documentElement.style.colorScheme = t;
    $$('.pv-theme-btn').forEach(function (b) { b.textContent = t === 'dark' ? 'Theme: dark' : 'Theme: light'; });
  }
  function setTheme(t) {
    store('pv-theme', t);
    applyTheme(t);
    var f = $('#pv-frame'); // viewer: forward to the framed page
    if (f && f.contentWindow) f.contentWindow.postMessage({ pvTheme: t }, '*');
  }
  function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
  W.addEventListener('message', function (e) {
    if (e.data && e.data.pvTheme) applyTheme(e.data.pvTheme);
  });

  // Modal helpers: remember the opener, trap Tab inside, close on Esc, restore focus.
  var modalStack = [];
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function openLayer(layer, focusTarget, onClose) {
    var rec = { layer: layer, opener: D.activeElement, onClose: onClose, scroll: D.body.style.overflow };
    modalStack.push(rec);
    D.body.appendChild(layer);
    D.body.style.overflow = 'hidden';
    D.body.classList.add('pv-modal-open');
    var t = focusTarget || $(FOCUSABLE, layer) || layer;
    if (t && t.focus) t.focus();
    return rec;
  }
  function closeTopLayer() {
    var rec = modalStack.pop();
    if (!rec) return false;
    if (rec.layer.parentNode) rec.layer.parentNode.removeChild(rec.layer);
    D.body.style.overflow = modalStack.length ? 'hidden' : rec.scroll;
    if (!modalStack.length) D.body.classList.remove('pv-modal-open');
    if (rec.opener && rec.opener.focus && D.contains(rec.opener)) rec.opener.focus();
    if (rec.onClose) rec.onClose();
    return true;
  }
  D.addEventListener('keydown', function (e) {
    var top = modalStack[modalStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); closeTopLayer(); return; }
    if (e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, top.layer).filter(function (n) { return n.offsetParent !== null; });
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0], last = items[items.length - 1];
    if (!top.layer.contains(D.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  function tplClone(sel) { // first element of a <template>, cloned
    var t = $(sel);
    return t && t.content.firstElementChild ? t.content.firstElementChild.cloneNode(true) : null;
  }
  function simpleNotice(title, text) {
    var wrap = el('div', { 'class': 'pv-notice', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pv-notice-title' });
    var card = el('div', { 'class': 'pv-notice-card' });
    card.appendChild(el('h2', { id: 'pv-notice-title' }, title));
    card.appendChild(el('p', {}, text));
    var b = el('button', { type: 'button' }, 'Close');
    b.addEventListener('click', closeTopLayer);
    card.appendChild(b);
    wrap.appendChild(card);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) closeTopLayer(); });
    openLayer(wrap, b);
  }

  /* ---------------------------------------------------------------------------------------------
   * 2. View bar and viewer
   * ------------------------------------------------------------------------------------------- */
  var VIEWS = [
    { id: 'home', label: 'Home', file: 'home.html' },
    { id: 'cart', label: 'Cart', file: 'cart.html' },
    { id: 'checkout', label: 'Checkout', file: 'checkout.html' },
    { id: 'admin-tiles', label: 'Ifiok staff: Tiles', file: 'admin-tiles.html' },
    { id: 'admin-carts', label: 'Ifiok staff: Carts', file: 'admin-carts.html' }
  ];
  var WIDTHS = [
    { w: 1440, label: 'Desktop 1440' },
    { w: 1024, label: 'Tablet 1024' },
    { w: 768, label: 'Tablet 768' },
    { w: 390, label: 'Phone 390' }
  ];
  var WIDTH_VALUES = WIDTHS.map(function (x) { return x.w; });
  function viewById(id) { for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i].id === id) return VIEWS[i]; return VIEWS[0]; }
  function viewByFile(f) { for (var i = 0; i < VIEWS.length; i++) if (f.indexOf(VIEWS[i].file) === 0) return VIEWS[i]; return null; }
  // The home page is captured once per breakpoint class (desktop header and hero, tablet header and short
  // slider, phone layout), because the real site picks them by device. Other views are responsive on their own.
  function fileFor(view, w) {
    if (view === 'home') return w >= 1440 ? 'home.html' : w >= 1024 ? 'home-1024.html' : w >= 768 ? 'home-768.html' : 'home-390.html';
    return viewById(view).file;
  }

  function buildBar(mode, state) {
    var bar = el('div', { 'class': 'pv-bar', role: 'navigation', 'aria-label': 'Preview controls' });
    var g1 = el('div', { 'class': 'pv-grp' });
    g1.appendChild(el('span', { 'class': 'pv-lbl' }, 'View'));
    VIEWS.forEach(function (v) {
      var a = el('a', { href: mode === 'viewer' ? 'viewer.html?v=' + v.id + '&w=' + state.w : v.file, 'data-pv-view': v.id }, v.label);
      if (v.id === state.view) a.setAttribute('aria-current', 'true');
      g1.appendChild(a);
    });
    bar.appendChild(g1);
    var g2 = el('div', { 'class': 'pv-grp' });
    g2.appendChild(el('span', { 'class': 'pv-lbl' }, 'Width'));
    WIDTHS.forEach(function (x) {
      var a = el('a', { href: 'viewer.html?v=' + state.view + '&w=' + x.w, 'data-pv-width': x.w }, x.label);
      if (mode === 'viewer' && x.w === state.w) a.setAttribute('aria-current', 'true');
      g2.appendChild(a);
    });
    if (mode === 'page') { // "Full" = what you are looking at now
      var full = el('a', { href: '#', 'aria-current': 'true', 'data-pv-keep': '1' }, 'Full window');
      full.addEventListener('click', function (e) { e.preventDefault(); });
      g2.insertBefore(full, g2.children[1]);
    }
    bar.appendChild(g2);
    var g3 = el('div', { 'class': 'pv-grp' });
    var tb = el('button', { type: 'button', 'class': 'pv-theme-btn', 'aria-label': 'Switch light and dark theme' }, '');
    tb.addEventListener('click', toggleTheme);
    g3.appendChild(tb);
    g3.appendChild(el('a', { href: 'index.html' }, 'All views'));
    var hide = el('button', { type: 'button', 'aria-label': 'Hide preview bar', 'aria-expanded': 'true' }, 'Hide');
    hide.addEventListener('click', function () { // collapse to a small chip so the bar never blocks the page
      var on = hide.getAttribute('aria-expanded') !== 'true';
      hide.setAttribute('aria-expanded', on ? 'true' : 'false');
      hide.textContent = on ? 'Hide' : 'Preview menu';
      $$('.pv-grp', bar).forEach(function (g) { if (g !== g3) g.style.display = on ? '' : 'none'; });
      $$('a', g3).forEach(function (a) { a.style.display = on ? '' : 'none'; });
      $$('.pv-theme-btn', g3).forEach(function (a) { a.style.display = on ? '' : 'none'; });
    });
    g3.appendChild(hide);
    bar.appendChild(g3);
    return bar;
  }

  function bootViewer() {
    var q = new URLSearchParams(W.location.search);
    var state = { view: viewById(q.get('v')).id, w: WIDTH_VALUES.indexOf(parseInt(q.get('w'), 10)) >= 0 ? parseInt(q.get('w'), 10) : 1440 };
    var stage = el('div', { id: 'pv-stage' });
    var frame = el('iframe', { id: 'pv-frame', title: 'Preview of the selected view' });
    stage.appendChild(frame);
    D.body.appendChild(stage);
    var bar = null;
    function render() {
      if (bar) bar.remove();
      bar = buildBar('viewer', state);
      D.body.appendChild(bar);
      applyTheme(getTheme());
      $$('a[data-pv-view]', bar).forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); state.view = a.getAttribute('data-pv-view'); load(); render(); history.replaceState(null, '', '?v=' + state.view + '&w=' + state.w); });
      });
      $$('a[data-pv-width]', bar).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var before = fileFor(state.view, state.w);
          state.w = parseInt(a.getAttribute('data-pv-width'), 10); layout(); render();
          if (fileFor(state.view, state.w) !== before) load(); // another capture fits this width
          history.replaceState(null, '', '?v=' + state.view + '&w=' + state.w);
        });
      });
    }
    function load(extra) { frame.src = fileFor(state.view, state.w) + '?embedded=1' + (extra || ''); }
    function layout() { // scale the framed page down when the window is narrower than the preset width
      var availW = W.innerWidth - 24, availH = W.innerHeight - 70;
      var scale = Math.min(1, availW / state.w);
      frame.style.width = state.w + 'px';
      frame.style.height = Math.max(400, availH / scale) + 'px';
      frame.style.transform = 'scale(' + scale + ')';
      stage.style.width = Math.round(state.w * scale) + 'px';
      stage.style.height = Math.round(availH) + 'px';
    }
    // Page inside the frame tells us which view it is (when the user follows a link inside it).
    W.addEventListener('message', function (e) {
      if (e.data && e.data.pvGo) { // a link inside the frame asked for another view: load the capture that fits the width
        state.view = viewById(e.data.pvGo).id; load(e.data.pvQuery); render(); history.replaceState(null, '', '?v=' + state.view + '&w=' + state.w);
      } else if (e.data && e.data.pvView && e.data.pvView !== state.view) {
        state.view = e.data.pvView; render(); history.replaceState(null, '', '?v=' + state.view + '&w=' + state.w);
      }
    });
    frame.addEventListener('load', function () {
      try { frame.contentWindow.postMessage({ pvTheme: getTheme() }, '*'); } catch (e) { /* ignore */ }
    });
    W.addEventListener('resize', layout);
    layout(); load(state.view === 'checkout' && q.get('state') === 'ready' ? '&state=ready' : ''); render();
  }

  /* ---------------------------------------------------------------------------------------------
   * 3. Storefront home
   * ------------------------------------------------------------------------------------------- */
  // Generic crossfade slider. The static snapshot keeps all slide backgrounds (opacity 0/1) but only the
  // active slide's text, so each slide's text block was saved in a <template> at capture time.
  function slider(root, o) {
    if (!root) return;
    var layers = $$(o.layers, root);
    var dots = $$(o.dots, root);
    if (!layers.length || dots.length !== layers.length) return;
    var spans = dots.map(function (d) { return d.querySelector('span'); });
    var activeCss = spans[0].style.cssText, idleCss = spans[1].style.cssText; // captured with slide 1 active
    var idx = 0, timer = null, paused = false;
    function show(i) {
      idx = (i + layers.length) % layers.length;
      layers.forEach(function (l, n) { l.style.opacity = n === idx ? '1' : '0'; });
      dots.forEach(function (d, n) { d.setAttribute('aria-current', n === idx ? 'true' : 'false'); spans[n].style.cssText = n === idx ? activeCss : idleCss; });
      var fresh = tplClone('template[' + o.tpl + '="' + idx + '"]');
      var cur = $(o.content, root);
      if (fresh && cur) { cur.replaceWith(fresh); }
    }
    function start() {
      clearInterval(timer);
      if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // no autoplay
      timer = setInterval(function () { if (!paused) show(idx + 1); }, o.every);
    }
    dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); start(); }); });
    if (o.prev) { var p = $(o.prev, root); if (p) p.addEventListener('click', function () { show(idx - 1); start(); }); }
    if (o.next) { var nx = $(o.next, root); if (nx) nx.addEventListener('click', function () { show(idx + 1); start(); }); }
    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    root.addEventListener('focusin', function () { paused = true; });
    root.addEventListener('focusout', function () { paused = false; });
    start();
  }

  // Hero side panels: collapse to a thin rail and widen the slider. Nothing is stored.
  function heroPanels() {
    var grid = $('section[aria-label="Homepage highlights"]');
    if (!grid) return;
    var sides = { left: grid.children[0], right: grid.children[2] };
    var collapsed = { left: false, right: false };
    var FULL = { left: 'var(--home-hero-left-w)', right: 'var(--home-hero-right-w)' };
    var HIDE = ['pointer-events-none', 'opacity-0', 'max-lg:hidden'];
    function setCols() {
      grid.style.setProperty('--hero-cols', (collapsed.left ? '46px' : FULL.left) + ' 1fr ' + (collapsed.right ? '46px' : FULL.right));
    }
    function setPanel(wrap, isCollapsed) {
      var full = wrap.children[0], rail = wrap.children[1];
      if (!full || !rail) return;
      HIDE.forEach(function (c) { full.classList.toggle(c, isCollapsed); rail.classList.toggle(c, !isCollapsed); });
      full.classList.toggle('opacity-100', !isCollapsed);
      rail.classList.toggle('opacity-100', isCollapsed);
      if (isCollapsed) full.setAttribute('inert', ''); else full.removeAttribute('inert');
      if (isCollapsed) rail.removeAttribute('inert'); else rail.setAttribute('inert', '');
    }
    ['left', 'right'].forEach(function (side) {
      var wrap = sides[side];
      if (!wrap) return;
      $$('button[aria-expanded]', wrap).forEach(function (b) {
        b.addEventListener('click', function () {
          collapsed[side] = /^Collapse/.test(b.getAttribute('aria-label') || '');
          setPanel(wrap, collapsed[side]); setCols();
          var target = $$('button[aria-expanded]', wrap)[collapsed[side] ? 1 : 0];
          if (target) target.focus();
        });
      });
    });
  }

  // Account menu: open on hover, focus or click; close on leave, blur or Esc.
  function accountMenu() {
    var btn = $('button[aria-label="Account"]');
    var tpl = $('#pv-account-menu');
    if (!btn || !tpl) return;
    var wrap = btn.parentElement, menu = null, closeTimer = null;
    function open() {
      clearTimeout(closeTimer);
      if (menu) return;
      menu = tpl.content.firstElementChild.cloneNode(true);
      wrap.appendChild(menu);
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { if (menu) { menu.remove(); menu = null; btn.setAttribute('aria-expanded', 'false'); } }, 120);
    }
    wrap.addEventListener('mouseenter', open);
    wrap.addEventListener('mouseleave', close);
    wrap.addEventListener('focusin', open);
    wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) close(); });
    btn.addEventListener('click', function () { if (menu) { clearTimeout(closeTimer); menu.remove(); menu = null; btn.setAttribute('aria-expanded', 'false'); } else open(); });
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu) { menu.remove(); menu = null; btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
  }

  // Mobile/tablet navigation drawer (the burger button below 1024px).
  function mobileDrawer() {
    var open = $('button[aria-label="Open menu"]');
    var drawer = $('#mobile-menu-drawer');
    if (!open || !drawer) return;
    var overlay = null;
    function show(on) {
      drawer.classList.toggle('-translate-x-full', !on);
      drawer.classList.toggle('pointer-events-none', !on);
      drawer.classList.toggle('translate-x-0', on);
      drawer.classList.toggle('pointer-events-auto', on);
      drawer.setAttribute('aria-hidden', on ? 'false' : 'true');
      open.setAttribute('aria-expanded', on ? 'true' : 'false');
      D.body.style.overflow = on ? 'hidden' : '';
      if (on && !overlay) { overlay = el('div', { 'class': 'drawer-overlay fixed inset-0 z-[70]' }); overlay.addEventListener('click', function () { show(false); }); D.body.appendChild(overlay); }
      if (!on && overlay) { overlay.remove(); overlay = null; }
      if (on) { var c = $('button[aria-label="Close menu"]', drawer); if (c) c.focus(); } else open.focus();
    }
    open.addEventListener('click', function () { show(true); });
    $$('button[aria-label="Close menu"]', drawer).forEach(function (b) { b.addEventListener('click', function () { show(false); }); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay) show(false); });
  }

  /* ---------------------------------------------------------------------------------------------
   * 3b. Tablet menu drawer (hamburger at tablet widths)
   * The real drawer is only in the page while open, so its open state was saved as a <template>
   * (dimmed backdrop + panel). Same behaviour as the real one: focus moves to Close, Tab stays inside,
   * Esc or a click on the backdrop closes it, focus returns to the hamburger. Links are inert.
   * ------------------------------------------------------------------------------------------- */
  function tabletDrawer() {
    var opener = $('button[aria-controls="tablet-menu-drawer"]');
    var tpl = $('#pv-tablet-drawer');
    if (!opener || !tpl) return;
    opener.addEventListener('click', function () {
      if (opener.getAttribute('aria-expanded') === 'true') return;
      var wrap = el('div', { style: 'display:contents' });
      Array.prototype.forEach.call(tpl.content.children, function (n) { wrap.appendChild(n.cloneNode(true)); });
      var backdrop = wrap.firstElementChild, panel = $('[role=dialog]', wrap);
      opener.setAttribute('aria-expanded', 'true');
      backdrop.addEventListener('click', closeTopLayer);
      panel.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('a,button') : null;
        if (!t) return;
        if (t.getAttribute('aria-label') === 'Close menu') { closeTopLayer(); return; }
        e.preventDefault();
        if (/^Theme/.test(t.textContent.trim())) { // theme button: flip the preview theme and relabel
          toggleTheme();
          var span = $$('span', t).filter(function (n) { return /^Theme/.test(n.textContent); })[0] || t;
          span.textContent = 'Theme: ' + (getTheme() === 'dark' ? 'Dark' : 'Light');
          return;
        }
        previewOnly('menu links are not connected in the preview');
      });
      var rec = openLayer(wrap, $('button[aria-label="Close menu"]', panel));
      rec.opener = opener;
      rec.onClose = function () { opener.setAttribute('aria-expanded', 'false'); };
    });
  }

  // Header/FAB cart badge helpers.
  var cartCount = 0;
  function setCartBadge(n) {
    cartCount = n;
    $$('a[aria-label="Cart"]').forEach(function (a) {
      var b = $('span[aria-label$="in cart"]', a);
      if (!n) { if (b) b.remove(); return; }
      if (!b) { b = el('span', { 'class': 'pv-badge' }); a.appendChild(b); }
      b.textContent = String(n);
      b.setAttribute('aria-label', n + (n === 1 ? ' item' : ' items') + ' in cart');
    });
  }

  // Product card "Add to cart": idle -> Adding -> Added, toast, header count +1. Reverts after a moment.
  function addToCart(btn) {
    if (btn.getAttribute('aria-busy') === 'true') return;
    var label = btn.querySelector('span');
    var original = label ? label.textContent : 'Add to cart';
    var card = btn.closest('.product-card');
    var name = card && card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'Item';
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
    if (label) label.textContent = 'Adding…';
    setTimeout(function () {
      btn.setAttribute('aria-busy', 'false'); btn.disabled = false;
      if (label) label.textContent = 'Added ✓';
      var status = btn.parentElement && btn.parentElement.querySelector('[role=status]');
      if (status) status.textContent = name + ' added to your cart';
      setCartBadge(cartCount + 1);
      toast(name + ' added to your cart (preview, not saved)');
      setTimeout(function () { if (label) label.textContent = original; if (status) status.textContent = ''; }, 2200);
    }, 650);
  }

  function bootHome() {
    slider($('section[aria-label="Featured promotions"]'), {
      layers: '.absolute.inset-0.transition-opacity', dots: 'button[aria-label^="Go to slide"]', content: '.relative.z-10',
      prev: 'button[aria-label="Previous slide"]', next: 'button[aria-label="Next slide"]', tpl: 'data-pv-hero', every: 6000
    });
    slider($('section[aria-label="Offers"]'), {
      layers: '.absolute.inset-0.transition-opacity', dots: 'button[aria-label^="Go to mini slide"]', content: '.relative.z-10',
      tpl: 'data-pv-mini', every: 4000
    });
    heroPanels(); accountMenu(); mobileDrawer(); tabletDrawer();

    // "Show more" on All Products: the extra cards are in the page, hidden on md+ with `md:hidden`.
    var more = $$('#collection-all_products button').filter(function (b) { return /show more/i.test(b.textContent); })[0];
    if (more) more.addEventListener('click', function () {
      $$('#collection-all_products .grid > .md\\:hidden').forEach(function (c) { c.classList.remove('md:hidden'); });
      more.parentElement.remove();
    });

    // Theme toggle button that lives in the drawer / apps menu of the real header.
    $$('button[aria-label^="Toggle theme"]').forEach(function (b) { b.addEventListener('click', toggleTheme); });

    D.addEventListener('click', function (e) {
      var add = e.target.closest && e.target.closest('.product-card button[aria-busy]');
      if (add) { e.preventDefault(); addToCart(add); e.__pv = true; }
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * 4. Cart page
   * ------------------------------------------------------------------------------------------- */
  var cart = { lines: [], flow: null };
  function cartLines() { return $$('[id^="cart-line-"]'); }
  function lineInfo(line) {
    var h = $('h3', line), qty = $('.w-8.text-center', line);
    return { line: line, name: h ? h.textContent.trim() : '', unit: parseInt(line.getAttribute('data-pv-unit'), 10) || 0, qty: parseInt(qty ? qty.textContent : '1', 10) || 1 };
  }
  function lineNeeds(line) { return !!$('.cart-needs-options', line); }
  function refreshCart() {
    var lines = cartLines(), units = 0, total = 0, needs = 0;
    lines.forEach(function (line) {
      var i = lineInfo(line), n = lineNeeds(line);
      units += i.qty; total += i.unit * i.qty; if (n) needs++;
      var from = n ? 'From ' : '';
      var unitP = $('p.text-sm.font-semibold', line); if (unitP) unitP.textContent = from + money(i.unit);
      var lineTotal = $('.sm\\:items-end p.text-sm.font-bold', line); if (lineTotal) lineTotal.textContent = from + money(i.unit * i.qty);
    });
    var box = $('.rounded-2xl.p-5');
    if (box) {
      var count = $('span.text-sm.font-medium', box); if (count) count.textContent = units + (units === 1 ? ' item' : ' items') + ' in cart';
      var tot = $('p.text-lg.font-bold', box); if (tot) tot.textContent = (needs ? 'From ' : '') + money(total);
      var banner = $('p.cart-needs-options', box);
      if (banner) { if (needs) banner.textContent = 'Choose options for ' + needs + (needs === 1 ? ' item' : ' items') + ' before you check out.'; else banner.remove(); }
    }
    setCartBadge(units);
  }
  // Options dialog, shared by the cart and the checkout. `idx` picks the saved dialog (one per product that
  // needs options). o = { flowStep, flowTotal, onSave(values) }. "Save" is validated like the real one.
  function optionsDialog(idx, o) {
    var dlg = tplClone('template[data-pv-options-dialog="' + idx + '"]') || tplClone('template[data-pv-options-dialog="0"]');
    if (!dlg) return null;
    var panel = $('[role=dialog]', dlg);
    var title = $('h2', dlg);
    if (o.flowStep) { // guided flow: "Product 1 of 2"
      var lbl = el('p', { 'class': 'text-xs font-semibold', id: 'pv-flow-label', style: 'color:var(--text-muted)' }, 'Product ' + o.flowStep + ' of ' + o.flowTotal);
      title.parentNode.insertBefore(lbl, title);
      panel.setAttribute('aria-labelledby', 'pv-flow-label ' + title.id);
    }
    // Option groups: accordion header, selects, design choices.
    var form = $('form', dlg);
    var selects = $$('select', dlg);
    var head = $('form button.flex.w-full', dlg);
    var counter = head ? $$('p', head).filter(function (p) { return /required/.test(p.textContent); })[0] : null;
    function progress() { var f = selects.filter(function (s) { return s.value; }).length; if (counter) counter.textContent = f + '/' + selects.length + ' required'; }
    selects.forEach(function (s) { s.addEventListener('change', function () { progress(); var e = $('.pv-err', dlg); if (e) e.remove(); }); });
    if (head) head.addEventListener('click', function () { var body = head.nextElementSibling; if (body) body.hidden = !body.hidden; });
    var choices = $$('fieldset button[aria-pressed]', dlg);
    var onCss = choices.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
    var offCss = choices.filter(function (b) { return b.getAttribute('aria-pressed') === 'false'; })[0];
    var onStyle = onCss ? onCss.getAttribute('style') : '', offStyle = offCss ? offCss.getAttribute('style') : '';
    choices.forEach(function (b) { b.addEventListener('click', function () {
      choices.forEach(function (o2) { var on = o2 === b; o2.setAttribute('aria-pressed', on ? 'true' : 'false'); o2.setAttribute('style', on ? onStyle : offStyle); });
    }); });
    $$('[aria-label="Close"]', dlg).forEach(function (b) { b.addEventListener('click', closeTopLayer); });
    var backdrop = dlg.firstElementChild; // dimmed backdrop
    if (backdrop && backdrop !== panel) backdrop.addEventListener('click', closeTopLayer);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = selects.filter(function (s) { return !s.value; });
      var old = $('.pv-err', dlg); if (old) old.remove();
      if (missing.length) {
        var p = el('p', { 'class': 'pv-err', role: 'alert' }, 'Please choose ' + missing.map(function (s) { var l = s.closest('div').parentNode.querySelector('label'); return l ? l.firstChild.textContent.trim() : 'an option'; }).join(' and ') + ' to continue.');
        form.appendChild(p); missing[0].focus();
        return;
      }
      var values = selects.map(function (s) { return s.value; });
      closeTopLayer();
      toast('Options saved (preview only, nothing is stored)');
      o.onSave(values);
    });
    return openLayer(dlg, panel);
  }
  // Cart: one saved dialog per line that needs options (same order as the lines).
  function openOptions(line, flowStep, flowTotal) {
    var idx = line.getAttribute('data-pv-need-index');
    optionsDialog(idx == null ? 0 : idx, {
      flowStep: flowStep, flowTotal: flowTotal,
      onSave: function (values) {
        // Mark the line configured, show the chosen options, then continue the flow if there is one.
        var badge = $('.cart-needs-options', line); if (badge) badge.remove();
        var btn = $('button.btn-primary', line); if (btn) btn.textContent = 'Edit options';
        var old2 = $('.pv-opts', line); if (old2) old2.remove();
        var nameEl = $('h3', line); if (nameEl) nameEl.insertAdjacentElement('afterend', el('p', { 'class': 'pv-opts' }, values.join(' · ')));
        refreshCart();
        if (cart.flow) continueFlow();
      }
    });
  }
  function continueFlow() {
    var next = cartLines().filter(lineNeeds)[0];
    if (next) { cart.flow.step += 1; setTimeout(function () { openOptions(next, cart.flow.step, cart.flow.total); }, 250); }
    else { cart.flow = null; setTimeout(function () { goView('checkout', '?state=ready'); }, 400); } // all options chosen: on to the checkout (ready state)
  }
  function bootCart() {
    // Remember each line's unit price (parsed once), and which lines need options (order matches the saved dialogs).
    var need = 0;
    cartLines().forEach(function (line) {
      var p = $('p.text-sm.font-semibold', line);
      line.setAttribute('data-pv-unit', String(parseMoney(p ? p.textContent : '0')));
      if (lineNeeds(line)) line.setAttribute('data-pv-need-index', String(need++));
    });
    D.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button') : null;
      if (!t) return;
      var line = t.closest('[id^="cart-line-"]');
      var text = t.textContent.trim();
      if (line && /^(Choose|Edit) options$/.test(text)) { e.__pv = true; cart.flow = null; openOptions(line); return; }
      if (line && t.closest('.mt-2.flex.items-center.gap-2')) { // quantity - / +
        var btns = $$('button', t.parentNode), qty = $('.w-8.text-center', t.parentNode);
        var q = parseInt(qty.textContent, 10) || 1;
        q = t === btns[0] ? Math.max(1, q - 1) : Math.min(99, q + 1);
        qty.textContent = String(q); e.__pv = true; refreshCart(); return;
      }
      if (line && /Remove$/.test(text)) { e.__pv = true; line.remove(); refreshCart(); toast('Line removed (preview only)'); return; }
      if (/^Proceed to Checkout/.test(text)) {
        e.__pv = true;
        var needs = cartLines().filter(lineNeeds);
        if (needs.length) { cart.flow = { step: 1, total: needs.length }; openOptions(needs[0], 1, needs.length); }
        else goView('checkout', '?state=ready');
      }
    });
    refreshCart();
  }

  /* ---------------------------------------------------------------------------------------------
   * 4b. Checkout page
   * The page is saved in its "needs options" state. Choosing options (one line, or the guided run from the
   * main button) removes that row from the options card and updates the counts. When the last line is set the
   * options card goes away and the summary switches to the saved "ready" version with the Place order button.
   * ------------------------------------------------------------------------------------------- */
  var co = { rows: [], total: 0, ready: 0, flow: null };
  function coRows() { return $$('#co-options li.co-opt-row'); }
  function coSetText(node, text) { // replace the last text node (keeps icons next to the text)
    if (!node) return;
    var last = null;
    for (var i = node.childNodes.length - 1; i >= 0; i--) if (node.childNodes[i].nodeType === 3) { last = node.childNodes[i]; break; }
    if (last) last.nodeValue = ' ' + text; else node.appendChild(D.createTextNode(text));
  }
  function coFinish() { // every line has its options: show the ready state
    var asideTpl = tplClone('#pv-co-ready-aside'), aside = $('aside.co-summary');
    if (asideTpl && aside) aside.replaceWith(asideTpl);
    var card = $('#co-options'); if (card) card.remove();
    var subTpl = tplClone('#pv-co-ready-sub'), sub = $('.co-sub');
    if (subTpl && sub) sub.replaceWith(subTpl);
    var place = $('aside.co-summary button.co-btn');
    if (place) place.focus();
  }
  function coLineDone(row) {
    var name = $('p.font-extrabold', row); name = name ? name.textContent.trim() : '';
    row.remove();
    co.ready += 1;
    var left = coRows().length;
    // summary line: the "Needs options" tag becomes "Options chosen"
    $$('aside.co-summary li.co-line').forEach(function (li) {
      var p = $('p.font-bold', li), tag = $('.co-tag', li);
      if (p && tag && p.textContent.trim() === name) { tag.textContent = 'Options chosen'; tag.setAttribute('style', 'background:var(--co-tint);color:var(--co-accent)'); }
    });
    if (!left) { coFinish(); return; }
    var sub = $('.co-options-sub');
    if (sub) sub.textContent = left === 1 ? '1 product still needs its options. Your order cannot move forward until it is set.' : left + ' products still need their options. Your order cannot move forward until each one is set.';
    var prog = $('.co-progress'); if (prog) prog.textContent = co.ready + ' of ' + co.total + ' ready';
    coSetText($('aside.co-summary p.co-warn-text.flex'), left === 1 ? 'Place order unlocks after 1 more choice' : 'Place order unlocks after ' + left + ' more choices');
  }
  function coChoose(row, step, total) {
    optionsDialog(row.getAttribute('data-pv-need-index'), {
      flowStep: step, flowTotal: total,
      onSave: function () {
        coLineDone(row);
        if (co.flow) {
          var next = coRows()[0];
          if (next) { co.flow.step += 1; setTimeout(function () { coChoose(next, co.flow.step, co.flow.total); }, 250); } else co.flow = null;
        }
      }
    });
  }
  function bootCheckout() {
    var p = $('#co-options .co-progress');
    var m = p ? /(\d+) of (\d+)/.exec(p.textContent) : null;
    co.ready = m ? +m[1] : 0; co.total = m ? +m[2] : 0;
    coRows().forEach(function (r, i) { r.setAttribute('data-pv-need-index', String(i)); });
    if (/[?&]state=ready/.test(W.location.search)) { coFinish(); }
    D.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button') : null;
      if (!t) return;
      var row = t.closest('li.co-opt-row');
      if (row && t.classList.contains('co-opt-btn')) { e.__pv = true; co.flow = null; coChoose(row); return; }
      if (t.closest('aside.co-summary') && /^Choose options to continue/.test(t.textContent.trim())) {
        e.__pv = true;
        var rows = coRows(); co.flow = { step: 1, total: rows.length };
        if (rows.length) coChoose(rows[0], 1, rows.length);
        return;
      }
      if (t.type === 'submit' && t.closest('aside.co-summary')) { e.__pv = true; e.preventDefault(); previewOnly('no order is placed in the preview'); return; } // Place order
      if (t.getAttribute('role') === 'radio' && t.classList.contains('co-choice')) { // delivery / pickup
        e.__pv = true;
        $$('.co-choice', t.parentNode).forEach(function (b) { b.setAttribute('aria-checked', b === t ? 'true' : 'false'); });
      }
    });
    // Place order: nothing is sent.
    D.addEventListener('submit', function (e) { e.preventDefault(); e.__pv = true; previewOnly('no order is placed in the preview'); }, true);
  }

  /* ---------------------------------------------------------------------------------------------
   * 5. Staff carts page
   * ------------------------------------------------------------------------------------------- */
  var adminKey = 'open'; // which saved list state is showing (open, stale, needs, all) or settings
  var listKey = 'open';
  function adminRoot() { return $('main > div > div'); }
  function adminSwap(key) {
    var fresh = tplClone('template[data-pv-state="' + key + '"]');
    var root = adminRoot();
    if (!fresh || !root) return;
    root.replaceWith(fresh);
    adminKey = key; if (key !== 'settings') listKey = key;
  }
  function openDrawer(id) {
    var layer = tplClone('template[data-pv-drawer="' + id + '"]');
    if (!layer) { previewOnly('details are included for the first four carts in this sample'); return; }
    var panel = $('[role=dialog]', layer);
    $$('[aria-label="Close"]', layer).forEach(function (b) { b.addEventListener('click', closeTopLayer); });
    layer.addEventListener('mousedown', function (e) { if (e.target === layer) closeTopLayer(); });
    $$('button', layer).forEach(function (b) { if (/Send reminder/.test(b.textContent)) b.addEventListener('click', function () { openReminder(b); }); });
    openLayer(layer, panel);
  }
  function openReminder() {
    var layer = tplClone('template[data-pv-modal="reminder"]');
    if (!layer) return;
    layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true');
    var h = $('h2', layer); if (h) { h.id = 'pv-rem-title'; layer.setAttribute('aria-labelledby', 'pv-rem-title'); }
    layer.addEventListener('mousedown', function (e) { if (e.target === layer) closeTopLayer(); });
    $$('button', layer).forEach(function (b) {
      var t = b.textContent.trim();
      if (t === 'Cancel' || (!t && b.querySelector('svg'))) b.addEventListener('click', closeTopLayer);
      else if (/Send reminder/.test(t)) b.addEventListener('click', function (e) {
        e.preventDefault(); closeTopLayer(); toast('Reminder queued (preview only, nothing was sent)');
      });
    });
    openLayer(layer, $('input[type=checkbox]', layer));
  }
  function bootAdmin() {
    D.addEventListener('click', function (e) {
      var t = e.target;
      var row = t.closest && t.closest('[data-cart-open]');
      if (row) { e.__pv = true; openDrawer(row.getAttribute('data-cart-open')); return; }
      var tab = t.closest && t.closest('[role=tab]');
      if (tab) { e.__pv = true; adminSwap(/Settings/.test(tab.textContent) ? 'settings' : listKey); return; }
      var chip = t.closest && t.closest('button[aria-pressed]');
      if (chip && adminRoot() && adminRoot().contains(chip) && !modalStack.length) {
        var map = { 'Open': 'open', 'Stale': 'stale', 'Needs options': 'needs', 'All': 'all' };
        var k = map[chip.textContent.trim()];
        if (k) { e.__pv = true; adminSwap(k); return; }
      }
      var sw = t.closest && t.closest('button[role=switch]');
      if (sw) { // settings switches: flip, and enable the inputs that belong to it
        e.__pv = true;
        var on = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', on ? 'true' : 'false');
        var track = sw.firstElementChild, thumb = track && track.firstElementChild;
        if (track) { track.classList.toggle('bg-teal-600', on); track.classList.toggle('bg-slate-300', !on); track.classList.toggle('dark:bg-slate-600', !on); }
        if (thumb) { thumb.classList.toggle('translate-x-5', on); thumb.classList.toggle('translate-x-0', !on); }
        var sec = sw.closest('section');
        if (sec) { $$('input', sec).forEach(function (i) { i.disabled = !on; }); $$('.opacity-50', sec).forEach(function (n) { if (n.tagName === 'SPAN') n.classList.toggle('opacity-50', !on); }); }
        return;
      }
      var b = t.closest && t.closest('button');
      if (b && /^Save/.test(b.textContent.trim())) { e.__pv = true; toast('Settings saved (preview only, nothing is stored)'); }
    });
  }


  /* ---------------------------------------------------------------------------------------------
   * 5b. Staff tiles page (slides editor with the Marketing tile tool)
   * Saved states (templates): the slide list, the main slides list, and the editor for the sample tile with
   * each tool (Copy, Image, Layout, Schedule, Marketing tile). The shape choice swaps the radio group and the
   * "Preview at card size" column. Show on chips and collection checkboxes toggle in place.
   * ------------------------------------------------------------------------------------------- */
  var tiles = { shape: 'card' };
  function tilesRoot() { return $('main > div > div'); }
  function tilesSwap(key) {
    var fresh = tplClone('template[data-pv-tstate="' + key + '"]'), root = tilesRoot();
    if (!fresh || !root) return;
    root.replaceWith(fresh);
    if (key === 'tile' && tiles.shape !== 'card') tilesShape(tiles.shape);
    W.scrollTo(0, 0);
  }
  function tilesPreviewCol() {
    var h = $$('main *').filter(function (n) { return /^Preview at card size$/.test(n.textContent.trim()); }).pop();
    return h ? h.parentElement : null;
  }
  function tilesShape(shape) {
    tiles.shape = shape;
    var rg = $('[role=radiogroup]'), col = tilesPreviewCol();
    var rgNew = tplClone('template[data-pv-shape-rg="' + shape + '"]'), colNew = tplClone('template[data-pv-shape-prev="' + shape + '"]');
    if (rg && rgNew) rg.parentElement.replaceWith(rgNew);
    if (col && colNew) col.replaceWith(colNew);
  }
  var CHIP_ON = ['border-teal-600', 'bg-teal-50', 'text-teal-900', 'dark:bg-teal-900/30', 'dark:text-teal-100'];
  var CHIP_OFF = ['border-slate-200', 'text-slate-600', 'hover:border-slate-300', 'dark:border-white/15', 'dark:text-slate-300'];
  function bootTiles() {
    D.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button,[role=radio]') : null;
      if (!t || !tilesRoot() || !tilesRoot().contains(t)) return;
      var label = (t.getAttribute('aria-label') || t.textContent || '').replace(/\s+/g, ' ').trim();
      var m;
      if (t.getAttribute('role') === 'radio') { e.__pv = true; if (/^Circle/.test(label)) tilesShape('circle'); else if (/^Card/.test(label)) tilesShape('card'); return; }
      if ((m = /^(Edit|Select) slide (\d+)/.exec(label))) { e.__pv = true; if (m[2] === '5') tilesSwap('copy'); else previewOnly('the editor is included for the sample tile "Startup discounts" (slide 5)'); return; }
      if (/^(Back to )?all slides$/i.test(label)) { e.__pv = true; tilesSwap('list'); return; }
      if (label === 'Main slides') { e.__pv = true; previewOnly('the main slides tab is not included; the mini slider tab has the same editor'); return; }
      if (label === 'Mini slider') { e.__pv = true; tilesSwap('list'); return; }
      var tool = { 'Copy': 'copy', 'Image': 'image', 'Layout': 'layout', 'Schedule': 'schedule', 'Marketing tile': 'tile' }[label];
      if (tool && $('template[data-pv-tstate="' + tool + '"]')) { e.__pv = true; tilesSwap(tool); return; }
      if (t.hasAttribute('aria-pressed') && /^(Desktop|Tablet|Phone)$/.test(label)) { // Show on chips
        e.__pv = true;
        var on = t.getAttribute('aria-pressed') !== 'true';
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
        CHIP_ON.forEach(function (c) { t.classList.toggle(c, on); });
        CHIP_OFF.forEach(function (c) { t.classList.toggle(c, !on); });
      }
    });
    D.addEventListener('change', function (e) { // collection checkboxes: show or hide the Position field
      var cb = e.target;
      if (!cb || cb.type !== 'checkbox' || !tilesRoot() || !tilesRoot().contains(cb)) return;
      var li = cb.closest('li'); if (!li) return;
      var field = $('input[type=number]', li);
      if (cb.checked && !field) {
        var box = tplClone('#pv-tile-pos');
        if (box) {
          var id = 'pv-pos-' + Math.random().toString(36).slice(2, 8), inp = $('input', box), lab = $('label', box);
          inp.id = id; lab.setAttribute('for', id); inp.value = '1';
          li.appendChild(box);
        }
      } else if (!cb.checked && field) field.parentElement.remove();
    });
    // The page is saved on the slide list; "Save & Publish" is disabled there, as in the real editor with no changes.
  }

  /* ---------------------------------------------------------------------------------------------
   * 6. Global fallbacks and boot
   * ------------------------------------------------------------------------------------------- */
  // Controls that already have their own handler (so the generic "Preview only" toast stays out of the way).
  var OWN = [
    '[aria-label^="Go to"]', '[aria-label="Previous slide"]', '[aria-label="Next slide"]', 'button[aria-expanded][aria-label$="panel"]',
    'button[aria-label="Account"]', '[aria-label="Open menu"]', '[aria-label="Close menu"]', '[aria-label^="Toggle theme"]',
    '#collection-all_products .justify-center button', '.product-card button[aria-busy]', '[data-cart-open]', '[role=tab]',
    'button[role=switch]', 'button[aria-pressed]', '[id^="cart-line-"] button', '.rounded-2xl.p-5 button.btn-primary',
    '[aria-controls="tablet-menu-drawer"]', '.co-opt-btn', 'aside.co-summary button.co-btn', '.co-choice'
  ].join(',');
  function bootGlobal() {
    D.addEventListener('click', function (e) { // capture phase: tag clicks that something else will handle
      if (e.target.closest && e.target.closest(OWN)) e.__pv = true;
    }, true);
    D.addEventListener('click', function (e) {
      if (e.__pv || e.defaultPrevented) return;
      var a = e.target.closest && e.target.closest('a');
      if (a) {
        var href = a.getAttribute('href') || '';
        if (a.closest('.pv-bar')) return;
        if (/\.html(\?|#|$)/.test(href) && href.indexOf('/') !== 0 && href.indexOf('http') !== 0) {
          var target = viewByFile(href);
          if (EMBEDDED && target) { e.preventDefault(); goView(target.id); } // the viewer loads the capture that fits the width
          return; // otherwise normal navigation between preview pages
        }
        e.preventDefault();
        if (a.getAttribute('data-pv-href') || href) previewOnly('this link is not connected here');
        return;
      }
      var btn = e.target.closest && e.target.closest('button, [role=button], summary');
      if (btn && !btn.closest('.pv-bar, .pv-notice') && !btn.closest('[role=dialog]') && btn.type !== 'checkbox') {
        if (btn.closest('form') && btn.type === 'submit') return; // handled by the submit listener
        if (btn.hasAttribute('data-pv-ok')) return;
        previewOnly('this control is not active in the preview');
      }
    }, false);
    D.addEventListener('submit', function (e) {
      if (e.defaultPrevented) return;
      e.preventDefault();
      previewOnly('forms are not submitted in the preview');
    });
  }

  function boot() {
    applyTheme(getTheme());
    if (PAGE === 'viewer') { bootViewer(); return; }
    if (PAGE === 'index') return; // landing page: theme only
    var view = viewById(PAGE).id;
    if (!EMBEDDED) { D.body.appendChild(buildBar('page', { view: view, w: 0 })); applyTheme(getTheme()); }
    else { try { W.parent.postMessage({ pvView: view }, '*'); } catch (e) { /* ignore */ } }
    if (PAGE === 'home') bootHome();
    if (PAGE === 'cart') bootCart();
    if (PAGE === 'checkout') bootCheckout();
    if (PAGE === 'admin-carts') bootAdmin();
    if (PAGE === 'admin-tiles') bootTiles();
    bootGlobal();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
