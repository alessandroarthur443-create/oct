// Versão 3D (three.js): rua com lojas, sol, sombras e câmera de cinema.
// Usa cena.js (carregado antes como script clássico) para as legendas.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const VW = 1080, VH = 1920;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, k) => a + (b - a) * k;
const eOut = k => 1 - Math.pow(1 - cl(k), 3);
const eOutQ = k => 1 - Math.pow(1 - cl(k), 2);
const eIO = k => { k = cl(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const eBack = k => { k = cl(k); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const R = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- renderer ----------
const glc = document.createElement('canvas'); glc.width = VW; glc.height = VH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(VW, VH, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.62;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.getElementById('c'); const ctx = out.getContext('2d');

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(48, VW / VH, 0.1, 600);

// céu + luz
const sky = new Sky(); sky.scale.setScalar(4000); scene.add(sky);
const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(52), THREE.MathUtils.degToRad(-35));
const su = sky.material.uniforms;
su.turbidity.value = 4; su.rayleigh.value = 1.4; su.mieCoefficient.value = .004; su.mieDirectionalG.value = .8; su.sunPosition.value.copy(sunDir);
const pmrem = new THREE.PMREMGenerator(renderer);
const skyScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(4000); sky2.material.uniforms.sunPosition.value.copy(sunDir);
Object.assign(sky2.material.uniforms.turbidity, { value: 4 }); skyScene.add(sky2);
scene.environment = pmrem.fromScene(skyScene).texture;
scene.environmentIntensity = 0.55;
const hemi = new THREE.HemisphereLight('#cfe6ff', '#8a7a66', 0.9); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1dc', 3.2);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 120;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
scene.add(sun, sun.target);
scene.fog = new THREE.Fog('#cfe2f2', 60, 220);

// ---------- texturas de canvas ----------
function ctex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function noise(g, w, h, a, n = 6000) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${R(i) > .5 ? '255,255,255' : '0,0,0'},${a * R(i + 1)})`; g.fillRect(R(i + 2) * w, R(i + 3) * h, 2 + R(i + 4) * 3, 2 + R(i + 5) * 3); } }
const M = (color, rough = .65, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}

// ---------- rua ----------
const STREET_X0 = -230, STREET_X1 = 60, LEN = STREET_X1 - STREET_X0, MIDX = (STREET_X0 + STREET_X1) / 2;
const roadTex = ctex(1024, 512, (g, w, h) => {
  g.fillStyle = '#4a4d52'; g.fillRect(0, 0, w, h); noise(g, w, h, .12, 20000);
  g.fillStyle = '#f2f2ea'; g.fillRect(0, 18, w, 10); g.fillRect(0, h - 28, w, 10);
  g.fillStyle = '#f2c230'; g.fillRect(0, h / 2 - 14, w * .5, 10); g.fillRect(0, h / 2 + 4, w * .5, 10);
}, [LEN / 16, 1]);
const road = mesh(new THREE.PlaneGeometry(LEN, 8), M('#ffffff', .92, 0, { map: roadTex }), MIDX, 0, 0, scene);
road.rotation.x = -Math.PI / 2; road.castShadow = false;
const walkTex = ctex(512, 512, (g, w, h) => {
  g.fillStyle = '#cfc7b8'; g.fillRect(0, 0, w, h); noise(g, w, h, .1, 8000);
  g.strokeStyle = 'rgba(80,70,60,.35)'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
}, [LEN / 4, 1]);
for (const z of [-5.5, 5.5]) {
  const s = mesh(new THREE.BoxGeometry(LEN, .15, 3), [M('#9c968c'), M('#9c968c'), M('#fff', .85, 0, { map: walkTex }), M('#9c968c'), M('#a8a298'), M('#a8a298')], MIDX, .075, z, scene);
  s.castShadow = false;
}
const grass = mesh(new THREE.PlaneGeometry(LEN, 80), M('#6f9a52', .95), MIDX, -.01, 47, scene); grass.rotation.x = -Math.PI / 2; grass.castShadow = false;
const back = mesh(new THREE.PlaneGeometry(LEN, 60), M('#8c8579', .95), MIDX, -.01, -37, scene); back.rotation.x = -Math.PI / 2;

function lamp(x, z, side) {
  const g = new THREE.Group(); g.position.set(x, .15, z); scene.add(g);
  const dark = M('#2d3035', .45, .6);
  mesh(new THREE.CylinderGeometry(.06, .09, 5.2, 12), dark, 0, 2.6, 0, g);
  const arm = mesh(new THREE.CylinderGeometry(.04, .04, 1.3, 8), dark, 0, 5.1, side * .6, g); arm.rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(.32, .12, .55), dark, 0, 5.05, side * 1.2, g);
  mesh(new THREE.BoxGeometry(.26, .03, .45), M('#fff8e0', .3, 0, { emissive: '#fff2c0', emissiveIntensity: .6 }), 0, 4.98, side * 1.2, g);
}
function tree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, .15, z); g.scale.setScalar(s); scene.add(g);
  mesh(new THREE.CylinderGeometry(.12, .18, 2.6, 10), M('#6b4a32', .9), 0, 1.3, 0, g);
  const leaf = M('#4f8a3c', .85, 0, { flatShading: true }), leaf2 = M('#679e45', .85, 0, { flatShading: true });
  [[0, 3.2, 0, 1.3], [.8, 2.8, .3, .9], [-.7, 2.9, -.2, 1], [.1, 3.9, -.2, .9], [-.3, 2.7, .7, .8]].forEach(([a, b, c, r], i) =>
    mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? leaf2 : leaf, a, b, c, g));
}
const livre = x => ![-60, -110, -160].some(o => Math.abs(x - o) < 8) && Math.abs(x + 10) > 5 && Math.abs(x + 192) > 6;
for (let x = STREET_X0 + 10; x < STREET_X1; x += 20) { if (livre(x)) lamp(x, -4.35, 1); if (livre(x + 10)) lamp(x + 10, 4.35, -1); }

// ---------- prédios ----------
const winTexCache = {};
function windowsTex(color) {
  if (winTexCache[color]) return winTexCache[color];
  return winTexCache[color] = ctex(256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h); noise(g, w, h, .06, 3000);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(48, 70, 160, 120);
    const gr = g.createLinearGradient(0, 64, 0, 186); gr.addColorStop(0, '#9cc3dd'); gr.addColorStop(1, '#5d7f99');
    g.fillStyle = gr; g.fillRect(56, 64, 144, 116);
    g.fillStyle = '#e9e5dc'; g.fillRect(124, 64, 8, 116); g.fillRect(56, 118, 144, 6); g.fillRect(44, 180, 168, 12);
  });
}
function filler(x, w, hgt, color, depth = 10) {
  const t = windowsTex(color).clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 3, (hgt - 3.6) / 3.2);
  const g = new THREE.Group(); g.position.set(x, .15, -7 - depth / 2); scene.add(g);
  const plain = M(color, .9);
  const front = M('#fff', .85, 0, { map: t });
  mesh(new THREE.BoxGeometry(w, hgt - 3.6, depth), [plain, plain, plain, plain, front, plain], 0, 3.6 + (hgt - 3.6) / 2, 0, g);
  // térreo com porta de enrolar
  const rollTex = ctex(256, 256, (gg, ww, hh) => { gg.fillStyle = '#9aa0a6'; gg.fillRect(0, 0, ww, hh); for (let i = 0; i < hh; i += 10) { gg.fillStyle = 'rgba(0,0,0,.18)'; gg.fillRect(0, i, ww, 3); } });
  mesh(new THREE.BoxGeometry(w, 3.6, depth), [plain, plain, plain, plain, M(color, .9), plain], 0, 1.8, 0, g);
  mesh(new THREE.BoxGeometry(w * .7, 2.8, .05), M('#fff', .6, .3, { map: rollTex }), 0, 1.4, depth / 2 + .03, g);
  mesh(new THREE.BoxGeometry(w + .2, .25, .4), M('#e9e5dc', .8), 0, hgt, depth / 2 - .1, g);
  mesh(new THREE.BoxGeometry(w + .1, .18, .3), M('#e9e5dc', .8), 0, 3.6, depth / 2, g);
}

// ---------- lojas ----------
const LOJAS = {
  padaria: { x: -60, nome: 'PADARIA', sub: 'DO ANTÔNIO', wall: '#f2d3a4', signBg: '#8a3f1d', aw: ['#c8442a', '#f7efe2'] },
  mercado: { x: -110, nome: 'MERCADINHO', sub: 'DA MARIA', wall: '#cfe5cf', signBg: '#1d6b3c', aw: ['#2a9d5c', '#f7f7f2'] },
  roupas: { x: -160, nome: 'MODAS CARLA', sub: 'MODA FEMININA', wall: '#eadcf5', signBg: '#5b2b9e', aw: ['#8e55d6', '#f7f2fb'] },
};
const shops = {};
function makeShop(key) {
  const L = LOJAS[key]; const g = new THREE.Group(); g.position.set(L.x, .15, -7); scene.add(g);
  const plasterTex = ctex(256, 256, (gg, w, h) => { gg.fillStyle = L.wall; gg.fillRect(0, 0, w, h); noise(gg, w, h, .07, 4000); }, [2, 2]);
  const wall = M('#fff', .88, 0, { map: plasterTex });
  const box = (x0, x1, y0, y1, z0, z1, mat = wall) => mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, g);
  const T = .3;
  box(-4, -3.4, 0, 5.8, -T, 0); box(.8, 1.6, 0, 5.8, -T, 0); box(3.2, 4, 0, 5.8, -T, 0);
  box(-3.4, .8, 0, .5, -T, 0); box(-3.4, .8, 2.9, 5.8, -T, 0); box(1.6, 3.2, 2.7, 5.8, -T, 0);
  box(-4, 4, 0, 5.8, -9, -1.4); box(-4, -3.9, 0, 5.8, -1.4, -T); box(3.9, 4, 0, 5.8, -1.4, -T);
  box(-4.1, 4.1, 5.8, 6.1, -9, .15, M('#e9e2d4', .8));
  // interior
  const inner = M('#f4ead8', .9);
  box(-3.9, 3.9, 0, .02, -1.4, -T, M('#b9a184', .7));
  box(-3.9, 3.9, 3.0, 3.1, -1.4, -T, inner);
  const backW = mesh(new THREE.PlaneGeometry(7.8, 3), inner, 0, 1.5, -1.39, g);
  // vidro
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), new THREE.MeshStandardMaterial({ color: '#cfe8f5', roughness: .04, metalness: .1, transparent: true, opacity: .22, envMapIntensity: 1.6 }));
  glass.position.set(-1.3, 1.7, -.12); g.add(glass);
  box(-3.4, .8, .45, .55, -.2, .05, M('#3a3a3a', .4, .6));
  // porta
  const hinge = new THREE.Group(); hinge.position.set(1.6, 0, -.15); g.add(hinge);
  const doorMat = M('#6d4428', .55);
  mesh(new THREE.BoxGeometry(1.6, 2.7, .08), doorMat, .8, 1.35, 0, hinge);
  mesh(new THREE.BoxGeometry(1.1, 1.2, .1), new THREE.MeshStandardMaterial({ color: '#bcd9ea', roughness: .05, transparent: true, opacity: .45 }), .8, 1.8, 0, hinge);
  mesh(new THREE.SphereGeometry(.06), M('#d9b44a', .3, .9), 1.4, 1.3, .08, hinge);
  // letreiro
  const signTex = ctex(1024, 200, (gg, w, h) => {
    gg.fillStyle = L.signBg; gg.fillRect(0, 0, w, h); noise(gg, w, h, .05, 2000);
    gg.strokeStyle = 'rgba(255,255,255,.8)'; gg.lineWidth = 6; gg.strokeRect(14, 14, w - 28, h - 28);
    gg.fillStyle = '#fff'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
    gg.font = '900 104px Inter'; gg.fillText(L.nome, w / 2, h / 2 - 18);
    gg.font = '700 38px Inter'; gg.fillText(L.sub, w / 2, h / 2 + 58);
  });
  const sign = mesh(new THREE.BoxGeometry(7.2, 1.4, .18), [M(L.signBg), M(L.signBg), M(L.signBg), M(L.signBg), M('#fff', .5, 0, { map: signTex, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: .12 }), M(L.signBg)], 0, 4.55, .1, g);
  // toldo listrado com bordas recortadas
  const awTex = ctex(1024, 256, (gg, w, h) => {
    const n = 14, sw = w / n;
    for (let i = 0; i < n; i++) { gg.fillStyle = L.aw[i % 2]; gg.fillRect(i * sw, 0, sw, h * .78); gg.beginPath(); gg.arc((i + .5) * sw, h * .78, sw / 2, 0, Math.PI); gg.fill(); }
  });
  const awM = new THREE.MeshStandardMaterial({ map: awTex, roughness: .8, alphaTest: .5, side: THREE.DoubleSide, transparent: false });
  awTex.premultiplyAlpha = false;
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.5), awM); aw.castShadow = true; aw.receiveShadow = true;
  aw.position.set(0, 3.2, .62); aw.rotation.x = -Math.PI / 2 + .55; g.add(aw);
  // conteúdo da vitrine
  const items = []; // {obj, at}
  const it = (o, at) => { items.push({ o, at, s: o.scale.clone() }); g.add(o); return o; };
  const shelfM = M('#8a6a4c', .7);
  const extras = [];
  if (key === 'padaria') {
    for (const y of [.95, 1.65, 2.35]) mesh(new THREE.BoxGeometry(2.4, .06, .5), shelfM, -2.1, y, -.85, g);
    const breadM = M('#c4803c', .55), breadM2 = M('#a8652a', .6);
    let k = 0;
    for (const y of [.95, 1.65, 2.35]) for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .22, 6, 12), i % 2 ? breadM : breadM2);
      b.rotation.z = Math.PI / 2; b.rotation.y = .3 * (R(k) - .5); b.position.set(-3.1 + i * .38, y + .1, -.85 + (R(k + 3) - .5) * .2); b.castShadow = true;
      it(b, k % 3 === 0 ? 0 : .1 + R(k + 7) * .7); k++;
    }
    // forno novo
    const oven = new THREE.Group(); oven.position.set(-.2, 0, -.95);
    mesh(new RoundedBoxGeometry(1.1, 1.6, .7, 3, .05), M('#b9bec4', .25, .85), 0, .8, 0, oven);
    mesh(new THREE.BoxGeometry(.8, .5, .02), M('#ff8a2a', .3, 0, { emissive: '#ff6a00', emissiveIntensity: 2.2 }), 0, .95, .36, oven);
    mesh(new THREE.BoxGeometry(.85, .06, .05), M('#2b2b2b', .3, .7), 0, 1.3, .38, oven);
    it(oven, .05);
    extras.push('steam');
  } else if (key === 'mercado') {
    for (const y of [.75, 1.35, 1.95, 2.55]) mesh(new THREE.BoxGeometry(4, .05, .55), M('#c9ccd0', .4, .5), -1.3, y, -.85, g);
    const cores = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#8ac926', '#ff7ab6', '#ffffff'];
    let k = 0;
    for (const y of [.75, 1.35, 1.95, 2.55]) for (let i = 0; i < 12; i++) {
      const c = cores[(i * 3 + k) % cores.length]; const h = .22 + R(k) * .18;
      const o = i % 3 === 2 ? new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, h, 14), M(c, .35, .4)) : new THREE.Mesh(new THREE.BoxGeometry(.24, h, .2), M(c, .6));
      o.position.set(-3.1 + i * .31, y + h / 2 + .03, -.85); o.castShadow = true;
      it(o, i % 4 === 0 ? 0 : .05 + R(k + 9) * .8); k++;
    }
  } else {
    mesh(new THREE.CylinderGeometry(.025, .025, 3.6, 8), M('#cfd3d8', .3, .9), -1.3, 2.45, -.75, g).rotation.z = Math.PI / 2;
    const cores = ['#ff6b9a', '#4ecdc4', '#ffd43b', '#5e60ce', '#ff924c', '#e5e5e5', '#2d6cdf', '#c1121f'];
    for (let i = 0; i < 9; i++) {
      const sh = new THREE.Group(); sh.position.set(-2.95 + i * .4, 2.45, -.75);
      mesh(new THREE.BoxGeometry(.36, .7, .05), M(cores[i % 8], .8), 0, -.42, 0, sh);
      mesh(new THREE.BoxGeometry(.6, .16, .05), M(cores[i % 8], .8), 0, -.14, 0, sh);
      sh.rotation.y = .9; it(sh, i % 4 === 0 ? 0 : .05 + R(i) * .8);
    }
    // manequim
    const mq = new THREE.Group(); mq.position.set(.1, 0, -.8);
    mesh(new THREE.CylinderGeometry(.03, .2, .9, 12), M('#222', .4), 0, .45, 0, mq);
    mesh(new THREE.CapsuleGeometry(.2, .5, 6, 12), M('#ff4d6d', .7), 0, 1.25, 0, mq);
    mesh(new THREE.SphereGeometry(.13, 16, 12), M('#eee', .4), 0, 1.75, 0, mq);
    it(mq, .1);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .45), new THREE.MeshBasicMaterial({ map: ctex(512, 160, (gg, w, h) => { gg.fillStyle = '#ff2e63'; gg.beginPath(); gg.roundRect(0, 0, w, h, 30); gg.fill(); gg.fillStyle = '#fff'; gg.font = '900 84px Inter'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('NOVIDADE', w / 2, h / 2 + 4); }), transparent: true }));
    tag.position.set(-1.6, 1.05, -.09); tag.rotation.z = .08; it(tag, .5);
  }
  const light = new THREE.PointLight('#ffcf8a', 0, 7, 1.6); light.position.set(-1.2, 2.7, -.8); g.add(light);
  shops[key] = { g, hinge, items, light, extras, L };
}
for (const k of Object.keys(LOJAS)) makeShop(k);
// prédios entre as lojas
{
  const cores = ['#d9c7b0', '#b7c4cf', '#e4d9c3', '#c9b8a6', '#bfcab7', '#e0c2b2', '#c4c0d8'];
  const ocupado = Object.values(LOJAS).map(l => l.x);
  let x = STREET_X1 - 4, i = 0;
  while (x > STREET_X0) {
    const w = 7 + R(i) * 4;
    const cx = x - w / 2;
    if (!ocupado.some(o => Math.abs(o - cx) < 4 + w / 2 + .2)) filler(cx, w - .3, 7 + R(i + 5) * 8, cores[i % cores.length]);
    else { x = ocupado.find(o => Math.abs(o - cx) < 4 + w / 2 + .2) - 4.2; i++; continue; }
    x -= w; i++;
  }
  for (const L of Object.values(LOJAS)) { tree(L.x + 6.2, -4.7, 1); tree(L.x - 6.4, -4.7, .9); }
  for (let x2 = 30; x2 > STREET_X0; x2 -= 23) if (![-60, -110, -160, -192].some(o => Math.abs(x2 - o) < 9)) tree(x2, 5.0, 1.05);
}

// ---------- personagens ----------
function makePerson(o) {
  const g = new THREE.Group();
  const shirt = M(o.shirt, .75), pants = M(o.pants, .8), skin = M(o.skin, .55), dark = M('#24262b', .5), hairM = M(o.hairColor || '#2a1c14', .7);
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * .11, .88, 0); g.add(hip);
    mesh(new THREE.CapsuleGeometry(.085, .3, 6, 12), pants, 0, -.21, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -.43; hip.add(knee);
    mesh(new THREE.CapsuleGeometry(.075, .3, 6, 12), pants, 0, -.2, 0, knee);
    mesh(new RoundedBoxGeometry(.14, .09, .27, 2, .04), dark, 0, -.42, .05, knee);
    legs.push({ hip, knee });
  }
  mesh(new THREE.SphereGeometry(.2, 20, 14), pants, 0, .92, 0, g).scale.set(1.1, .55, .8);
  const torso = mesh(new THREE.CapsuleGeometry(.2, .36, 8, 16), shirt, 0, 1.17, 0, g); torso.scale.set(1.12, 1, .74);
  if (o.apron) mesh(new RoundedBoxGeometry(.36, .55, .03, 2, .01), M(o.apron, .8), 0, 1.03, .155, g);
  mesh(new THREE.CylinderGeometry(.065, .07, .12, 12), skin, 0, 1.45, 0, g);
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .27, 1.38, 0); g.add(sh);
    mesh(new THREE.SphereGeometry(.085, 12, 10), shirt, 0, 0, 0, sh);
    mesh(new THREE.CapsuleGeometry(.068, .18, 6, 12), shirt, 0, -.13, 0, sh);
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el);
    mesh(new THREE.CapsuleGeometry(.055, .18, 6, 12), skin, 0, -.12, 0, el);
    mesh(new THREE.SphereGeometry(.072, 14, 10), skin, 0, -.27, 0, el);
    arms.push({ sh, el });
  }
  const head = new THREE.Group(); head.position.y = 1.67; g.add(head);
  mesh(new THREE.SphereGeometry(.2, 28, 20), skin, 0, 0, 0, head).scale.set(1, 1.05, .98);
  for (const s of [-1, 1]) {
    mesh(new THREE.SphereGeometry(.045, 10, 8), skin, s * .195, -.01, 0, head);
    mesh(new THREE.SphereGeometry(.03, 12, 10), M('#ffffff', .3), s * .072, .025, .17, head);
    mesh(new THREE.SphereGeometry(.02, 10, 8), M('#18120e', .2), s * .072, .025, .192, head);
    const br = mesh(new RoundedBoxGeometry(.07, .015, .02, 1, .006), hairM, s * .072, .085, .182, head); br.rotation.z = -s * .12;
  }
  mesh(new THREE.SphereGeometry(.032, 10, 8), skin, 0, -.02, .2, head);
  const smile = mesh(new THREE.TorusGeometry(.055, .011, 8, 16, Math.PI), M('#5a2620', .5), 0, -.065, .18, head); smile.rotation.z = Math.PI;
  const mouth = mesh(new THREE.SphereGeometry(.05, 14, 10), M('#6e1d22', .5), 0, -.085, .165, head); mouth.scale.set(1, .6, .35); mouth.visible = false;
  if (o.mustache) mesh(new THREE.CapsuleGeometry(.025, .1, 4, 8), M('#3a2618', .7), 0, -.05, .19, head).rotation.z = Math.PI / 2;
  const half = (r) => new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  if (o.hair === 'cap') {
    mesh(half(.212), M(o.hat, .6), 0, .03, 0, head);
    const brim = mesh(new THREE.CylinderGeometry(.15, .15, .02, 24, 1, false, -Math.PI / 2, Math.PI), M(o.hat, .6), 0, .05, .14, head);
  } else if (o.hair === 'helmet') {
    mesh(new THREE.SphereGeometry(.255, 28, 18, 0, Math.PI * 2, 0, Math.PI * .58), M(o.hat, .22, .1), 0, .0, 0, head);
    mesh(new THREE.CylinderGeometry(.2, .2, .025, 24, 1, false, -Math.PI / 2, Math.PI), M('#1f2329', .2, .2), 0, .1, .12, head);
    mesh(new THREE.TorusGeometry(.252, .018, 8, 40), M('#ffffff', .4), 0, .02, 0, head).rotation.x = Math.PI / 2;
  } else if (o.hair === 'chef') {
    mesh(half(.21), M('#ffffff', .8), 0, .03, 0, head);
    mesh(new THREE.CylinderGeometry(.17, .19, .2, 20), M('#ffffff', .8), 0, .2, 0, head);
    mesh(new THREE.SphereGeometry(.21, 20, 14), M('#ffffff', .8), 0, .34, 0, head).scale.set(1, .6, 1);
  } else if (o.hair === 'bun') {
    mesh(half(.214), hairM, 0, .02, -.01, head).scale.set(1, 1.05, 1.02);
    mesh(new THREE.SphereGeometry(.09, 14, 10), hairM, 0, .18, -.13, head);
  } else if (o.hair === 'long') {
    mesh(half(.216), hairM, 0, .02, -.01, head).scale.set(1, 1.08, 1.05);
    mesh(new RoundedBoxGeometry(.42, .42, .16, 2, .06), hairM, 0, -.14, -.1, head);
  }
  return { g, legs, arms, head, smile, mouth };
}
function pose(p, o) {
  const [L, Rr] = p.legs, [A, B] = p.arms;
  L.hip.rotation.x = o.lh ?? 0; L.knee.rotation.x = o.lk ?? 0; Rr.hip.rotation.x = o.rh ?? 0; Rr.knee.rotation.x = o.rk ?? 0;
  A.sh.rotation.set(o.ax ?? 0, 0, -(o.az ?? .08)); B.sh.rotation.set(o.bx ?? 0, 0, (o.bz ?? .08));
  A.el.rotation.x = o.ae ?? -.15; B.el.rotation.x = o.be ?? -.15;
  p.head.rotation.set(o.hx ?? 0, o.hy ?? 0, o.hz ?? 0);
  p.mouth.visible = !!o.open; p.smile.visible = !o.open;
}
function walkPose(ph, extra = {}) {
  const s = Math.sin(ph);
  return { lh: s * .55, rh: -s * .55, lk: Math.max(0, -Math.cos(ph)) * .8, rk: Math.max(0, Math.cos(ph)) * .8, ax: -s * .5, bx: s * .5, ae: -.35, be: -.35, ...extra };
}

const ZE = { shirt: '#2f6bff', pants: '#26324f', skin: '#e8b48f', hair: 'cap', hat: '#ffc300' };
const ze = makePerson(ZE); scene.add(ze.g);
const DONOS = {
  padaria: makePerson({ shirt: '#ffffff', pants: '#5b606b', skin: '#c98d62', hair: 'chef', apron: '#efe0c4', mustache: true, hairColor: '#3a2618' }),
  mercado: makePerson({ shirt: '#ff7aa2', pants: '#34467a', skin: '#efc19c', hair: 'bun', hairColor: '#8e8e96', apron: '#2a9d5c' }),
  roupas: makePerson({ shirt: '#8e55d6', pants: '#1f4b8f', skin: '#a8714c', hair: 'long', hairColor: '#20140e' }),
};
for (const k in DONOS) scene.add(DONOS[k].g);

// bolsa de dinheiro
const bagLabel = ctex(256, 192, (g, w, h) => { g.fillStyle = '#d8b46a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d6b3c'; g.font = '900 120px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('R$', w / 2, h / 2 + 6); });
function makeBag() {
  const g = new THREE.Group();
  const pts = [[0, 0], [.13, .01], [.2, .07], [.235, .16], [.225, .25], [.17, .32], [.08, .37], [.05, .4], [.075, .44], [.05, .47], [0, .48]].map(([a, b]) => new THREE.Vector2(a, b));
  const geo = new THREE.LatheGeometry(pts, 32);
  mesh(geo, M('#d8b46a', .9), 0, 0, 0, g);
  mesh(new THREE.TorusGeometry(.055, .015, 8, 20), M('#b8312f', .6), 0, .4, 0, g).rotation.x = Math.PI / 2;
  for (const s of [1, -1]) { const lb = new THREE.Mesh(new THREE.PlaneGeometry(.22, .16), new THREE.MeshStandardMaterial({ map: bagLabel, roughness: .9 })); lb.position.set(0, .17, s * .232); if (s < 0) lb.rotation.y = Math.PI; g.add(lb); }
  return g;
}
const bag = makeBag(); scene.add(bag);
const handBag = makeBag(); scene.add(handBag);

// moto
function makeMoto() {
  const g = new THREE.Group();
  const red = M('#d62839', .28, .15), black = M('#1d1f23', .5), chrome = M('#d7dbe0', .18, 1);
  const wheels = [];
  for (const x of [-.62, .62]) {
    const w = new THREE.Group(); w.position.set(x, .27, 0); g.add(w);
    mesh(new THREE.TorusGeometry(.2, .075, 14, 32), M('#151515', .85), 0, 0, 0, w);
    mesh(new THREE.CylinderGeometry(.14, .14, .09, 24), chrome, 0, 0, 0, w).rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(.25, .03, .1), M('#8b9198', .3, .9), 0, 0, 0, w); sp.rotation.z = k * Math.PI / 5; }
    wheels.push(w);
  }
  const body = mesh(new THREE.SphereGeometry(.5, 32, 20), red, -.32, .58, 0, g); body.scale.set(1.15, .5, .52);
  mesh(new RoundedBoxGeometry(.75, .1, .36, 3, .04), black, .1, .36, 0, g);
  const shield = mesh(new RoundedBoxGeometry(.18, .85, .42, 3, .07), red, .5, .74, 0, g); shield.rotation.z = -.28;
  const fender = mesh(new THREE.SphereGeometry(.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), red, .62, .36, 0, g); fender.scale.set(1, .6, .55);
  mesh(new THREE.CylinderGeometry(.03, .03, .8, 10), chrome, .58, .7, 0, g).rotation.z = -.28;
  mesh(new THREE.CylinderGeometry(.025, .025, .7, 10), black, .37, 1.13, 0, g).rotation.x = Math.PI / 2;
  mesh(new RoundedBoxGeometry(.2, .14, .36, 3, .05), red, .4, 1.1, 0, g);
  const hl = mesh(new THREE.SphereGeometry(.08, 16, 12), M('#fffbe0', .1, 0, { emissive: '#fff6c8', emissiveIntensity: 1.5 }), .5, 1.08, 0, g); hl.scale.set(.6, 1, 1);
  for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(.01, .01, .25, 6), chrome, .38, 1.28, s * .3, g); mesh(new THREE.SphereGeometry(.045, 10, 8), chrome, .38, 1.4, s * .32, g).scale.set(.4, 1, 1.3); }
  mesh(new RoundedBoxGeometry(.7, .12, .36, 3, .05), black, -.3, .86, 0, g);
  mesh(new RoundedBoxGeometry(.5, .38, .46, 3, .06), M('#f4f4f2', .35), -.8, 1.02, 0, g);
  mesh(new THREE.BoxGeometry(.06, .06, .2), M('#ff3030', .3, 0, { emissive: '#ff2020', emissiveIntensity: .8 }), -.9, .62, 0, g);
  mesh(new THREE.CylinderGeometry(.04, .05, .5, 12), chrome, -.45, .3, .2, g).rotation.z = Math.PI / 2.2;
  return { g, wheels };
}
const moto = makeMoto(); scene.add(moto.g);
const rider = makePerson({ ...ZE, hair: 'helmet', hat: '#ffc300' });
rider.g.rotation.y = Math.PI / 2; rider.g.position.set(-.27, .05, 0); moto.g.add(rider.g);
const BAG_ON_MOTO = new THREE.Vector3(-.8, 1.21, 0);

// partículas: dinheiro
const billTex = ctex(256, 112, (g, w, h) => { g.fillStyle = '#8fd19e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2e7d4f'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#2e7d4f'; g.beginPath(); g.arc(w / 2, h / 2, 30, 0, 7); g.fill(); g.font = '900 34px Inter'; g.fillText('R$', 18, 46); g.fillText('100', w - 86, h - 22); });
const billMat = new THREE.MeshStandardMaterial({ map: billTex, roughness: .8, side: THREE.DoubleSide });
const coinMat = M('#f2b705', .25, 1);
const parts = [];
for (let i = 0; i < 46; i++) {
  const m = i % 3 === 2 ? new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .012, 20), coinMat) : new THREE.Mesh(new THREE.PlaneGeometry(.2, .088), billMat);
  m.castShadow = true; m.visible = false; scene.add(m); parts.push(m);
}
const starTex = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(.25, 'rgba(255,220,120,.7)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(64, 0); g.lineTo(70, 58); g.lineTo(128, 64); g.lineTo(70, 70); g.lineTo(64, 128); g.lineTo(58, 70); g.lineTo(0, 64); g.lineTo(58, 58); g.fill(); });
const sparks = [];
for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); sparks.push(s); }
const steamTex = ctex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const steam = [];
for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); steam.push(s); }

// ---------- utilidades de cena ----------
function hideAll() {
  ze.g.visible = false; moto.g.visible = false; bag.visible = false; handBag.visible = false;
  for (const k in DONOS) DONOS[k].g.visible = false;
  parts.forEach(p => p.visible = false); sparks.forEach(s => s.visible = false); steam.forEach(s => s.visible = false);
  for (const k in shops) setShop(k, 0, 0, 0);
}
function setShop(k, up, t, doorOpen) {
  const S = shops[k];
  for (const { o, at, s } of S.items) { const v = at === 0 ? 1 : eBack((up - at) / .25); o.scale.copy(s).multiplyScalar(Math.max(.0001, v)); o.visible = v > .001; }
  S.light.intensity = mix(1.5, 9, up);
  S.hinge.rotation.y = -doorOpen * 1.6;
}
function placeMoto(x, z, dist, t, rpose) {
  moto.g.visible = true; moto.g.position.set(x, 0, z); moto.g.rotation.y = Math.PI;
  moto.wheels.forEach(w => w.rotation.z = -dist / .27);
  pose(rider, { lh: -1.5, rh: -1.5, lk: 1.35, rk: 1.35, ax: -1.05, bx: -1.05, ae: -.35, be: -.35, ...rpose });
}
function motoBagWorld() { return moto.g.localToWorld(BAG_ON_MOTO.clone()); }
function look(px, py, pz, tx, ty, tz, t, shake = 1) {
  const sx = (Math.sin(t * 1.7) + Math.sin(t * 2.9) * .5) * .025 * shake, sy = (Math.sin(t * 2.3) + Math.sin(t * 3.7) * .5) * .02 * shake;
  cam.position.set(px + sx, py + sy, pz); cam.lookAt(tx, ty, tz); cam.updateMatrixWorld();
  sun.target.position.set(tx, 0, tz); sun.position.copy(sun.target.position).addScaledVector(sunDir, 60);
}
function moneyRain(cx, cz, lt, n = 40) {
  for (let i = 0; i < n; i++) {
    const p = parts[i]; p.visible = true;
    const fall = .9 + R(i) * .6, y = 5 - ((lt * fall + R(i + 3) * 5) % 5);
    p.position.set(cx + (R(i + 7) - .5) * 4 + Math.sin(lt * 2 + i) * .2, y, cz + (R(i + 11) - .5) * 2.5);
    p.rotation.set(lt * 2 + i, lt * 1.3 + i * 2, Math.sin(lt * 3 + i));
  }
}
function burst(o, lt, seed) {
  if (lt < 0 || lt > 2.2) return;
  for (let i = 0; i < 30; i++) {
    const p = parts[i]; p.visible = true;
    const a = R(seed + i) * Math.PI * 2, v = 1.2 + R(seed + i + 40) * 1.8, vy = 3 + R(seed + i + 80) * 2.5;
    let y = o.y + vy * lt - 4.9 * lt * lt; const ground = .17 + (i % 3 === 2 ? 0 : .002 * i);
    let tt = lt; if (y < ground) { y = ground; tt = (vy + Math.sqrt(vy * vy + 4 * 4.9 * (o.y - ground))) / 9.8; }
    p.position.set(o.x + Math.cos(a) * v * Math.min(lt, tt), y, o.z + Math.sin(a) * v * Math.min(lt, tt) * .7);
    if (lt < tt) p.rotation.set(lt * 9 + i, lt * 5, lt * 7); else p.rotation.set(-Math.PI / 2, 0, i);
  }
}

// ---------- cenas ----------
let TL3 = null;
const S3 = {
  intro(lt, s, t) {
    const zx = -10, zz = 5.4;
    ze.g.visible = true; ze.g.position.set(zx, .15, zz); ze.g.rotation.y = -.15;
    const w = Math.sin(t * 9) * .3;
    pose(ze, { bz: 2.6 + w, be: -.4, az: .12, hy: .1, open: Math.sin(t * 18) > 0 && lt > .3 && lt < 1.2 });
    placeMoto(zx - 1.2, 2.6, 0, t, {}); rider.g.visible = false;
    const k = eOut(lt / 1.7);
    look(zx + .2, mix(1.75, 1.6, k), mix(10.5, 9.0, k), zx, 1.25, zz, t);
  },
  dinheiro(lt, s, t) {
    const zx = -10, zz = 5.4;
    ze.g.visible = true; ze.g.position.set(zx, .15, zz); ze.g.rotation.y = .1;
    pose(ze, { bz: 2.75, be: -.1, az: .6 + Math.sin(t * 6) * .2, ae: -.6, open: true, hx: -.1 });
    handBag.visible = true; const hp = new THREE.Vector3(); ze.arms[1].el.updateWorldMatrix(true, false);
    ze.arms[1].el.localToWorld(hp.set(0, -.27, 0)); handBag.position.copy(hp).add(new THREE.Vector3(0, -.05, 0)); handBag.rotation.set(Math.PI, Math.sin(t * 3) * .3, 0);
    handBag.position.y += .02; handBag.rotation.x = 0; handBag.position.y -= .0;
    moneyRain(zx, zz, lt);
    placeMoto(zx - 1.2, 2.6, 0, t, {}); rider.g.visible = false;
    const a = mix(-.35, .3, eIO(lt / (s.end - s.start)));
    look(zx + Math.sin(a) * 4.6, 1.7, zz + Math.cos(a) * 4.6, zx, 1.35, zz, t);
  },
  rodando(lt, s, t) {
    rider.g.visible = true;
    const d = lt * 11, x = -14 - d, z = -1.7;
    placeMoto(x, z, d, t, { hy: .15 });
    moto.g.position.y = Math.sin(t * 25) * .006;
    bag.visible = true; bag.position.copy(motoBagWorld()); bag.rotation.y = Math.PI;
    const k = lt / (s.end - s.start);
    look(x - mix(3.2, 1.2, k), 1.25, z + mix(3.4, 4.6, k), x - .3, 1.0, z, t, 1.5);
  },
  loja(lt, s, t) {
    const S = shops[s.loja], L = S.L, dono = DONOS[s.loja];
    const RIDE = s.lead - .25, u = cl(lt / RIDE);
    const xs = L.x + 1.1, dist = 14 * (1 - eOutQ(u));
    const mx = xs + dist, mz = mix(-1.6, -2.75, eIO((u - .3) / .7));
    rider.g.visible = true;
    const th = s.lines[1].start - s.start - .15, fly = .7, got = lt - th - fly;
    const up = cl(got / 1.6);
    // piloto entrega o saco com o braço do lado da loja
    const reach = cl((lt - th + .3) / .3) * (1 - cl((lt - th - fly) / .4));
    placeMoto(mx, mz, 14 - dist, t, { ax: mix(-1.05, -.2, reach), az: mix(.08, 1.2, reach), ae: mix(-.35, -.1, reach), hy: mix(0, -.6, cl((lt - RIDE) / .5)), bz: lt > th + fly ? 2.5 + Math.sin(t * 10) * .3 : .08, bx: lt > th + fly ? 0 : -1.05, open: lt > th + fly });
    // dono sai da porta e vem até o meio-fio
    dono.g.visible = true;
    const walkT0 = RIDE - .3, walkD = 1.8, wk = cl((lt - walkT0) / walkD);
    const p0 = new THREE.Vector3(L.x + 2.4, .15, -7.7), p1 = new THREE.Vector3(xs + 1.25, .15, -4.2);
    dono.g.position.lerpVectors(p0, p1, eIO(wk));
    dono.g.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z) * (1 - eIO((wk - .7) / .3)) + mix(0, .5, cl((lt - th - fly) / .6));
    setShop(s.loja, up, t, cl((lt - walkT0 + .4) / .5));
    const jump = got > 0 && got < 1.5 ? Math.abs(Math.sin(got * 6.5)) * .28 : 0;
    dono.g.position.y += jump;
    if (wk > 0 && wk < 1) pose(dono, walkPose(wk * 9, { open: false }));
    else if (got > 0) pose(dono, { az: 2.75, bz: 2.75, ae: -.1, be: -.1, open: true, lk: jump > .05 ? .4 : 0, rk: jump > .05 ? .4 : 0, lh: jump > .05 ? -.3 : 0, rh: jump > .05 ? -.3 : 0, hx: -.15 });
    else if (lt > th - .3) pose(dono, { ax: -1.2, bx: -1.2, ae: -.4, be: -.4, open: true });
    else pose(dono, { bz: wk >= 1 ? 2.4 + Math.sin(t * 11) * .35 : .08, open: wk >= 1 });
    // saco: no baú -> voa -> nas mãos do dono, erguido
    bag.visible = true;
    const pA = motoBagWorld(), pB = dono.g.position.clone().add(new THREE.Vector3(0, 1.3, .3));
    if (lt < th) { bag.position.copy(pA); bag.rotation.set(0, 0, 0); }
    else if (got < 0) { const k = eIO((lt - th) / fly); bag.position.lerpVectors(pA, pB, k); bag.position.y += Math.sin(k * Math.PI) * .6; bag.rotation.set(k * 1.2, k * 6.28, 0); }
    else { const k = eOut(got / .35); bag.position.lerpVectors(pB, dono.g.position.clone().add(new THREE.Vector3(0, 2.15, 0)), k); bag.rotation.set(0, Math.sin(t * 4) * .3, Math.sin(t * 8) * .1); }
    burst(dono.g.position.clone().add(new THREE.Vector3(0, 2.2, 0)), got, s.loja.length * 17);
    // brilhos na fachada
    if (up > 0) sparks.forEach((sp, i) => {
      sp.visible = true; const a = R(i + 3); const ph = (t * .8 + R(i)) % 1;
      sp.position.set(L.x - 3.6 + a * 4.6, .9 + R(i + 9) * 2.4, -7 + .1 + R(i + 1) * .3);
      sp.scale.setScalar(Math.sin(ph * Math.PI) * .55 * up + .01); sp.material.opacity = Math.sin(ph * Math.PI);
    });
    if (S.extras.includes('steam') && up > 0) steam.forEach((sp, i) => {
      sp.visible = true; const ph = (t * .5 + i / steam.length) % 1;
      sp.position.set(L.x - 2.9 + (i % 5) * .45 + Math.sin(t + i) * .05, 1.1 + (i % 3) * .7 + ph * .6, -8.0);
      sp.scale.setScalar(.25 + ph * .4); sp.material.opacity = Math.sin(ph * Math.PI) * .8 * up;
    });
    // câmera: acompanha a chegada -> plano da loja -> aproxima na entrega
    const kArr = eIO((lt - RIDE * .35) / (RIDE * .9));
    const kIn = eIO((lt - th + .2) / 2.4);
    const camA = new THREE.Vector3(mx - 2.6, 1.2, mz + 4.2), tgA = new THREE.Vector3(mx - .2, 1.0, mz);
    const camB = new THREE.Vector3(L.x + .8, 2.1, 8.5), tgB = new THREE.Vector3(L.x + .8, 2.65, -7);
    const camC = new THREE.Vector3(xs - 1.6, 1.9, 3.6), tgC = new THREE.Vector3(xs + .2, 2.2, -6.2);
    const cp = camA.clone().lerp(camB, kArr).lerp(camC, kIn), tg = tgA.clone().lerp(tgB, kArr).lerp(tgC, kIn);
    look(cp.x, cp.y, cp.z, tg.x, tg.y, tg.z, t, 1);
  },
  resumo(lt, s, t) {
    const dur = s.end - s.start, k = lt / dur;
    for (const key in shops) setShop(key, 1, t, 0);
    sparks.forEach((sp, i) => {
      const L = Object.values(LOJAS)[i % 3]; sp.visible = true; const ph = (t * .9 + R(i)) % 1;
      sp.position.set(L.x - 3.5 + R(i + 3) * 4.5, 1 + R(i + 9) * 2.3, -6.8); sp.scale.setScalar(Math.sin(ph * Math.PI) * .7 + .01);
    });
    const keys = Object.keys(LOJAS), idx = Math.min(2, Math.floor(k * 3)), kk = k * 3 - idx, L = LOJAS[keys[idx]];
    rider.g.visible = true;
    const mx = L.x + 5 - kk * 9;
    placeMoto(mx, -1.7, lt * 9, t, { bz: 2.5 + Math.sin(t * 10) * .3, bx: 0, be: -.3, open: true });
    bag.visible = false;
    look(L.x + .8 + mix(1.2, -1.2, kk), 2.4, 9.5, L.x + .8, 2.6, -7, t, .5);
  },
  cta(lt, s, t) {
    const mx = -192, mz = -2.2;
    const kIn = eOut(lt / .9);
    rider.g.visible = true;
    placeMoto(mx + (1 - kIn) * 8, mz, (1 - kIn) * 8, t, lt > .7 ? { bz: 2.6 + Math.sin(t * 10) * .35, bx: 0, be: -.3, hy: -.55, open: lt > 1 && lt < 2.6 } : {});
    bag.visible = true; bag.position.copy(motoBagWorld()); bag.rotation.y = Math.PI;
    look(mx - 2.9, 1.45, mz + 3.7, mx - .1, 1.15, mz, t);
  },
};

// ---------- overlay 2D (legendas + CTA) ----------
function overlayCTA(c, lt, s) {
  const tb = s.lines[1].start - s.start;
  if (lt < tb) return;
  const k = eBack((lt - tb) / .55);
  const g = c.createLinearGradient(0, 1050, 0, 1920); g.addColorStop(0, 'rgba(8,20,60,0)'); g.addColorStop(1, `rgba(8,20,60,${.75 * cl((lt - tb) / .4)})`);
  c.fillStyle = g; c.fillRect(0, 1050, 1080, 870);
  for (let i = 0; i < 34; i++) {
    const tt = lt - tb, x = R(i) * 1080 + Math.sin(tt * 3 + i) * 40, y = -50 + tt * (300 + R(i + 4) * 300) + R(i + 8) * 200;
    c.save(); c.translate(x, y); c.rotate(tt * 5 + i); c.fillStyle = ['#FFD400', '#FF5C8A', '#2EB872', '#FFFFFF', '#3D7BFF'][i % 5]; c.fillRect(-11, -6, 22, 12); c.restore();
  }
  const pulse = 1 + Math.sin(lt * 6) * .03;
  c.save(); c.translate(540, 1430); c.scale(k * pulse, k * pulse);
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
  c.beginPath(); c.roundRect(-460, -95, 920, 190, 95); c.fillStyle = '#FFD400'; c.fill();
  c.shadowColor = 'transparent'; c.lineWidth = 8; c.strokeStyle = '#1d1d22'; c.stroke();
  c.fillStyle = '#1d1d22'; c.font = '900 76px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(TL3.cta.botao, 0, 4); c.restore();
  const k2 = eOut((lt - tb - .5) / .4);
  c.globalAlpha = k2; c.fillStyle = '#FFFFFF'; c.font = '800 46px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 12; c.fillText(TL3.cta.sub, 540, 1620); c.shadowColor = 'transparent'; c.globalAlpha = 1;
}

window.__setup = (tl) => { TL3 = tl; setTimeline(tl); };
window.__render = (t) => {
  const s = TL3.scenes.find(x => t >= x.start && t < x.end) || TL3.scenes[TL3.scenes.length - 1];
  const lt = t - s.start;
  hideAll(); rider.g.visible = true;
  S3[s.tipo](lt, s, t);
  renderer.render(scene, cam);
  ctx.drawImage(glc, 0, 0);
  // vinheta leve
  const v = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
  if (s.tipo === 'cta') overlayCTA(ctx, lt, s);
  drawCaption(ctx, t);
  if (lt < .12 && s.start > 0) { ctx.fillStyle = `rgba(255,255,255,${.5 * (1 - lt / .12)})`; ctx.fillRect(0, 0, VW, VH); }
  return out.toDataURL('image/jpeg', .93).split(',')[1];
};
window.__ready = true;
