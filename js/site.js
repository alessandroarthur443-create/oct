(() => {
  const db = Store.load();
  const $ = (s) => document.querySelector(s);
  $('#yr').textContent = new Date().getFullYear();

  // ---------- Menu mobile / header ----------
  const toggle = $('.nav__toggle'), links = $('.nav__links'), nav = $('.nav');
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', links.classList.toggle('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) links.classList.remove('open'); });
  addEventListener('scroll', () => nav.classList.toggle('nav--solid', scrollY > 30), { passive: true });

  // ---------- Velocímetro ----------
  const ticks = $('.g-ticks');
  for (let i = 0; i <= 20; i++) {
    const a = (-225 + i * 13.5) * Math.PI / 180, r1 = i % 5 === 0 ? 100 : 108, r2 = 116;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 150 + r1 * Math.cos(a)); l.setAttribute('y1', 150 + r1 * Math.sin(a));
    l.setAttribute('x2', 150 + r2 * Math.cos(a)); l.setAttribute('y2', 150 + r2 * Math.sin(a));
    if (i >= 16) l.setAttribute('class', 'hot');
    ticks.appendChild(l);
  }

  // ---------- Moto que passa ao rolar ----------
  const pass = $('.pass');
  if (pass && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { pass.classList.remove('go'); void pass.offsetWidth; pass.classList.add('go'); }
    }), { threshold: 0.6 }).observe(pass);
  }

  // ---------- WhatsApp ----------
  // Número configurado no painel; se vazio, usa o telefone da loja.
  const waNum = (() => { const n = (db.settings.whatsapp || '1124032745').replace(/\D/g, ''); return n.startsWith('55') ? n : '55' + n; })();
  const waUrl = (msg) => `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
  const w = $('#waLink'); w.href = waUrl('Olá, Urso Motos! Vim pelo site.'); w.hidden = false;

  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2000); };

  // ---------- Carrinho (pedido) ----------
  const CART_KEY = 'urso_motos_cart';
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }
  const prod = (id) => db.products.find((p) => p.id === id);
  Object.keys(cart).forEach((id) => { if (!prod(id)) delete cart[id]; });
  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} renderCart(); };

  function add(id, n = 1) {
    const p = prod(id); if (!p) return;
    cart[id] = Math.min((cart[id] || 0) + n, p.stock || 99);
    saveCart(); toast(`${p.name} adicionada ao pedido`);
    document.querySelectorAll('.fab, .nav__cart').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }
  function setQty(id, q) { if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, prod(id)?.stock || 99); saveCart(); }

  function renderCart() {
    const ids = Object.keys(cart);
    const count = ids.reduce((a, id) => a + cart[id], 0);
    const total = ids.reduce((a, id) => a + cart[id] * (prod(id)?.price || 0), 0);
    document.querySelectorAll('[data-count]').forEach((b) => { b.textContent = count; b.hidden = !count; });
    $('#cartEmpty').hidden = ids.length > 0;
    $('#orderForm').hidden = ids.length === 0;
    $('#sendOrder').disabled = ids.length === 0;
    $('#cartTotal').textContent = BRL(total);
    $('#cartList').innerHTML = ids.map((id) => {
      const p = prod(id);
      return `<li class="ci">
        <div class="ci__info"><b>${esc(p.name)}</b><small>${esc(p.code || p.category || '')} · ${BRL(p.price)} un.</small></div>
        <div class="qty">
          <button type="button" data-q="-1" data-id="${id}" aria-label="Diminuir">−</button>
          <span>${cart[id]}</span>
          <button type="button" data-q="1" data-id="${id}" aria-label="Aumentar">+</button>
        </div>
        <b class="ci__sub">${BRL(cart[id] * p.price)}</b>
        <button type="button" class="ci__rm" data-rm="${id}" aria-label="Remover">✕</button>
      </li>`;
    }).join('');
    document.querySelectorAll('.part').forEach((el) => el.classList.toggle('in-cart', !!cart[el.dataset.id]));
  }

  $('#cartList').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rm) setQty(b.dataset.rm, 0);
    else setQty(b.dataset.id, (cart[b.dataset.id] || 0) + Number(b.dataset.q));
  });

  const cartEl = $('#cart');
  const openCart = () => { document.body.classList.add('cart-open'); cartEl.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => { document.body.classList.remove('cart-open'); cartEl.setAttribute('aria-hidden', 'true'); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); }
    else if (e.target.closest('[data-close-cart]')) { closeCart(); }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  // Etapas visuais do formulário
  const steps = document.querySelectorAll('.steps span');
  $('#orderForm').addEventListener('input', (e) => {
    const f = e.currentTarget;
    steps[1].classList.toggle('on', f.nome.value.trim().length > 0);
    steps[2].classList.toggle('on', f.nome.value.trim().length > 0);
  });

  $('#orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget, ids = Object.keys(cart);
    if (!ids.length) return;
    const total = ids.reduce((a, id) => a + cart[id] * prod(id).price, 0);
    const lines = [
      '🏍️ *PEDIDO DE PEÇAS — URSO MOTOS*', '',
      ...ids.map((id) => { const p = prod(id); return `• ${cart[id]}x ${p.name}${p.code ? ` (${p.code})` : ''} — ${BRL(cart[id] * p.price)}`; }),
      '', `*Total estimado:* ${BRL(total)}`, '',
      `*Nome:* ${f.nome.value.trim()}`,
      f.moto.value.trim() ? `*Moto:* ${f.moto.value.trim()}` : null,
      `*Opção:* ${f.entrega.value}`,
      f.obs.value.trim() ? `*Obs.:* ${f.obs.value.trim()}` : null,
      '', 'Pode confirmar a disponibilidade? Obrigado!',
    ].filter((l) => l !== null);
    window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
  });

  // ---------- Lista de peças ----------
  const list = db.products.filter((p) => p.visible && p.stock > 0);
  const cats = ['Todas', ...new Set(list.map((p) => p.category).filter(Boolean))];
  let cat = 'Todas', q = '';
  const chips = $('#chips');
  chips.innerHTML = cats.map((c) => `<button class="chip${c === cat ? ' on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    cat = b.dataset.c; chips.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b)); render();
  });
  $('#q').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); render(); });

  $('#parts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    add(b.dataset.add);
  });

  function render() {
    const items = list.filter((p) => (cat === 'Todas' || p.category === cat) &&
      (!q || (p.name + ' ' + p.code + ' ' + p.category).toLowerCase().includes(q)));
    $('#partsEmpty').hidden = items.length > 0;
    $('#parts').innerHTML = items.map((p, i) => `<article class="part" data-id="${p.id}" style="--d:${i * 60}ms">
        <div class="part__top"><span class="tag">${esc(p.category || 'Peça')}</span>${p.code ? `<span class="code">${esc(p.code)}</span>` : ''}</div>
        <h3>${esc(p.name)}</h3>
        <div class="part__price"><small>a partir de</small><b>${BRL(p.price)}</b></div>
        <span class="stock ${p.stock <= 3 ? 'low' : ''}">${p.stock <= 3 ? 'Últimas unidades' : 'Em estoque'}</span>
        <div class="part__acts">
          <button class="btn btn--sm btn--red" data-add="${p.id}"><span class="add-txt">+ Adicionar</span><span class="in-txt">✓ No pedido (+1)</span></button>
          <a class="wa-btn" target="_blank" rel="noopener" title="Pedir pelo WhatsApp" aria-label="Pedir ${esc(p.name)} pelo WhatsApp"
             href="${waUrl(`Olá, Urso Motos! Quero pedir:\n• 1x ${p.name}${p.code ? ` (${p.code})` : ''} — ${BRL(p.price)}\n\nTem disponível?`)}">
            <svg viewBox="0 0 32 32" class="wa-ico"><use href="#wa"/></svg>
          </a>
        </div>
      </article>`).join('');
    renderCart();
  }
  render();
})();
