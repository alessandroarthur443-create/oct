/* Armazenamento local do estoque Urso Motos.
 * Os dados ficam no navegador (localStorage) de quem usa o painel.
 * Use "Exportar backup" no painel para guardar/transferir os dados. */
const Store = (() => {
  const KEY = 'urso_motos_db_v1';
  const empty = () => ({
    products: [],
    moves: [],
    settings: { password: 'urso1997', whatsapp: '' },
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const db = JSON.parse(raw);
      return Object.assign(empty(), db, { settings: Object.assign(empty().settings, db.settings || {}) });
    } catch (e) {
      return empty();
    }
  }

  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert('Não foi possível salvar os dados neste navegador.'); }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function seed() {
    const db = empty();
    const items = [
      ['Óleo 4T 20W50 Mineral 1L', 'Lubrificantes', 'OL-2050', 32.9, 24],
      ['Óleo 4T 10W30 Semissintético 1L', 'Lubrificantes', 'OL-1030', 44.9, 18],
      ['Kit Relação (coroa, pinhão e corrente)', 'Transmissão', 'KR-160', 189.9, 6],
      ['Pastilha de Freio Dianteira', 'Freios', 'PF-D01', 39.9, 15],
      ['Vela de Ignição', 'Elétrica', 'VL-NGK', 24.9, 30],
      ['Pneu Traseiro 100/80-18', 'Pneus', 'PN-10080', 279.0, 4],
      ['Filtro de Ar', 'Filtros', 'FA-150', 34.9, 10],
      ['Bateria 12V 5Ah', 'Elétrica', 'BT-5AH', 219.0, 3],
    ];
    const now = new Date().toISOString();
    items.forEach(([name, category, code, price, qty]) => {
      const p = { id: uid(), name, category, code, price, stock: 0, visible: true, createdAt: now };
      db.products.push(p);
      db.moves.push({ id: uid(), productId: p.id, type: 'in', qty, unit: +(price * 0.6).toFixed(2), date: now.slice(0, 10), note: 'Estoque inicial' });
      p.stock = qty;
    });
    save(db);
    return db;
  }

  return { load, save, uid, KEY };
})();

const BRL = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
