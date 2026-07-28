import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { FACTORS } from '@/data/labContent'

type Kind = 'exo' | 'endo'

function EnergyDiagram() {
  const { t } = useI18n()
  const [kind, setKind] = useState<Kind>('exo')
  const exo = kind === 'exo'
  // y-Ebenen: Edukte / Produkte
  const eduY = exo ? 50 : 100
  const prodY = exo ? 100 : 50
  const path = `M20 ${eduY} H55 C75 ${eduY} 75 15 100 15 C125 15 125 ${prodY} 145 ${prodY} H180`
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-rose-300">{t('lab.energy.diagram')}</span>
        <div className="flex gap-2">
          <button onClick={() => setKind('exo')} className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${exo ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {t('lab.energy.exo')}
          </button>
          <button onClick={() => setKind('endo')} className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${!exo ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {t('lab.energy.endo')}
          </button>
        </div>
      </div>
      <svg viewBox="0 0 200 140" className="h-44 w-full rounded-xl bg-slate-950/70">
        <text x="8" y="15" fill="#94a3b8" fontSize="8">{t('lab.energy.axis')}</text>
        <text x="150" y="135" fill="#94a3b8" fontSize="8">{t('lab.energy.course')}</text>
        <path d={path} fill="none" stroke={exo ? '#fb7185' : '#38bdf8'} strokeWidth="3" style={{ transition: 'all 0.5s' }} />
        <line x1="20" y1={eduY} x2="55" y2={eduY} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" style={{ transition: 'all 0.5s' }} />
        <line x1="145" y1={prodY} x2="180" y2={prodY} stroke="#34d399" strokeWidth="2" strokeDasharray="4 3" style={{ transition: 'all 0.5s' }} />
        <text x="24" y={eduY - 5} fill="#fbbf24" fontSize="9" fontWeight="bold" style={{ transition: 'all 0.5s' }}>{t('lab.energy.educts')}</text>
        <text x="147" y={exo ? prodY + 12 : prodY - 5} fill="#34d399" fontSize="9" fontWeight="bold" style={{ transition: 'all 0.5s' }}>{t('lab.energy.products')}</text>
        <text x="82" y="12" fill="#cbd5e1" fontSize="8">{t('lab.energy.activation')}</text>
        <path d={exo ? 'M100 95 l0 20 m-4 -6 l4 6 l4 -6' : 'M100 55 l0 -20 m-4 6 l4 -6 l4 6'} stroke={exo ? '#fb7185' : '#38bdf8'} strokeWidth="2.5" fill="none" />
      </svg>
      <p className="mt-2 text-sm text-slate-300">
        {exo
          ? t('lab.energy.exoDesc')
          : t('lab.energy.endoDesc')}
      </p>
    </div>
  )
}

function Flask({ speed }: { speed: number }) {
  // speed 1..64 → Bläschenfrequenz
  const bubbles = Math.min(10, Math.ceil(speed / 6))
  return (
    <svg viewBox="0 0 120 140" className="h-36 w-28">
      <path d="M45 15 h30 v35 l22 55 a12 12 0 0 1 -11 17 h-52 a12 12 0 0 1 -11 -17 l22 -55 z" fill="rgba(56,189,248,0.12)" stroke="#7dd3fc" strokeWidth="2.5" />
      <path d="M36 80 h48 l11 25 a10 10 0 0 1 -9 15 h-52 a10 10 0 0 1 -9 -15 z" fill="rgba(244,114,182,0.35)" />
      {Array.from({ length: bubbles }).map((_, i) => (
        <circle key={i} cx={45 + (i * 37) % 32} r={2 + (i % 3)} fill="rgba(255,255,255,0.7)">
          <animate attributeName="cy" values="112;84" dur={`${Math.max(0.4, 2.6 - speed * 0.04)}s`} begin={`${i * 0.25}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur={`${Math.max(0.4, 2.6 - speed * 0.04)}s`} begin={`${i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

function ReactionTuner({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [sel, setSel] = useState<number[]>([0, 0, 0])
  const [runs, setRuns] = useState<number[]>([])
  const product = FACTORS.reduce((acc, f, i) => acc * f.mult[sel[i]], 1)
  const time = Math.max(1, Math.round(64 / product))
  const notMaxed = FACTORS.filter((f, i) => sel[i] < f.optionIds.length - 1).map((f) => t(`lab.energy.factor.${f.nameId}`))

  const run = () => {
    setRuns([...runs, time])
    if (time <= 1) onComplete()
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <Flask speed={product} />
          <div className="min-w-60 flex-1 space-y-3">
            {FACTORS.map((f, fi) => (
              <div key={f.key} className="flex flex-wrap items-center gap-2">
                <span className="w-28 text-sm font-semibold text-slate-300">{t(`lab.energy.factor.${f.nameId}`)}</span>
                <div className="flex gap-1.5">
                  {f.optionIds.map((oid, oi) => (
                    <button
                      key={oid}
                      onClick={() => setSel(sel.map((v, i) => (i === fi ? oi : v)))}
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${sel[fi] === oi ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {t(`lab.energy.opt.${oid}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={run} className="mt-4 rounded-xl bg-rose-500 px-6 py-2.5 font-bold text-white transition hover:bg-rose-400">
          {t('lab.energy.start')}
        </button>
      </div>

      {runs.length > 0 && (
        <div className="mt-4 space-y-2">
          {runs.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${r <= 1 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
              <span className="text-sm text-slate-400">{t('lab.energy.run', { i: i + 1 })}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${r <= 1 ? 'bg-emerald-400' : r <= 8 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${Math.max(3, 100 - r * 1.5)}%` }} />
              </div>
              <span className={`font-black ${r <= 1 ? 'text-emerald-300' : 'text-white'}`}>{r} s</span>
            </div>
          ))}
          {runs[runs.length - 1] > 1 ? (
            <p className="text-sm text-amber-300">
              {t('lab.energy.tooSlow', { missing: notMaxed.join(', ') || '–' })}
            </p>
          ) : (
            <p className="font-semibold text-emerald-400">{t('lab.energy.done')}</p>
          )}
        </div>
      )}
    </div>
  )
}

function FactorExplorer() {
  const { t } = useI18n()
  const [sel, setSel] = useState<number[]>([1, 1, 0])
  const product = useMemo(() => FACTORS.reduce((acc, f, i) => acc * f.mult[sel[i]], 1), [sel])
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-2 text-sm font-semibold text-rose-300">{t('lab.energy.tunerTitle')}</div>
      <p className="mb-3 text-sm text-slate-400">{t('lab.energy.tunerIntro')}</p>
      <div className="flex flex-wrap items-center gap-6">
        <Flask speed={product} />
        <div className="min-w-60 flex-1 space-y-3">
          {FACTORS.map((f, fi) => (
            <div key={f.key} className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-sm font-semibold text-slate-300">{t(`lab.energy.factor.${f.nameId}`)}</span>
              <div className="flex gap-1.5">
                {f.optionIds.map((oid, oi) => (
                  <button
                    key={oid}
                    onClick={() => setSel(sel.map((v, i) => (i === fi ? oi : v)))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${sel[fi] === oi ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {t(`lab.energy.opt.${oid}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-1 text-sm text-slate-300">
            {t('lab.energy.relSpeed', { n: product })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EnergyLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <ReactionTuner onComplete={onComplete ?? (() => {})} />
  return (
    <div className="space-y-4">
      <EnergyDiagram />
      <FactorExplorer />
    </div>
  )
}
