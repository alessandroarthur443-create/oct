(() => {
  let db = Store.load();
  const $ = (s) => document.querySelector(s);
  const today = () => new Date().toISOString().slice(0, 10);
  const persist = () => { Store.save(db); renderAll(); };
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); };
  const prodById = (id) => db.products.find((p) => p.id === id);
  const fmtDate = (d) => d ? d.split('-').reverse().join('/') : '';

  // ---------- Login ----------
  const SESSION = 'urso_admin_ok';
  const enter = () => { $('#login').hidden = true; $('#app').hidden = false; renderAll(); };
  if (sessionStorage.getItem(SESSION) === '1') enter();
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#pwd').value === db.settings.password) { sessionStorage.setItem(SESSION, '1'); enter(); }
    else { $('#loginErr').hidden = false; }
  });
  $('#logout').addEventListener('click', () => { sessionStorage.removeItem(SESSION); location.reload(); });

  // ---------- Abas ----------
  document.querySelectorAll('.side__nav button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.side__nav button').forEach((x) => x.classList.toggle('on', x === b));
    document.querySelectorAll('.tab').forEach((t) => { t.hidden = t.id !== 'tab-' + b.dataset.tab; });
  }));

  // ---------- Dashboard ----------
  function renderDash() {
    const ym = today().slice(0, 7);
    const month = db.moves.filter((m) => m.date.startsWith(ym));
    const sum = (arr, f) => arr.reduce((a, m) => a + f(m), 0);
    { const s = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); $('#monthLbl').textContent = s[0].toUpperCase() + s.slice(1); }
    $('#kStock').textContent = sum(db.products, (p) => p.stock);
    $('#kIn').textContent = sum(month.filter((m) => m.type === 'in'), (m) => m.qty);
    $('#kOut').textContent = sum(month.filter((m) => m.type === 'out'), (m) => m.qty);
    $('#kRev').textContent = BRL(sum(month.filter((m) => m.type === 'out'), (m) => m.qty * m.unit));
    const low = db.products.filter((p) => p.stock <= 3).sort((a, b) => a.stock - b.stock);
    $('#lowList').innerHTML = low.length ? low.map((p) => `<tr><td>${esc(p.name)}</td><td><span class="pill ${p.stock === 0 ? 'pill--red' : ''}">${p.stock}</span></td></tr>`).join('')
      : '<tr><td colspan="2" class="muted">Tudo certo com o estoque.</td></tr>';
    const last = [...db.moves].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    $('#lastMoves').innerHTML = last.map((m) => `<tr><td>${fmtDate(m.date)}</td><td>${typeTag(m.type)}</td><td>${esc(prodById(m.productId)?.name || '—')}</td><td>${m.qty}</td></tr>`).join('')
      || '<tr><td colspan="4" class="muted">Sem movimentações.</td></tr>';
  }
  const typeTag = (t) => t === 'in' ? '<span class="pill pill--in">Entrada</span>' : '<span class="pill pill--out">Venda</span>';

  // ---------- Movimentação ----------
  const mf = $('#moveForm');
  mf.date.value = today();
  function renderMoveSelect() {
    const cur = mf.productId.value;
    mf.productId.innerHTML = db.products.length
      ? db.products.slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => `<option value="${p.id}">${esc(p.name)} — estoque: ${p.stock}</option>`).join('')
      : '<option value="">Cadastre uma peça primeiro</option>';
    if (cur && prodById(cur)) mf.productId.value = cur;
    syncMove();
  }
  function syncMove() {
    const out = mf.type.value === 'out';
    const p = prodById(mf.productId.value);
    $('#unitLbl').textContent = out ? 'Preço de venda unitário (R$)' : 'Custo unitário (R$)';
    if (p && out) mf.unit.value = p.price;
    $('#moveInfo').textContent = p ? `Em estoque: ${p.stock} un.` : '';
  }
  mf.addEventListener('change', (e) => { if (e.target.name === 'type' || e.target.name === 'productId') syncMove(); });
  mf.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = prodById(mf.productId.value);
    if (!p) return toast('Cadastre uma peça primeiro.');
    const type = mf.type.value, qty = parseInt(mf.qty.value, 10);
    if (type === 'out' && qty > p.stock && !confirm(`Estoque atual é ${p.stock}. Registrar mesmo assim?`)) return;
    db.moves.push({ id: Store.uid(), productId: p.id, type, qty, unit: parseFloat(mf.unit.value) || 0, date: mf.date.value, note: mf.note.value.trim() });
    p.stock = Math.max(0, p.stock + (type === 'in' ? qty : -qty));
    persist();
    mf.qty.value = 1; mf.note.value = ''; if (type === 'in') mf.unit.value = '';
    toast(type === 'in' ? 'Entrada registrada!' : 'Venda registrada!');
  });

  // ---------- Produtos ----------
  const pf = $('#prodForm');
  function resetProd() { pf.reset(); pf.id.value = ''; $('#prodSubmit').textContent = 'Cadastrar peça'; $('#prodCancel').hidden = true; }
  $('#prodCancel').addEventListener('click', resetProd);
  pf.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = { name: pf.name.value.trim(), code: pf.code.value.trim(), category: pf.category.value.trim(), price: parseFloat(pf.price.value) || 0, visible: pf.visible.checked };
    if (pf.id.value) { Object.assign(prodById(pf.id.value), data); toast('Peça atualizada.'); }
    else { db.products.push({ id: Store.uid(), stock: 0, createdAt: new Date().toISOString(), ...data }); toast('Peça cadastrada. Registre a entrada para somar ao estoque.'); }
    resetProd(); persist();
  });
  $('#prodQ').addEventListener('input', renderProds);
  $('#prodList').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const p = prodById(b.dataset.id);
    if (b.dataset.act === 'edit') {
      pf.id.value = p.id; pf.name.value = p.name; pf.code.value = p.code || ''; pf.category.value = p.category || '';
      pf.price.value = p.price; pf.visible.checked = p.visible;
      $('#prodSubmit').textContent = 'Salvar alterações'; $('#prodCancel').hidden = false;
      pf.scrollIntoView({ behavior: 'smooth' });
    } else if (b.dataset.act === 'del') {
      if (!confirm(`Excluir "${p.name}" e todo o seu histórico?`)) return;
      db.products = db.products.filter((x) => x.id !== p.id);
      db.moves = db.moves.filter((m) => m.productId !== p.id);
      persist(); toast('Peça excluída.');
    } else if (b.dataset.act === 'vis') {
      p.visible = !p.visible; persist();
    }
  });
  function renderProds() {
    const q = $('#prodQ').value.toLowerCase();
    const rows = db.products.filter((p) => !q || (p.name + p.code + p.category).toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
    $('#prodList').innerHTML = rows.map((p) => `<tr>
      <td>${esc(p.name)}</td><td>${esc(p.code)}</td><td>${esc(p.category)}</td><td>${BRL(p.price)}</td>
      <td><span class="pill ${p.stock === 0 ? 'pill--red' : ''}">${p.stock}</span></td>
      <td><button class="link" data-act="vis" data-id="${p.id}">${p.visible ? 'Visível' : 'Oculta'}</button></td>
      <td class="acts"><button class="link" data-act="edit" data-id="${p.id}">Editar</button><button class="link danger" data-act="del" data-id="${p.id}">Excluir</button></td>
    </tr>`).join('') || '<tr><td colspan="7" class="muted">Nenhuma peça.</td></tr>';
    $('#catList').innerHTML = [...new Set(db.products.map((p) => p.category).filter(Boolean))].map((c) => `<option value="${esc(c)}">`).join('');
  }

  // ---------- Histórico ----------
  ['#hType', '#hFrom', '#hTo'].forEach((s) => $(s).addEventListener('change', renderHist));
  function histRows() {
    const t = $('#hType').value, f = $('#hFrom').value, to = $('#hTo').value;
    return db.moves.filter((m) => (!t || m.type === t) && (!f || m.date >= f) && (!to || m.date <= to)).sort((a, b) => b.date.localeCompare(a.date));
  }
  function renderHist() {
    const rows = histRows();
    $('#histList').innerHTML = rows.map((m) => `<tr>
      <td>${fmtDate(m.date)}</td><td>${typeTag(m.type)}</td><td>${esc(prodById(m.productId)?.name || '—')}</td>
      <td>${m.qty}</td><td>${BRL(m.unit)}</td><td>${BRL(m.qty * m.unit)}</td><td>${esc(m.note)}</td>
      <td><button class="link danger" data-id="${m.id}">Desfazer</button></td></tr>`).join('') || '<tr><td colspan="8" class="muted">Nada no período.</td></tr>';
    const ins = rows.filter((m) => m.type === 'in'), outs = rows.filter((m) => m.type === 'out');
    const s = (a) => a.reduce((x, m) => x + m.qty * m.unit, 0);
    $('#histSum').innerHTML = `Entradas: <b>${ins.reduce((x, m) => x + m.qty, 0)} un. (${BRL(s(ins))})</b> · Vendas: <b>${outs.reduce((x, m) => x + m.qty, 0)} un. (${BRL(s(outs))})</b>`;
  }
  $('#histList').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const m = db.moves.find((x) => x.id === b.dataset.id);
    if (!confirm('Desfazer esta movimentação? O estoque será ajustado.')) return;
    const p = prodById(m.productId);
    if (p) p.stock = Math.max(0, p.stock + (m.type === 'in' ? -m.qty : m.qty));
    db.moves = db.moves.filter((x) => x !== m);
    persist(); toast('Movimentação desfeita.');
  });
  $('#csv').addEventListener('click', () => {
    const lines = [['Data', 'Tipo', 'Peça', 'Código', 'Qtd', 'Unitário', 'Total', 'Obs']];
    histRows().forEach((m) => { const p = prodById(m.productId) || {}; lines.push([fmtDate(m.date), m.type === 'in' ? 'Entrada' : 'Venda', p.name, p.code, m.qty, m.unit.toFixed(2).replace('.', ','), (m.qty * m.unit).toFixed(2).replace('.', ','), m.note]); });
    download('movimentacoes-urso-motos.csv', '﻿' + lines.map((l) => l.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  });

  // ---------- Config ----------
  const cf = $('#cfgForm');
  cf.addEventListener('submit', (e) => {
    e.preventDefault();
    db.settings.whatsapp = cf.whatsapp.value.trim();
    if (cf.password.value) db.settings.password = cf.password.value;
    cf.password.value = ''; persist(); toast('Configurações salvas.');
  });
  $('#exp').addEventListener('click', () => download(`backup-urso-motos-${today()}.json`, JSON.stringify(db, null, 2), 'application/json'));
  $('#imp').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => {
      try { const d = JSON.parse(t); if (!Array.isArray(d.products) || !Array.isArray(d.moves)) throw 0; db = Object.assign(db, d); persist(); toast('Backup importado.'); }
      catch { alert('Arquivo de backup inválido.'); }
    });
    e.target.value = '';
  });
  $('#wipe').addEventListener('click', () => {
    if (!confirm('Apagar TODAS as peças e movimentações? Faça um backup antes.')) return;
    db.products = []; db.moves = []; persist(); toast('Dados apagados.');
  });

  function download(name, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function renderAll() { renderDash(); renderMoveSelect(); renderProds(); renderHist(); cf.whatsapp.value = db.settings.whatsapp || ''; }
})();
