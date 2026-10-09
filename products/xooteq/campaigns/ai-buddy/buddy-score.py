"""Score and sound design for "the noise and the light" (XOOTEQ, your AI buddy).

Synthesised from scratch with numpy, hit for hit on the film's own events: tools/design/cinema.mjs runs
    python3 -I buddy-score.py <events.json> <out.wav>
where events.json holds the scene's timeline (FILM_TIMES) and events (FILM_EVENTS).

Arc (foundations/video/video.json: arousal builds, a pattern interrupt, anticipation, a peak, a forward end):
  noise    a drone that brightens and rises, notification pings that thicken as cards fly past, whooshes
  freeze   everything sucked out into silence, one deep impact, a held breath
  light    a warm chord blooms; each notification the light takes becomes a soft glass chime
  knows    a gentle pulse under "rhythm", plucks for each person, near-silence for "quiet"
  hi       a sparkle that follows the pen, a bell when the dot lands, the chord opens
  logo     a rising swell into a three-note sonic logo over a soft sub, then a long tail
Key: F major (F, G, A, C, D pentatonic for the chimes), 72 bpm under the pulse. No sudden loud events
except the single impact; nothing is louder than the music around the words.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
ev = json.load(open(sys.argv[1]))
T, E = ev["times"], ev["events"]
LEN = float(ev["seconds"])
N = int(LEN * SR)
rng = np.random.default_rng(325)
out = np.zeros((2, N))


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def tt(n):
    return np.arange(n) / SR


def place(sig, t0, pan=0.0, gain=1.0):
    """Add a mono or stereo signal at time t0 (s), equal-power pan -1..1."""
    i = int(t0 * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)])
    j = min(N, i + sig.shape[1])
    if i < 0:
        sig, i = sig[:, -i:], 0
    out[:, i:j] += gain * sig[:, : j - i]


def env(n, a=0.01, r=0.3, curve=4.0):
    """Attack then exponential release over n samples."""
    t = tt(n)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(r, 1e-4))
    return e


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-0.5 * (np.maximum(0, lo - f) / (lo * 0.25 + 1)) ** 2) * np.exp(-0.5 * (np.maximum(0, f - hi) / (hi * 0.25 + 1)) ** 2)
    return np.fft.irfft(X, len(x))


def additive(freq, dur, bright, partials=12, detune=0.0):
    """A saw-like tone whose brightness can change over time (bright: array or number; higher = more partials)."""
    n = int(dur * SR)
    t = tt(n)
    b = np.broadcast_to(np.asarray(bright, dtype=float), (n,)) if np.ndim(bright) else np.full(n, float(bright))
    y = np.zeros(n)
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)) if np.ndim(freq) else np.full(n, float(freq))
    ph0 = rng.random() * 2 * np.pi
    phase = 2 * np.pi * np.cumsum(f) / SR + ph0
    for k in range(1, partials + 1):
        amp = np.exp(-(k - 1) / np.maximum(b, 0.3)) / k
        y += amp * np.sin(k * phase * (1 + detune * (k % 3 - 1) * 0.001))
    return y


def bell(freq, dur=2.5, bright=1.0):
    """Glass bell: inharmonic partials, fast decay of the upper ones."""
    n = int(dur * SR)
    t = tt(n)
    y = np.zeros(n)
    for ratio, amp, dec in [(1, 1, 1.6), (2.756, 0.45 * bright, 3.2), (5.404, 0.22 * bright, 5.5), (8.933, 0.1 * bright, 8.0)]:
        y += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * dec / dur * 2.2)
    return y * np.minimum(1, t / 0.003)


def pluck(freq, dur=1.6):
    """Soft plucked string (Karplus-Strong)."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p) * 0.6
    y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]
        buf[i % p] = 0.4985 * (buf[i % p] + buf[(i + 1) % p])
    return bandpass(y, 60, 5000)


def pad(chord, dur, attack=2.0, release=2.0, bright=2.2):
    n = int(dur * SR)
    t = tt(n)
    chord = [m if m >= 52 else m + 12 for m in chord]  # pads stay above the low end (the sub is for impacts only)
    y = sum(additive(hz(m), dur, bright, partials=8, detune=3) + additive(hz(m) * 1.004, dur, bright, partials=8) for m in chord)
    e = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, dur - t) / release)
    return bandpass(y * e / len(chord), 110, 7000)


def noise_whoosh(dur, lo, hi, peak=0.6):
    n = int(dur * SR)
    t = tt(n)
    x = bandpass(rng.normal(0, 1, n), lo, hi)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    e = e ** (1 / peak)
    return x * e / (np.abs(x).max() + 1e-9)


def reverb(stereo, seconds=3.2, mix=0.32, damp=4500):
    """Convolution with a synthetic, decorrelated, darkening tail."""
    n = int(seconds * SR)
    t = tt(n)
    wet = np.zeros_like(stereo)
    for ch in range(2):
        ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / seconds)
        ir = bandpass(ir, 120, damp)
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt((ir ** 2).sum())
        L = 1 << int(np.ceil(np.log2(stereo.shape[1] + n)))
        wet[ch] = np.fft.irfft(np.fft.rfft(stereo[ch], L) * np.fft.rfft(ir, L), L)[: stereo.shape[1]]
    return (1 - mix) * stereo + mix * wet * 3.0


# ------------------------------------------------------------------ 1. the noise (0 .. stop)
stop, freeze = T["stop"], T["freeze"]
dn = freeze + 0.25
t = tt(int(dn * SR))
bright = 1.2 + 9 * (t / dn) ** 2
drone = bandpass(sum(additive(hz(m) * (1 + 0.04 * (t / dn) ** 2), dn, bright, partials=16, detune=4) for m in [29, 36, 41]), 50, 12000)
drone *= np.minimum(1, t / 1.2) * (0.25 + 0.75 * (t / dn) ** 1.5) / 3
place(drone, 0, gain=0.42)
# Rising tension: a pitched riser and a tightening tremolo.
riser = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (3.2 * (t / dn) ** 2)) / SR) * (t / dn) ** 2.5
riser *= 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(3 + 18 * (t / dn) ** 2) / SR)
place(riser, 0, gain=0.08)
# Notification pings, thickening with speed (thinned so it stays a texture, not a din).
penta = [77, 79, 81, 84, 86, 89, 91, 93]
last = -1
for tp, pan in E["passes"]:
    if tp - last < 0.035:
        continue
    last = tp
    f = hz(penta[int(rng.integers(len(penta)))])
    n = int(0.16 * SR)
    ping = np.sin(2 * np.pi * f * tt(n)) * env(n, 0.002, 0.08, 6)
    place(ping, tp, pan * 0.9, 0.06 + 0.06 * (tp / stop))
for tw in E["rush"]:
    place(noise_whoosh(0.9, 300, 5000, 0.5), tw - 0.55, 0, 0.32)
# The freeze: a reverse swell ends exactly at the stop, then silence and one deep impact.
rs = int(0.55 * SR)
sw = noise_whoosh(0.55, 200, 7000, 2.0)[::-1] * np.linspace(0, 1, rs) ** 3
place(sw, freeze - 0.3, 0, 0.5)
out[:, int(stop * SR) - int(0.05 * SR): int(stop * SR)] *= np.linspace(1, 0, int(0.05 * SR))
out[:, int(stop * SR): int(T["lightIn"] * SR)] = 0
n = int(3.5 * SR)
tb = tt(n)
boom = np.sin(2 * np.pi * np.cumsum(32 + 38 * np.exp(-tb * 9)) / SR) * np.exp(-tb * 1.4)
boom += 0.35 * bandpass(rng.normal(0, 1, n), 40, 400) * np.exp(-tb * 18)
place(boom, stop, 0, 0.9)
# Held breath: a faint high tone and air under the question.
n = int((T["lightIn"] - stop) * SR)
tq = tt(n)
air = bandpass(rng.normal(0, 1, n), 2000, 9000) * 0.02 + np.sin(2 * np.pi * hz(96) * tq) * 0.012 * np.exp(-tq * 0.6)
place(air * np.minimum(1, tq / 0.8), stop + 0.2, 0, 1)
place(pad([41, 48, 53], T["lightIn"] - (T["q1"] + 1.2) + 0.6, attack=3.0, release=0.6, bright=1.0), T["q1"] + 1.2, 0, 0.12)

# ------------------------------------------------------------------ 2. the light
li, le = T["lightIn"], T["lightEnd"]
rise_t = tt(int((le - li) * SR))
flyby = np.sin(2 * np.pi * np.cumsum(hz(65) * 2 ** (rise_t / (le - li))) / SR) * np.sin(np.pi * rise_t / (le - li)) ** 2
place(flyby, li, 0, 0.05)
place(noise_whoosh(le - li, 600, 6000, 1.6), li, 0, 0.12)
lp = pad([41, 48, 57, 64, 67], T["hi"] - li + 1.0, attack=3.5, release=1.0, bright=2.4)
tl = li + tt(len(lp))
auto = np.interp(tl, [li, T["rhythm"], T["rhythm"] + 1.5, T["quiet"], T["quiet"] + 1.2, T["hi"], T["hi"] + 1.0], [1, 1, 0.6, 0.6, 0.12, 0.12, 0])
place(lp * auto, li, 0, 0.3)
chimes = [77, 79, 81, 84, 86, 89, 91]
last = -1
for k, (ta, pan) in enumerate(E["absorb"]):
    if ta - last < 0.09:
        continue
    last = ta
    f = hz(chimes[int(rng.integers(len(chimes)))])
    place(bell(f, 2.2, 0.7), ta + 0.45, pan, 0.05)
place(bell(hz(81), 4.0, 1.0), T["before"], 0, 0.12)
place(bell(hz(72), 4.0, 0.6), T["before"], 0, 0.1)

# ------------------------------------------------------------------ 3. it knows you
beat = 60 / 72
k0 = T["rhythm"] + 1.0
tk = k0
while tk < T["quiet"] + 0.6:
    n = int(0.5 * SR)
    tb = tt(n)
    kick = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-tb * 28)) / SR) * np.exp(-tb * 7)
    fade = min(1, (tk - k0) / 2) * (1 - min(1, max(0, (tk - T["quiet"]) / 0.6)))
    place(bandpass(kick, 45, 4000), tk, 0, 0.24 * fade)
    n2 = int(0.06 * SR)
    place(bandpass(rng.normal(0, 1, n2), 6000, 14000) * env(n2, 0.001, 0.03, 7), tk + beat / 2, 0.3, 0.035 * fade)
    tk += beat
for i, tm in enumerate(E["moments"]):
    place(bell(hz([69, 72, 74, 77, 81][i]), 1.8, 0.5), tm, -0.5 + i * 0.25, 0.09)
for i, tp in enumerate(E["people"]):
    place(pluck(hz([60, 64, 67, 69, 72][i]), 1.8), tp, [0.6, -0.2, -0.6, 0.2, 0.5][i], 0.22)
th = E["thread"]
n = int(2.4 * SR)
tt2 = tt(n)
string = additive(hz(69), 2.4, 2.0, 10) * np.minimum(1, tt2 / 0.5) * np.exp(-tt2 * 0.9)
place(string, th, -0.1, 0.09)
place(pad([45, 52, 57], T["peopleOut"] - T["people"] + 0.5, attack=1.5, release=1.0, bright=1.6), T["people"], 0, 0.1)
# Quiet: the music drops away; a message arrives muffled and is gently held back.
n = int(0.5 * SR)
ding = bandpass(bell(hz(84), 0.5, 0.6), 200, 1400)
place(ding, E["heldIn"] + 0.6, 0.6, 0.1)
n = int(1.2 * SR)
tb = tt(n)
whomp = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-tb * 1.5)) / SR) * np.sin(np.pi * np.clip(tb / 1.2, 0, 1))
place(whomp, E["heldBack"], 0.4, 0.06)
place(pad([53, 60], T["hi"] - T["quiet"] + 0.6, attack=1.4, release=0.8, bright=0.8), T["quiet"], 0, 0.07)

# ------------------------------------------------------------------ 4. hi
ps, pe = E["penStart"], E["penEnd"]
tk = ps
while tk < pe:
    f = hz(84 + int(rng.integers(0, 12)))
    n = int(0.25 * SR)
    place(np.sin(2 * np.pi * f * tt(n)) * env(n, 0.003, 0.12, 6), tk, -0.6 + 1.2 * (tk - ps) / (pe - ps), 0.035)
    tk += 0.045
place(noise_whoosh(pe - ps + 0.3, 3000, 12000, 1.2), ps - 0.1, 0, 0.05)
place(bell(hz(89), 4.0, 1.0), E["dotLand"], 0.1, 0.16)
place(bell(hz(77), 4.0, 0.8), E["dotLand"], -0.1, 0.12)
place(pad([41, 48, 57, 60, 64, 69], T["end"] - T["hi"] + 0.4, attack=1.6, release=1.0, bright=2.8), T["hi"] + 0.2, 0, 0.3)

# ------------------------------------------------------------------ 5. the logo
ce, tend = T["collapse"], T["end"]
n = int((tend - ce + 0.05) * SR)
tr = tt(n)
swell = sum(additive(hz(m), tend - ce + 0.05, 1 + 7 * (tr / (tend - ce)) ** 2, 12) for m in [53, 60, 65]) / 3 * (tr / (tend - ce)) ** 2.2
place(swell, ce, 0, 0.3)
place(noise_whoosh(tend - ce, 1500, 9000, 3.0), ce, 0, 0.18)
n = int(4.5 * SR)
tb = tt(n)
sub = np.sin(2 * np.pi * 43.65 * tb) * np.exp(-tb * 0.9) * np.minimum(1, tb / 0.01)
place(sub, tend, 0, 0.45)
for i, m in enumerate([69, 72, 77]):
    place(bell(hz(m), 4.5, 1.0), tend + 0.05 + i * 0.32, [-0.25, 0.25, 0][i], 0.2)
place(pad([41, 48, 53, 57, 64], LEN - tend, attack=0.4, release=2.6, bright=1.8), tend, 0, 0.22)
place(bell(hz(96), 3.0, 0.4), E["sweep"] + 0.4, 0.3, 0.05)

# ------------------------------------------------------------------ master
mix = reverb(out, 3.4, 0.3)
for ch in range(2):  # low cut at 30 Hz and a gentle shelf below 120 Hz
    X = np.fft.rfft(mix[ch]); f = np.fft.rfftfreq(mix.shape[1], 1 / SR)
    X *= 1 / np.sqrt(1 + (30 / np.maximum(f, 1)) ** 8) * (0.6 + 0.4 / np.sqrt(1 + (120 / np.maximum(f, 1)) ** -4))
    mix[ch] = np.fft.irfft(X, mix.shape[1])
mix[:, : int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
fade = int(1.4 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
mix /= np.abs(mix).max() / 0.89
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"score: {LEN:.1f} s, {len(E['passes'])} passes, {len(E['absorb'])} absorbed")
