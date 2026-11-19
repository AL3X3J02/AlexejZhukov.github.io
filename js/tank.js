/* Title screen mini-game: a little tank patrols the ground, its turret tracks the cursor,
   and clicking the sky fires a shell at the drones. Pauses when off-screen. */
(function () {
  const ACCENT = '#4db2ff';
  const HOT = '#ff5d5d';
  const INK = '#e9ecf5';

  function init(canvas, host, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, ground = 0;
    let running = false, last = 0, raf = 0;
    let score = 0, turbo = false;
    const mouse = { x: 0, y: 0, active: false };
    const keys = { left: false, right: false, lastManual: 0 };
    const tank = { x: 120, dir: 1, angle: -Math.PI / 4, recoil: 0, tread: 0 };
    let stars = [], drones = [], shells = [], parts = [], floats = [];

    function resize() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ground = h - 54;
      if (!stars.length) seed();
      tank.x = Math.min(Math.max(tank.x, 60), w - 60);
      if (!running) draw(0);
    }

    function seed() {
      stars = Array.from({ length: Math.round(Math.min(110, w / 12)) }, () => ({
        x: Math.random() * w, y: Math.random() * (h - 80), r: Math.random() < .15 ? 1.6 : 1, t: Math.random() * 6, d: .2 + Math.random() * .8
      }));
      const n = w < 640 ? 2 : 3;
      drones = Array.from({ length: n }, (_, i) => makeDrone(i));
    }

    function makeDrone(i) {
      return {
        x: Math.random() * w, y: 110 + Math.random() * Math.max(80, ground - 260),
        vx: (Math.random() < .5 ? -1 : 1) * (28 + Math.random() * 30), ph: Math.random() * 6, alive: true, respawn: 0, i: i
      };
    }

    function barrelTip() {
      const cx = tank.x, cy = ground - 24;
      const len = 30 - tank.recoil * 6;
      return { x: cx + Math.cos(tank.angle) * len, y: cy + Math.sin(tank.angle) * len };
    }

    function fire(tx, ty) {
      const tip = barrelTip();
      const spread = turbo ? [-0.12, 0, 0.12] : [0];
      spread.forEach(s => {
        const a = tank.angle + s, sp = 980;
        shells.push({ x: tip.x, y: tip.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 2.2 });
      });
      tank.recoil = 1;
      burst(tip.x, tip.y, 8, turbo ? HOT : ACCENT, 140);
      if (opts.onFire) opts.onFire();
    }

    function burst(x, y, n, color, speed) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (.3 + Math.random() * .7);
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .5 + Math.random() * .4, max: .9, c: color, sz: 2 + Math.random() * 2 });
      }
    }

    function update(dt) {
      // drive: manual with arrow keys, otherwise patrol
      const manual = performance.now() - keys.lastManual < 2500;
      if (keys.left || keys.right) {
        tank.x += (keys.right ? 1 : -1) * 170 * dt; tank.dir = keys.right ? 1 : -1;
        tank.tread += (keys.right ? 1 : -1) * 170 * dt;
      } else if (!manual) {
        tank.x += tank.dir * 36 * dt; tank.tread += tank.dir * 36 * dt;
        if (tank.x > w - 70) tank.dir = -1;
        if (tank.x < 70) tank.dir = 1;
      }
      tank.x = Math.min(Math.max(tank.x, 40), w - 40);
      tank.recoil = Math.max(0, tank.recoil - dt * 5);

      // aim: cursor, or the nearest drone when there is no cursor
      let tx, ty;
      if (mouse.active) { tx = mouse.x; ty = mouse.y; }
      else {
        const live = drones.filter(d => d.alive);
        const t = live.sort((a, b) => Math.abs(a.x - tank.x) - Math.abs(b.x - tank.x))[0];
        tx = t ? t.x : tank.x + 100; ty = t ? t.y : 100;
      }
      let target = Math.atan2(ty - (ground - 24), tx - tank.x);
      target = Math.min(Math.max(target, -Math.PI + .08), -.08);
      tank.angle += (target - tank.angle) * Math.min(1, dt * 10);

      stars.forEach(s => { s.t += dt * s.d * 2; });

      drones.forEach(d => {
        if (!d.alive) {
          d.respawn -= dt;
          if (d.respawn <= 0) Object.assign(d, makeDrone(d.i), { x: d.vx > 0 ? -20 : w + 20 });
          return;
        }
        d.ph += dt * 2; d.x += d.vx * dt;
        if (d.x < -30) d.x = w + 30;
        if (d.x > w + 30) d.x = -30;
      });

      shells.forEach(s => {
        s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (Math.random() < .6) parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: .25, max: .25, c: 'rgba(233,236,245,.5)', sz: 1.5 });
        drones.forEach(d => {
          if (!d.alive) return;
          const dy = d.y + Math.sin(d.ph) * 10;
          if (Math.hypot(s.x - d.x, s.y - dy) < 20) {
            d.alive = false; d.respawn = 1.4; s.life = 0;
            burst(d.x, dy, 26, turbo ? HOT : ACCENT, 260);
            score += 100;
            floats.push({ x: d.x, y: dy, life: 1, txt: '+100' });
            if (opts.onHit) opts.onHit(score);
          }
        });
        if (s.y >= ground) { s.life = 0; burst(s.x, ground, 10, 'rgba(233,236,245,.7)', 120); }
      });
      shells = shells.filter(s => s.life > 0 && s.x > -50 && s.x < w + 50);

      parts.forEach(p => { p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.life -= dt; });
      parts = parts.filter(p => p.life > 0);
      floats.forEach(f => { f.y -= 40 * dt; f.life -= dt; });
      floats = floats.filter(f => f.life > 0);
    }

    function drawTank() {
      const x = tank.x, g = ground, col = turbo ? HOT : ACCENT;
      ctx.save();
      // barrel
      const len = 30 - tank.recoil * 6;
      ctx.translate(x, g - 24); ctx.rotate(tank.angle);
      ctx.fillStyle = '#2a3247'; ctx.fillRect(4, -2.5, len - 4, 5);
      ctx.fillStyle = col; ctx.fillRect(len - 5, -3.5, 5, 7);
      ctx.restore();

      // turret dome
      ctx.fillStyle = '#232a3c'; ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, g - 22, 12, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      // hull
      ctx.beginPath();
      ctx.moveTo(x - 30, g - 22); ctx.lineTo(x + 30, g - 22); ctx.lineTo(x + 36, g - 13); ctx.lineTo(x - 36, g - 13); ctx.closePath();
      ctx.fillStyle = '#1b2131'; ctx.fill(); ctx.stroke();
      // tracks
      ctx.fillStyle = '#10131c'; ctx.strokeStyle = 'rgba(233,236,245,.35)'; ctx.lineWidth = 1.5;
      roundRect(x - 34, g - 13, 68, 13, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(233,236,245,.55)';
      const off = ((tank.tread % 8) + 8) % 8;
      for (let i = -34 + off; i < 34; i += 8) ctx.fillRect(x + i, g - 2, 3, 2);
      for (let i = -24; i <= 24; i += 12) { ctx.beginPath(); ctx.arc(x + i, g - 6.5, 3.2, 0, Math.PI * 2); ctx.fill(); }
      // light
      ctx.fillStyle = col; ctx.fillRect(x + (tank.dir > 0 ? 28 : -32), g - 20, 4, 3);
    }

    function roundRect(x, y, ww, hh, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + ww, y, x + ww, y + hh, r); ctx.arcTo(x + ww, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + ww, y, r); ctx.closePath();
    }

    function drawDrone(d) {
      const y = d.y + Math.sin(d.ph) * 10;
      ctx.save(); ctx.translate(d.x, y);
      ctx.strokeStyle = 'rgba(233,236,245,.75)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-16, -6); ctx.lineTo(16, -6); ctx.stroke();               // rotor bar
      ctx.fillStyle = 'rgba(233,236,245,.6)';
      const spin = Math.abs(Math.sin(d.ph * 8)) * 7 + 2;
      ctx.fillRect(-16 - spin / 2, -8, spin, 2); ctx.fillRect(16 - spin / 2, -8, spin, 2);  // rotors
      ctx.fillStyle = '#1b2131'; ctx.strokeStyle = ACCENT;
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9, 0); ctx.lineTo(0, 9); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = (Math.sin(d.ph * 3) > 0) ? HOT : 'rgba(255,93,93,.25)';
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const px = mouse.active ? (mouse.x / w - .5) : 0, py = mouse.active ? (mouse.y / h - .5) : 0;
      stars.forEach(s => {
        ctx.globalAlpha = .25 + .45 * (0.5 + 0.5 * Math.sin(s.t));
        ctx.fillStyle = INK;
        ctx.fillRect(s.x - px * 14 * s.d, s.y - py * 10 * s.d, s.r, s.r);
      });
      ctx.globalAlpha = 1;

      // ground: horizon line plus receding pixel tiles
      ctx.strokeStyle = 'rgba(77,178,255,.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ground + .5); ctx.lineTo(w, ground + .5); ctx.stroke();
      for (let row = 1; row < 5; row++) {
        const y = ground + row * row * 3 + row * 4;
        ctx.globalAlpha = .22 - row * .04;
        for (let x = (-(tank.tread * .3) % 24) - 24; x < w; x += 24) { ctx.fillStyle = ACCENT; ctx.fillRect(x, y, 10, 1); }
      }
      ctx.globalAlpha = 1;

      drones.forEach(d => d.alive && drawDrone(d));
      shells.forEach(s => { ctx.fillStyle = turbo ? HOT : ACCENT; ctx.fillRect(s.x - 2, s.y - 2, 4, 4); });
      parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.sz, p.sz); });
      ctx.globalAlpha = 1;
      drawTank();
      ctx.font = '12px Silkscreen, monospace';
      floats.forEach(f => { ctx.globalAlpha = Math.max(0, f.life); ctx.fillStyle = ACCENT; ctx.fillText(f.txt, f.x - 16, f.y); });
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
      update(dt); draw(t);
      if (running) raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduced) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    // input
    host.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
    });
    host.addEventListener('pointerleave', () => { mouse.active = false; });
    host.addEventListener('click', e => {
      if (reduced) return;
      if (e.target.closest('a, button, .card-char, .title__copy')) return;
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (y > ground - 4) return;
      mouse.x = x; mouse.y = y;
      const a = Math.atan2(y - (ground - 24), x - tank.x);
      tank.angle = Math.min(Math.max(a, -Math.PI + .08), -.08);
      fire(x, y);
    });
    window.addEventListener('keydown', e => {
      if (!running || e.target.closest('input, textarea, dialog')) return;
      if (e.key === 'ArrowLeft') { keys.left = true; keys.lastManual = performance.now(); }
      if (e.key === 'ArrowRight') { keys.right = true; keys.lastManual = performance.now(); }
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
    });

    new ResizeObserver(resize).observe(host);
    resize();
    if (reduced) { draw(0); return { setTurbo() {} }; }
    new IntersectionObserver(([en]) => { en.isIntersecting && !document.hidden ? start() : stop(); }, { threshold: .05 }).observe(host);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

    return { setTurbo(v) { turbo = v; burst(tank.x, ground - 30, 30, HOT, 220); } };
  }

  window.TankGame = { init };
})();
