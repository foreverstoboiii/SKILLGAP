(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const pad = n => String(n).padStart(2, '0');
  let current = 0;

  // Stagger reveals inside each slide
  slides.forEach(s => s.querySelectorAll('.reveal').forEach((el, i) => (el.style.transitionDelay = i * 110 + 'ms')));

  // 1. Sent Resumes grid (Slide 02)
  const sentGrid = document.getElementById('sent-grid');
  if (sentGrid) {
    for (let i = 0; i < 30; i++) {
      const doc = document.createElement('i');
      doc.className = 'sent-doc';
      sentGrid.appendChild(doc);
    }
  }

  const triggerSentAnimation = () => {
    const docs = document.querySelectorAll('.sent-doc');
    docs.forEach((doc, idx) => {
      setTimeout(() => doc.classList.add('dimmed'), 100 + idx * 35);
    });
  };

  // 2. Dynamic Gapbar in chrome
  const gbLeft = document.getElementById('gb-left');
  const gbRight = document.getElementById('gb-right');
  const gbBadge = document.getElementById('gb-badge');

  const updateGapbar = (idx) => {
    if (!gbLeft || !gbRight || !gbBadge) return;
    const progress = Math.min(1, Math.max(0, idx / (slides.length - 1)));
    const segWidth = 10 + progress * 35; // 10% -> 45%
    gbLeft.style.width = `${segWidth}%`;
    gbRight.style.width = `${segWidth}%`;

    if (idx >= slides.length - 2) {
      gbBadge.textContent = '✓ МОСТ';
      gbBadge.classList.add('bridged');
    } else {
      gbBadge.textContent = 'GAP';
      gbBadge.classList.remove('bridged');
    }
  };

  // 3. Network flywheel cycle (Slide 13)
  const loopNodes = document.querySelectorAll('.loop-node');
  let activeNode = 0;
  if (loopNodes.length) {
    setInterval(() => {
      loopNodes.forEach(n => n.classList.remove('active'));
      activeNode = (activeNode + 1) % loopNodes.length;
      loopNodes[activeNode].classList.add('active');
    }, 2200);
  }

  // 4. Case study interactive switcher
  const CASES = {
    arch: {
      title: 'Цель: Архитектор-проектировщик',
      pct: 54,
      who: 'Сардор М. · 4 курс ТАУК · Архитектура',
      have: [
        { skill: 'Начертательная геометрия', note: '✓ зачетка: 5' },
        { skill: 'AutoCAD & Чертеж', note: '✓ курсовой проект' },
        { skill: 'Строительные нормы (КМК)', note: '✓ госстандарт' }
      ],
      miss: [
        { skill: 'BIM / Autodesk Revit', note: 'требуют 82% девелоперов' },
        { skill: 'Lumion / 3ds Max', note: 'в 65% проектных бюро' }
      ],
      route: [
        { step: 'Недели 1–4', desc: 'Revit: архитектурное моделирование' },
        { step: 'Недели 5–8', desc: 'Сборка реального BIM-проекта в портфолио' },
        { step: 'Недели 9–12', desc: 'Skill-квест от девелоперской компании' }
      ]
    },
    fin: {
      title: 'Цель: Младший финансовый аналитик',
      pct: 48,
      who: 'Мадина Т. · 4 курс · Корпоративные финансы',
      have: [
        { skill: 'Финансовый анализ', note: '✓ зачетка: 5' },
        { skill: 'Макроэкономика & Баланс', note: '✓ университетский курс' },
        { skill: 'Базовый Excel', note: '✓ таблицы и формулы' }
      ],
      miss: [
        { skill: 'Финмоделирование (Cash Flow, DCF)', note: 'требуют 78% банков' },
        { skill: '1С:Предприятие 8.3', note: 'в 72% вакансий' }
      ],
      route: [
        { step: 'Недели 1–3', desc: 'Excel: сводные таблицы, XLOOKUP, финмодель' },
        { step: 'Недели 4–8', desc: 'Кейс-задачи на выгрузку и анализ из 1С' },
        { step: 'Недели 9–12', desc: 'Skill-квест от коммерческого банка' }
      ]
    },
    dev: {
      title: 'Цель: Frontend-разработчик',
      pct: 47,
      who: 'Азиз К. · 3 курс · Информационные технологии',
      have: [
        { skill: 'JavaScript / HTML / CSS', note: '✓ университетский курс' },
        { skill: 'Теория алгоритмов', note: '✓ зачетка: 5' },
        { skill: 'English B2', note: '✓ сертификат' }
      ],
      miss: [
        { skill: 'React / Next.js', note: 'требуют 88% IT-компаний' },
        { skill: 'Командный Git & GitHub', note: 'в 85% вакансий' }
      ],
      route: [
        { step: 'Недели 1–2', desc: 'Git: ветки, pull requests, 3 репозитория' },
        { step: 'Недели 3–8', desc: 'React: 2 проекта с роутингом и API' },
        { step: 'Недели 9–12', desc: 'Skill-квест от IT-компании' }
      ]
    }
  };

  const renderCase = (role) => {
    const c = CASES[role];
    const el = document.getElementById('case-card');
    if (!el) return;
    el.innerHTML = `
      <div class="card-top">
        <span>${c.title}</span>
        <b style="font-size:64px;font-weight:500;margin:6px 0 2px;"><span data-count="${c.pct}">${c.pct}</span>%</b>
        <small>${c.who}</small>
      </div>
      <div class="card-block">
        <p class="cap">Фундамент из вуза</p>
        ${c.have.map(h => `<div class="row"><span>${h.skill}</span><em>${h.note}</em></div>`).join('')}
      </div>
      <div class="card-block">
        <p class="cap">Разрыв до вакансии (GAP)</p>
        ${c.miss.map(m => `<div class="row miss"><span>${m.skill}</span><em>${m.note}</em></div>`).join('')}
      </div>
      <div class="card-block">
        <p class="cap">Персональный маршрут (90 дней)</p>
        ${c.route.map(r => `<div class="row"><span>${r.step}</span><em>${r.desc}</em></div>`).join('')}
      </div>
    `;
  };

  const roleButtons = document.querySelectorAll('.role-btn');
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCase(btn.dataset.role);
    });
  });

  // Initial case render
  renderCase('arch');

  // 5. Reveal + numbers counter on slide enter
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting || e.target.classList.contains('in')) return;
    const slide = e.target;
    slide.classList.add('in');

    if (slide.id === 's-story') {
      triggerSentAnimation();
    }

    slide.querySelectorAll('[data-count]').forEach(el => {
      const to = parseFloat(el.dataset.count);
      const isDecimal = el.dataset.dec === '1';
      const t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / 1300);
        const val = to * (1 - Math.pow(1 - t, 3));
        el.textContent = isDecimal ? val.toFixed(1).replace('.', ',') : Math.round(val);
        if (t < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 300);
    });
  }), { threshold: 0.25 });
  slides.forEach(s => io.observe(s));

  // 6. Navigation, Counter & Gapbar update
  const update = () => {
    const mid = innerHeight / 2;
    slides.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= mid) current = i;
    });
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    updateGapbar(current);
  };
  addEventListener('scroll', update, { passive: true });
  update();

  // Keyboard navigation
  const go = i => slides[Math.max(0, Math.min(slides.length - 1, i))].scrollIntoView({ behavior: 'smooth' });
  addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    else if (/^[fFаА]$/.test(e.key)) {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
  });
})();
