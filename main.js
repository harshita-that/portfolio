/* ══════════════════════════════════════════════════
   HARSHITA VAGHELA — PORTFOLIO · interactions
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(max-width: 760px)').matches || ('ontouchstart' in window);
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ─────────── NAV ─────────── */
  const nav = $('#nav');
  $$('.nav-links a').forEach((a) => {
    const span = a.querySelector('span');
    if (span) a.setAttribute('data-label', span.textContent);
  });
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ─────────── SCROLL PROGRESS ─────────── */
  const prog = $('#scrollProgress');
  const onProg = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    prog.style.width = (p * 100).toFixed(2) + '%';
  };
  onProg();
  window.addEventListener('scroll', onProg, { passive: true });

  /* ─────────── CUSTOM CURSOR ─────────── */
  if (!isTouch) {
    const dot = $('#cursorDot'), ring = $('#cursorRing'), label = $('#cursorLabel');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function loop() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const setState = (s) => {
      document.body.classList.remove('c-hover', 'c-view', 'c-mail', 'c-down');
      if (s === 'view') { document.body.classList.add('c-view'); label.textContent = 'View'; }
      else if (s === 'mail') { document.body.classList.add('c-mail'); label.textContent = 'Mail'; }
      else if (s === 'link' || s === 'hold') { document.body.classList.add('c-hover'); }
    };
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      setState(t ? t.getAttribute('data-cursor') : null);
    });
    window.addEventListener('mousedown', () => ring.style.opacity = '.5');
    window.addEventListener('mouseup', () => ring.style.opacity = '1');
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
  }

  /* ─────────── SPLIT TEXT HELPER ─────────── */
  function splitWord(lineEl) {
    const word = lineEl.getAttribute('data-word') || lineEl.textContent;
    lineEl.textContent = '';
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? ' ' : ch;
      lineEl.appendChild(s);
    });
    return $$('.char', lineEl);
  }
  function animateChars(chars, delayBase = 0) {
    chars.forEach((c, i) => {
      c.style.transform = 'translateY(0)';
      if (c.animate) {
        c.animate(
          [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
          { duration: 1000, delay: (delayBase + i * 0.035) * 1000, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'backwards' }
        );
      }
    });
  }

  /* ─────────── HERO KINETIC NAME ─────────── */
  const heroLines = $$('#heroName .line');
  if (reduce) {
    heroLines.forEach((l) => { l.textContent = l.getAttribute('data-word'); });
  } else {
    let base = 0.15;
    heroLines.forEach((l) => {
      const chars = splitWord(l);
      animateChars(chars, base);
      base += chars.length * 0.018 + 0.1;
    });
  }

  /* ─────────── REVEALS ─────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  setTimeout(() => $$('#hero .reveal').forEach((el) => el.classList.add('in')), 250);

  /* ─────────── STAT COUNTERS ─────────── */
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (isNaN(target) || reduce) { statIO.unobserve(el); return; }
      let cur = 0; const dur = 1200, t0 = performance.now();
      (function tick(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      statIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.stat-num[data-count]').forEach((el) => statIO.observe(el));

  /* ─────────── ABOUT WORD-LIGHT ─────────── */
  const aboutEl = $('.about-statement');
  if (aboutEl) {
    const words = aboutEl.textContent.trim().split(/\s+/);
    aboutEl.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      aboutEl.appendChild(s);
      if (i < words.length - 1) aboutEl.appendChild(document.createTextNode(' '));
    });
    const wEls = $$('.w', aboutEl);
    if (reduce) { wEls.forEach((w) => w.classList.add('lit')); }
    else {
      const onLight = () => {
        const r = aboutEl.getBoundingClientRect();
        const start = innerHeight * 0.85, end = innerHeight * 0.35;
        const p = clamp((start - r.top) / (start - end), 0, 1);
        const n = Math.round(p * wEls.length);
        wEls.forEach((w, i) => w.classList.toggle('lit', i < n));
      };
      onLight();
      window.addEventListener('scroll', onLight, { passive: true });
    }
  }

  /* ─────────── TERMINAL ─────────── */
  const tbody = $('#terminalBody');
  if (tbody) {
    const script = [
      { p: '$', cmd: 'whoami' },
      { out: 'harshita vaghela — full-stack developer' },
      { p: '$', cmd: 'cat focus.txt' },
      { out: 'building AI + full-stack systems, end to end.' },
      { p: '$', cmd: 'ls ~/projects' },
      { out: 'petpulse  hardhire  bidsmart  pramaan  +2' },
      { p: '$', cmd: 'status --hire' },
      { out: '✓ available for opportunities', cls: 'avail' },
    ];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    function line() { const d = document.createElement('div'); d.className = 't-line'; tbody.appendChild(d); return d; }
    const caret = () => { const c = document.createElement('span'); c.className = 't-cursor'; return c; };

    async function run() {
      if (reduce) {
        script.forEach((s) => {
          const d = line();
          if (s.cmd) d.innerHTML = `<span class="t-prompt">${s.p} </span><span class="t-cmd">${s.cmd}</span>`;
          else d.innerHTML = `<span class="t-out">${s.out}</span>`;
        });
        return;
      }
      await wait(900);
      for (const s of script) {
        const d = line();
        if (s.cmd) {
          d.innerHTML = `<span class="t-prompt">${s.p} </span><span class="t-cmd"></span>`;
          const span = d.querySelector('.t-cmd');
          const car = caret(); d.appendChild(car);
          for (const ch of s.cmd) { span.textContent += ch; await wait(48 + Math.random() * 50); }
          await wait(260); car.remove();
        } else {
          await wait(180);
          d.innerHTML = `<span class="t-out" style="color:${s.cls ? 'var(--accent)' : ''}">${s.out}</span>`;
        }
        await wait(160);
      }
      const c = line(); c.innerHTML = '<span class="t-prompt">$ </span>'; c.appendChild(caret());
    }
    run();
  }

  /* ─────────── MARQUEE ─────────── */
  const stack = ['Next.js', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Tailwind', 'GSAP', 'Python', 'Express', 'Framer Motion', 'Vercel'];
  $$('.marquee-row').forEach((row) => {
    const dir = parseFloat(row.dataset.dir) || 1;
    const build = () => {
      const frag = document.createDocumentFragment();
      stack.forEach((s) => {
        const item = document.createElement('span');
        item.className = 'm-item';
        item.innerHTML = `${s}<span class="m-dot"></span>`;
        frag.appendChild(item);
      });
      return frag;
    };
    row.appendChild(build()); row.appendChild(build()); row.appendChild(build());
    let half = row.scrollWidth / 3;
    let x = dir > 0 ? 0 : -half;
    const speed = 0.4 * dir;
    if (!reduce) {
      (function move() {
        x -= speed;
        if (dir > 0 && x <= -half) x += half;
        if (dir < 0 && x >= 0) x -= half;
        row.style.transform = `translateX(${x}px)`;
        requestAnimationFrame(move);
      })();
      window.addEventListener('resize', () => { half = row.scrollWidth / 3; });
    }
  });

  /* ─────────── WORK HOVER PREVIEW ─────────── */
  const preview = $('#workPreview');
  const previewLabel = $('#previewLabel');
  const previewInner = $('#previewInner');
  if (preview && !isTouch) {
    let px = 0, py = 0, tx = 0, ty = 0, active = false;
    $$('.work-row').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        active = true;
        previewLabel.textContent = row.dataset.preview + ' — live';
        const hue = row.dataset.hue || 135;
        previewInner.style.background = `linear-gradient(135deg, hsl(${hue} 30% 12%), hsl(${hue} 40% 7%))`;
        preview.classList.add('show');
      });
      row.addEventListener('mouseleave', () => { active = false; preview.classList.remove('show'); });
    });
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    (function pv() {
      px = lerp(px, tx, 0.12); py = lerp(py, ty, 0.12);
      if (active) preview.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%) scale(1)`;
      requestAnimationFrame(pv);
    })();
  }

  /* ─────────── MAGNETIC BUTTONS ─────────── */
  if (!isTouch && !reduce) {
    $$('.btn, .nav-status, .contact-mail').forEach((el) => {
      const strength = 0.32;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${dx}px,${dy}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ─────────── HERO GLOW PARALLAX ─────────── */
  const glow = $('#heroGlow');
  const hero = $('#hero');
  if (glow && hero && !isTouch && !reduce) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.width / 2) / r.width;
      const dy = (e.clientY - r.height / 2) / r.height;
      glow.style.transform = `translate(calc(-50% + ${dx * 60}px), calc(-50% + ${dy * 60}px))`;
    });
  }
  if (glow && !reduce) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < innerHeight) glow.style.opacity = String(1 - window.scrollY / innerHeight * 0.8);
    }, { passive: true });
  }

  /* ─────────── HERO CANVAS — CONSTELLATION ─────────── */
  const canvas = $('#heroCanvas');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [], mouse = { x: -999, y: -999 };
    const COUNT = isTouch ? 26 : 56;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.6 + 0.5 });
      }
    }
    resize(); seed();
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c8f751';
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.hypot(dxm, dym);
        if (dm < 140) { p.x += dxm / dm * 0.6; p.y += dym / dm * 0.6; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            const near = Math.min(Math.hypot(a.x - mouse.x, a.y - mouse.y), Math.hypot(b.x - mouse.x, b.y - mouse.y));
            const isAcc = near < 170;
            ctx.strokeStyle = isAcc ? acc : 'rgba(255,255,255,0.10)';
            ctx.globalAlpha = (1 - d / 130) * 0.5;
            ctx.lineWidth = isAcc ? 0.8 : 0.5;
            ctx.stroke(); ctx.globalAlpha = 1;
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
    window.addEventListener('resize', () => { resize(); seed(); });
  }

  /* ─────────── CONTACT HEADLINE SPLIT ─────────── */
  const contactLines = $$('.contact-headline .line');
  if (contactLines.length) {
    if (reduce) { contactLines.forEach((l) => { l.textContent = l.getAttribute('data-word'); }); }
    else {
      const charSets = contactLines.map((l) => splitWord(l));
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          let base = 0;
          charSets.forEach((chars) => { animateChars(chars, base); base += chars.length * 0.02 + 0.05; });
          cio.disconnect();
        });
      }, { threshold: 0.4 });
      cio.observe($('#contact'));
    }
  }

  /* ─────────── SMOOTH ANCHOR OFFSET ─────────── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
