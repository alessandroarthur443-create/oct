"""Gera narração (TTS), linha do tempo (timeline.json), música e efeitos."""
import json, os, subprocess, wave, re
import numpy as np
from roteiro import CENAS, CTA_BOTAO, CTA_SUB

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "build")
os.makedirs(OUT, exist_ok=True)
SR = 44100
VOZ = os.environ.get("VOZ", "mb-br1")
GAP = 0.22


def tts(texto, caminho):
    raw = caminho + ".raw.wav"
    subprocess.run(["espeak-ng", "-v", VOZ, "-s", "168", "-p", "52", texto, "-w", raw],
                   check=True, capture_output=True)
    # reamostra, corta silêncio das pontas e dá um leve brilho na voz
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,"
                    "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                    "highpass=f=90,equalizer=f=3000:t=q:w=1:g=3,volume=1.6",
                    "-ar", str(SR), "-ac", "1", caminho], check=True)
    os.remove(raw)
    with wave.open(caminho) as w:
        dados = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return dados


timeline = {"scenes": [], "cta": {"botao": CTA_BOTAO, "sub": CTA_SUB}}
voz_clips = []
t = 0.0
n = 0
for cena in CENAS:
    sc = {k: v for k, v in cena.items() if k != "falas"}
    sc["start"] = round(t, 3)
    tt = t + cena["lead"]
    linhas = []
    for f in cena["falas"]:
        falado = f.get("tts") or f["txt"].replace("*", "")
        audio = tts(falado, os.path.join(OUT, f"fala_{n:02d}.wav"))
        n += 1
        d = len(audio) / SR
        linhas.append({"txt": f["txt"], "start": round(tt, 3), "end": round(tt + d, 3),
                       "semLegenda": f.get("semLegenda", False)})
        voz_clips.append((tt, audio))
        tt += d + GAP
    tt -= GAP
    sc["end"] = round(tt + cena["tail"], 3)
    sc["lines"] = linhas
    timeline["scenes"].append(sc)
    t = sc["end"]

TOTAL = t
timeline["duration"] = round(TOTAL, 3)
with open(os.path.join(OUT, "timeline.json"), "w") as fh:
    json.dump(timeline, fh, ensure_ascii=False, indent=1)
print(f"duração total: {TOTAL:.2f}s")

N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)


def env(n, a=0.005, d=0.3):
    x = np.arange(n) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)


def add(buf, t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g


# ---------- música (C - G - Am - F, 112 bpm) ----------
bpm = 112
beat = 60 / bpm
musica = np.zeros(N, np.float32)
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
acordes = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
padrao = [0, 1, 2, 1, 0, 2, 1, 2]  # arpejo em colcheias


def pluck(f, dur=0.35):
    n_ = int(dur * SR)
    x = np.arange(n_) / SR
    s = np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x) + 0.15 * np.sin(6 * np.pi * f * x)
    return (s * env(n_, 0.003, 0.12)).astype(np.float32)


def kick():
    n_ = int(0.25 * SR)
    x = np.arange(n_) / SR
    f = 50 + 90 * np.exp(-x * 30)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 14)).astype(np.float32)


def ruido(dur, dec, hp=True):
    n_ = int(dur * SR)
    r = rng.standard_normal(n_).astype(np.float32)
    if hp:
        r = np.diff(r, prepend=0)
    return r * env(n_, 0.001, dec)


barras = int(TOTAL / (4 * beat)) + 2
for b in range(barras):
    ac = acordes[b % 4]
    t0 = b * 4 * beat
    for k, p in enumerate(padrao):
        m = ac[p] + 12
        add(musica, t0 + k * beat / 2, pluck(nota(m)), 0.18)
    for k in (0, 2):
        add(musica, t0 + k * beat, pluck(nota(ac[0] - 24), 0.6), 0.35)
    for k in range(4):
        add(musica, t0 + k * beat, kick(), 0.55)
        add(musica, t0 + k * beat + beat / 2, ruido(0.06, 0.02), 0.05)
    for k in (1, 3):
        add(musica, t0 + k * beat, ruido(0.18, 0.05, hp=False), 0.12)

# ---------- efeitos ----------
sfx = np.zeros(N, np.float32)


def vrum():
    d = 1.3
    n_ = int(d * SR)
    x = np.arange(n_) / SR
    f = 60 + 110 * (1 - np.exp(-x * 2.5))
    fase = np.cumsum(f) / SR
    saw = 2 * (fase % 1) - 1
    trem = 0.7 + 0.3 * np.sin(2 * np.pi * 28 * x)
    a = np.minimum(1, x / 0.08) * np.exp(-np.maximum(0, x - 0.6) * 4)
    s = saw * trem * a
    # passa-baixa simples
    for _ in range(3):
        s = np.convolve(s, np.ones(12) / 12, mode="same")
    return s.astype(np.float32)


def ching():
    n_ = int(0.6 * SR)
    x = np.arange(n_) / SR
    s = (np.sin(2 * np.pi * 2093 * x) + 0.7 * np.sin(2 * np.pi * 2637 * x)) * env(n_, 0.002, 0.15)
    out = s.copy()
    k = int(0.09 * SR)
    out[k:] += s[: n_ - k] * 0.8
    return out.astype(np.float32)


def pop():
    n_ = int(0.12 * SR)
    x = np.arange(n_) / SR
    f = 300 + 900 * x / 0.12
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n_, 0.002, 0.05)).astype(np.float32)


def whoosh():
    n_ = int(0.35 * SR)
    x = np.arange(n_) / SR
    r = rng.standard_normal(n_)
    r = np.convolve(r, np.ones(30) / 30, mode="same")
    a = np.sin(np.pi * x / 0.35) ** 2
    return (r * a).astype(np.float32)


for sc in timeline["scenes"]:
    add(sfx, max(0, sc["start"] - 0.1), whoosh(), 0.5)
    if sc["tipo"] in ("rodando", "loja"):
        add(sfx, sc["start"], vrum(), 0.35)
    if sc["tipo"] == "loja":
        th = sc["lines"][1]["start"] - 0.1 + 0.6
        add(sfx, th, ching(), 0.35)
    if sc["tipo"] in ("intro",):
        add(sfx, sc["start"] + 0.1, pop(), 0.4)
    if sc["tipo"] == "cta":
        add(sfx, sc["lines"][1]["start"], pop(), 0.5)
        add(sfx, sc["lines"][1]["start"] + 0.05, ching(), 0.3)

# ---------- voz + ducking ----------
voz = np.zeros(N, np.float32)
for t0, a in voz_clips:
    add(voz, t0, a)
ativo = np.zeros(N, np.float32)
for t0, a in voz_clips:
    i = int(t0 * SR)
    ativo[i:i + len(a)] = 1
k = int(0.15 * SR)
ativo = np.convolve(ativo, np.ones(k) / k, mode="same")

# fade out final da música
fade = np.ones(N, np.float32)
fi = int((TOTAL - 1.2) * SR)
fade[fi:] = np.linspace(1, 0, N - fi).clip(0, 1)
fade[int(TOTAL * SR):] = 0


def salva(nome, sinal):
    sinal = sinal / max(1e-6, np.abs(sinal).max()) * 0.92
    pcm = (sinal * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, nome), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


musica /= np.abs(musica).max()
salva("mix_com_voz.wav", voz * 1.0 + musica * fade * (0.30 - 0.20 * ativo) + sfx * fade)
salva("mix_sem_voz.wav", musica * fade * 0.55 + sfx * fade)
print("áudio ok")
