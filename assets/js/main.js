/* Bar Al Hikman Dream Camp: interactions & motion (no dependencies) */
(() => {
  'use strict';

  /* ---------- Booking config ---------- */
  const WA_NUMBER = '96891132705'; // +968 9113 2705
  const PRICES = { adult: 45, kid: 30, trip: { none: 0, snorkel: 10, fishing: 15 } };
  const TRIP_NAMES = {
    none: 'No trip',
    snorkel: 'Snorkeling at the coral spot + lagoon tour',
    fishing: 'Fishing & crab hunting (incl. snorkeling + lagoon tour)',
  };
  const MESSAGES = {
    default: "Hello Dream Camp! I'd like to book a bungalow at Bar Al Hikman. Could you share your availability?",
    location: 'Hello Dream Camp! Could you send me the location pin and directions to the camp?',
    fishing: "Hello Dream Camp! I'm interested in the fishing & crab hunting trip (OMR 15 per person). Is it available?",
  };
  const waUrl = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* ---------- WhatsApp links ---------- */
  $$('[data-wa]').forEach((a) => { a.href = waUrl(MESSAGES[a.dataset.wa] || MESSAGES.default); });

  /* ---------- Hero entrance ---------- */
  const heroImg = $('.hero__media img');
  const ready = () => requestAnimationFrame(() => root.classList.add('is-ready'));
  if (heroImg && !heroImg.complete) {
    let done = false;
    const go = () => { if (!done) { done = true; ready(); } };
    heroImg.addEventListener('load', go, { once: true });
    heroImg.addEventListener('error', go, { once: true });
    setTimeout(go, 700); // never hold the page back
  } else {
    ready();
  }

  /* ---------- Footer year ---------- */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Stars ---------- */
  $$('[data-stars]').forEach((box) => {
    const isCycle = box.classList.contains('cycle__stars');
    const count = isCycle ? 90 : 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      const size = Math.random() < 0.85 ? 1 + Math.random() * 1.2 : 2 + Math.random() * 1.2;
      s.className = 'star';
      s.style.cssText = `left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * (isCycle ? 72 : 100)).toFixed(2)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--o:${(0.45 + Math.random() * 0.55).toFixed(2)};animation-delay:${(-Math.random() * 4).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 3).toFixed(2)}s`;
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Mobile menu ---------- */
  const header = $('[data-header]');
  const menu = $('[data-menu]');
  const toggle = $('[data-menu-toggle]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
    if (open) { menu.removeAttribute('hidden'); setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 300); }
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1080px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.site-nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${e.target.id}`));
        navLinks.forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ---------- Day cycle (sticky scroll story) ---------- */
  const cycle = $('[data-cycle]');
  const stage = cycle && $('.cycle__stage', cycle);
  const sun = cycle && $('[data-sun]', cycle);
  const moon = cycle && $('[data-moon]', cycle);
  const cycleStars = cycle && $('[data-stars]', cycle);
  const phaseImgs = cycle ? $$('[data-phase-img]', cycle) : [];
  const phaseCopy = cycle ? $$('[data-phase-copy]', cycle) : [];
  const phaseDots = cycle ? $$('[data-goto]', cycle) : [];
  const SKIES = [
    ['#F6C8AE', '#FDF0E2'], // sunrise: peach dawn
    ['#A8DBEA', '#F1FAFC'], // daytime: clear blue
    ['#EC8C60', '#FAD09E'], // sunset: coral & gold
    ['#050C1C', '#16305A'], // night: deep navy
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const SKY_RGB = SKIES.map(([a, b]) => [hex(a), hex(b)]);
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  let currentPhase = -1;
  let stageW = 0, stageH = 0;

  const setPhase = (i) => {
    if (i === currentPhase) return;
    currentPhase = i;
    stage.dataset.phase = String(i);
    phaseImgs.forEach((img, k) => img.classList.toggle('is-active', k === i));
    phaseCopy.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.setAttribute('aria-hidden', String(k !== i));
    });
    phaseDots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current')));
  };

  const cycleProgress = () => {
    const rect = cycle.getBoundingClientRect();
    const total = cycle.offsetHeight - window.innerHeight;
    return { rect, p: total > 0 ? clamp(-rect.top / total, 0, 1) : 0 };
  };

  const updateCycle = () => {
    if (!cycle) return;
    const { rect, p } = cycleProgress();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    setPhase(Math.min(3, Math.floor(p * 4)));

    // Sky colour: hold near each phase centre, blend between
    const f = clamp(p * 4 - 0.5, 0, 3);
    const i = Math.min(2, Math.floor(f));
    const t = smooth(0.25, 0.75, f - i);
    stage.style.setProperty('--sky-top', rgb(mix(SKY_RGB[i][0], SKY_RGB[i + 1][0], t)));
    stage.style.setProperty('--sky-bottom', rgb(mix(SKY_RGB[i][1], SKY_RGB[i + 1][1], t)));

    // Sun arc across the sky, then the moon & stars take over
    const st = clamp(p / 0.8, 0, 1);
    const sx = stageW * (0.06 + 0.88 * st);
    const sy = stageH * (0.8 - 0.62 * Math.sin(Math.PI * st));
    sun.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${(1.25 - 0.35 * Math.sin(Math.PI * st)).toFixed(3)})`;
    sun.style.opacity = String(1 - smooth(0.7, 0.8, p));

    const mt = clamp((p - 0.7) / 0.3, 0, 1);
    const wide = stageW >= 900;
    const mx = wide ? 0.38 + 0.08 * mt : 0.9 - 0.04 * mt;
    const my = wide ? 0.32 - 0.16 * mt : 0.22 - 0.1 * mt;
    moon.style.transform = `translate3d(${(stageW * mx).toFixed(1)}px, ${(stageH * my).toFixed(1)}px, 0)`;
    moon.style.opacity = String(smooth(0.72, 0.86, p));
    cycleStars.style.opacity = String(smooth(0.68, 0.86, p));
  };

  phaseDots.forEach((btn) => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.goto);
    const top = cycle.offsetTop + ((i + 0.5) / 4) * (cycle.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }));

  /* ---------- Parallax (uses `translate` so it never fights other transforms) ---------- */
  const parallaxEls = $$('[data-parallax]').map((el) => ({ el, f: parseFloat(el.dataset.parallax) || 0 }));
  const updateParallax = () => {
    if (reduceMotion.matches) return;
    const vh = window.innerHeight;
    parallaxEls.forEach(({ el, f }) => {
      // Measure the (untranslated) parent so the offset never feeds back into itself
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -f;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  };

  /* ---------- Header, FAB, booking bar ---------- */
  const hero = $('.hero');
  const fab = $('[data-fab]');
  const bookBar = $('[data-bookbar]');
  const ctaSection = $('.cta');
  let lastY = window.scrollY;

  const updateChrome = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    header.classList.toggle('is-solid', y > 24);
    if (!menu.classList.contains('is-open')) {
      header.classList.toggle('is-hidden', y > 480 && y > lastY + 2);
      if (y < lastY - 2) header.classList.remove('is-hidden');
    }
    lastY = y;

    const pastHero = y > (hero ? hero.offsetHeight * 0.6 : 400);
    const ctaRect = ctaSection?.getBoundingClientRect();
    const ctaInView = ctaRect ? ctaRect.top < vh * 0.85 : false;
    let inCycle = false;
    if (cycle) { const r = cycle.getBoundingClientRect(); inCycle = r.top < vh * 0.5 && r.bottom > vh * 0.5; }
    fab?.classList.toggle('is-visible', pastHero && !ctaInView);
    bookBar?.classList.toggle('is-visible', pastHero && !ctaInView && !inCycle && !menu.classList.contains('is-open'));
  };

  /* ---------- Scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateChrome();
      updateParallax();
      updateCycle();
      ticking = false;
    });
  };
  const onResize = () => {
    if (stage) { stageW = stage.clientWidth; stageH = stage.clientHeight; }
    onScroll();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  /* ---------- Carousel ---------- */
  $$('[data-carousel]').forEach((car) => {
    const track = $('[data-track]', car);
    const prev = $('[data-prev]', car);
    const next = $('[data-next]', car);
    const bar = $('[data-progress]', car);
    const step = () => {
      const slide = $('.slide', track);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return slide ? slide.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      const visible = track.clientWidth / track.scrollWidth;
      bar.style.width = `${Math.max(visible, 0.12) * 100 + ratio * (1 - Math.max(visible, 0.12)) * 100}%`;
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft > max - 8;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    // Mouse drag to scroll (touch already swipes natively)
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- Stay planner ---------- */
  const planner = $('[data-planner]');
  if (planner) {
    const state = { nights: 1, adults: 2, kids: 0, trip: 'none' };
    const linesEl = $('[data-lines]', planner);
    const mealsEl = $('[data-meals]', planner);
    const hintEl = $('[data-hint]', planner);
    const totalEl = $('[data-total]', planner);
    const sendBtn = $('[data-planner-send]', planner);
    const dateEl = $('[data-checkin]', planner);
    let shownTotal = 0;

    // Earliest check-in = today (local)
    const now = new Date();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateEl.min = iso(now);

    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const omr = (n) => `OMR ${n.toLocaleString('en-US')}`;

    const animateTotal = (to) => {
      const from = shownTotal;
      shownTotal = to;
      if (reduceMotion.matches || from === to) { totalEl.textContent = to.toLocaleString('en-US'); return; }
      const start = performance.now();
      const dur = 450;
      const tick = (t) => {
        const k = clamp((t - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        totalEl.textContent = Math.round(from + (to - from) * eased).toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const render = () => {
      const { nights, adults, kids, trip } = state;
      const guests = adults + kids;
      const adultCost = adults * PRICES.adult * nights;
      const kidCost = kids * PRICES.kid * nights;
      const tripCost = guests * PRICES.trip[trip];
      const total = adultCost + kidCost + tripCost;
      const bungalows = Math.max(1, Math.ceil(guests / 4));

      const lines = [
        [`${plural(adults, 'adult', 'adults')} × OMR 45 × ${plural(nights, 'night', 'nights')}`, omr(adultCost)],
      ];
      if (kids) lines.push([`${plural(kids, 'child', 'children')} × OMR 30 × ${plural(nights, 'night', 'nights')}`, omr(kidCost)]);
      if (trip !== 'none') lines.push([`${trip === 'fishing' ? 'Fishing & crab trip' : 'Snorkeling + lagoon'} × ${guests}`, omr(tripCost)]);
      linesEl.innerHTML = '';
      lines.forEach(([label, value]) => {
        const li = document.createElement('li');
        const a = document.createElement('span'); a.textContent = label;
        const b = document.createElement('span'); b.textContent = value;
        li.append(a, b);
        linesEl.appendChild(li);
      });

      mealsEl.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-utensils"/></svg>';
      mealsEl.append(nights === 1
        ? 'Dinner + breakfast included'
        : 'Dinner + breakfast included, plus lunch on the day after check-in');

      if (guests < 2) {
        hintEl.hidden = false;
        hintEl.textContent = 'Bungalows are for 2–4 guests. Travelling solo? Ask us on WhatsApp.';
      } else if (guests > 4) {
        hintEl.hidden = false;
        hintEl.textContent = `That’s ${bungalows} bungalows for ${guests} guests (2–4 per bungalow).`;
      } else {
        hintEl.hidden = true;
      }

      animateTotal(total);

      let dateText = 'Flexible / to be confirmed';
      if (dateEl.value) {
        const d = new Date(`${dateEl.value}T00:00:00`);
        if (!Number.isNaN(d.getTime())) dateText = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
      const msg = [
        "Hello Dream Camp! I'd like to book a stay at Bar Al Hikman.",
        '',
        `• Check-in: ${dateText}`,
        `• Nights: ${nights}`,
        `• Adults: ${adults}`,
        `• Children (3–15): ${kids}`,
        `• Bungalows: ${bungalows}`,
        `• Trip: ${TRIP_NAMES[trip]}`,
        `• Estimated total: ${omr(total)}`,
        '',
        'Is this available?',
      ].join('\n');
      sendBtn.href = waUrl(msg);
    };

    $$('[data-stepper]', planner).forEach((wrap) => {
      const out = $('[data-value]', wrap);
      const key = out.getAttribute('name');
      const min = Number(wrap.dataset.min);
      const max = Number(wrap.dataset.max);
      const dec = $('[data-dec]', wrap);
      const inc = $('[data-inc]', wrap);
      const sync = () => {
        out.textContent = state[key];
        dec.disabled = state[key] <= min;
        inc.disabled = state[key] >= max;
      };
      const change = (d) => {
        const v = clamp(state[key] + d, min, max);
        if (v === state[key]) return;
        state[key] = v;
        sync();
        out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump');
        render();
      };
      dec.addEventListener('click', () => change(-1));
      inc.addEventListener('click', () => change(1));
      sync();
    });

    $$('input[name="trip"]', planner).forEach((r) => r.addEventListener('change', () => { state.trip = r.value; render(); }));
    dateEl.addEventListener('change', render);
    planner.addEventListener('submit', (e) => e.preventDefault());
    render();
  }

  /* ---------- Lightbox ---------- */
  const lb = $('[data-lightbox]');
  const tiles = $$('[data-gallery] .tile');
  if (lb && tiles.length && typeof lb.showModal === 'function') {
    const lbImg = $('[data-lb-img]', lb);
    const lbCap = $('[data-lb-cap]', lb);
    let index = 0;
    const show = (i) => {
      index = (i + tiles.length) % tiles.length;
      const t = tiles[index];
      const thumb = $('img', t);
      lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
      lbImg.src = t.dataset.full;
      lbImg.alt = thumb.alt;
      lbCap.textContent = thumb.alt;
    };
    tiles.forEach((t, i) => t.addEventListener('click', () => {
      show(i);
      lb.showModal();
      document.body.classList.add('lb-open');
    }));
    lb.addEventListener('close', () => { document.body.classList.remove('lb-open'); });
    $('[data-close]', lb).addEventListener('click', () => lb.close());
    $('[data-lb-prev]', lb).addEventListener('click', () => show(index - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  } else {
    // Fallback: open the full image in a new tab
    tiles.forEach((t) => t.addEventListener('click', () => window.open(t.dataset.full, '_blank', 'noopener')));
  }
})();
