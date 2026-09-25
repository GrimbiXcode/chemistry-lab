import type { QuizQuestion } from '@/data/appData'

export interface QuizOption {
  text: string
  correct: boolean
}

/**
 * Deterministisches Mischen pro Frage: Die Reihenfolge der Antworten variiert
 * zwischen den Fragen, bleibt aber beim Wiederholen derselben Frage stabil.
 */
export function shuffledOptions(q: QuizQuestion, tfLabels?: [string, string]): QuizOption[] {
  const opts = q.type === 'tf' ? (tfLabels ?? ['Richtig', 'Falsch']) : q.options!
  const mapped = opts.map((text, i) => ({
    text,
    correct: q.type === 'tf' ? (i === 0) === (q.correct === true) : i === q.correct,
  }))
  let seed = 0
  for (const ch of q.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const a = [...mapped]
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
