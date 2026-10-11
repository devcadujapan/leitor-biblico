(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Dados: 66 livros, 1189 capítulos
     Formato: [nome, quantidade de capítulos]
  ------------------------------------------------------------------ */
  const TESTAMENTS = {
    at: [
      { name: 'Pentateuco', hue: 30, books: [
        ['Gênesis', 50], ['Êxodo', 40], ['Levítico', 27], ['Números', 36], ['Deuteronômio', 34]
      ]},
      { name: 'Livros históricos', hue: 155, books: [
        ['Josué', 24], ['Juízes', 21], ['Rute', 4], ['1 Samuel', 31], ['2 Samuel', 24],
        ['1 Reis', 22], ['2 Reis', 25], ['1 Crônicas', 29], ['2 Crônicas', 36],
        ['Esdras', 10], ['Neemias', 13], ['Ester', 10]
      ]},
      { name: 'Livros poéticos', hue: 330, books: [
        ['Jó', 42], ['Salmos', 150], ['Provérbios', 31], ['Eclesiastes', 12], ['Cantares', 8]
      ]},
      { name: 'Profetas maiores', hue: 265, books: [
        ['Isaías', 66], ['Jeremias', 52], ['Lamentações', 5], ['Ezequiel', 48], ['Daniel', 12]
      ]},
      { name: 'Profetas menores', hue: 195, books: [
        ['Oseias', 14], ['Joel', 3], ['Amós', 9], ['Obadias', 1], ['Jonas', 4], ['Miqueias', 7],
        ['Naum', 3], ['Habacuque', 3], ['Sofonias', 3], ['Ageu', 2], ['Zacarias', 14], ['Malaquias', 4]
      ]}
    ],
    nt: [
      { name: 'Evangelhos', hue: 350, books: [
        ['Mateus', 28], ['Marcos', 16], ['Lucas', 24], ['João', 21]
      ]},
      { name: 'História da Igreja', hue: 95, books: [
        ['Atos', 28]
      ]},
      { name: 'Cartas de Paulo', hue: 215, books: [
        ['Romanos', 16], ['1 Coríntios', 16], ['2 Coríntios', 13], ['Gálatas', 6], ['Efésios', 6],
        ['Filipenses', 4], ['Colossenses', 4], ['1 Tessalonicenses', 5], ['2 Tessalonicenses', 3],
        ['1 Timóteo', 6], ['2 Timóteo', 4], ['Tito', 3], ['Filemom', 1]
      ]},
      { name: 'Cartas gerais', hue: 45, books: [
        ['Hebreus', 13], ['Tiago', 5], ['1 Pedro', 5], ['2 Pedro', 3], ['1 João', 5],
        ['2 João', 1], ['3 João', 1], ['Judas', 1]
      ]},
      { name: 'Profecia', hue: 285, books: [
        ['Apocalipse', 22]
      ]}
    ]
  };

  const STORAGE_KEY = 'leitura-biblia:v1';
  const RING_LENGTH = 2 * Math.PI * 34;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Estado
  ------------------------------------------------------------------ */
  const books = [];      // lista plana com todos os livros
  const groups = [];     // grupos com referência ao contador
  let saved = loadSaved();

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function save() {
    const out = {};
    books.forEach(b => {
      if (b.read.size) out[b.id] = [...b.read].sort((a, c) => a - c);
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
    } catch (e) { /* armazenamento indisponível: segue sem salvar */ }
  }

  /* ------------------------------------------------------------------
     Elementos
  ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $('#app');
  const scrollBox = $('#scroll');
  const ringFill = $('#ringFill');
  const ringBox = $('.ring');
  const pctEl = $('#pct');
  const summaryEl = $('#summary');
  const tabsEl = $('.tabs');
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = { at: $('#panel-at'), nt: $('#panel-nt') };
  const tabPct = { at: $('#pct-at'), nt: $('#pct-nt') };

  ringFill.style.strokeDasharray = RING_LENGTH;
  ringFill.style.strokeDashoffset = RING_LENGTH;

  /* ------------------------------------------------------------------
     Construção da interface
  ------------------------------------------------------------------ */
  let bookId = 0;

  Object.entries(TESTAMENTS).forEach(([testament, groupList]) => {
    groupList.forEach(g => {
      const group = { name: g.name, hue: g.hue, testament, books: [], countEl: null };
      groups.push(group);

      const title = document.createElement('h2');
      title.className = 'group';
      title.style.setProperty('--h', g.hue);
      title.innerHTML = `<span>${g.name}</span><span class="group-count"></span>`;
      group.countEl = title.querySelector('.group-count');
      panels[testament].appendChild(title);

      g.books.forEach(([name, chapters]) => {
        const id = bookId++;
        const stored = Array.isArray(saved[id]) ? saved[id] : [];
        const read = new Set(stored.filter(n => Number.isInteger(n) && n >= 1 && n <= chapters));
        const book = { id, name, chapters, hue: g.hue, testament, group, read, el: null, chEls: [] };
        books.push(book);
        group.books.push(book);
        panels[testament].appendChild(buildBook(book));
      });
    });
  });

  function buildBook(book) {
    const el = document.createElement('article');
    el.className = 'book';
    el.style.setProperty('--h', book.hue);
    el.dataset.id = book.id;

    const bodyId = `book-body-${book.id}`;
    el.innerHTML = `
      <button class="book-head" type="button" aria-expanded="false" aria-controls="${bodyId}">
        <span class="dot"></span>
        <span class="book-name">${book.name}</span>
        <span class="book-count"></span>
        <span class="chev"></span>
        <span class="book-bar"><i></i></span>
      </button>
      <div class="book-body" id="${bodyId}">
        <div class="book-inner">
          <div class="chapters"></div>
          <div class="book-actions">
            <button class="mini-btn" type="button" data-act="all">Marcar livro inteiro</button>
            <button class="mini-btn" type="button" data-act="none">Limpar livro</button>
          </div>
        </div>
      </div>`;

    const grid = $('.chapters', el);
    for (let n = 1; n <= book.chapters; n++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ch';
      b.dataset.n = n;
      b.textContent = n;
      b.setAttribute('aria-label', `${book.name} capítulo ${n}`);
      grid.appendChild(b);
      book.chEls[n] = b;
    }

    book.el = el;
    book.countEl = $('.book-count', el);
    book.barEl = $('.book-bar i', el);
    renderBook(book);
    return el;
  }

  /* ------------------------------------------------------------------
     Atualização da interface
  ------------------------------------------------------------------ */
  function renderBook(book) {
    book.chEls.forEach((btn, n) => {
      if (!btn) return;
      const isRead = book.read.has(n);
      btn.classList.toggle('is-read', isRead);
      btn.setAttribute('aria-pressed', isRead);
    });
    updateBookMeta(book);
  }

  function updateBookMeta(book) {
    const count = book.read.size;
    book.countEl.textContent = `${count}/${book.chapters}`;
    book.barEl.style.width = `${(count / book.chapters) * 100}%`;
    book.el.classList.toggle('done', count === book.chapters);
  }

  const totals = () => {
    const t = { all: 0, allRead: 0, at: 0, atRead: 0, nt: 0, ntRead: 0 };
    books.forEach(b => {
      t.all += b.chapters;
      t.allRead += b.read.size;
      t[b.testament] += b.chapters;
      t[b.testament + 'Read'] += b.read.size;
    });
    return t;
  };

  let shownPct = 0;
  let countFrame = null;

  function formatPct(v) {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function animatePct(to) {
    cancelAnimationFrame(countFrame);
    const from = shownPct;
    if (reduceMotion || from === to) {
      shownPct = to;
      pctEl.textContent = formatPct(to);
      return;
    }
    const start = performance.now();
    const duration = 800;
    const step = now => {
      const k = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      shownPct = from + (to - from) * eased;
      pctEl.textContent = formatPct(shownPct);
      if (k < 1) countFrame = requestAnimationFrame(step);
    };
    countFrame = requestAnimationFrame(step);
  }

  function refreshTotals() {
    const t = totals();
    const pct = (t.allRead / t.all) * 100;

    ringFill.style.strokeDashoffset = RING_LENGTH * (1 - t.allRead / t.all);
    animatePct(pct);

    summaryEl.textContent = `${t.allRead} de ${t.all} capítulos lidos`;
    tabPct.at.textContent = `${Math.round((t.atRead / t.at) * 100)}% · ${t.atRead}/${t.at}`;
    tabPct.nt.textContent = `${Math.round((t.ntRead / t.nt) * 100)}% · ${t.ntRead}/${t.nt}`;

    groups.forEach(g => {
      const total = g.books.reduce((s, b) => s + b.chapters, 0);
      const done = g.books.reduce((s, b) => s + b.read.size, 0);
      g.countEl.textContent = `${done}/${total}`;
    });

    app.classList.toggle('complete', t.allRead === t.all);
    return t;
  }

  /* ------------------------------------------------------------------
     Confete
  ------------------------------------------------------------------ */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let rafId = null;
  let dpr = 1;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function burst(x, y, hue, amount = 60, power = 1) {
    if (reduceMotion) return;
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 7 + 3) * power;
      const useHue = Math.random() < 0.7 ? hue + (Math.random() * 70 - 35) : Math.random() * 360;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4 * power,
        w: Math.random() * 7 + 4,
        h: Math.random() * 4 + 3,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        life: 0,
        max: 70 + Math.random() * 40,
        color: `hsl(${useHue} 92% 64%)`
      });
    }
    if (!rafId) rafId = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter(p => p.life < p.max);

    particles.forEach(p => {
      p.life++;
      p.vy += 0.24;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.globalAlpha = Math.min(1, (p.max - p.life) / 25);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (particles.length) {
      rafId = requestAnimationFrame(tickConfetti);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function celebrate(book, originEl, before, after) {
    const rect = originEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Livro concluído
    burst(x, y, book.hue, 70);

    // Testamento concluído
    const key = book.testament;
    if (before[key + 'Read'] < before[key] && after[key + 'Read'] === after[key]) {
      setTimeout(() => {
        burst(window.innerWidth * 0.3, window.innerHeight * 0.35, 260, 90, 1.3);
        burst(window.innerWidth * 0.7, window.innerHeight * 0.35, 20, 90, 1.3);
      }, 250);
    }

    // Bíblia inteira
    if (before.allRead < before.all && after.allRead === after.all) {
      setTimeout(() => {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => burst(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.6,
            Math.random() * 360, 80, 1.4
          ), i * 220);
        }
      }, 500);
    }
  }

  /* ------------------------------------------------------------------
     Ações
  ------------------------------------------------------------------ */
  function bump() {
    ringBox.classList.remove('bump');
    void ringBox.offsetWidth;
    ringBox.classList.add('bump');
  }

  function toggleChapter(book, n, btn) {
    const before = totals();
    const wasDone = book.read.size === book.chapters;

    if (book.read.has(n)) book.read.delete(n);
    else book.read.add(n);

    const isRead = book.read.has(n);
    btn.classList.toggle('is-read', isRead);
    btn.setAttribute('aria-pressed', isRead);
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');

    updateBookMeta(book);
    const after = refreshTotals();
    bump();
    save();

    if (!wasDone && book.read.size === book.chapters) celebrate(book, btn, before, after);
  }

  function setWholeBook(book, markAll, originEl) {
    const before = totals();
    const wasDone = book.read.size === book.chapters;

    book.read.clear();
    if (markAll) for (let n = 1; n <= book.chapters; n++) book.read.add(n);

    renderBook(book);
    const after = refreshTotals();
    bump();
    save();

    if (markAll && !wasDone) celebrate(book, originEl, before, after);
  }

  function openBook(book, open) {
    const head = $('.book-head', book.el);
    book.el.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', open);
    if (open) {
      setTimeout(() => book.el.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }), 260);
    }
  }

  function switchTab(target) {
    tabs.forEach(t => {
      const active = t.dataset.target === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    tabsEl.dataset.active = target;
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== target; });
    scrollBox.scrollTop = 0;
  }

  /* ------------------------------------------------------------------
     Eventos
  ------------------------------------------------------------------ */
  document.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) return switchTab(tab.dataset.target);

    const bookEl = e.target.closest('.book');
    if (!bookEl) return;
    const book = books[Number(bookEl.dataset.id)];

    const ch = e.target.closest('.ch');
    if (ch) return toggleChapter(book, Number(ch.dataset.n), ch);

    const act = e.target.closest('[data-act]');
    if (act) return setWholeBook(book, act.dataset.act === 'all', act);

    if (e.target.closest('.book-head')) {
      const willOpen = !bookEl.classList.contains('is-open');
      books.forEach(b => { if (b !== book && b.el.classList.contains('is-open')) openBook(b, false); });
      openBook(book, willOpen);
    }
  });

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Apagar todo o progresso de leitura? Essa ação não pode ser desfeita.')) return;
    books.forEach(b => { b.read.clear(); renderBook(b); });
    refreshTotals();
    save();
  });

  // Luz que acompanha o cursor dentro da janela
  app.addEventListener('pointermove', e => {
    const r = app.getBoundingClientRect();
    app.style.setProperty('--mx', `${e.clientX - r.left}px`);
    app.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* ------------------------------------------------------------------
     Início
  ------------------------------------------------------------------ */
  switchTab('at');
  refreshTotals();
})();