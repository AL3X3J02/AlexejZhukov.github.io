(function () {
  const D = window.PORTFOLIO;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  // Real hosts can embed YouTube; the preview sandbox cannot, so it shows the screenshot and a link.
  const EMBED = /github\.io$|alexejzhukov\.com$|^localhost$/.test(location.hostname);

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ytWatch = id => 'https://www.youtube.com/watch?v=' + id;
  const ytList = id => 'https://www.youtube.com/playlist?list=' + id;

  /* ---------- Boot screen ---------- */
  const boot = $('#boot');
  if (reduced || store.get('az-booted')) {
    document.documentElement.classList.add('no-boot');
  } else {
    const fill = $('#boot-fill');
    let done = false;
    const finish = () => { if (done) return; done = true; boot.classList.add('is-done'); store.set('az-booted', '1'); };
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 900);
      fill.style.width = (p * 100).toFixed(1) + '%';
      p < 1 && !done ? requestAnimationFrame(tick) : setTimeout(finish, 120);
    })(t0);
    boot.addEventListener('click', finish);
    window.addEventListener('keydown', finish, { once: true });
  }

  /* ---------- Name entrance ---------- */
  if (!reduced) {
    let i = 0;
    $$('.title__line').forEach(line => {
      const text = line.textContent;
      line.setAttribute('aria-label', text);
      line.textContent = '';
      [...text].forEach(ch => {
        const s = document.createElement('span');
        s.className = 'char-in'; s.style.setProperty('--i', i++); s.textContent = ch; s.setAttribute('aria-hidden', 'true');
        line.appendChild(s);
      });
    });
  }

  /* ---------- Level select: map path + preview panel ---------- */
  const L = D.levels, last = L.length - 1;
  const inner = $('#track-inner'), scroller = $('#track-scroll'), tankEl = $('#track-tank'), stage = $('#stage');
  const shortLabel = i => L[i].boss ? 'Final' : 'Lvl ' + String(i + 1).padStart(2, '0');
  const fullLabel = i => L[i].boss ? 'Final level' : 'Level ' + (i + 1);
  inner.style.setProperty('--n', L.length);

  let col = 1;
  const worldsHtml = D.worlds.map(w => {
    const count = L.filter(l => l.world === w.n).length;
    const html = '<p class="world" style="grid-column:' + col + ' / span ' + count + '"><span class="pixel">World ' + w.n + '</span> ' + esc(w.name) + '</p>';
    col += count; return html;
  }).join('');
  const nodesHtml = L.map((l, i) =>
    '<button class="node' + (l.boss ? ' node--boss' : '') + '" type="button" data-i="' + i + '" style="grid-column:' + (i + 1) + '" aria-label="' + esc(fullLabel(i) + ': ' + l.title) + '">' +
    '<span class="node__thumb"><img src="' + l.image + '" alt="" loading="lazy" width="240" height="150"></span>' +
    '<span class="node__pin" aria-hidden="true"><i></i></span>' +
    '<span class="pixel node__num">' + shortLabel(i) + '</span>' +
    '<span class="node__title">' + esc(l.short) + '</span></button>').join('');
  inner.insertAdjacentHTML('afterbegin', worldsHtml + nodesHtml);
  const nodes = $$('.node', inner);
  let cur = -1;

  function placeTank(animate) {
    const n = nodes[cur]; if (!n) return;
    const pin = $('.node__pin', n);
    const x = n.offsetLeft + n.offsetWidth / 2 - 22;
    const y = n.offsetTop + pin.offsetTop + pin.offsetHeight - 9 - 24;
    tankEl.style.transition = animate && !reduced ? '' : 'none';
    tankEl.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function renderStage(i, animate) {
    const l = L[i], w = D.worlds.find(x => x.n === l.world);
    const img = $('#stage-img'); img.src = l.image; img.alt = 'Screenshot of ' + l.title;
    $('#stage-badge').textContent = fullLabel(i);
    $('#stage-engine').textContent = l.engine;
    $('#stage-world').textContent = 'World ' + w.n + ', ' + w.name;
    $('#stage-title').innerHTML = esc(l.title) + (l.wip ? ' <span class="pixel wip">WIP</span>' : '');
    $('#stage-ctx').textContent = l.context;
    $('#stage-body').textContent = l.body;
    $('#stage-tags').innerHTML = l.tags.map(t => '<li>' + esc(t) + '</li>').join('');
    const video = l.yt ? ytWatch(l.yt) : (l.playlist ? ytList(l.playlist) : '');
    const play = $('#stage-play');
    play.hidden = !video; play.href = video || '#';
    play.innerHTML = '&#9654; ' + (l.playlist ? 'Play playlist' : 'Play video');
    const acts = [];
    if (video) acts.push('<a class="btn btn--primary" href="' + video + '" target="_blank" rel="noopener">Watch on YouTube &#8599;</a>');
    if (l.report) acts.push('<a class="btn" href="' + l.report + '" target="_blank" rel="noopener">Read the report &#8599;</a>');
    $('#stage-actions').innerHTML = acts.join('');
    $('#stage-count').textContent = (i + 1) + ' / ' + L.length;
    $('#stage-prev').disabled = i === 0;
    $('#stage-next').disabled = i === last;
    const media = $('#stage-media'), frame = $('iframe', media);
    if (frame) frame.remove();
    if (animate && !reduced) { stage.classList.remove('is-swap'); void stage.offsetWidth; stage.classList.add('is-swap'); }
  }

  function pickLevel(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(last, i));
    if (i === cur) return;
    const prev = cur; cur = i;
    nodes.forEach((n, j) => {
      n.classList.toggle('is-on', j === i);
      n.classList.toggle('is-done', j < i);
      n.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
    if (prev !== -1) tankEl.classList.toggle('is-left', i < prev);
    placeTank(prev !== -1);
    renderStage(i, prev !== -1);
    if (opts.scroll) {
      const n = nodes[i];
      scroller.scrollTo({ left: n.offsetLeft - scroller.clientWidth / 2 + n.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    }
    if (opts.focus) nodes[i].focus({ preventScroll: true });
  }

  inner.addEventListener('click', e => { const n = e.target.closest('.node'); if (n) pickLevel(+n.dataset.i, { scroll: true }); });
  inner.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    pickLevel(cur + (e.key === 'ArrowRight' ? 1 : -1), { scroll: true, focus: true });
  });
  $('#stage-prev').addEventListener('click', () => pickLevel(cur - 1, { scroll: true }));
  $('#stage-next').addEventListener('click', () => pickLevel(cur + 1, { scroll: true }));
  $('#stage-play').addEventListener('click', e => {
    const l = L[cur];
    if (!EMBED || !(l.yt || l.playlist)) return; // the preview sandbox opens YouTube in a new tab instead
    e.preventDefault();
    const src = l.yt
      ? 'https://www.youtube-nocookie.com/embed/' + l.yt + '?autoplay=1'
      : 'https://www.youtube-nocookie.com/embed/videoseries?list=' + l.playlist + '&autoplay=1';
    $('#stage-media').insertAdjacentHTML('beforeend', '<iframe src="' + src + '" title="' + esc(l.title) + ' video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>');
  });
  new ResizeObserver(() => placeTank(false)).observe(inner);
  pickLevel(last);
  requestAnimationFrame(() => {
    const n = nodes[last];
    scroller.scrollLeft = n.offsetLeft - scroller.clientWidth / 2 + n.offsetWidth / 2;
  });

  /* ---------- Side quests ---------- */
  $('#quests-grid').innerHTML = D.sideQuests.map((q, i) => {
    const first = ytWatch(q.videos[0]);
    const parts = q.videos.length > 1
      ? '<ul class="chips" aria-label="Episodes">' + q.videos.map((v, j) => '<li><a href="' + ytWatch(v) + '" target="_blank" rel="noopener">#' + (j + 1) + '</a></li>').join('') + '</ul>'
      : '';
    return '<article class="quest reveal" style="--d:' + (i % 3) + '">' +
      '<span class="quest__img"><img src="' + q.image + '" alt="" loading="lazy" width="480" height="270"></span>' +
      '<div class="quest__body"><h3 class="quest__title"><a href="' + first + '" target="_blank" rel="noopener">' + esc(q.title) + ' <span aria-hidden="true">&#8599;</span></a></h3>' +
      '<p class="quest__tools">' + esc(q.tools) + (q.videos.length > 1 ? ', ' + q.videos.length + ' videos' : '') + '</p>' + parts + '</div></article>';
  }).join('');
  $('#art-list').innerHTML = D.artwork.map(a => '<li>' + esc(a[0]) + ' <em>' + esc(a[1]) + '</em></li>').join('');

  /* ---------- Tilt ---------- */
  if (finePointer && !reduced) {
    const tilt = (el, max) => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) translateZ(0)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    };
    tilt($('.card-char'), 9);
  }

  /* ---------- Main menu (arrow keys + Enter, like a game) ---------- */
  const items = $$('.menu__item');
  let sel = 0;
  const select = i => { sel = (i + items.length) % items.length; items.forEach((it, j) => it.classList.toggle('is-selected', j === sel)); };
  select(0);
  items.forEach((it, i) => { it.addEventListener('pointerenter', () => select(i)); it.addEventListener('focus', () => select(i)); });
  const hero = $('#title');
  const heroInView = () => window.scrollY < hero.offsetHeight * .5;

  /* ---------- Achievements ---------- */
  const toast = $('#toast'); const queue = []; let showing = false;
  function unlock(key, text) {
    if (store.get('ach-' + key)) return;
    store.set('ach-' + key, '1'); queue.push(text); if (!showing) nextToast();
  }
  function nextToast() {
    const t = queue.shift(); if (!t) { showing = false; return; }
    showing = true; $('#toast-text').textContent = t; toast.classList.add('is-on');
    setTimeout(() => { toast.classList.remove('is-on'); setTimeout(nextToast, 500); }, 3200);
  }

  /* ---------- Tank ---------- */
  const scoreEl = $('#score');
  const game = window.TankGame.init($('#tank-canvas'), hero, {
    onHit(score) {
      scoreEl.textContent = 'Score ' + String(score).padStart(6, '0');
      scoreEl.classList.add('is-on');
      if (score === 100) unlock('sharpshooter', 'Sharpshooter: you shot down a drone');
      if (score === 1000) unlock('ace', 'Ace: ten drones down. Hire this person?');
    }
  });

  /* ---------- Keyboard: menu, Konami code ---------- */
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'a', 'z']; // ends in my initials
  let kpos = 0;
  window.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === konami[kpos] ? kpos + 1 : (k === konami[0] ? 1 : 0);
    if (kpos === konami.length) {
      kpos = 0; game.setTurbo(true);
      unlock('konami', 'Cheat code accepted: turbo tank');
    }
    if (e.target.closest('input, textarea, .track')) return;
    if (!heroInView()) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
    else if (e.key === 'Enter' && !e.target.closest('a, button')) { e.preventDefault(); items[sel].click(); }
  });

  /* ---------- HUD: solid on scroll, scroll spy, XP bar, mobile menu ---------- */
  const hud = $('#hud'), xp = $('#xp-fill');
  const onScroll = () => {
    hud.classList.toggle('is-solid', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    xp.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const links = $$('[data-spy]'); const seen = new Set();
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.dataset.spy === en.target.id));
      seen.add(en.target.id);
      if (seen.size === links.length) unlock('explorer', 'Completionist: you visited every section');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.getElementById(a.dataset.spy); if (s) spy.observe(s); });

  const menuBtn = $('#menu-btn'), nav = $('#nav');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open'); menuBtn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); } });

  /* ---------- Reveal on scroll ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target; el.classList.add('in'); io.unobserve(el);
        // hand transforms back to hover and tilt effects once the entrance is done
        setTimeout(() => { el.classList.remove('will-reveal', 'in'); el.style.transitionDelay = ''; }, 1300);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => {
      el.classList.add('will-reveal');
      const d = el.style.getPropertyValue('--d');
      if (d) el.style.transitionDelay = (d * 90) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Continue countdown ---------- */
  const count = $('#countdown'); let n = 9, timer = 0;
  if (!reduced) {
    new IntersectionObserver(([en]) => {
      clearInterval(timer);
      if (en.isIntersecting) timer = setInterval(() => { n = n <= 0 ? 9 : n - 1; count.textContent = n; }, 1000);
    }).observe(count);
  }

  /* ---------- Copy email ---------- */
  const status = $('#copy-status');
  $('#copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(D.email);
      status.textContent = 'Copied. Paste it into your email app.';
    } catch (e) {
      const r = document.createRange(); r.selectNodeContents($('#email-text'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      status.textContent = 'Address selected. Press Ctrl+C (or Cmd+C) to copy it.';
    }
  });
})();
