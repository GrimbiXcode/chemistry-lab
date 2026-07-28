import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n'

interface P { x: number; y: number; vx: number; vy: number; ax: number; ay: number }

const N = 48

function ParticleSim() {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [temp, setTemp] = useState(10)
  const tempRef = useRef(temp)
  tempRef.current = temp
  const partsRef = useRef<P[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = (canvas.width = canvas.offsetWidth * 2)
    const H = (canvas.height = canvas.offsetHeight * 2)

    if (partsRef.current.length === 0) {
      const cols = 8
      const parts: P[] = []
      for (let i = 0; i < N; i++) {
        const gx = (i % cols) / (cols - 1)
        const gy = Math.floor(i / cols) / (N / cols - 1)
        parts.push({
          x: W * 0.2 + gx * W * 0.6,
          y: H * 0.35 + gy * H * 0.55,
          vx: 0, vy: 0,
          ax: W * 0.2 + gx * W * 0.6,
          ay: H * 0.35 + gy * H * 0.55,
        })
      }
      partsRef.current = parts
    }

    let raf: number
    const tick = () => {
      const t = tempRef.current
      const parts = partsRef.current
      const state = t < 34 ? 'solid' : t < 67 ? 'liquid' : 'gas'

      for (const p of parts) {
        if (state === 'solid') {
          const amp = 1 + t * 0.25
          p.vx += (p.ax - p.x) * 0.02 + (Math.random() - 0.5) * amp
          p.vy += (p.ay - p.y) * 0.02 + (Math.random() - 0.5) * amp
          p.vx *= 0.82; p.vy *= 0.82
        } else if (state === 'liquid') {
          const top = H * 0.45
          p.vx += (Math.random() - 0.5) * (2 + t * 0.08)
          p.vy += (Math.random() - 0.5) * (2 + t * 0.08) + 0.35
          p.vx *= 0.92; p.vy *= 0.92
          if (p.y < top) p.vy += 1.2
        } else {
          p.vx += (Math.random() - 0.5) * 1.5
          p.vy += (Math.random() - 0.5) * 1.5
          const sp = Math.hypot(p.vx, p.vy)
          const target = 4 + (t - 67) * 0.35
          if (sp > 0.01) { p.vx = (p.vx / sp) * target; p.vy = (p.vy / sp) * target }
        }
        p.x += p.vx; p.y += p.vy
        const m = 14
        if (p.x < m) { p.x = m; p.vx = Math.abs(p.vx) }
        if (p.x > W - m) { p.x = W - m; p.vx = -Math.abs(p.vx) }
        if (p.y < m) { p.y = m; p.vy = Math.abs(p.vy) }
        if (p.y > H - m) { p.y = H - m; p.vy = -Math.abs(p.vy) }
      }

      ctx.clearRect(0, 0, W, H)
      // beaker
      ctx.strokeStyle = 'rgba(148,163,184,0.5)'
      ctx.lineWidth = 4
      ctx.strokeRect(4, 4, W - 8, H - 8)
      // state label glow
      for (const p of parts) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16)
        g.addColorStop(0, 'rgba(103,232,249,1)')
        g.addColorStop(1, 'rgba(103,232,249,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#a5f3fc'
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const state = temp < 34 ? t('lab.state.fest') : temp < 67 ? t('lab.state.fluessig') : t('lab.state.gas')
  const stateDesc =
    temp < 34
      ? t('lab.state.fest.desc')
      : temp < 67
        ? t('lab.state.fluessig.desc')
        : t('lab.state.gas.desc')

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-cyan-300">{t('lab.particle.title')}</span>
        <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-bold text-cyan-300">{state}</span>
      </div>
      <canvas ref={canvasRef} className="h-56 w-full rounded-xl bg-slate-950/70" />
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>{t('lab.particle.cold')}</span>
          <span>{t('lab.particle.temp', { t: temp })}</span>
          <span>{t('lab.particle.hot')}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <p className="mt-2 text-sm text-slate-300">{stateDesc}</p>
      </div>
    </div>
  )
}

type StateKey = 'fest' | 'fluessig' | 'gas'

function dotsFor(state: StateKey, seed: number): { x: number; y: number }[] {
  const rnd = (() => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } })()
  const pts: { x: number; y: number }[] = []
  if (state === 'fest') {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++)
      pts.push({ x: 15 + c * 14 + (rnd() - 0.5) * 3, y: 22 + r * 13 + (rnd() - 0.5) * 3 })
  } else if (state === 'fluessig') {
    for (let i = 0; i < 26; i++) {
      const row = Math.floor(i / 7)
      pts.push({ x: 12 + rnd() * 76, y: 40 + row * 11 + rnd() * 8 })
    }
  } else {
    for (let i = 0; i < 14; i++) pts.push({ x: 8 + rnd() * 84, y: 8 + rnd() * 84 })
  }
  return pts
}

function StateMatcher({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const boxes: { id: string; state: StateKey }[] = [
    { id: 'A', state: 'fluessig' },
    { id: 'B', state: 'gas' },
    { id: 'C', state: 'fest' },
  ]
  const [answers, setAnswers] = useState<Record<string, StateKey | null>>({ A: null, B: null, C: null })
  const [checked, setChecked] = useState(false)
  const [done, setDone] = useState(false)

  const options: { key: StateKey; label: string }[] = [
    { key: 'fest', label: t('lab.state.fest') },
    { key: 'fluessig', label: t('lab.state.fluessig') },
    { key: 'gas', label: t('lab.state.gas') },
  ]

  const allAnswered = Object.values(answers).every(Boolean)
  const check = () => {
    setChecked(true)
    if (boxes.every((b) => answers[b.id] === b.state)) {
      setDone(true)
      onComplete()
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {boxes.map((b, bi) => {
          const pts = dotsFor(b.state, 42 + bi * 7)
          const isCorrect = checked && answers[b.id] === b.state
          const isWrong = checked && answers[b.id] !== b.state
          return (
            <div
              key={b.id}
              className={`rounded-xl border p-3 transition-colors ${
                isCorrect ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-900/60'
              }`}
            >
              <div className="mb-2 text-center text-sm font-bold text-slate-300">{t('lab.particle.container', { id: b.id })}</div>
              <svg viewBox="0 0 100 100" className="mb-3 h-32 w-full rounded-lg bg-slate-950/70">
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="2" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="#67e8f9" />
                ))}
              </svg>
              <div className="flex flex-col gap-1.5">
                {options.map((o) => (
                  <button
                    key={o.key}
                    disabled={done}
                    onClick={() => { setAnswers({ ...answers, [b.id]: o.key }); setChecked(false) }}
                    className={`rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                      answers[b.id] === o.key
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {!done && (
          <button
            onClick={check}
            disabled={!allAnswered}
            className="rounded-xl bg-cyan-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('lab.common.check')}
          </button>
        )}
        {checked && !done && <p className="text-sm text-rose-400">{t('lab.particle.wrong')}</p>}
        {done && <p className="font-semibold text-emerald-400">{t('lab.particle.done')}</p>}
      </div>
    </div>
  )
}

export default function ParticleLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <StateMatcher onComplete={onComplete ?? (() => {})} />
  return <ParticleSim />
}
