import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import { ATOM_TASKS } from '@/data/labContent'

function shellDistribution(e: number): number[] {
  const caps = [2, 8, 8, 18]
  const shells: number[] = []
  let rest = e
  for (const c of caps) {
    if (rest <= 0) break
    const take = Math.min(c, rest)
    shells.push(take)
    rest -= take
  }
  return shells
}

function BohrModel({ p, n, e, size = 280 }: { p: number; n: number; e: number; size?: number }) {
  const shells = shellDistribution(e)
  const C = 140
  return (
    <svg viewBox="0 0 280 280" style={{ width: size, height: size }} className="mx-auto">
      {shells.map((count, si) => {
        const r = 52 + si * 30
        return (
          <g key={si}>
            <circle cx={C} cy={C} r={r} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" strokeDasharray="4 4" />
            {Array.from({ length: count }).map((_, i) => {
              const a = (i / count) * Math.PI * 2 - Math.PI / 2
              return (
                <circle key={i} cx={C + Math.cos(a) * r} cy={C + Math.sin(a) * r} r="6" fill="#facc15" stroke="#a16207" strokeWidth="1" />
              )
            })}
          </g>
        )
      })}
      <circle cx={C} cy={C} r="34" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.8)" strokeWidth="2" />
      <text x={C} y={C - 4} textAnchor="middle" fill="#fda4af" fontSize="13" fontWeight="bold">{p} p⁺</text>
      <text x={C} y={C + 12} textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="bold">{n} n</text>
    </svg>
  )
}

function Counter({ label, value, onChange, color, max = 20 }: { label: string; value: number; onChange: (v: number) => void; color: string; max?: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-2.5">
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="h-8 w-8 rounded-lg bg-slate-700 font-bold text-slate-200 hover:bg-slate-600">−</button>
        <span className="w-8 text-center text-lg font-bold text-white">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="h-8 w-8 rounded-lg bg-slate-700 font-bold text-slate-200 hover:bg-slate-600">+</button>
      </div>
    </div>
  )
}

function AtomExplorer() {
  const { t } = useI18n()
  const { elements } = useI18nData()
  const [z, setZ] = useState(8)
  const el = elements.find((x) => x.z === z)!
  const neutrons = Math.round(el.mass) - el.z
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-violet-300">{t('lab.atom.explorer')}</span>
        <select
          value={z}
          onChange={(e) => setZ(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white"
        >
          {elements.map((x) => (
            <option key={x.z} value={x.z}>{x.z} – {x.name} ({x.symbol})</option>
          ))}
        </select>
      </div>
      <BohrModel p={el.z} n={neutrons} e={el.z} />
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-rose-500/10 py-2 text-rose-300"><b>{el.z}</b> {t('lab.atom.protons')}</div>
        <div className="rounded-lg bg-slate-500/10 py-2 text-slate-300"><b>{neutrons}</b> {t('lab.atom.neutrons')}</div>
        <div className="rounded-lg bg-yellow-500/10 py-2 text-yellow-300"><b>{el.z}</b> {t('lab.atom.electrons')}</div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        {t('lab.atom.info', { name: el.name, z: el.z, mass: Math.round(el.mass), shells: shellDistribution(el.z).length })}
      </p>
    </div>
  )
}

function AtomBuilder({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const { elements } = useI18nData()
  const [taskIdx, setTaskIdx] = useState(0)
  const [p, setP] = useState(0)
  const [n, setN] = useState(0)
  const [e, setE] = useState(0)
  const [feedback, setFeedback] = useState<'none' | 'wrong' | 'right'>('none')
  const task = ATOM_TASKS[taskIdx]
  const el = elements.find((x) => x.z === task.z)!

  const correctN = useMemo(() => task.mass - task.z, [task])

  const check = () => {
    if (p === task.z && e === task.z && n === correctN) {
      setFeedback('right')
      if (taskIdx + 1 >= ATOM_TASKS.length) onComplete()
    } else {
      setFeedback('wrong')
    }
  }

  const next = () => {
    if (taskIdx + 1 >= ATOM_TASKS.length) {
      onComplete()
      return
    }
    setTaskIdx(taskIdx + 1)
    setP(0); setN(0); setE(0)
    setFeedback('none')
  }

  const done = feedback === 'right' && taskIdx + 1 >= ATOM_TASKS.length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-violet-300">{t('lab.atom.taskOf', { i: taskIdx + 1, n: ATOM_TASKS.length })}</div>
          <div className="text-lg font-bold text-white">
            {t('lab.atom.build', { name: el.name, symbol: el.symbol })}
          </div>
          <div className="text-sm text-slate-300">{t('lab.atom.taskInfo', { z: task.z, mass: task.mass, tip: t(`lab.atom.tip.${task.tipId}`) })}</div>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500 text-xl font-black text-white">{el.symbol}</div>
      </div>

      <BohrModel p={p} n={n} e={e} size={240} />

      <div className="mt-3 space-y-2">
        <Counter label={t('lab.atom.protonsUnit')} value={p} onChange={(v) => { setP(v); setFeedback('none') }} color="text-rose-300" />
        <Counter label={t('lab.atom.neutronsUnit')} value={n} onChange={(v) => { setN(v); setFeedback('none') }} color="text-slate-300" />
        <Counter label={t('lab.atom.electronsUnit')} value={e} onChange={(v) => { setE(v); setFeedback('none') }} color="text-yellow-300" />
      </div>

      <div className="mt-4 flex items-center gap-4">
        {feedback !== 'right' && (
          <button onClick={check} className="rounded-xl bg-violet-500 px-6 py-2.5 font-bold text-white transition hover:bg-violet-400">
            {t('lab.atom.checkAtom')}
          </button>
        )}
        {feedback === 'right' && !done && (
          <button onClick={next} className="rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400">
            {t('lab.atom.nextAtom')}
          </button>
        )}
        {feedback === 'wrong' && (
          <p className="text-sm text-rose-400">
            {p !== task.z
              ? t('lab.atom.errP', { z: task.z })
              : e !== p
                ? t('lab.atom.errE')
                : t('lab.atom.errN', { mass: task.mass, z: task.z })}
          </p>
        )}
        {feedback === 'right' && <p className="font-semibold text-emerald-400">{t('lab.atom.done', { name: el.name })}</p>}
      </div>
    </div>
  )
}

export default function AtomLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <AtomBuilder onComplete={onComplete ?? (() => {})} />
  return <AtomExplorer />
}
