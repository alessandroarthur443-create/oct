/* =========================================================
   GetApp — catálogo, busca, filtros, detalhes, favoritos
   Edite o array APPS para cadastrar seus aplicativos.
   Em "url" coloque o link real do arquivo para download.
   ========================================================= */

const APPS = [
  { id: "aurora",   name: "Aurora Notes",   dev: "Lumen Studio",  cat: "Produtividade", rating: 4.9, downloads: 820000, size: "24 MB", version: "3.4.1", updated: "2026-11-20", colors: ["#c9a26b", "#8f6f3e"], featured: true,  tagline: "Notas elegantes que se organizam sozinhas.", desc: "Escreva, organize e encontre suas ideias com uma interface limpa, sincronização instantânea e busca inteligente.", url: "#" },
  { id: "pulse",    name: "Pulse Fit",      dev: "Motion Labs",   cat: "Saúde",         rating: 4.8, downloads: 640000, size: "48 MB", version: "2.9.0", updated: "2026-11-18", colors: ["#9bb59a", "#5d7f63"], featured: true,  tagline: "Treinos guiados no seu ritmo.", desc: "Planos de treino personalizados, acompanhamento de progresso e lembretes que respeitam sua rotina.", url: "#" },
  { id: "cinema",   name: "Cineluz",        dev: "Frame Co.",     cat: "Entretenimento",rating: 4.7, downloads: 1200000,size: "36 MB", version: "5.1.2", updated: "2026-11-22", colors: ["#d7a59a", "#a5645a"], featured: true,  tagline: "Seu cinema, em qualquer lugar.", desc: "Catálogo de filmes e séries com recomendações personalizadas, listas e modo offline.", url: "#" },
  { id: "wallet",   name: "Ledger One",     dev: "Northbank",     cat: "Finanças",      rating: 4.8, downloads: 510000, size: "31 MB", version: "4.0.3", updated: "2026-11-12", colors: ["#7f8fa6", "#4a5a72"], featured: true,  tagline: "Suas finanças com clareza absoluta.", desc: "Controle gastos, metas e investimentos em um painel claro, com categorização automática.", url: "#" },
  { id: "lens",     name: "Halo Camera",    dev: "Optic House",   cat: "Fotografia",    rating: 4.6, downloads: 930000, size: "52 MB", version: "7.2.0", updated: "2026-11-15", colors: ["#e0b98a", "#b07c47"], featured: true,  tagline: "Fotos profissionais com um toque.", desc: "Modos manuais, filtros de filme e edição RAW em um app leve e intuitivo.", url: "#" },
  { id: "voyage",   name: "Voyage",         dev: "Atlas Digital", cat: "Viagem",        rating: 4.7, downloads: 380000, size: "40 MB", version: "2.3.5", updated: "2026-11-09", colors: ["#8fb3c4", "#4f7c91"], featured: false, tagline: "Roteiros que se planejam sozinhos.", desc: "Planeje viagens, salve reservas e descubra lugares com mapas offline.", url: "#" },
  { id: "chord",    name: "Chordify Pro",   dev: "Sonora",        cat: "Música",        rating: 4.5, downloads: 720000, size: "29 MB", version: "6.0.1", updated: "2026-11-02", colors: ["#b9a1c9", "#7b5f91"], featured: false, tagline: "Aprenda qualquer música.", desc: "Cifras sincronizadas, afinador e metrônomo integrados para músicos de todos os níveis.", url: "#" },
  { id: "quest",    name: "Stellar Quest",  dev: "Nebula Games",  cat: "Jogos",         rating: 4.8, downloads: 1500000,size: "310 MB",version: "1.12.0",updated: "2026-11-24", colors: ["#e3c27f", "#a8823a"], featured: false, tagline: "Uma aventura entre as estrelas.", desc: "RPG de exploração espacial com mundo aberto, missões e modo cooperativo.", url: "#" },
  { id: "puzzle",   name: "Mosaic",         dev: "Calm Play",     cat: "Jogos",         rating: 4.6, downloads: 450000, size: "88 MB", version: "3.0.0", updated: "2026-10-30", colors: ["#d5b3a6", "#9b6b5b"], featured: false, tagline: "Quebra-cabeças relaxantes.", desc: "Centenas de níveis com arte minimalista e trilha sonora relaxante.", url: "#" },
  { id: "chat",     name: "Murmur",         dev: "Echo Labs",     cat: "Social",        rating: 4.4, downloads: 980000, size: "45 MB", version: "8.4.2", updated: "2026-11-21", colors: ["#94b8a8", "#5b8572"], featured: false, tagline: "Conversas privadas de verdade.", desc: "Mensagens com criptografia de ponta a ponta, chamadas de voz e grupos.", url: "#" },
  { id: "learn",    name: "Lexis",          dev: "Bright Minds",  cat: "Educação",      rating: 4.9, downloads: 560000, size: "38 MB", version: "5.5.0", updated: "2026-11-19", colors: ["#a9b78f", "#6f7d55"], featured: false, tagline: "Idiomas em 10 minutos por dia.", desc: "Lições curtas, revisão espaçada e prática de conversação com correção instantânea.", url: "#" },
  { id: "tasks",    name: "Orbit Tasks",    dev: "Lumen Studio",  cat: "Produtividade", rating: 4.7, downloads: 410000, size: "19 MB", version: "2.1.4", updated: "2026-11-05", colors: ["#c8b08c", "#8c7553"], featured: false, tagline: "Tarefas com foco total.", desc: "Listas, projetos e modo foco com timer integrado para produzir mais.", url: "#" },
  { id: "sleep",    name: "Drift",          dev: "Motion Labs",   cat: "Saúde",         rating: 4.6, downloads: 300000, size: "33 MB", version: "1.8.2", updated: "2026-10-28", colors: ["#9fa8c7", "#5f6a91"], featured: false, tagline: "Durma melhor esta noite.", desc: "Sons ambientes, meditações guiadas e análise do seu sono.", url: "#" },
  { id: "edit",     name: "Cut Studio",     dev: "Frame Co.",     cat: "Fotografia",    rating: 4.5, downloads: 670000, size: "96 MB", version: "4.3.0", updated: "2026-11-11", colors: ["#d9a88a", "#a26a4d"], featured: false, tagline: "Edição de vídeo sem complicação.", desc: "Linha do tempo multicamadas, transições e exportação em 4K.", url: "#" },
  { id: "pay",      name: "Quanto",         dev: "Northbank",     cat: "Finanças",      rating: 4.3, downloads: 240000, size: "22 MB", version: "1.4.7", updated: "2026-10-21", colors: ["#8aa9a0", "#4f7369"], featured: false, tagline: "Divida contas sem esforço.", desc: "Divida despesas com amigos e acompanhe quem deve o quê.", url: "#" },
  { id: "radio",    name: "Wave Radio",     dev: "Sonora",        cat: "Música",        rating: 4.4, downloads: 350000, size: "18 MB", version: "3.2.1", updated: "2026-11-01", colors: ["#c4a4b4", "#8d6578"], featured: false, tagline: "Milhares de rádios ao vivo.", desc: "Rádios do mundo todo, podcasts e timer para dormir.", url: "#" },
];

const PAGE = 8;
const state = { cat: "Todos", q: "", sort: "popular", shown: PAGE };
const $ = (s, el = document) => el.querySelector(s);
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " mi" : n >= 1e3 ? Math.round(n / 1e3) + " mil" : String(n);
const dateBR = d => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const star = '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>';
const heart = '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9Z"/></svg>';
const icon = a => `<span class="app-icon" style="background:linear-gradient(135deg,${a.colors[0]},${a.colors[1]})">${a.name[0]}</span>`;

/* ---------- Favoritos (localStorage) ---------- */
let favs = [];
try { favs = JSON.parse(localStorage.getItem("getapp-favs") || "[]"); } catch (e) { favs = []; }
const saveFavs = () => { try { localStorage.setItem("getapp-favs", JSON.stringify(favs)); } catch (e) {} updateFavBadge(); };
const isFav = id => favs.includes(id);
function toggleFav(id) {
  favs = isFav(id) ? favs.filter(f => f !== id) : [...favs, id];
  saveFavs();
  toast(isFav(id) ? "Adicionado aos favoritos" : "Removido dos favoritos");
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => b.classList.toggle("on", isFav(id)));
  if (!$("#drawer").hidden) renderDrawer();
}
function updateFavBadge() {
  const b = $("#favCount");
  b.textContent = favs.length;
  b.hidden = favs.length === 0;
}

/* ---------- Destaques ---------- */
function renderFeatured() {
  $("#featured").innerHTML = APPS.filter(a => a.featured).map(a => `
    <article class="feat-card" data-open="${a.id}" style="background:linear-gradient(160deg,${a.colors[0]}22,${a.colors[0]}55)">
      <div>
        <span class="tag">${a.cat}</span>
        <h3>${a.name}</h3>
        <p>${a.tagline}</p>
      </div>
      <div class="feat-foot">
        ${icon(a)}
        <button class="btn btn-dark btn-get" data-download="${a.id}">Baixar</button>
      </div>
    </article>`).join("");
}

/* ---------- Categorias ---------- */
function renderChips() {
  const cats = ["Todos", ...new Set(APPS.map(a => a.cat))];
  $("#chips").innerHTML = cats.map(c =>
    `<button class="chip" role="tab" aria-selected="${c === state.cat}" data-cat="${c}">${c}</button>`).join("");
}

/* ---------- Catálogo ---------- */
function filtered() {
  const q = norm(state.q.trim());
  let list = APPS.filter(a =>
    (state.cat === "Todos" || a.cat === state.cat) &&
    (!q || norm(`${a.name} ${a.dev} ${a.cat} ${a.tagline}`).includes(q)));
  const sorters = {
    popular: (a, b) => b.downloads - a.downloads,
    rating: (a, b) => b.rating - a.rating,
    recent: (a, b) => b.updated.localeCompare(a.updated),
    name: (a, b) => a.name.localeCompare(b.name, "pt-BR"),
  };
  return list.sort(sorters[state.sort]);
}

function renderGrid() {
  const list = filtered();
  const visible = list.slice(0, state.shown);
  $("#grid").innerHTML = visible.map((a, i) => `
    <article class="app-card" data-open="${a.id}" style="animation-delay:${(i % PAGE) * 40}ms">
      <div class="app-top">
        ${icon(a)}
        <div class="app-meta"><h3>${a.name}</h3><span>${a.dev} · ${a.cat}</span></div>
        <button class="fav-btn ${isFav(a.id) ? "on" : ""}" data-fav="${a.id}" aria-label="Favoritar ${a.name}">${heart}</button>
      </div>
      <p class="app-desc">${a.desc}</p>
      <div class="app-foot">
        <span class="rating">${star}${a.rating.toFixed(1).replace(".", ",")} <span class="size">· ${a.size}</span></span>
        <button class="btn btn-dark btn-get" data-download="${a.id}">Baixar</button>
      </div>
    </article>`).join("");
  $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "aplicativo" : "aplicativos"}${state.cat !== "Todos" ? " em " + state.cat : ""}${state.q ? ` para “${state.q}”` : ""}`;
  $("#empty").hidden = list.length > 0;
  $("#loadMore").parentElement.hidden = list.length <= state.shown;
}

/* ---------- Modal de detalhes ---------- */
let lastFocus = null;
function openModal(id) {
  const a = APPS.find(x => x.id === id);
  if (!a) return;
  lastFocus = document.activeElement;
  $("#modalBody").innerHTML = `
    <div class="modal-hero" style="background:linear-gradient(160deg,${a.colors[0]}26,${a.colors[0]}50)">
      ${icon(a)}
      <div><h2 id="modalTitle">${a.name}</h2><p>${a.dev} · ${a.cat}</p></div>
    </div>
    <div class="modal-content">
      <div class="specs">
        <div class="spec"><strong>${a.rating.toFixed(1).replace(".", ",")}★</strong><span>Avaliação</span></div>
        <div class="spec"><strong>${fmt(a.downloads)}</strong><span>Downloads</span></div>
        <div class="spec"><strong>${a.size}</strong><span>Tamanho</span></div>
        <div class="spec"><strong>${a.version}</strong><span>Versão</span></div>
      </div>
      <div class="shots">
        ${[0, 1, 2, 3].map(i => `<div class="shot" style="background:linear-gradient(${160 + i * 30}deg,${a.colors[0]},${a.colors[1]})"></div>`).join("")}
      </div>
      <h4>Sobre</h4>
      <p>${a.desc} Atualizado em ${dateBR(a.updated)}.</p>
      <div class="modal-actions">
        <button class="btn btn-gold dl-btn" data-download="${a.id}"><i class="bar"></i><span>Baixar agora · ${a.size}</span></button>
        <button class="btn btn-outline" data-share="${a.id}">Compartilhar</button>
        <button class="fav-btn ${isFav(a.id) ? "on" : ""}" data-fav="${a.id}" aria-label="Favoritar">${heart}</button>
      </div>
    </div>`;
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", "#app-" + a.id);
  $(".modal-close").focus();
}
function closeModal() {
  $("#modal").hidden = true;
  document.body.style.overflow = "";
  history.replaceState(null, "", location.pathname + location.search);
  lastFocus && lastFocus.focus();
}

/* ---------- Download ---------- */
function download(id, btn) {
  const a = APPS.find(x => x.id === id);
  if (!a || btn.dataset.busy) return;
  const label = btn.querySelector("span") || btn;
  const original = label.textContent;
  const bar = btn.querySelector(".bar");
  btn.dataset.busy = "1";
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18 + 6);
    label.textContent = p < 100 ? `Preparando… ${Math.round(p)}%` : "Concluído ✓";
    if (bar) bar.style.width = p + "%";
    if (p >= 100) {
      clearInterval(t);
      if (a.url && a.url !== "#") window.location.href = a.url;
      toast(`${a.name} pronto para instalar`);
      setTimeout(() => { label.textContent = original; if (bar) bar.style.width = 0; delete btn.dataset.busy; }, 1800);
    }
  }, 160);
}

async function share(id) {
  const a = APPS.find(x => x.id === id);
  const url = location.origin + location.pathname + "#app-" + id;
  try {
    if (navigator.share) await navigator.share({ title: a.name, text: a.tagline, url });
    else { await navigator.clipboard.writeText(url); toast("Link copiado"); }
  } catch (e) { /* cancelado */ }
}

/* ---------- Drawer de favoritos ---------- */
function renderDrawer() {
  const list = APPS.filter(a => isFav(a.id));
  $("#drawerList").innerHTML = list.length ? list.map(a => `
    <div class="drawer-item" data-open="${a.id}">
      ${icon(a)}
      <div><strong>${a.name}</strong><span>${a.cat} · ${a.size}</span></div>
      <button class="fav-btn on" data-fav="${a.id}" aria-label="Remover">${heart}</button>
    </div>`).join("") : '<p class="muted">Você ainda não favoritou nenhum app. Toque no coração para salvar.</p>';
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Eventos ---------- */
document.addEventListener("click", e => {
  const fav = e.target.closest("[data-fav]");
  if (fav) { e.stopPropagation(); return toggleFav(fav.dataset.fav); }
  const dl = e.target.closest("[data-download]");
  if (dl) { e.stopPropagation(); return download(dl.dataset.download, dl); }
  const sh = e.target.closest("[data-share]");
  if (sh) return share(sh.dataset.share);
  const chip = e.target.closest("[data-cat]");
  if (chip) { state.cat = chip.dataset.cat; state.shown = PAGE; renderChips(); return renderGrid(); }
  if (e.target.closest("[data-close]")) return closeModal();
  if (e.target.closest("[data-close-drawer]")) return ($("#drawer").hidden = true);
  const open = e.target.closest("[data-open]");
  if (open) { $("#drawer").hidden = true; return openModal(open.dataset.open); }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if (!$("#modal").hidden) closeModal(); $("#drawer").hidden = true; }
});

$("#heroSearch").addEventListener("submit", e => {
  e.preventDefault();
  state.q = $("#heroInput").value;
  state.cat = "Todos"; state.shown = PAGE;
  $("#catalogInput").value = state.q;
  renderChips(); renderGrid();
  $("#catalogo").scrollIntoView({ behavior: "smooth" });
});
$("#catalogInput").addEventListener("input", e => { state.q = e.target.value; state.shown = PAGE; renderGrid(); });
$("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });
$("#loadMore").addEventListener("click", () => { state.shown += PAGE; renderGrid(); });
$("#clearFilters").addEventListener("click", () => {
  Object.assign(state, { cat: "Todos", q: "", shown: PAGE });
  $("#catalogInput").value = ""; $("#heroInput").value = "";
  renderChips(); renderGrid();
});
$("#newsletterForm").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); toast("Inscrição confirmada. Obrigado!"); });

// Carrossel
const feat = $("#featured");
const step = () => (feat.firstElementChild?.offsetWidth || 300) + 22;
$("#prevFeat").addEventListener("click", () => feat.scrollBy({ left: -step(), behavior: "smooth" }));
$("#nextFeat").addEventListener("click", () => {
  if (feat.scrollLeft + feat.clientWidth >= feat.scrollWidth - 4) feat.scrollTo({ left: 0, behavior: "smooth" });
  else feat.scrollBy({ left: step(), behavior: "smooth" });
});

// Menu mobile
const toggle = $("#navToggle"), links = $("#navLinks");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.addEventListener("click", e => { if (e.target.tagName === "A") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", false); } });

// Botões flutuantes
$("#fabTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
$("#fabFav").addEventListener("click", () => { renderDrawer(); $("#drawer").hidden = false; });
window.addEventListener("scroll", () => $("#fabTop").classList.toggle("show", scrollY > 600), { passive: true });

// Link ativo na navegação
const navObs = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) document.querySelectorAll(".nav-links a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => navObs.observe(s));

// Animações de entrada
const revObs = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); }
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => revObs.observe(el));

// Contadores
document.querySelectorAll("[data-count]").forEach(el => {
  const target = +el.dataset.count, start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / 1600), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = target >= 1e6 ? fmt(v) : v.toLocaleString("pt-BR") + (p === 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

/* ---------- Início ---------- */
$("#year").textContent = new Date().getFullYear();
renderFeatured(); renderChips(); renderGrid(); updateFavBadge();
if (location.hash.startsWith("#app-")) openModal(location.hash.slice(5));
