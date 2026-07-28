import { useState } from 'react'
import { useI18n } from '@/i18n'
import { PH_SUBSTANCES, PH_SORT_TASKS } from '@/data/labContent'


function phColor(ph: number): string {
  // red (0) -> orange -> yellow -> green (7) -> blue -> violet (14)
  const stops: [number, [number, number, number]][] = [
    [0, [239, 68, 68]],
    [3, [249, 115, 22]],
    [5, [234, 179, 8]],
    [7, [34, 197, 94]],
    [9, [20, 184, 166]],
    [11, [59, 130, 246]],
    [14, [139, 92, 246]],
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i]
    const [p1, c1] = stops[i + 1]
    if (ph >= p0 && ph <= p1) {
      const t = (ph - p0) / (p1 - p0)
      const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t))
      return `rgb(${c[0]},${c[1]},${c[2]})`
    }
  }
  return 'rgb(34,197,94)'
}

function PHExplorer({ onSelect }: { onSelect?: (id: string) => void }) {
  const { t } = useI18n()
  const [i, setI] = useState(6)
  const s = PH_SUBSTANCES[i]
  const color = phColor(s.ph)
  const phLabel = (ph: number): string =>
    ph < 3 ? t('lab.ph.strongAcid') : ph < 6.5 ? t('lab.ph.acid') : ph < 7.5 ? t('lab.ph.neutral') : ph < 11 ? t('lab.ph.base') : t('lab.ph.strongBase')
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-teal-300">{t('lab.ph.explorer')}</span>
        <span className="rounded-full px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${color}33`, color }}>
          pH {s.ph.toFixed(1)} · {phLabel(s.ph)}
        </span>
      </div>
      <div className="flex items-center gap-6">
        {/* beaker */}
        <svg viewBox="0 0 120 150" className="h-44 w-32 shrink-0">
          <path d="M25 15 h70 v15 h-10 v85 a15 15 0 0 1 -15 15 h-20 a15 15 0 0 1 -15 -15 v-85 h-10 z" fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth="3" />
          <path d="M38 55 h44 v60 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill={color} opacity="0.85" style={{ transition: 'fill 0.4s' }} />
          {[0, 1, 2].map((b) => (
            <circle key={b} cx={50 + b * 10} cy={100 - b * 12} r="3" fill="rgba(255,255,255,0.5)">
              <animate attributeName="cy" values={`${100 - b * 12};60;${100 - b * 12}`} dur={`${2 + b * 0.7}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">{t(`lab.ph.sub.${s.id}`)}</div>
          <p className="mt-1 text-sm text-slate-300">
            {t('lab.ph.colorNote')}
          </p>
          <input
            type="range"
            min={0}
            max={PH_SUBSTANCES.length - 1}
            value={i}
            onChange={(e) => { setI(Number(e.target.value)); onSelect?.(PH_SUBSTANCES[Number(e.target.value)].id) }}
            className="mt-3 w-full accent-teal-400"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            <span>{t(`lab.ph.sub.${PH_SUBSTANCES[0].id}`)}</span>
            <span>{t(`lab.ph.sub.${PH_SUBSTANCES[PH_SUBSTANCES.length - 1].id}`)}</span>
          </div>
        </div>
      </div>
      {/* scale */}
      <div className="mt-4">
        <div className="relative h-4 w-full rounded-full" style={{ background: 'linear-gradient(to right, rgb(239,68,68), rgb(249,115,22), rgb(234,179,8), rgb(34,197,94), rgb(20,184,166), rgb(59,130,246), rgb(139,92,246))' }}>
          <div
            className="absolute -top-1.5 h-7 w-1.5 rounded bg-white shadow"
            style={{ left: `${(s.ph / 14) * 100}%`, transition: 'left 0.4s' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>{t('lab.ph.scale0')}</span><span>{t('lab.ph.scale7')}</span><span>{t('lab.ph.scale14')}</span>
        </div>
      </div>
    </div>
  )
}

function PHSorter({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const cats: { key: 'sauer' | 'neutral' | 'basisch'; labelKey: string }[] = [
    { key: 'sauer', labelKey: 'lab.ph.acid' },
    { key: 'neutral', labelKey: 'lab.ph.neutral' },
    { key: 'basisch', labelKey: 'lab.ph.base' },
  ]
  const allAnswered = PH_SORT_TASKS.every((task) => answers[task.id])
  const allCorrect = PH_SORT_TASKS.every((task) => answers[task.id] === task.cat)

  return (
    <div>
      <PHExplorer />
      <p className="mb-3 mt-5 text-sm text-slate-300">
        {t('lab.ph.taskIntro')}
      </p>
      <div className="space-y-3">
        {PH_SORT_TASKS.map((task) => {
          const sel = answers[task.id]
          const right = checked && sel === task.cat
          const wrong = checked && sel && sel !== task.cat
          return (
            <div key={task.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
              <span className="font-semibold text-white">{t(`lab.ph.sub.${task.id}`)}</span>
              <div className="flex gap-2">
                {cats.map((c) => (
                  <button
                    key={c.key}
                    disabled={checked && allCorrect}
                    onClick={() => { setAnswers({ ...answers, [task.id]: c.key }); setChecked(false) }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${sel === c.key ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {t(c.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {!(checked && allCorrect) && (
          <button
            onClick={() => {
              setChecked(true)
              if (allCorrect) onComplete()
            }}
            disabled={!allAnswered}
            className="rounded-xl bg-teal-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('lab.common.check')}
          </button>
        )}
        {checked && !allCorrect && <p className="text-sm text-rose-400">{t('lab.ph.wrong')}</p>}
        {checked && allCorrect && <p className="font-semibold text-emerald-400">{t('lab.ph.done')}</p>}
      </div>
    </div>
  )
}

export default function PHLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <PHSorter onComplete={onComplete ?? (() => {})} />
  return <PHExplorer />
}
