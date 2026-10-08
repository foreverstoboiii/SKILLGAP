/* SkillGap — presentation engine */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const ease = t => 1 - Math.pow(1 - t, 3);
  const tween = (dur, fn, done) => {
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / dur);
      fn(ease(t));
      t < 1 ? requestAnimationFrame(step) : done && done();
    };
    requestAnimationFrame(step);
  };
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ---------- Slides, nav, progress ---------- */
  const slides = $$('.slide');
  const nav = $('#sidenav');
  const counter = $('#counter');
  const pad = n => String(n).padStart(2, '0');

  slides.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.id = 'nav-' + s.id;
    a.innerHTML = `<span>${pad(i + 1)} · ${s.dataset.title}</span>`;
    nav.appendChild(a);
    $$('.reveal', s).forEach((el, j) => (el.style.transitionDelay = j * 90 + 'ms'));
  });
  const navLinks = $$('a', nav);

  let current = 0;
  const onScroll = () => {
    const mid = innerHeight * 0.45;
    let idx = 0;
    slides.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) idx = i; });
    if (idx !== current || !navLinks[idx].classList.contains('active')) {
      current = idx;
      navLinks.forEach((l, i) => l.classList.toggle('active', i === idx));
      counter.textContent = `${pad(idx + 1)} / ${pad(slides.length)}`;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#progress-bar').style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  const go = i => {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    const k = e.key;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(k)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k)) { e.preventDefault(); go(current - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(slides.length - 1); }
    else if (k === 'f' || k === 'F' || k === 'а' || k === 'А') toggleFs();
  });

  const toggleFs = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  $('#btn-fullscreen').addEventListener('click', toggleFs);

  /* ---------- Enter hooks ---------- */
  const hooks = {};
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const s = en.target;
      if (!s.classList.contains('in')) {
        s.classList.add('in');
        hooks[s.id] && hooks[s.id]();
      }
    });
  }, { threshold: 0.25 });
  slides.forEach(s => io.observe(s));

  /* ---------- HERO: knowledge-graph background ---------- */
  (() => {
    const cv = $('#graph-bg');
    const ctx = cv.getContext('2d');
    let W, H, nodes = [], running = true;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (W * H) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.6 + .6,
        c: Math.random() < .5 ? '61,242,196' : Math.random() < .5 ? '139,123,255' : '255,181,71'
      }));
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.strokeStyle = `rgba(${a.c},${(1 - d / 150) * .22})`;
            ctx.lineWidth = .7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${a.c},.8)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    resize(); draw();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) draw();
    }).observe(cv);
  })();

  hooks['s-hero'] = () => {
    const C = 326.7, target = 47;
    setTimeout(() => tween(1800, t => {
      $('#hero-pct').textContent = Math.round(target * t);
      $('#hero-gauge').style.strokeDashoffset = C * (1 - (target * t) / 100);
    }), 500);
  };

  /* ---------- PARADOX dots ---------- */
  ['#dots-a', '#dots-b'].forEach(sel => {
    const box = $(sel);
    for (let i = 0; i < 48; i++) box.appendChild(document.createElement('i'));
  });
  hooks['s-paradox'] = () => {
    const a = $$('#dots-a i'), b = $$('#dots-b i');
    setInterval(() => {
      [a, b].forEach(arr => {
        const el = arr[Math.floor(Math.random() * arr.length)];
        el.classList.add('lit');
        setTimeout(() => el.classList.remove('lit'), 1400);
      });
    }, 220);
  };

  /* ---------- DEMO: radar ---------- */
  const ROLES = {
    frontend: {
      axes: ['JavaScript', 'React', 'Git', 'HTML/CSS', 'REST API', 'English'],
      market: [92, 88, 85, 80, 75, 70],
      you: [70, 20, 25, 90, 30, 60],
      plan: [
        ['Дни 1–14', 'Git и GitHub: 3 репозитория с осмысленной историей коммитов'],
        ['Дни 15–60', 'React: курс + 2 pet-проекта с роутингом и состоянием'],
        ['Дни 61–90', 'REST API: интеграция с публичным API, деплой на Vercel']
      ]
    },
    data: {
      axes: ['Python', 'SQL', 'Excel / BI', 'Статистика', 'Визуализация', 'English'],
      market: [90, 95, 70, 75, 80, 65],
      you: [40, 55, 85, 70, 35, 50],
      plan: [
        ['Дни 1–30', 'SQL: JOIN, оконные функции, 50 задач на реальных датасетах'],
        ['Дни 31–60', 'Python: pandas и анализ открытых данных stat.uz'],
        ['Дни 61–90', 'Дашборд в Power BI / Looker — кейс в портфолио']
      ]
    },
    backend: {
      axes: ['Java', 'Spring', 'SQL', 'Docker', 'Git', 'Алгоритмы'],
      market: [95, 85, 85, 70, 80, 65],
      you: [75, 15, 60, 10, 40, 85],
      plan: [
        ['Дни 1–40', 'Spring Boot: REST-сервис с авторизацией и тестами'],
        ['Дни 41–60', 'Docker: контейнеризация сервиса + PostgreSQL'],
        ['Дни 61–90', 'Git flow и code review в open-source проекте']
      ]
    },
    marketing: {
      axes: ['SMM', 'Таргет', 'Аналитика', 'Копирайтинг', 'Figma / Canva', 'English'],
      market: [85, 80, 75, 70, 60, 60],
      you: [80, 25, 20, 75, 65, 45],
      plan: [
        ['Дни 1–30', 'Таргетированная реклама: Meta Ads, тестовая кампания'],
        ['Дни 31–60', 'Веб-аналитика: GA4, Яндекс Метрика, UTM-разметка'],
        ['Дни 61–90', 'Кейс: продвижение локального бизнеса с цифрами результата']
      ]
    }
  };

  const radar = (() => {
    const svg = $('#radar');
    const cx = 220, cy = 200, R = 140, n = 6;
    const ang = i => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 100, cy + Math.sin(ang(i)) * R * v / 100];
    const poly = vals => vals.map((v, i) => pt(i, v).join(',')).join(' ');

    [25, 50, 75, 100].forEach(l => svg.appendChild(svgEl('polygon', { class: 'ring', points: poly(Array(n).fill(l)) })));
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, 100);
      svg.appendChild(svgEl('line', { class: 'axis', x1: cx, y1: cy, x2: x, y2: y }));
    }
    const labels = Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(i, 124);
      const c = Math.cos(ang(i));
      const t = svgEl('text', { class: 'lbl', x, y: y + 4, 'text-anchor': Math.abs(c) < .2 ? 'middle' : c > 0 ? 'start' : 'end' });
      svg.appendChild(t);
      return t;
    });
    const pm = svgEl('polygon', { class: 'p-market' });
    const py = svgEl('polygon', { class: 'p-you' });
    svg.append(pm, py);
    const dots = Array.from({ length: n }, () => { const c = svgEl('circle', { class: 'pt', r: 3.5 }); svg.appendChild(c); return c; });

    let curM = Array(n).fill(0), curY = Array(n).fill(0);
    return (role) => {
      const d = ROLES[role];
      labels.forEach((l, i) => (l.textContent = d.axes[i]));
      const fromM = curM.slice(), fromY = curY.slice();
      tween(900, t => {
        curM = fromM.map((v, i) => v + (d.market[i] - v) * t);
        curY = fromY.map((v, i) => v + (d.you[i] - v) * t);
        pm.setAttribute('points', poly(curM));
        py.setAttribute('points', poly(curY));
        dots.forEach((c, i) => { const [x, y] = pt(i, curY[i]); c.setAttribute('cx', x); c.setAttribute('cy', y); });
      });
    };
  })();

  let matchVal = 0;
  const setRole = role => {
    const d = ROLES[role];
    radar(role);
    $$('#demo-tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.role === role));

    const covered = d.market.reduce((s, m, i) => s + Math.min(m, d.you[i]), 0);
    const total = d.market.reduce((s, m) => s + m, 0);
    const target = Math.round((covered / total) * 100);
    const from = matchVal;
    tween(900, t => ($('#match-num').textContent = Math.round(from + (target - from) * t)));
    matchVal = target;

    const gaps = d.axes
      .map((a, i) => ({ a, m: d.market[i], y: d.you[i], g: d.market[i] - d.you[i] }))
      .filter(x => x.g > 0).sort((p, q) => q.g - p.g).slice(0, 3);
    $('#gap-list').innerHTML = gaps.map((x, i) => `
      <li style="animation-delay:${i * 80}ms">
        <span>${x.a}</span>
        <span class="bar"><i style="width:${x.m}%"></i><b style="width:${x.y}%"></b></span>
        <span class="v">−${x.g}</span>
      </li>`).join('');
    $('#plan-list').innerHTML = d.plan.map((p, i) => `
      <li style="animation-delay:${200 + i * 90}ms"><span>${p[0]}</span>${p[1]}</li>`).join('');
  };
  $$('#demo-tabs .tab').forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
  hooks['s-demo'] = () => setRole('frontend');

  /* ---------- SCIENCE: trend chart ---------- */
  (() => {
    const svg = $('#trend-chart');
    const labels = ['Q1’25', 'Q2', 'Q3', 'Q4', 'Q1’26', 'Q2', 'Q3', 'Q4', 'Q1’27', 'Q2'];
    const vals = labels.map((_, i) => 100 * Math.pow(1.15, i));
    const hist = 7;
    const x0 = 10, x1 = 390, y0 = 185, y1 = 30;
    const max = vals[vals.length - 1];
    const X = i => x0 + (i / (labels.length - 1)) * (x1 - x0);
    const Y = v => y0 - ((v - 80) / (max - 80)) * (y0 - y1);

    const defs = svgEl('defs');
    defs.innerHTML = `<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3df2c4" stop-opacity=".25"/><stop offset="1" stop-color="#3df2c4" stop-opacity="0"/></linearGradient>`;
    svg.appendChild(defs);
    [0, 1, 2, 3].forEach(k => {
      const y = y1 + k * ((y0 - y1) / 3);
      svg.appendChild(svgEl('line', { class: 'grid', x1: x0, x2: x1, y1: y, y2: y }));
    });
    labels.forEach((l, i) => { if (i % 2 === 0 || i === labels.length - 1) {
      const t = svgEl('text', { class: 'lbl', x: X(i), y: 206, 'text-anchor': 'middle' }); t.textContent = l; svg.appendChild(t);
    }});

    const hp = vals.slice(0, hist).map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
    const fp = vals.slice(hist - 1).map((v, i) => `${i ? 'L' : 'M'}${X(i + hist - 1)},${Y(v)}`).join(' ');
    svg.appendChild(svgEl('path', { class: 'area', d: `${hp} L${X(hist - 1)},${y0} L${X(0)},${y0} Z` }));
    svg.appendChild(svgEl('line', { class: 'now', x1: X(hist - 1), x2: X(hist - 1), y1: 20, y2: y0 }));
    const h = svgEl('path', { class: 'hist', d: hp });
    const f = svgEl('path', { class: 'fc', d: fp });
    svg.append(h, f);
    const last = labels.length - 1;
    svg.appendChild(svgEl('circle', { class: 'dot', cx: X(last), cy: Y(vals[last]), r: 4 }));
    const tag = svgEl('text', { class: 'tag', x: X(last) - 6, y: Y(vals[last]) - 12, 'text-anchor': 'end' });
    tag.textContent = '+15% / кв · прогноз';
    svg.appendChild(tag);
    const nl = svgEl('text', { class: 'lbl', x: X(hist - 1) + 6, y: 28 }); nl.textContent = 'сейчас'; svg.appendChild(nl);

    const hl = h.getTotalLength();
    h.style.strokeDasharray = hl; h.style.strokeDashoffset = hl;
    f.style.opacity = 0;
    hooks['s-science'] = () => {
      h.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.2,.7,.2,1) .6s';
      h.style.strokeDashoffset = 0;
      f.style.transition = 'opacity .8s ease 2.3s';
      f.style.opacity = 1;
    };
  })();

  /* ---------- HEATMAP ---------- */
  (() => {
    const skills = ['Алгоритмы', 'Python', 'SQL', 'Git', 'Docker', 'Excel / BI', 'English B2', 'Презентация'];
    const demand = [58, 71, 66, 69, 64, 74, 62, 55];
    const facs = [
      ['Информационные технологии', 'ИТ', [80, 62, 48, 15, 15, 40, 45, 35]],
      ['Экономика', 'Экономика', [35, 22, 30, 5, 3, 72, 40, 55]],
      ['Финансы и банковское дело', 'Финансы', [40, 18, 38, 6, 4, 78, 38, 50]],
      ['Менеджмент', 'Менеджмент', [20, 8, 15, 4, 2, 60, 48, 70]],
      ['Маркетинг', 'Маркетинг', [15, 10, 12, 3, 2, 55, 52, 76]]
    ];
    const color = v => {
      const h = v < 50 ? 350 + (v / 50) * 48 : 38 + ((v - 50) / 50) * 127;
      return `hsl(${h % 360} ${v < 50 ? 85 : 80}% ${60 + (v > 50 ? 0 : 2)}%)`;
    };
    const tbl = $('#heat-table');
    tbl.style.gridTemplateColumns = `minmax(170px,1.6fr) repeat(${skills.length}, 1fr)`;
    tbl.innerHTML = '<div></div>' + skills.map(s => `<div class="h-col">${s}</div>`).join('');
    let k = 0;
    facs.forEach(([name, short, vals], r) => {
      tbl.insertAdjacentHTML('beforeend', `<div class="h-row">${name}</div>`);
      vals.forEach((v, c) => {
        const el = document.createElement('div');
        el.className = 'cell';
        el.id = `cell-${r}-${c}`;
        el.style.background = color(v);
        el.style.transitionDelay = `0s, 0s, ${(k++) * 18}ms`;
        el.textContent = v + '%';
        el.addEventListener('click', () => select(el, short, skills[c], v, demand[c]));
        tbl.appendChild(el);
      });
    });
    const select = (el, fac, skill, v, need) => {
      $$('.cell.sel').forEach(c => c.classList.remove('sel'));
      el.classList.add('sel');
      $('#ins-title').textContent = `${fac} × ${skill}`;
      $('#ins-have').textContent = v + '%';
      $('#ins-need').textContent = need + '%';
      $('#ins-have').style.color = v < 30 ? 'var(--gap)' : v < 60 ? 'var(--market)' : 'var(--you)';
      $('#ins-text').textContent =
        v < 30 ? 'Критический разрыв. Рекомендация: добавить практический модуль в учебный план уже в следующем семестре.'
        : v < 60 ? 'Зона роста. Рекомендация: усилить проектными заданиями и кейсами от компаний-партнёров.'
        : 'Сильная сторона факультета. Рекомендация: использовать в позиционировании для абитуриентов и работодателей.';
    };
    hooks['s-heatmap'] = () => setTimeout(() => $('#cell-0-4').click(), 900);
  })();

  /* ---------- KPI counters ---------- */
  hooks['s-roadmap'] = () => {
    $$('#s-roadmap [data-count]').forEach(el => {
      const target = +el.dataset.count;
      setTimeout(() => tween(1600, t => (el.textContent = fmt(target * t))), 600);
    });
  };

  /* ---------- BUDGET donut ---------- */
  (() => {
    const svg = $('#donut');
    const data = [15, 24, 7.5];
    const colors = ['#3df2c4', '#8b7bff', '#ffb547'];
    const total = data.reduce((a, b) => a + b, 0);
    const r = 80, C = 2 * Math.PI * r, gap = 4;
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r, fill: 'none', stroke: 'rgba(255,255,255,.04)', 'stroke-width': 22 }));
    let acc = 0;
    const segs = data.map((v, i) => {
      const len = (v / total) * C;
      const c = svgEl('circle', {
        class: 'seg', cx: 100, cy: 100, r, stroke: colors[i],
        'stroke-dashoffset': -acc
      });
      c.dataset.len = len - gap;
      c.style.strokeDasharray = `0 ${C}`;
      c.style.transition = `stroke-width .35s ease, opacity .35s ease, stroke-dasharray 1.4s cubic-bezier(.2,.7,.2,1) ${.4 + i * .25}s`;
      acc += len;
      svg.appendChild(c);
      return c;
    });
    const items = $$('.b-item');
    const hl = i => {
      svg.classList.toggle('dim', i !== null);
      segs.forEach((s, j) => s.classList.toggle('hl', j === i));
      items.forEach((it, j) => it.classList.toggle('hl', j === i));
    };
    segs.forEach((s, i) => { s.addEventListener('mouseenter', () => hl(i)); s.addEventListener('mouseleave', () => hl(null)); });
    items.forEach((it, i) => { it.addEventListener('mouseenter', () => hl(i)); it.addEventListener('mouseleave', () => hl(null)); });
    hooks['s-budget'] = () => segs.forEach(s => (s.style.strokeDasharray = `${s.dataset.len} ${C}`));
  })();
})();
