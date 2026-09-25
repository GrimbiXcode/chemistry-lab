import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { buildPatterns, type GlossaryEntry } from '@/data/appData'
import { useI18nData } from '@/hooks/useI18nData'

// Muster kommen aus der Sprachdatei (tp.*): „match" ist die Wortform im Text,
// „term" der Glossar-Begriff, zu dem das Popup springt.

interface Segment {
  kind: 'text' | 'term'
  text: string
  entry?: GlossaryEntry
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface GlossaryMatcher {
  term: string
  re: RegExp
}

/** Glossar-Begriffe: Wortgrenzen + kurze Flexionsendung (Plural -s/-e/-n etc.), case-insensitive. */
function buildGlossaryMatchers(byName: Map<string, GlossaryEntry>): GlossaryMatcher[] {
  return [...byName.keys()]
    .filter((term) => term.length > 2)
    .map((term) => ({
      term,
      re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(term)}[\\p{L}]{0,2}(?![\\p{L}\\p{N}])`, 'iu'),
    }))
    .sort((a, b) => b.term.length - a.term.length)
}

function splitIntoSegments(
  text: string,
  patterns: { match: string; term: string }[],
  glossaryMatchers: GlossaryMatcher[],
  byName: Map<string, GlossaryEntry>,
): Segment[] {
  // Manuelle Muster (tp.*): exakte Suche. Glossar-Begriffe: siehe buildGlossaryMatchers.
  const out: Segment[] = []
  let rest = text
  while (rest.length > 0) {
    let earliest = -1
    let chosenMatch = ''
    let chosenTerm: string | null = null
    // 1) manuelle Muster (exakt)
    for (const p of patterns) {
      const i = rest.indexOf(p.match)
      if (i !== -1 && (earliest === -1 || i < earliest || (i === earliest && p.match.length > chosenMatch.length))) {
        earliest = i
        chosenMatch = p.match
        chosenTerm = p.term
      }
    }
    // 2) Glossar-Begriffe (Wortgrenzen, case-insensitive)
    for (const gm of glossaryMatchers) {
      const m = rest.match(gm.re)
      if (m && m.index !== undefined && (earliest === -1 || m.index < earliest || (m.index === earliest && m[0].length > chosenMatch.length))) {
        earliest = m.index
        chosenMatch = m[0]
        chosenTerm = gm.term
      }
    }
    if (!chosenTerm || earliest === -1) {
      out.push({ kind: 'text', text: rest })
      break
    }
    if (earliest > 0) out.push({ kind: 'text', text: rest.slice(0, earliest) })
    const entry = byName.get(chosenTerm)
    out.push({ kind: 'term', text: chosenMatch, entry })
    rest = rest.slice(earliest + chosenMatch.length)
  }
  return out
}

function Term({ word, entry }: { word: string; entry: GlossaryEntry }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Beim Öffnen horizontal so positionieren, dass das Popup im Viewport bleibt.
  useEffect(() => {
    if (!open || !ref.current) return
    const anchor = ref.current.getBoundingClientRect()
    const margin = 12
    const vw = window.innerWidth
    const popW = Math.min(288, vw - 2 * margin)
    let absLeft = anchor.left
    if (absLeft + popW > vw - margin) absLeft = vw - margin - popW
    if (absLeft < margin) absLeft = margin
    setStyle({ left: `${absLeft - anchor.left}px`, width: `${popW}px` })
  }, [open])

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-semibold text-cyan-300 underline decoration-cyan-500/60 decoration-dotted underline-offset-4 transition hover:text-cyan-200"
        aria-expanded={open}
      >
        {word}
      </button>
      {open && (
        <span
          style={style}
          className="absolute bottom-full z-50 mb-2 block max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-600 bg-slate-900 p-3 text-left shadow-2xl"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-bold text-white">{entry.term}</span>
            <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">{t('gloss.moduleBadge', { n: entry.module })}</span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-slate-300">{entry.def}</span>
        </span>
      )}
    </span>
  )
}

/** Rendert Lektionstext und macht Fachbegriffe antippbar (mit Erklär-Popup). */
export default function TermText({ text }: { text: string }) {
  const { dict } = useI18n()
  const { glossary } = useI18nData()
  const patterns = useMemo(() => buildPatterns(dict), [dict])
  const byName = useMemo(() => new Map(glossary.map((g) => [g.term, g])), [glossary])
  const matchers = useMemo(() => buildGlossaryMatchers(byName), [byName])
  const segments = useMemo(() => splitIntoSegments(text, patterns, matchers, byName), [text, patterns, matchers, byName])
  return (
    <>
      {segments.map((s, i) =>
        s.kind === 'term' && s.entry ? (
          <Term key={i} word={s.text} entry={s.entry} />
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
