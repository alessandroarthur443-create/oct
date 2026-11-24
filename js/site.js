(() => {
  const db = Store.load();
  document.getElementById('yr').textContent = new Date().getFullYear();

  // Menu mobile
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', (e) => { if (e.target.tagName === 'A') links.classList.remove('open'); });

  // Header ao rolar
  const nav = document.querySelector('.nav');
  addEventListener('scroll', () => nav.classList.toggle('nav--solid', scrollY > 30), { passive: true });

  // Marcas do velocímetro
  const ticks = document.querySelector('.g-ticks');
  if (ticks) {
    for (let i = 0; i <= 20; i++) {
      const a = (-225 + i * 13.5) * Math.PI / 180;
      const r1 = i % 5 === 0 ? 100 : 108, r2 = 116;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 150 + r1 * Math.cos(a)); l.setAttribute('y1', 150 + r1 * Math.sin(a));
      l.setAttribute('x2', 150 + r2 * Math.cos(a)); l.setAttribute('y2', 150 + r2 * Math.sin(a));
      if (i >= 16) l.setAttribute('class', 'hot');
      ticks.appendChild(l);
    }
  }

  // WhatsApp (configurado no painel)
  const wa = (db.settings.whatsapp || '').replace(/\D/g, '');
  const waUrl = (msg) => `https://wa.me/${wa.startsWith('55') ? wa : '55' + wa}?text=${encodeURIComponent(msg)}`;
  if (wa) {
    const w = document.getElementById('waLink');
    w.href = waUrl('Olá, Urso Motos! Vim pelo site.');
    w.hidden = false;
  }

  // Peças
  const list = db.products.filter((p) => p.visible && p.stock > 0);
  const cats = ['Todas', ...new Set(list.map((p) => p.category).filter(Boolean))];
  let cat = 'Todas', q = '';
  const chips = document.getElementById('chips');
  chips.innerHTML = cats.map((c) => `<button class="chip${c === cat ? ' on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    cat = b.dataset.c;
    chips.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
    render();
  });
  document.getElementById('q').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); render(); });

  function render() {
    const items = list.filter((p) => (cat === 'Todas' || p.category === cat) &&
      (!q || (p.name + ' ' + p.code + ' ' + p.category).toLowerCase().includes(q)));
    document.getElementById('partsEmpty').hidden = items.length > 0;
    document.getElementById('parts').innerHTML = items.map((p) => {
      const cta = wa
        ? `<a class="btn btn--sm btn--red" target="_blank" rel="noopener" href="${waUrl(`Olá! Tenho interesse na peça: ${p.name} (${p.code || 's/ código'})`)}">Consultar</a>`
        : `<a class="btn btn--sm btn--red" href="tel:+551124032745">Consultar</a>`;
      return `<article class="part">
        <div class="part__top"><span class="tag">${esc(p.category || 'Peça')}</span>${p.code ? `<span class="code">${esc(p.code)}</span>` : ''}</div>
        <h3>${esc(p.name)}</h3>
        <div class="part__bot">
          <div><small>a partir de</small><b>${BRL(p.price)}</b></div>
          ${cta}
        </div>
        <span class="stock ${p.stock <= 3 ? 'low' : ''}">${p.stock <= 3 ? 'Últimas unidades' : 'Em estoque'}</span>
      </article>`;
    }).join('');
  }
  render();
})();
