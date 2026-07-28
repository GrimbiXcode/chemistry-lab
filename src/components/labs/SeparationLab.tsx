import { useState } from 'react'
import { useI18n } from '@/i18n'
import { METHODS, MIXTURES, type Method } from '@/data/labContent'


function MethodAnimation({ method }: { method: Method }) {
  if (method === 'filtrieren') {
    return (
      <svg viewBox="0 0 200 150" className="h-36 w-full rounded-xl bg-slate-950/70">
        <polygon points="60,25 140,25 108,80 108,115 92,115 92,80" fill="rgba(56,189,248,0.12)" stroke="#7dd3fc" strokeWidth="2" />
        <line x1="92" y1="80" x2="108" y2="80" stroke="#a3a3a3" strokeWidth="4" strokeDasharray="3 3" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={88 + i * 8} cy={55 - (i % 2) * 8} r="4" fill="#d6a35c" />
        ))}
        <rect x="75" y="120" width="50" height="24" fill="rgba(56,189,248,0.15)" stroke="#7dd3fc" strokeWidth="2" rx="4" />
        {[0, 1].map((i) => (
          <circle key={i} cx={95 + i * 8} r="3" fill="#38bdf8">
            <animate attributeName="cy" values="85;140" dur="1.4s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    )
  }
  if (method === 'verdampfen') {
    return (
      <svg viewBox="0 0 200 150" className="h-36 w-full rounded-xl bg-slate-950/70">
        <ellipse cx="100" cy="95" rx="55" ry="18" fill="rgba(56,189,248,0.15)" stroke="#7dd3fc" strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={85 + i * 15} cy="95" r="3.5" fill="#f8fafc" />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${85 + i * 15} 78 q4 -8 0 -16 q-4 -8 0 -14`} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </path>
        ))}
        <path d="M85 118 q5 -8 10 0 q5 -8 10 0 q5 -8 10 0" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
    )
  }
  if (method === 'magnet') {
    return (
      <svg viewBox="0 0 200 150" className="h-36 w-full rounded-xl bg-slate-950/70">
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={30 + (i % 5) * 30} cy={110 + Math.floor(i / 5) * 14} r="5" fill="#d6a35c" />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} r="4" fill="#334155">
            <animate attributeName="cx" values={`${60 + i * 40};100`} dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values="110;48" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <path d="M85 20 h30 v25 a15 15 0 0 1 -30 0 z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <rect x="85" y="20" width="30" height="8" fill="#cbd5e1" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 220 150" className="h-36 w-full rounded-xl bg-slate-950/70">
      <circle cx="50" cy="100" r="30" fill="rgba(56,189,248,0.2)" stroke="#7dd3fc" strokeWidth="2" />
      <rect x="45" y="55" width="10" height="20" fill="none" stroke="#7dd3fc" strokeWidth="2" />
      <path d="M55 60 h80 q20 0 20 20 v20" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <circle r="3.5" fill="#bae6fd">
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M50 95 v-35 h85 q20 0 20 20 v22" />
      </circle>
      <rect x="140" y="100" width="30" height="35" fill="rgba(56,189,248,0.12)" stroke="#7dd3fc" strokeWidth="2" rx="4" />
      {[0, 1].map((i) => (
        <circle key={i} cx={152 + i * 7} r="3" fill="#38bdf8">
          <animate attributeName="cy" values="102;130" dur="1.2s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M38 135 q4 -6 8 0 q4 -6 8 0 q4 -6 8 0" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

function SeparationExplorer() {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const mix = MIXTURES[idx]
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 text-sm font-semibold text-indigo-300">{t('lab.sep.explorer')}</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {MIXTURES.map((m, i) => (
          <button
            key={m.nameId}
            onClick={() => setIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${i === idx ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {t(`lab.sep.mix.${m.nameId}`)}
          </button>
        ))}
      </div>
      <MethodAnimation method={mix.method} />
      <div className="mt-3 rounded-xl bg-slate-800/70 p-3 text-sm">
        <b className="text-indigo-300">{t(`lab.sep.method.${mix.method}`)}</b>
        <span className="text-slate-300"> – {t(`lab.sep.principle.${mix.method}`)}. </span>
        <span className="text-slate-300">{t(`lab.sep.note.${mix.noteId}`)}</span>
      </div>
    </div>
  )
}

function SeparationWorkshop({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const methods: Method[] = [...METHODS]
  const [answers, setAnswers] = useState<Record<number, Method>>({})
  const [checked, setChecked] = useState(false)
  const allAnswered = Object.keys(answers).length === MIXTURES.length
  const allCorrect = MIXTURES.every((m, i) => answers[i] === m.method)

  const check = () => {
    setChecked(true)
    if (allCorrect) onComplete()
  }

  return (
    <div>
      <div className="space-y-3">
        {MIXTURES.map((m, i) => {
          const sel = answers[i]
          const right = checked && sel === m.method
          const wrong = checked && sel !== undefined && sel !== m.method
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-colors ${right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-900/60'}`}
            >
              <div className="mb-3 font-bold text-white">{t(`lab.sep.mix.${m.nameId}`)}</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {methods.map((me) => (
                  <button
                    key={me}
                    disabled={checked && allCorrect}
                    onClick={() => { setAnswers({ ...answers, [i]: me }); setChecked(false) }}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${sel === me ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {t(`lab.sep.method.${me}`)}
                  </button>
                ))}
              </div>
              {right && <p className="mt-2 text-sm text-emerald-300">{t(`lab.sep.note.${m.noteId}`)}</p>}
              {wrong && <p className="mt-2 text-sm text-rose-300">{t('lab.sep.wrong')}</p>}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {!(checked && allCorrect) && (
          <button
            onClick={check}
            disabled={!allAnswered}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('lab.common.check')}
          </button>
        )}
        {checked && allCorrect && <p className="font-semibold text-emerald-400">{t('lab.sep.done')}</p>}
      </div>
    </div>
  )
}

export default function SeparationLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <SeparationWorkshop onComplete={onComplete ?? (() => {})} />
  return <SeparationExplorer />
}
