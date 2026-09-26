import { useState } from 'react'
import { CATEGORY_COLORS, CATEGORY_COLOR_KEYS, type ElementInfo } from '@/data/appData'
import { HUNTS } from '@/data/labContent'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import { formatNumber } from '@/lib/format'

function Table({ onSelect, selected, elements }: { onSelect: (el: ElementInfo) => void; selected?: number | null; elements: ElementInfo[] }) {
  const { t } = useI18n()
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
        {elements.map((el) => (
          <button
            key={el.z}
            type="button"
            aria-label={`${el.z} ${el.name}`}
            aria-pressed={selected === el.z}
            onClick={() => onSelect(el)}
            style={{ gridColumnStart: el.group, gridRowStart: el.period }}
            className={`flex aspect-square flex-col items-center justify-center rounded-md text-white transition hover:scale-110 hover:ring-2 hover:ring-white/70 ${CATEGORY_COLORS[el.cat]} ${
              selected === el.z ? 'ring-2 ring-white scale-110' : ''
            }`}
          >
            <span className="text-[9px] leading-none opacity-80">{el.z}</span>
            <span className="text-sm font-black leading-tight">{el.symbol}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORY_COLOR_KEYS.map((cat) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className={`h-3 w-3 rounded ${CATEGORY_COLORS[cat]}`} /> {t(`el.cat.${cat}`)}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Valenzelektronen der Hauptgruppen-Elemente; Helium ist mit 2 Elektronen bereits „voll“. */
function valence(el: ElementInfo): number {
  if (el.group === 18) return el.z === 2 ? 2 : 8
  if (el.group <= 2) return el.group
  return el.group - 10
}

function Explorer() {
  const { t, lang } = useI18n()
  const { elements } = useI18nData()
  const [sel, setSel] = useState<ElementInfo>(elements.find((e) => e.z === 8)!)
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 text-sm font-semibold text-emerald-300">{t('lab.periodic.title')}</div>
      <Table onSelect={setSel} selected={sel.z} elements={elements} />
      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl text-white ${CATEGORY_COLORS[sel.cat]}`}>
            <span className="text-[10px]">{sel.z}</span>
            <span className="text-2xl font-black">{sel.symbol}</span>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{sel.name}</div>
            <div className="text-sm text-slate-300">{t('lab.periodic.meta', { cat: sel.cat, group: sel.group, period: sel.period })}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-slate-300">{t('lab.periodic.ordnungszahl')}<br /><b className="text-white">{sel.z}</b></div>
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-slate-300">{t('lab.periodic.atommasse')}<br /><b className="text-white">{formatNumber(sel.mass, lang)}</b></div>
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-slate-300">{t('lab.periodic.valence')}<br /><b className="text-white">{valence(sel)}</b></div>
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-slate-300">{t('lab.periodic.shells')}<br /><b className="text-white">{sel.period}</b></div>
        </div>
      </div>
    </div>
  )
}

function ElementHunt({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n()
  const { elements } = useI18nData()
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const hunt = HUNTS[idx]

  const pick = (el: ElementInfo) => {
    if (el.z === hunt.answer) {
      setWrong(null)
      if (idx + 1 >= HUNTS.length) onComplete()
      else setIdx(idx + 1)
    } else {
      setWrong(el.z)
    }
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="text-xs uppercase tracking-wide text-emerald-300">{t('lab.periodic.clueOf', { i: idx + 1, n: HUNTS.length })}</div>
        <p className="mt-1 font-medium text-white">{t(`lab.periodic.clue.${hunt.clueId}`)}</p>
      </div>
      <Table onSelect={pick} selected={null} elements={elements} />
      {wrong !== null && (
        <p className="mt-3 text-sm text-rose-400">
          {t('lab.periodic.wrong', { name: elements.find((e) => e.z === wrong)?.name ?? '' })}
        </p>
      )}
    </div>
  )
}

export default function PeriodicLab({ mode, onComplete }: { mode: 'explore' | 'exercise'; onComplete?: () => void }) {
  if (mode === 'exercise') return <ElementHunt onComplete={onComplete ?? (() => {})} />
  return <Explorer />
}
