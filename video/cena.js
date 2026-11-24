// Desenha o quadro do vídeo no tempo t (segundos). Canvas 1080x1920.
const W = 1080, H = 1920;
const INK = '#1d1d22';
const GROUND = 1350;      // linha da calçada (lojas)
const ROAD_Y = 1585;      // chão da moto
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeInOut = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const elastic = k => { k = clamp(k); if (k === 0 || k === 1) return k; return Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3)) + 1; };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const ZE = { shirt: '#2F6BFF', pants: '#1F2A44', skin: '#F2C29B', hair: 'cap', hat: '#FFC300' };
const DONOS = {
  padaria: { shirt: '#FFFFFF', pants: '#6B6F7A', skin: '#D9A074', hair: 'chef', apron: '#F4E3C3', mustache: true },
  mercado: { shirt: '#FF7AA2', pants: '#3A4A7A', skin: '#F0BE96', hair: 'bun', hairColor: '#8D8D96', apron: '#2EB872' },
  roupas:  { shirt: '#8E5BE8', pants: '#24508F', skin: '#B97A52', hair: 'long', hairColor: '#2A1A14' },
};
const LOJAS = {
  padaria: { nome: 'PADARIA', wall: '#FFE0B2', signBg: '#B5562B', aw1: '#E85D3A', aw2: '#FFF3E0' },
  mercado: { nome: 'MERCADINHO', wall: '#D8F3DC', signBg: '#1E8E4E', aw1: '#2EB872', aw2: '#FFFFFF' },
  roupas:  { nome: 'MODAS CARLA', wall: '#F3E5FF', signBg: '#7A3FD1', aw1: '#C77DFF', aw2: '#FFFFFF' },
};

let TL = null;
function setTimeline(tl) { TL = tl; }

// ---------- primitivas ----------
function limb(c, x1, y1, x2, y2, w, color) {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 10;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = color; c.lineWidth = w;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function limb3(c, x1, y1, x2, y2, x3, y3, w, color) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [lw, col] of [[w + 10, INK], [w, color]]) {
    c.strokeStyle = col; c.lineWidth = lw;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.stroke();
  }
}
function circle(c, x, y, r, fill, stroke = INK, lw = 6) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
function rrect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function box(c, x, y, w, h, fill, r = 8, lw = 6) {
  rrect(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke();
}
function star(c, x, y, r, rot, color) {
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .35 : r; const a = i * Math.PI / 4; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = color; c.fill(); c.restore();
}

// ---------- personagens ----------
function drawHead(c, hx, hy, p, t, faceDx = 0, mouth = 'smile') {
  // cabelo atrás
  if (p.hair === 'long') {
    c.fillStyle = p.hairColor; c.strokeStyle = INK; c.lineWidth = 6;
    c.beginPath(); c.moveTo(hx - 56, hy + 45); c.lineTo(hx - 56, hy - 5); c.arc(hx, hy - 5, 56, Math.PI, 0); c.lineTo(hx + 56, hy + 45);
    c.quadraticCurveTo(hx, hy + 60, hx - 56, hy + 45); c.fill(); c.stroke();
  }
  if (p.hair === 'bun') { circle(c, hx - 30, hy - 52, 22, p.hairColor); }
  circle(c, hx, hy, 48, p.skin);
  // rosto
  const ex = hx + faceDx;
  const blink = ((t + (p.blinkOff || 0)) % 3.1) < 0.09;
  c.fillStyle = INK;
  for (const s of [-1, 1]) {
    if (blink) { c.fillRect(ex + s * 16 - 7, hy - 4, 14, 4); }
    else { c.beginPath(); c.ellipse(ex + s * 16, hy - 2, 5.5, 8, 0, 0, Math.PI * 2); c.fill(); }
  }
  c.fillStyle = 'rgba(255,110,110,.35)';
  for (const s of [-1, 1]) { c.beginPath(); c.arc(ex + s * 28, hy + 14, 9, 0, Math.PI * 2); c.fill(); }
  if (p.mustache) { c.fillStyle = '#4A2F22'; c.beginPath(); c.ellipse(ex - 9, hy + 16, 12, 6, .2, 0, Math.PI * 2); c.ellipse(ex + 9, hy + 16, 12, 6, -.2, 0, Math.PI * 2); c.fill(); }
  if (mouth === 'open') {
    c.fillStyle = '#7A1F2B'; c.beginPath(); c.ellipse(ex, hy + 24, 13, 11, 0, 0, Math.PI); c.fill();
    c.strokeStyle = INK; c.lineWidth = 4; c.stroke();
  } else {
    c.strokeStyle = INK; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.arc(ex, hy + 8, 17, .2 * Math.PI, .8 * Math.PI); c.stroke();
  }
  // cabelo/chapéu na frente
  c.strokeStyle = INK; c.lineWidth = 6;
  if (p.hair === 'cap') {
    c.fillStyle = p.hat; c.beginPath(); c.arc(hx, hy - 10, 50, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(hx + 38 + faceDx * .5, hy - 14, 34, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    circle(c, hx, hy - 60, 6, p.hat, INK, 4);
  } else if (p.hair === 'helmet') {
    c.fillStyle = p.hat; c.beginPath(); c.arc(hx, hy - 4, 58, Math.PI * .95, Math.PI * 2.05); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#FFFFFF'; c.fillRect(hx - 40, hy - 52, 80, 9);
    c.fillStyle = 'rgba(120,200,255,.45)'; c.beginPath(); c.arc(hx + faceDx, hy - 4, 50, Math.PI * 1.1, Math.PI * 1.9); c.lineTo(hx + faceDx + 40, hy - 10); c.lineTo(hx + faceDx - 40, hy - 10); c.closePath(); c.fill();
  } else if (p.hair === 'chef') {
    c.fillStyle = '#FFFFFF';
    for (const [dx, dy, r] of [[-26, -70, 26], [0, -84, 30], [26, -70, 26]]) circle(c, hx + dx, hy + dy, r, '#FFFFFF');
    box(c, hx - 44, hy - 62, 88, 26, '#FFFFFF', 6, 6);
  } else if (p.hair === 'bun' || p.hair === 'long') {
    c.fillStyle = p.hairColor; c.beginPath(); c.arc(hx, hy - 6, 52, Math.PI * 1.05, Math.PI * 1.95);
    c.quadraticCurveTo(hx + 10, hy - 30, hx - 50, hy - 20); c.closePath(); c.fill(); c.stroke();
  }
}

function drawBag(c, x, y, s = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#E9C46A'; c.strokeStyle = INK; c.lineWidth = 6;
  c.beginPath(); c.moveTo(-14, 12);
  c.bezierCurveTo(-75, 30, -70, 115, 0, 115); c.bezierCurveTo(70, 115, 75, 30, 14, 12); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-14, 12); c.lineTo(-24, -6); c.lineTo(24, -6); c.lineTo(14, 12); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#C0392B'; c.fillRect(-18, 6, 36, 9); c.strokeRect(-18, 6, 36, 9);
  c.fillStyle = '#1E7B45'; c.font = '900 46px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('R$', 0, 70);
  c.restore();
}

// pessoa em pé. aL/aR: ângulo dos braços (0 = para baixo, PI = para cima)
function drawPerson(c, x, y, s, p, t, o = {}) {
  const aL = o.aL ?? .15, aR = o.aR ?? .15, walk = o.walk || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 4, 70, 14, 0, 0, Math.PI * 2); c.fill();
  const sw = Math.sin(walk) * 20;
  limb(c, -12, -95, -14 + sw, -8, 24, p.pants);
  limb(c, 12, -95, 14 - sw, -8, 24, p.pants);
  c.fillStyle = INK;
  c.beginPath(); c.ellipse(-12 + sw, -4, 20, 11, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(16 - sw, -4, 20, 11, 0, 0, Math.PI * 2); c.fill();
  limb(c, 0, -105, 0, -160, 74, p.shirt);
  if (p.apron) { box(c, -30, -150, 60, 70, p.apron, 10, 5); }
  const hL = [-32 - Math.sin(aL) * 72, -158 + Math.cos(aL) * 72];
  const hR = [32 + Math.sin(aR) * 72, -158 + Math.cos(aR) * 72];
  limb(c, -32, -158, hL[0], hL[1], 20, p.shirt);
  limb(c, 32, -158, hR[0], hR[1], 20, p.shirt);
  circle(c, hL[0], hL[1], 13, p.skin, INK, 5);
  circle(c, hR[0], hR[1], 13, p.skin, INK, 5);
  drawHead(c, 0, -222, p, t, o.faceDx || 0, o.mouth);
  if (o.bag) drawBag(c, hR[0], hR[1] + 4, 1, Math.sin(t * 3) * .08);
  c.restore();
  return { hR: [x + hR[0] * s, y + hR[1] * s] };
}

function drawMoto(c, x, y, s, wheelRot, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 190, 16, 0, 0, Math.PI * 2); c.fill();
  for (const wx of [-108, 112]) {
    circle(c, wx, -44, 44, '#2B2B31');
    circle(c, wx, -44, 20, '#C9CED6', INK, 5);
    c.strokeStyle = '#8A919C'; c.lineWidth = 4;
    for (let k = 0; k < 3; k++) { const a = wheelRot + k * Math.PI / 3; c.beginPath(); c.moveTo(wx + Math.cos(a) * 20, -44 + Math.sin(a) * 20); c.lineTo(wx - Math.cos(a) * 20, -44 - Math.sin(a) * 20); c.stroke(); }
  }
  // corpo
  c.fillStyle = '#E63946'; c.strokeStyle = INK; c.lineWidth = 6; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-170, -92); c.lineTo(-150, -140); c.quadraticCurveTo(-90, -158, -30, -140); c.lineTo(-30, -88);
  c.lineTo(58, -88); c.lineTo(84, -196); c.lineTo(112, -196); c.lineTo(134, -92); c.quadraticCurveTo(128, -60, 90, -62);
  c.lineTo(-125, -62); c.quadraticCurveTo(-170, -62, -170, -92); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(112, -44, 56, Math.PI * 1.1, Math.PI * 1.75); c.stroke();
  box(c, -158, -168, 118, 24, '#33333B', 10, 5);
  // baú com o saco de dinheiro
  if (!o.semBag) drawBag(c, -170, -270, .85, Math.sin(t * 9) * .04);
  c.strokeStyle = INK; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(78, -204); c.lineTo(126, -210); c.stroke();
  circle(c, 134, -160, 14, '#FFE45C', INK, 5);
  // piloto
  const P = { ...ZE, hair: 'helmet', hat: '#FFC300' };
  limb3(c, -66, -170, 8, -165, 18, -96, 26, P.pants);
  c.fillStyle = INK; c.beginPath(); c.ellipse(30, -92, 22, 11, 0, 0, Math.PI * 2); c.fill();
  limb(c, -64, -175, -48, -248, 72, P.shirt);
  if (o.wave) {
    const w = Math.sin(t * 14) * .25;
    const ex = -20, ey = -300, hx = ex + Math.sin(w) * 60, hy = ey - Math.cos(w) * 60;
    limb3(c, -30, -238, ex, ey, hx, hy, 20, P.shirt); circle(c, hx, hy, 13, P.skin, INK, 5);
  }
  limb3(c, -40, -238, 20, -222, 84, -206, 20, P.shirt);
  circle(c, 86, -206, 13, P.skin, INK, 5);
  drawHead(c, -40, -300, P, t, 10, o.mouth);
  c.restore();
  // posição do saco (coordenadas de tela) para a entrega
  return { bag: [x - 170 * s, y - 270 * s] };
}

// ---------- cenário ----------
function sky(c, top = '#7CC8FF', bot = '#E4F5FF') {
  const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function cloud(c, x, y, s) {
  c.fillStyle = '#FFFFFF';
  c.beginPath(); c.arc(x, y, 40 * s, 0, 7); c.arc(x + 45 * s, y - 20 * s, 52 * s, 0, 7); c.arc(x + 100 * s, y, 42 * s, 0, 7);
  c.rect(x, y - 5, 100 * s, 45 * s); c.fill();
}
function street(c, scroll, t) {
  sky(c);
  c.fillStyle = 'rgba(255,230,120,.35)'; c.beginPath(); c.arc(880, 700, 110, 0, 7); c.fill();
  circle(c, 880, 700, 72, '#FFD43B', null);
  for (let i = 0; i < 4; i++) {
    const x = ((rnd(i) * 1600 - scroll * .12 - t * 12) % 1600 + 1600) % 1600 - 300;
    cloud(c, x, 640 + rnd(i + 9) * 260, .8 + rnd(i + 3) * .6);
  }
  // prédios ao fundo
  const cores = ['#B9C6E6', '#C9B9E6', '#B9DEE6', '#E6CFB9', '#BFD9C4'];
  const tot = 8 * 210;
  for (let i = 0; i < 9; i++) {
    const bw = 190, bh = 230 + rnd(i * 7) * 260;
    const x = ((i * 210 - scroll * .35) % tot + tot) % tot - 210;
    c.fillStyle = cores[i % 5]; c.fillRect(x, GROUND - bh, bw, bh);
    c.fillStyle = 'rgba(255,255,255,.55)';
    for (let wy = GROUND - bh + 30; wy < GROUND - 50; wy += 60) for (let wx = x + 25; wx < x + bw - 30; wx += 55) c.fillRect(wx, wy, 28, 34);
  }
  // calçada
  c.fillStyle = '#E3DCCB'; c.fillRect(0, GROUND, W, 75);
  c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 3;
  for (let i = -1; i < 14; i++) { const x = ((i * 90 - scroll) % 1170 + 1170) % 1170 - 90; c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x - 20, GROUND + 75); c.stroke(); }
  c.fillStyle = '#9EA3AD'; c.fillRect(0, GROUND + 75, W, 18);
  c.fillStyle = '#3B3F48'; c.fillRect(0, GROUND + 93, W, 230);
  c.fillStyle = '#F5F5F0';
  for (let i = -1; i < 8; i++) { const x = ((i * 220 - scroll * 1.0) % 1540 + 1540) % 1540 - 220; c.fillRect(x, ROAD_Y + 18, 120, 12); }
  c.fillStyle = '#9EA3AD'; c.fillRect(0, GROUND + 323, W, 14);
  c.fillStyle = '#7CC36E'; c.fillRect(0, GROUND + 337, W, H);
}
function sunburst(c, t, a = '#FFE9A0', b = '#FFF5CF') {
  c.fillStyle = b; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2, 1050); c.rotate(t * .15); c.fillStyle = a;
  for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2000, i * Math.PI / 8, i * Math.PI / 8 + Math.PI / 16); c.closePath(); c.fill(); }
  c.restore();
}
function speedLines(c, t, y0, y1, k = 1) {
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineCap = 'round'; c.lineWidth = 6;
  for (let i = 0; i < 9; i++) {
    const y = y0 + rnd(i) * (y1 - y0), len = 80 + rnd(i + 5) * 120;
    const x = W - ((t * 1800 + rnd(i + 2) * W) % (W + 400));
    c.globalAlpha = k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y); c.stroke();
  }
  c.globalAlpha = 1;
}

// ---------- lojas ----------
function drawShop(c, cx, gy, w, h, tipo, up, t) {
  const L = LOJAS[tipo], x = cx - w / 2, y = gy - h;
  box(c, x, y, w, h, L.wall, 4, 7);
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + 4, y + 4, w - 8, 18);
  box(c, x + w * .07, y + 22, w * .86, 92, L.signBg, 14, 6);
  let fs = 58; c.font = `900 ${fs}px Inter`;
  while (c.measureText(L.nome).width > w * .78) { fs -= 2; c.font = `900 ${fs}px Inter`; }
  c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L.nome, cx, y + 70);
  // toldo
  const ay = y + 128, ah = 70, n = 8, sw = w / n;
  for (let i = 0; i < n; i++) {
    c.fillStyle = i % 2 ? L.aw2 : L.aw1;
    c.beginPath(); c.moveTo(x + i * sw, ay); c.lineTo(x + (i + 1) * sw, ay); c.lineTo(x + (i + 1) * sw, ay + ah);
    c.arc(x + (i + .5) * sw, ay + ah, sw / 2, 0, Math.PI); c.closePath(); c.fill();
  }
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x, ay); c.lineTo(x + w, ay); c.stroke();
  c.beginPath(); c.moveTo(x, ay); c.lineTo(x, ay + ah);
  for (let i = 0; i < n; i++) c.arc(x + (i + .5) * sw, ay + ah, sw / 2, Math.PI, 0, true);
  c.lineTo(x + w, ay); c.stroke();
  // vitrine
  const vx = x + w * .07, vy = ay + ah + sw / 2 + 25, vw = w * .55, vh = gy - vy - 40;
  box(c, vx, vy, vw, vh, '#CDEBFF', 6, 7);
  c.save(); rrect(c, vx, vy, vw, vh, 6); c.clip();
  if (up > 0) { c.fillStyle = `rgba(255,214,110,${.45 * up})`; c.fillRect(vx, vy, vw, vh); }
  conteudo(c, tipo, vx, vy, vw, vh, up, t);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(vx + vw * .1, vy); c.lineTo(vx + vw * .3, vy); c.lineTo(vx, vy + vh * .5); c.lineTo(vx, vy + vh * .25); c.fill();
  c.restore(); box(c, vx, vy, vw, vh, 'rgba(0,0,0,0)', 6, 7);
  // porta
  const dx = x + w * .69, dw = w * .24;
  box(c, dx, vy - 10, dw, gy - vy + 10, '#8B5A3C', 6, 7);
  box(c, dx + dw * .15, vy + 15, dw * .7, (gy - vy) * .35, '#CDEBFF', 4, 5);
  circle(c, dx + dw * .82, vy + (gy - vy) * .6, 7, '#FFD43B', INK, 4);
  // brilhos após a entrega
  if (up > 0) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + t * .5, rr = .55 + .1 * Math.sin(t * 3 + i);
      const sx = cx + Math.cos(a) * w * rr * .9, sy = gy - h / 2 + Math.sin(a) * h * rr * .75;
      const k = up * (.5 + .5 * Math.sin(t * 6 + i * 1.7));
      star(c, sx, sy, 22 * k + 4, t * 2 + i, '#FFD43B');
    }
  }
}
function conteudo(c, tipo, x, y, w, h, up, t) {
  c.strokeStyle = INK; c.lineWidth = 4;
  if (tipo === 'padaria') {
    const rows = 2;
    for (let r = 0; r < rows; r++) {
      const sy = y + h * (.45 + r * .42);
      c.fillStyle = '#A0714F'; c.fillRect(x, sy, w, 10);
      const n = 2 + Math.round(up * 3);
      for (let i = 0; i < n; i++) {
        const px = x + 40 + i * (w - 60) / 5, py = sy - 22;
        c.fillStyle = '#D98E46'; c.beginPath(); c.ellipse(px, py, 30, 20, 0, 0, 7); c.fill(); c.stroke();
        c.strokeStyle = '#F7D2A0'; c.lineWidth = 3;
        for (const d of [-10, 2, 14]) { c.beginPath(); c.moveTo(px + d - 4, py - 10); c.lineTo(px + d + 4, py + 6); c.stroke(); }
        c.strokeStyle = INK; c.lineWidth = 4;
      }
    }
    if (up > 0) { // vapor do pão quentinho
      c.strokeStyle = `rgba(255,255,255,${.9 * up})`; c.lineWidth = 6; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sx = x + w * (.25 + i * .25), off = (t * 40 + i * 20) % 40;
        c.beginPath(); c.moveTo(sx, y + h * .3 - off);
        c.bezierCurveTo(sx + 15, y + h * .2 - off, sx - 15, y + h * .1 - off, sx, y - off); c.stroke();
      }
    }
  } else if (tipo === 'mercado') {
    const cores = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF924C'];
    for (let r = 0; r < 3; r++) {
      const sy = y + h * (.33 + r * .31);
      c.fillStyle = '#8A8F99'; c.fillRect(x, sy, w, 9);
      const n = Math.round(lerp(2, 7, up));
      for (let i = 0; i < n; i++) {
        const bw = (w - 30) / 7 - 6, bh = 38 + rnd(i + r * 9) * 22;
        box(c, x + 15 + i * (bw + 6), sy - bh, bw, bh, cores[(i + r * 2) % 6], 4, 3);
      }
    }
  } else {
    c.fillStyle = '#8A8F99'; c.fillRect(x + 10, y + 40, w - 20, 8);
    const cores = ['#FF6B9A', '#4ECDC4', '#FFD43B', '#5E60CE', '#FF924C'];
    const n = 2 + Math.round(up * 3);
    for (let i = 0; i < n; i++) {
      const px = x + 50 + i * (w - 80) / 4.4, py = y + 50, sway = Math.sin(t * 2 + i) * .05;
      c.save(); c.translate(px, py); c.rotate(sway);
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -10); c.lineTo(0, 6); c.stroke();
      c.fillStyle = cores[i % 5]; c.lineWidth = 4; c.beginPath();
      c.moveTo(-14, 6); c.lineTo(-34, 18); c.lineTo(-30, 40); c.lineTo(-22, 36); c.lineTo(-22, 110); c.lineTo(22, 110);
      c.lineTo(22, 36); c.lineTo(30, 40); c.lineTo(34, 18); c.lineTo(14, 6); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    if (up > 0) {
      c.save(); c.translate(x + w * .62, y + h * .78); c.rotate(-.12); c.scale(up, up);
      box(c, -110, -32, 220, 64, '#FF3B6B', 12, 5);
      c.fillStyle = '#FFF'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NOVIDADE!', 0, 2);
      c.restore();
    }
  }
}

// ---------- partículas de dinheiro ----------
function bill(c, x, y, rot, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  box(c, -45, -24, 90, 48, '#7BD389', 6, 4);
  circle(c, 0, 0, 13, '#4CAF6A', INK, 3);
  c.fillStyle = '#1E6B3A'; c.font = '900 18px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R$', -28, -10);
  c.restore();
}
function coin(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(Math.abs(s), 1);
  circle(c, 0, 0, 22, '#FFC300', INK, 4); circle(c, 0, 0, 14, '#FFD95A', null);
  c.fillStyle = '#B07D00'; c.font = '900 20px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 0, 1);
  c.restore();
}
function burst(c, x, y, lt, seed) {
  if (lt < 0 || lt > 1.6) return;
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (rnd(seed + i) - .5) * 2.4, v = 600 + rnd(seed + i + 50) * 600;
    const px = x + Math.cos(a) * v * lt, py = y + Math.sin(a) * v * lt + 1400 * lt * lt;
    c.globalAlpha = clamp(1.6 - lt);
    if (i % 2) coin(c, px, py, Math.cos(lt * 12 + i)); else bill(c, px, py, lt * 6 + i, .8);
  }
  c.globalAlpha = 1;
}

// ---------- legendas ----------
function chunksOf(line) {
  const words = line.txt.split(' ').map(w => ({ hl: w.includes('*'), w: w.replace(/\*/g, '') }));
  // propaga destaque entre *frases com espaço*
  let open = false;
  line.txt.split(' ').forEach((raw, i) => {
    const st = raw.startsWith('*'), en = raw.replace(/[!?.,:]+$/, '').endsWith('*');
    if (st) open = true;
    words[i].hl = open;
    if (en) open = false;
  });
  const FRACAS = new Set(['o', 'a', 'os', 'as', 'e', 'é', 'de', 'do', 'da', 'um', 'uma', 'pra', 'na', 'no', 'em', 'que', 'sem', 'ele', 'seu', 'dona', 'lá']);
  const out = []; let cur = [];
  words.forEach((w, i) => {
    cur.push(w);
    const len = cur.map(x => x.w).join(' ').length;
    const pont = /[.,!?:]$/.test(w.w);
    const fraca = FRACAS.has(w.w.toLowerCase()) && i < words.length - 1;
    if (pont || (!fraca && (cur.length >= 3 || len > 12)) || cur.length >= 4) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  const total = out.reduce((s, ch) => s + ch.map(x => x.w).join(' ').length + 2, 0);
  let acc = 0; const d = line.end - line.start;
  return out.map(ch => { const l = ch.map(x => x.w).join(' ').length + 2; const s = line.start + d * acc / total; acc += l; return { words: ch, start: s, end: line.start + d * acc / total }; });
}
function drawCaption(c, t) {
  let cur = null;
  for (const sc of TL.scenes) for (let li = 0; li < sc.lines.length; li++) {
    const line = sc.lines[li]; if (line.semLegenda) continue;
    const next = sc.lines[li + 1]; const hold = next ? next.start : sc.end;
    const chs = chunksOf(line);
    chs.forEach((ch, i) => { const e = i === chs.length - 1 ? hold : ch.end; if (t >= ch.start && t < e) cur = ch; });
  }
  if (!cur) return;
  const k = t - cur.start;
  const sc = k < .09 ? lerp(.55, 1.12, k / .09) : k < .16 ? lerp(1.12, 1, (k - .09) / .07) : 1;
  const fs = 104; c.font = `900 ${fs}px Inter`;
  const space = c.measureText(' ').width;
  // quebra em até 2 linhas
  const lines = [[]]; let lw = 0;
  for (const w of cur.words) { const ww = c.measureText(w.w.toUpperCase()).width; if (lw + ww > 940 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + space; }
  c.save(); c.translate(W / 2, 420); c.scale(sc, sc); c.rotate(-.02);
  c.textBaseline = 'middle'; c.textAlign = 'left'; c.lineJoin = 'round';
  lines.forEach((ln, i) => {
    const tw = ln.reduce((s, w) => s + w.ww, 0) + space * (ln.length - 1);
    let x = -tw / 2; const y = (i - (lines.length - 1) / 2) * fs * 1.05;
    for (const w of ln) {
      const s = w.w.toUpperCase();
      c.strokeStyle = INK; c.lineWidth = 22; c.strokeText(s, x, y + 6);
      c.strokeText(s, x, y);
      c.fillStyle = w.hl ? '#FFD400' : '#FFFFFF'; c.fillText(s, x, y);
      x += w.ww + space;
    }
  });
  c.restore();
}

// ---------- cenas ----------
const CENAS = {
  intro(c, lt, sc, t) {
    sunburst(c, t);
    const k = elastic(lt / .7);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(540, 1540, 220 * k, 34 * k, 0, 0, 7); c.fill();
    drawPerson(c, 540, 1540 - (1 - k) * 200, 2.6 * Math.max(.01, k), ZE, t, { aR: 2.6 + Math.sin(t * 12) * .35, aL: .2, mouth: 'open' });
  },
  dinheiro(c, lt, sc, t) {
    sunburst(c, t, '#C8F2CF', '#E9FBEA');
    for (let i = 0; i < 22; i++) {
      const sp = 300 + rnd(i) * 250, y = -100 + ((lt * sp + rnd(i + 3) * 2000) % 2100);
      const x = rnd(i + 7) * W + Math.sin(lt * 2 + i) * 60;
      if (i % 3) bill(c, x, y, Math.sin(lt * 3 + i) * .8, 1.1); else coin(c, x, y, Math.cos(lt * 6 + i) * 1.4);
    }
    drawPerson(c, 540, 1560, 2.5, ZE, t, { aR: 2.75 + Math.sin(t * 5) * .08, aL: .5 + Math.sin(t * 6) * .2, bag: true, mouth: 'open' });
  },
  rodando(c, lt, sc, t) {
    const S = lt * 1100;
    street(c, S, t);
    speedLines(c, lt, 1130, 1560, .8);
    drawMoto(c, 470 + Math.sin(lt * 2) * 30, ROAD_Y + Math.sin(lt * 30) * 3, 1.25, S / 48, t, { mouth: 'open' });
  },
  loja(c, lt, sc, t) {
    const R = sc.lead, u = clamp(lt / R), e = easeOut(u);
    const off = (1 - e) * 1500, S = e * 1500;
    street(c, S, t);
    const cx = 590 + off;
    const th = sc.lines[1].start - sc.start - .1;   // início da entrega
    const fly = .6, got = lt - th - fly;
    const up = easeOut(got / .6);
    drawShop(c, cx, GROUND, 640, 620, sc.loja, up, t);
    // dono na porta
    const dono = DONOS[sc.loja];
    const jump = got > 0 && got < 1.4 ? Math.abs(Math.sin(got * 7)) * 50 : 0;
    const doorX = cx + 210, doorY = GROUND + 40 - jump;
    let pose;
    if (got > 0) pose = { aR: 2.7 + Math.sin(t * 8) * .1, aL: 2.5 + Math.sin(t * 8 + 1) * .2, bag: true, mouth: 'open' };
    else if (lt > R) pose = { aR: 2.4 + Math.sin(t * 12) * .35, aL: .2 };
    else pose = { aR: .2, aL: .2 };
    const donoInfo = drawPerson(c, doorX, doorY, 1.15, { ...dono, blinkOff: 1.3 }, t, { ...pose, faceDx: -8 });
    if (u < 1) speedLines(c, lt, 1130, 1560, 1 - u);
    const mx = 300, my = ROAD_Y + (u < 1 ? Math.sin(lt * 30) * 3 : 0);
    const m = drawMoto(c, mx, my, 1.15, S / 48, t, { semBag: lt > th, wave: lt > th + .3, mouth: lt > th ? 'open' : 'smile' });
    // saco voando em arco
    if (lt > th && got < 0) {
      const k = easeInOut((lt - th) / fly);
      const tx = doorX + 32 * 1.15 + 60, ty = doorY - 300;
      const bx = lerp(m.bag[0], tx, k), by = lerp(m.bag[1], ty, k) - Math.sin(k * Math.PI) * 330;
      drawBag(c, bx, by, lerp(.98, 1.15, k), k * Math.PI * 2);
    }
    burst(c, doorX, doorY - 320, got, sc.loja.length * 13);
  },
  resumo(c, lt, sc, t) {
    street(c, 0, t);
    const ks = ['padaria', 'mercado', 'roupas'];
    ks.forEach((k, i) => {
      const p = elastic((lt - i * .18) / .6);
      c.save(); c.translate(185 + i * 355, GROUND); c.scale(p, p);
      drawShop(c, 0, 0, 335, 430, k, 1, t + i);
      c.restore();
      const ck = elastic((lt - .8 - i * .25) / .5);
      if (ck > 0) { c.save(); c.translate(185 + i * 355 + 120, GROUND - 430); c.scale(ck, ck);
        circle(c, 0, 0, 44, '#2EB872', INK, 6);
        c.strokeStyle = '#FFF'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(-20, 2); c.lineTo(-5, 18); c.lineTo(22, -14); c.stroke(); c.restore(); }
    });
    const dur = sc.end - sc.start, x = lerp(-300, 1400, (lt % dur) / dur);
    drawMoto(c, x, ROAD_Y, 1.1, lt * 25, t, { wave: true, mouth: 'open' });
    speedLines(c, lt, 1450, 1560, .6);
  },
  cta(c, lt, sc, t) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2F6BFF'); g.addColorStop(1, '#0B2B8F');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.globalAlpha = .08; c.translate(W / 2, 1150); c.rotate(t * .12); c.fillStyle = '#FFF';
    for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2000, i * Math.PI / 8, i * Math.PI / 8 + Math.PI / 16); c.closePath(); c.fill(); }
    c.restore();
    const kIn = easeOut(lt / .6);
    drawMoto(c, lerp(-300, 560, kIn), 1290, 1.45, (1 - kIn) * 30, t, { wave: lt > .6, mouth: 'open' });
    const tb = sc.lines[1].start - sc.start;
    const k = elastic((lt - tb) / .7);
    if (lt > tb) {
      for (let i = 0; i < 30; i++) { // confete
        const tt = lt - tb, x = rnd(i) * W + Math.sin(tt * 3 + i) * 40, y = -50 + tt * (300 + rnd(i + 4) * 300) + rnd(i + 8) * 200;
        c.save(); c.translate(x, y); c.rotate(tt * 5 + i); c.fillStyle = ['#FFD400', '#FF5C8A', '#2EB872', '#FFFFFF'][i % 4]; c.fillRect(-10, -6, 20, 12); c.restore();
      }
      const pulse = 1 + Math.sin(lt * 6) * .035;
      c.save(); c.translate(W / 2, 1470); c.scale(k * pulse, k * pulse);
      rrect(c, -460, -95 + 14, 920, 190, 95); c.fillStyle = INK; c.fill();
      box(c, -460, -95, 920, 190, '#FFD400', 95, 8);
      c.fillStyle = INK; c.font = '900 76px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(TL.cta.botao, 0, 4);
      c.restore();
      const k2 = easeOut((lt - tb - .5) / .4);
      c.globalAlpha = k2; c.fillStyle = '#FFFFFF'; c.font = '800 46px Inter'; c.textAlign = 'center';
      c.fillText(TL.cta.sub, W / 2, 1660); c.globalAlpha = 1;
    }
  },
};

function render(c, t) {
  let sc = TL.scenes.find(s => t >= s.start && t < s.end) || TL.scenes[TL.scenes.length - 1];
  const lt = t - sc.start;
  c.save();
  const z = 1 + .07 * (1 - easeOut(lt / .3));   // "zoom punch" na troca de cena
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  if (sc.tipo === 'loja' || sc.tipo === 'rodando') { c.translate(540, 1800); c.scale(1.15, 1.15); c.translate(-540, -1800); }
  CENAS[sc.tipo](c, lt, sc, t);
  c.restore();
  drawCaption(c, t);
  if (lt < .15 && sc.start > 0) { c.fillStyle = `rgba(255,255,255,${.7 * (1 - lt / .15)})`; c.fillRect(0, 0, W, H); }
}
