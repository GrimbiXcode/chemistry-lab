import { useState } from 'react'
import { useI18n } from '@/i18n'
import { FORMULA_EXAMPLES, FORMULA_TASKS } from '@/data/labContent'

function FormulaExplorer() {
  const { t } = useI18n()
  const [i, setI] = useState(0)
  const ex = FORMULA_EXAMPLES[i]
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <div className="mb-3 text-sm font-semibold text-rose-300">{t('lab.formula.explorer')}</div>
      <div className="rounded-xl bg-slate-950/70 p-8 text-center">
        <div className="text-5xl font-black tracking-wide text-white">{ex.formula}</div>
        <div className="mt-2 text-lg font-semibold text-rose-300">{t(`lab.formula.name.${ex.nameId}`)}</div>
        <p className="mt-2 text-sm text-slate-300">{t(`lab.formula.desc.${ex.descId}`)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setI((i - 1 + FORMULA_EXAMPLES.length) % FORMULA_EXAMPLES.length)}
          className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-600"
        >
          {t('lab.formula.back')}
        </button>
        <span className="text-sm text-slate-400">{i + 1} / {FORMULA_EXAMPLES.length}</span>
        <button
          onClick={() => setI((i + 1) % FORMULA_EXAMPLES.length)}
          className="rounded-xl bg-rose-500 px-4 py-2 font-bold text-white hover:bg-rose-400"
        >
          {t('lab.formula.next')}
        </button>
      </div>
    </div>
  )
}

function FormulaCounter({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<'none' | 'wrong' | 'right'>('none')
  const task = FORMULA_TASKS[idx]

  const check = () => {
    const ok = task.parts.every((p) => Number(vals[p.el]) === p.count)
    setFeedback(ok ? 'right' : 'wrong')
    if (ok && idx + 1 >= FORMULA_TASKS.length) onComplete()
  }

  const next = () => {
    if (idx + 1 >= FORMULA_TASKS.length) {
      onComplete()
      return
    }
    setIdx(idx + 1)
    setVals({})
    setFeedback('none')
  }

  const done = feedback === 'right' && idx + 1 >= FORMULA_TASKS.length

  return (
    <div>
      <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
        <div className="text-xs uppercase tracking-wide text-rose-300">{t('lab.mol.taskOf', { i: idx + 1, n: FORMULA_TASKS.length })}</div>
        <div className="mt-1 text-3xl font-black text-white">{task.formula}</div>
        <div className="text-sm text-slate-300">{t('lab.formula.countPrompt', { name: t(`lab.formula.name.${task.nameId}`) })}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {task.parts.map((p) => (
          <label key={p.el} className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
            <span className="text-lg font-bold text-white">{p.el}</span>
            <input
              type="number"
              min={0}
              max={30}
              value={vals[p.el] ?? ''}
              disabled={feedback === 'right'}
              onChange={(e) => { setVals({ ...vals, [p.el]: e.target.value }); setFeedback('none') }}
              className="w-20 rounded-lg border border-slate-600 bg-slate-950 px-3 py-1.5 text-center text-lg font-bold text-white outline-none focus:border-rose-400"
              placeholder="?"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {feedback !== 'right' && (
          <button onClick={check} className="rounded-xl bg-rose-500 px-6 py-2.5 font-bold text-white transition hover:bg-rose-400">
            {t('lab.common.check')}
          </button>
        )}
        {feedback === 'right' && !done && (
          <button onClick={next} className="rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400">
            {t('lab.formula.nextFormula')}
          </button>
        )}
        {feedback === 'wrong' && (
          <p className="text-sm text-rose-400">
            {t(task.formula.includes('(') ? 'lab.formula.wrongBracket' : 'lab.formula.wrongPlain')}
          </p>
        )}
        {feedback === 'right' && <p className="font-semibold text-emerald-400">{t('lab.formula.done')}</p>}
      </div>
    </div>
  )
}

export default function FormulaLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <FormulaCounter onComplete={onComplete ?? (() => {})} />
  return <FormulaExplorer />
}
