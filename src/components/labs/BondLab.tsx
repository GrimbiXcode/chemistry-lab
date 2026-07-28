import { useState } from 'react'
import { useI18n } from '@/i18n'
import { NA_STEP_IDS, H2_TEXT_IDS, BOND_PAIRS } from '@/data/labContent'

function NaClSim() {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const transferred = step >= 1
  const charged = step >= 2
  const bonded = step >= 3
  const naX = bonded ? 105 : 70
  const clX = bonded ? 165 : 260

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-2 text-sm font-semibold text-amber-300">{t('lab.bond.ionicTitle')}</div>
      <svg viewBox="0 0 360 200" className="h-52 w-full rounded-xl bg-slate-950/70">
        {/* electron transfer path */}
        {step === 1 && (
          <circle r="6" fill="#facc15">
            <animate attributeName="cx" values={`${naX + 38};${clX - 38}`} dur="1.2s" fill="freeze" />
            <animate attributeName="cy" values="100;100" dur="1.2s" fill="freeze" />
          </circle>
        )}
        {/* Na */}
        <g style={{ transition: 'all 0.8s', transform: `translateX(${bonded ? 35 : 0}px)` }}>
          <circle cx="70" cy="100" r="32" fill="rgba(244,63,94,0.25)" stroke="#fb7185" strokeWidth="2.5" />
          <text x="70" y="106" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="bold">Na</text>
          {charged && <text x="102" y="70" fill="#fda4af" fontSize="16" fontWeight="bold">+</text>}
          {!transferred && <circle cx="108" cy="100" r="6" fill="#facc15" />}
        </g>
        {/* Cl */}
        <g style={{ transition: 'all 0.8s', transform: `translateX(${bonded ? -35 : 0}px)` }}>
          <circle cx="260" cy="100" r="38" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="2.5" />
          <text x="260" y="106" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="bold">Cl</text>
          {charged && <text x="288" y="66" fill="#6ee7b7" fontSize="16" fontWeight="bold">−</text>}
          {transferred && <circle cx="222" cy="100" r="6" fill="#facc15" />}
        </g>
        {bonded && (
          <text x="180" y="180" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">{t('lab.bond.naclDone')}</text>
        )}
      </svg>
      <div className="mt-3 rounded-xl bg-slate-800/70 p-3">
        <div className="text-sm font-bold text-amber-300">{t('lab.bond.stepOf4', { i: step + 1, title: t(`lab.bond.${NA_STEP_IDS[step]}.title`) })}</div>
        <p className="mt-1 text-sm text-slate-300">{t(`lab.bond.${NA_STEP_IDS[step]}.text`)}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setStep(Math.min(3, step + 1))}
          disabled={step >= 3}
          className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-40"
        >
          {t('lab.bond.nextStep')}
        </button>
        <button onClick={() => setStep(0)} className="rounded-xl bg-slate-700 px-5 py-2 font-semibold text-slate-200 hover:bg-slate-600">
          {t('lab.bond.reset')}
        </button>
      </div>
    </div>
  )
}

function H2Sim() {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-2 text-sm font-semibold text-amber-300">{t('lab.bond.atomicTitle')}</div>
      <svg viewBox="0 0 360 180" className="h-44 w-full rounded-xl bg-slate-950/70">
        <g style={{ transition: 'all 0.8s', transform: `translateX(${step * 35}px)` }}>
          <circle cx="90" cy="90" r="34" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="90" y="96" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="bold">H</text>
          {step < 2 && <circle cx="124" cy="90" r="6" fill="#facc15" />}
        </g>
        <g style={{ transition: 'all 0.8s', transform: `translateX(${-step * 35}px)` }}>
          <circle cx="270" cy="90" r="34" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="270" y="96" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="bold">H</text>
          {step < 2 && <circle cx="236" cy="90" r="6" fill="#facc15" />}
        </g>
        {step === 2 && (
          <>
            <circle cx="172" cy="90" r="6" fill="#facc15" />
            <circle cx="188" cy="90" r="6" fill="#facc15" />
            <text x="180" y="160" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="bold">{t('lab.bond.sharedPair')}</text>
          </>
        )}
      </svg>
      <div className="mt-3 rounded-xl bg-slate-800/70 p-3">
        <div className="text-sm font-bold text-amber-300">{t('lab.bond.stepOf3', { i: step + 1 })}</div>
        <p className="mt-1 text-sm text-slate-300">{t(`lab.bond.${H2_TEXT_IDS[step]}`)}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setStep(Math.min(2, step + 1))}
          disabled={step >= 2}
          className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-40"
        >
          {t('lab.bond.nextStep')}
        </button>
        <button onClick={() => setStep(0)} className="rounded-xl bg-slate-700 px-5 py-2 font-semibold text-slate-200 hover:bg-slate-600">
          {t('lab.bond.reset')}
        </button>
      </div>
    </div>
  )
}

function BondExplorer() {
  const { t } = useI18n()
  const [tab, setTab] = useState<'na' | 'h2'>('na')
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setTab('na')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'na' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          {t('lab.bond.tabIonic')}
        </button>
        <button onClick={() => setTab('h2')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'h2' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          {t('lab.bond.tabAtomic')}
        </button>
      </div>
      {tab === 'na' ? <NaClSim /> : <H2Sim />}
    </div>
  )
}

function BondClassifier({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [answers, setAnswers] = useState<Record<number, 'ion' | 'atom'>>({})
  const [checked, setChecked] = useState(false)
  const allAnswered = Object.keys(answers).length === BOND_PAIRS.length
  const allCorrect = BOND_PAIRS.every((p, i) => answers[i] === p.answer)

  const check = () => {
    setChecked(true)
    if (allCorrect) onComplete()
  }

  return (
    <div>
      <div className="space-y-3">
        {BOND_PAIRS.map((p, i) => {
          const sel = answers[i]
          const wrong = checked && sel !== p.answer
          const right = checked && sel === p.answer
          return (
            <div key={i} className={`rounded-xl border p-4 transition-colors ${right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white">{t(`lab.el.${p.aId}`)} + {t(`lab.el.${p.bId}`)}</span>
                  <span className="ml-2 text-xs text-slate-400">({t(`lab.bond.pair.${p.typesId}`)})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={checked && allCorrect}
                    onClick={() => { setAnswers({ ...answers, [i]: 'ion' }); setChecked(false) }}
                    className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${sel === 'ion' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {t('lab.bond.ionic')}
                  </button>
                  <button
                    disabled={checked && allCorrect}
                    onClick={() => { setAnswers({ ...answers, [i]: 'atom' }); setChecked(false) }}
                    className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${sel === 'atom' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {t('lab.bond.atomic')}
                  </button>
                </div>
              </div>
              {checked && right && <p className="mt-2 text-sm text-emerald-300">{t(`lab.bond.why.${p.whyId}`)}</p>}
              {checked && wrong && <p className="mt-2 text-sm text-rose-300">{t('lab.bond.wrong')}</p>}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {!(checked && allCorrect) && (
          <button
            onClick={check}
            disabled={!allAnswered}
            className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('lab.common.check')}
          </button>
        )}
        {checked && allCorrect && <p className="font-semibold text-emerald-400">{t('lab.bond.done')}</p>}
      </div>
    </div>
  )
}

export default function BondLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <BondClassifier onComplete={onComplete ?? (() => {})} />
  return <BondExplorer />
}
