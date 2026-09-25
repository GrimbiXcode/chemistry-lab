import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { EQUATIONS, type MolDef as Mol } from '@/data/labContent'


function countAtoms(mols: Mol[], coefs: number[], offset: number): Record<string, number> {
  const out: Record<string, number> = {}
  mols.forEach((m, i) => {
    const c = coefs[offset + i]
    for (const [el, n] of Object.entries(m.atoms)) out[el] = (out[el] ?? 0) + n * c
  })
  return out
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** Grösster gemeinsamer Teiler aller Koeffizienten – ist er > 1, lässt sich die Gleichung noch kürzen. */
function commonDivisor(coefs: number[]): number {
  return coefs.reduce((acc, c) => gcd(acc, c), 0)
}

function CoefStepper({ value, onChange, disabled, label }: { value: number; onChange: (v: number) => void; disabled?: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={`${label} +1`}
        disabled={disabled || value >= 6}
        onClick={() => onChange(Math.min(6, value + 1))}
        className="h-7 w-10 rounded-lg bg-slate-700 font-bold text-white hover:bg-slate-600 disabled:opacity-40"
      >
        +
      </button>
      <div className={`flex h-11 w-12 items-center justify-center rounded-xl border-2 text-xl font-black ${value > 0 ? 'border-orange-400 text-orange-300' : 'border-slate-700 text-slate-600'}`}>
        {value > 0 ? value : '–'}
      </div>
      <button
        type="button"
        aria-label={`${label} −1`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-7 w-10 rounded-lg bg-slate-700 font-bold text-white hover:bg-slate-600 disabled:opacity-40"
      >
        −
      </button>
    </div>
  )
}

function EquationGame({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const eq = EQUATIONS[idx]
  const [coefs, setCoefs] = useState<number[]>(() => EQUATIONS[0].left.concat(EQUATIONS[0].right).map(() => 0))
  const [tried, setTried] = useState(false)

  const leftAtoms = useMemo(() => countAtoms(eq.left, coefs, 0), [eq, coefs])
  const rightAtoms = useMemo(() => countAtoms(eq.right, coefs, eq.left.length), [eq, coefs])
  const elements = useMemo(() => [...new Set([...Object.keys(leftAtoms), ...Object.keys(rightAtoms)])], [leftAtoms, rightAtoms])

  const balanced = elements.every((el) => (leftAtoms[el] ?? 0) === (rightAtoms[el] ?? 0) && (leftAtoms[el] ?? 0) > 0)
  // Konvention: kleinstmögliche ganzzahlige Koeffizienten (4 H₂ + 2 O₂ → 4 H₂O ist zwar
  // ausgeglichen, wird aber durch 2 gekürzt).
  const divisor = balanced ? commonDivisor(coefs) : 1
  const reducible = balanced && divisor > 1

  const setC = (i: number, v: number) => {
    const c = [...coefs]
    c[i] = v
    setCoefs(c)
    setTried(false)
  }

  const check = () => {
    setTried(true)
    if (balanced && !reducible && idx + 1 >= EQUATIONS.length) onComplete()
  }

  const next = () => {
    if (idx + 1 >= EQUATIONS.length) {
      onComplete()
      return
    }
    const nEq = EQUATIONS[idx + 1]
    setCoefs(nEq.left.concat(nEq.right).map(() => 0))
    setIdx(idx + 1)
    setTried(false)
  }

  const solved = tried && balanced && !reducible
  const done = solved && idx + 1 >= EQUATIONS.length

  const mols = [...eq.left, null, ...eq.right] as (Mol | null)[]
  let molIndex = -1

  return (
    <div>
      <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
        <div className="text-xs uppercase tracking-wide text-orange-300">{t('lab.eq.of', { i: idx + 1, n: EQUATIONS.length })}</div>
        <div className="mt-1 text-lg font-bold text-white">{t(`lab.eq.name.${eq.nameId}`)}</div>
        <div className="text-sm text-slate-300">{t('lab.eq.instruction')}</div>
      </div>

      <div className="rounded-xl bg-slate-950/70 p-6">
        <div className="flex flex-wrap items-end justify-center gap-3">
          {mols.map((m, i) => {
            if (m === null) return <span key={`arrow-${i}`} className="pb-3 text-3xl font-black text-orange-400">→</span>
            molIndex++
            const ci = molIndex
            const isLastLeft = i === eq.left.length - 1
            const isFirstRight = i === eq.left.length + 1
            return (
              <div key={i} className="flex items-end gap-3">
                {i > 0 && !isFirstRight && mols[i - 1] !== null && <span className="pb-3 text-2xl font-bold text-slate-500">+</span>}
                <div className="flex items-end gap-1">
                  <CoefStepper value={coefs[ci]} onChange={(v) => setC(ci, v)} disabled={solved} label={m.f} />
                  <span className="pb-2 text-3xl font-black text-white">{m.f}</span>
                </div>
                {isLastLeft && <span className="hidden" />}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {elements.map((el) => {
            const l = leftAtoms[el] ?? 0
            const r = rightAtoms[el] ?? 0
            const ok = l === r && l > 0
            return (
              <div key={el} className={`rounded-xl border px-4 py-2 text-center ${ok ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
                <div className="text-sm font-bold text-white">{el}</div>
                <div className={`text-sm ${ok ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {l} : {r} {ok ? '✓' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {!solved && (
          <button onClick={check} className="rounded-xl bg-orange-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-orange-400">
            {t('lab.eq.check')}
          </button>
        )}
        {solved && !done && (
          <button onClick={next} className="rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400">
            {t('lab.eq.next')}
          </button>
        )}
        {tried && !balanced && (
          <p className="text-sm text-rose-400">{t('lab.eq.wrong')}</p>
        )}
        {tried && reducible && (
          <p className="text-sm text-amber-300">{t('lab.eq.reducible', { g: divisor })}</p>
        )}
        {solved && <p className="font-semibold text-emerald-400">{t('lab.eq.done')}</p>}
      </div>
    </div>
  )
}

function EquationExplorer() {
  const { t } = useI18n()
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <div className="mb-3 text-sm font-semibold text-orange-300">{t('lab.eq.title')}</div>
      <div className="rounded-xl bg-slate-950/70 p-6 text-center">
        <div className="text-3xl font-black text-white">
          <span className="text-sky-300">2 H₂</span> + <span className="text-rose-300">O₂</span>{' '}
          <span className="text-orange-400">→</span> <span className="text-emerald-300">2 H₂O</span>
        </div>
        <div className="mt-4 grid gap-2 text-left text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-800/60 p-3"><b className="text-sky-300">{t('lab.eq.eductsB')}</b> {t('lab.eq.educts')}</div>
          <div className="rounded-lg bg-slate-800/60 p-3"><b className="text-orange-300">{t('lab.eq.arrowB')}</b> {t('lab.eq.arrow')}</div>
          <div className="rounded-lg bg-slate-800/60 p-3"><b className="text-emerald-300">{t('lab.eq.productsB')}</b> {t('lab.eq.products')}</div>
        </div>
        <div className="mt-4 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-200">
          {t('lab.eq.coefNote')}
        </div>
      </div>
    </div>
  )
}

export default function EquationLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <EquationGame onComplete={onComplete ?? (() => {})} />
  return <EquationExplorer />
}
