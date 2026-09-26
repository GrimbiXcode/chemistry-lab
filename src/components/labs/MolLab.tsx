import { useState } from 'react'
import { useI18n } from '@/i18n'
import { MOL_SUBSTANCES, MOL_TASKS } from '@/data/labContent'
import { formatNumber } from '@/lib/format'

function MolExplorer() {
  const { t, lang } = useI18n()
  const fmt = (x: number): string => formatNumber(x, lang, 1)
  const [idx, setIdx] = useState(0)
  const [n, setN] = useState(1)
  const s = MOL_SUBSTANCES[idx]
  const mass = n * s.M
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 text-sm font-semibold text-purple-300">{t('lab.mol.explorer')}</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {MOL_SUBSTANCES.map((x, i) => (
          <button
            key={x.formula}
            onClick={() => setIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${i === idx ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {x.formula}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-slate-950/70 p-5 text-center">
        <div className="text-3xl font-black text-white">{s.formula} <span className="text-lg font-semibold text-slate-400">({t(`lab.mol.name.${s.nameId}`)})</span></div>
        <div className="mt-1 text-sm text-slate-300">{t('lab.mol.molarMass', { breakdown: s.breakdown, m: fmt(s.M) })}</div>
        <div className="mx-auto mt-4 max-w-sm">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{t('lab.mol.amount')}</span>
            <span className="font-bold text-white">{fmt(n)} mol</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={n}
            aria-label={t('lab.mol.amount')}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full accent-purple-400"
          />
        </div>
        <div className="mt-3 rounded-xl bg-purple-500/10 py-3 text-xl font-black text-purple-200">
          {t('lab.mol.formula', { n: fmt(n), m: fmt(s.M), mass: fmt(mass) })}
        </div>
      </div>
    </div>
  )
}

function MolWorkshop({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const [val, setVal] = useState('')
  const [feedback, setFeedback] = useState<'none' | 'wrong' | 'right'>('none')
  const task = MOL_TASKS[idx]

  const check = () => {
    // Dezimalkomma und -punkt akzeptieren, Leerzeichen ignorieren; leere Eingabe zählt als falsch.
    const parsed = Number(val.trim().replace(',', '.'))
    const ok = val.trim() !== '' && Math.abs(parsed - task.answer) < 1e-9
    setFeedback(ok ? 'right' : 'wrong')
    if (ok && idx + 1 >= MOL_TASKS.length) onComplete()
  }

  const next = () => {
    setIdx(idx + 1)
    setVal('')
    setFeedback('none')
  }

  const done = feedback === 'right' && idx + 1 >= MOL_TASKS.length

  return (
    <div>
      <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
        <div className="text-xs uppercase tracking-wide text-purple-300">{t('lab.mol.taskOf', { i: idx + 1, n: MOL_TASKS.length })}</div>
        <p className="mt-1 text-lg font-bold text-white">{t(`lab.mol.q.${task.qId}`)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={val}
          disabled={feedback === 'right'}
          onChange={(e) => { setVal(e.target.value); setFeedback('none') }}
          onKeyDown={(e) => { if (e.key === 'Enter') check() }}
          placeholder={t('lab.mol.placeholder')}
          className="w-44 rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-lg font-bold text-white outline-none focus:border-purple-400"
        />
        <span className="text-lg font-bold text-purple-300">{task.unit}</span>
        {feedback !== 'right' && (
          <button onClick={check} className="rounded-xl bg-purple-500 px-6 py-2.5 font-bold text-white transition hover:bg-purple-400">
            {t('lab.common.check')}
          </button>
        )}
        {feedback === 'right' && !done && (
          <button onClick={next} className="rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400">
            {t('lab.mol.next')}
          </button>
        )}
      </div>
      {feedback === 'wrong' && (
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          {t('lab.mol.wrong', { hint: t(`lab.mol.hint.${task.hintId}`) })}
        </p>
      )}
      {feedback === 'right' && <p className="mt-3 font-semibold text-emerald-400">{t('lab.mol.done', { emoji: done ? '🎉' : '' })}</p>}
    </div>
  )
}

export default function MolLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <MolWorkshop onComplete={onComplete ?? (() => {})} />
  return <MolExplorer />
}
