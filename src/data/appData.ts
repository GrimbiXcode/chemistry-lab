// Zentraler sprachabhängiger Datenzugriff.
// Liest aus der aktiven Sprachdatei (Fallback Deutsch) über das translate()-Helper.
import { translate, type Dict, type TFn } from '@/i18n'

// ---------- Statische (sprachunabhängige) Typen & Metadaten ----------

export interface LessonStep {
  title: string
  text: string
  interactive?: string
  takeaway?: string
  poe?: { predict: string; observe: string }
}

export interface QuizQuestion {
  id: string
  type: 'mc' | 'tf'
  question: string
  options?: string[]
  correct: number | boolean
  explanation: string
  hint?: string
}

export interface ChemModule {
  id: string
  number: number
  icon: string
  color: string
  title: string
  subtitle: string
  goal: string
  labTitle: string
  labTask: string
  steps: LessonStep[]
  questions: QuizQuestion[]
}

export interface ModuleMeta {
  id: string
  number: number
  icon: string
  color: string
  interactive: string
  questionIds: string[]
  questionTypes: ('mc' | 'tf')[]
  questionCorrect: (number | boolean)[]
  questionOptionCounts: (number | null)[]
  stepHasPoe: boolean[]
  stepHasTakeaway: boolean[]
}

// Reihenfolge + fachliche Lösungen: NIE übersetzen!
export const MODULE_META: ModuleMeta[] = [
  { id: 'materie', number: 1, icon: 'Waves', color: 'from-cyan-500 to-blue-600', interactive: 'particles', questionIds: ['m1q1','m1q2','m1q3','m1q4','m1q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 2, false, 2, 2], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, true, false], stepHasTakeaway: [true, true, true] },
  { id: 'atome', number: 2, icon: 'Atom', color: 'from-violet-500 to-purple-700', interactive: 'atom', questionIds: ['m2q1','m2q2','m2q3','m2q4','m2q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 2, true, 0, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, false, true], stepHasTakeaway: [true, true, true] },
  { id: 'periodensystem', number: 3, icon: 'Grid3X3', color: 'from-emerald-500 to-teal-700', interactive: 'periodic', questionIds: ['m3q1','m3q2','m3q3','m3q4','m3q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 1, false, 2, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, false, false], stepHasTakeaway: [true, true, true] },
  { id: 'bindungen', number: 4, icon: 'Link', color: 'from-amber-500 to-orange-600', interactive: 'bond', questionIds: ['m4q1','m4q2','m4q3','m4q4','m4q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 2, false, 1, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, false, false], stepHasTakeaway: [true, true, true] },
  { id: 'formeln', number: 5, icon: 'FlaskConical', color: 'from-rose-500 to-pink-600', interactive: 'formula', questionIds: ['m5q1','m5q2','m5q3','m5q4','m5q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [2, 1, false, 1, 2], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [false, true, false], stepHasTakeaway: [true, true, true] },
  { id: 'reaktionen', number: 6, icon: 'Zap', color: 'from-orange-500 to-red-600', interactive: 'equation', questionIds: ['m6q1','m6q2','m6q3','m6q4','m6q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 1, false, 1, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [false, true, false], stepHasTakeaway: [true, true, true] },
  { id: 'ph', number: 7, icon: 'Droplets', color: 'from-teal-500 to-cyan-600', interactive: 'ph', questionIds: ['m7q1','m7q2','m7q3','m7q4','m7q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [2, 1, true, 2, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, false, false], stepHasTakeaway: [true, true, true] },
  { id: 'trennung', number: 8, icon: 'Filter', color: 'from-indigo-500 to-blue-700', interactive: 'separation', questionIds: ['m8q1','m8q2','m8q3','m8q4','m8q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 1, false, 1, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [true, false, false], stepHasTakeaway: [true, true, true] },
  { id: 'energie', number: 9, icon: 'Flame', color: 'from-rose-500 to-red-700', interactive: 'energy', questionIds: ['m9q1','m9q2','m9q3','m9q4','m9q5'], questionTypes: ['mc','tf','mc','mc','mc'], questionCorrect: [0, false, 1, 1, 1], questionOptionCounts: [4, null, 4, 4, 4], stepHasPoe: [true, true, false], stepHasTakeaway: [true, true, true] },
  { id: 'mol', number: 10, icon: 'Scale', color: 'from-purple-500 to-violet-700', interactive: 'mol', questionIds: ['m10q1','m10q2','m10q3','m10q4','m10q5'], questionTypes: ['mc','mc','tf','mc','mc'], questionCorrect: [1, 1, false, 2, 1], questionOptionCounts: [4, 4, null, 4, 4], stepHasPoe: [false, true, false], stepHasTakeaway: [true, true, true] },
]

// ---------- Builder: Module in aktiver Sprache ----------

export function buildModules(t: TFn): ChemModule[] {
  return MODULE_META.map((meta) => {
    const steps: LessonStep[] = [1, 2, 3].map((i) => {
      const step: LessonStep = {
        title: t(`m.${meta.id}.s${i}.title`),
        text: t(`m.${meta.id}.s${i}.text`),
        interactive: meta.interactive,
      }
      if (meta.stepHasPoe[i - 1]) {
        step.poe = {
          predict: t(`m.${meta.id}.s${i}.poe.predict`),
          observe: t(`m.${meta.id}.s${i}.poe.observe`),
        }
      }
      if (meta.stepHasTakeaway[i - 1]) {
        step.takeaway = t(`m.${meta.id}.s${i}.takeaway`)
      }
      return step
    })
    const questions: QuizQuestion[] = meta.questionIds.map((qid, qi) => {
      const type = meta.questionTypes[qi]
      const q: QuizQuestion = {
        id: qid,
        type,
        question: t(`q.${qid}.question`),
        correct: meta.questionCorrect[qi],
        explanation: t(`q.${qid}.explanation`),
      }
      if (type === 'mc') {
        q.options = Array.from({ length: meta.questionOptionCounts[qi] ?? 0 }, (_, oi) => t(`q.${qid}.o${oi}`))
      }
      const hintKey = `q.${qid}.hint`
      const hint = t(hintKey)
      if (hint !== hintKey) q.hint = hint
      return q
    })
    return {
      id: meta.id,
      number: meta.number,
      icon: meta.icon,
      color: meta.color,
      title: t(`m.${meta.id}.title`),
      subtitle: t(`m.${meta.id}.subtitle`),
      goal: t(`m.${meta.id}.goal`),
      labTitle: t(`m.${meta.id}.labTitle`),
      labTask: t(`m.${meta.id}.labTask`),
      steps,
      questions,
    }
  })
}

// ---------- Glossar ----------

export interface GlossaryEntry {
  term: string
  def: string
  module: number
}

// Reihenfolge + Modul-Bezug (stabil, aus der DE-Masterdatei übernommen).
// Die Anzeige im Glossar wird sprachabhängig alphabetisch sortiert; der Index
// hier ist nur der Schlüssel in den Sprachdateien (g.<index>.term / .def).
export const GLOSSARY_META: { index: number; module: number }[] = [
  { index: 0, module: 1 }, { index: 1, module: 9 }, { index: 2, module: 3 }, { index: 3, module: 2 }, { index: 4, module: 4 }, { index: 5, module: 2 }, { index: 6, module: 10 }, { index: 7, module: 7 }, { index: 8, module: 8 }, { index: 9, module: 8 }, { index: 10, module: 6 }, { index: 11, module: 3 }, { index: 12, module: 2 }, { index: 13, module: 2 }, { index: 14, module: 9 }, { index: 15, module: 9 }, { index: 16, module: 8 }, { index: 17, module: 8 }, { index: 18, module: 3 }, { index: 19, module: 3 }, { index: 20, module: 7 }, { index: 21, module: 4 }, { index: 22, module: 4 }, { index: 23, module: 9 }, { index: 24, module: 6 }, { index: 25, module: 2 }, { index: 26, module: 10 }, { index: 27, module: 10 }, { index: 28, module: 5 }, { index: 29, module: 2 }, { index: 30, module: 7 }, { index: 31, module: 4 }, { index: 32, module: 2 }, { index: 33, module: 3 }, { index: 34, module: 3 }, { index: 35, module: 7 }, { index: 36, module: 6 }, { index: 37, module: 2 }, { index: 38, module: 8 }, { index: 39, module: 7 }, { index: 40, module: 10 }, { index: 41, module: 1 }, { index: 42, module: 4 }, { index: 43, module: 5 }, { index: 44, module: 8 }, { index: 45, module: 1 }, { index: 46, module: 1 }, { index: 47, module: 1 }, { index: 48, module: 6 }, { index: 49, module: 2 }, { index: 50, module: 3 }, { index: 51, module: 3 }, { index: 52, module: 4 }, { index: 53, module: 4 }, { index: 54, module: 7 }, { index: 55, module: 5 }, { index: 56, module: 5 }, { index: 57, module: 6 }, { index: 58, module: 7 }, { index: 59, module: 8 }, { index: 60, module: 8 }, { index: 61, module: 8 }, { index: 62, module: 9 }, { index: 63, module: 9 }, { index: 64, module: 9 }, { index: 65, module: 1 }, { index: 66, module: 2 }, { index: 67, module: 3 }, { index: 68, module: 6 }, { index: 69, module: 6 },
  // Ergänzungen: Isotop, Atommasse, Elementsymbol, Kation, Anion, Metallbindung, Lösung, Konzentration, Reaktionsgeschwindigkeit
  { index: 70, module: 2 }, { index: 71, module: 2 }, { index: 72, module: 2 }, { index: 73, module: 4 }, { index: 74, module: 4 }, { index: 75, module: 4 }, { index: 76, module: 8 }, { index: 77, module: 9 }, { index: 78, module: 9 },
]

export function buildGlossary(t: TFn): GlossaryEntry[] {
  return GLOSSARY_META.map(({ index, module }) => ({
    term: t(`g.${index}.term`),
    def: t(`g.${index}.def`),
    module,
  }))
}

// ---------- Elemente ----------

export interface ElementInfo {
  z: number
  symbol: string
  name: string
  group: number
  period: number
  cat: string
  /** Relative Atommasse in u (gerundet, wie im Schul-PSE) – Grundlage für die molare Masse. */
  mass: number
  /** Massenzahl (Protonen + Neutronen) des häufigsten Isotops – Grundlage für den Atom-Baukasten. */
  a: number
}

export const ELEMENTS_STATIC: Omit<ElementInfo, 'name' | 'cat'>[] = [
  { z: 1, symbol: 'H', group: 1, period: 1, mass: 1, a: 1 },
  { z: 2, symbol: 'He', group: 18, period: 1, mass: 4, a: 4 },
  { z: 3, symbol: 'Li', group: 1, period: 2, mass: 7, a: 7 },
  { z: 4, symbol: 'Be', group: 2, period: 2, mass: 9, a: 9 },
  { z: 5, symbol: 'B', group: 13, period: 2, mass: 11, a: 11 },
  { z: 6, symbol: 'C', group: 14, period: 2, mass: 12, a: 12 },
  { z: 7, symbol: 'N', group: 15, period: 2, mass: 14, a: 14 },
  { z: 8, symbol: 'O', group: 16, period: 2, mass: 16, a: 16 },
  { z: 9, symbol: 'F', group: 17, period: 2, mass: 19, a: 19 },
  { z: 10, symbol: 'Ne', group: 18, period: 2, mass: 20, a: 20 },
  { z: 11, symbol: 'Na', group: 1, period: 3, mass: 23, a: 23 },
  { z: 12, symbol: 'Mg', group: 2, period: 3, mass: 24, a: 24 },
  { z: 13, symbol: 'Al', group: 13, period: 3, mass: 27, a: 27 },
  { z: 14, symbol: 'Si', group: 14, period: 3, mass: 28, a: 28 },
  { z: 15, symbol: 'P', group: 15, period: 3, mass: 31, a: 31 },
  { z: 16, symbol: 'S', group: 16, period: 3, mass: 32, a: 32 },
  // Chlor: Atommasse 35,5 u ist der Isotopen-Durchschnitt; das häufigste Isotop ist Cl-35 (18 Neutronen).
  { z: 17, symbol: 'Cl', group: 17, period: 3, mass: 35.5, a: 35 },
  { z: 18, symbol: 'Ar', group: 18, period: 3, mass: 40, a: 40 },
  { z: 19, symbol: 'K', group: 1, period: 4, mass: 39, a: 39 },
  { z: 20, symbol: 'Ca', group: 2, period: 4, mass: 40, a: 40 },
]

const EL_CATS: Record<number, string> = {
  1: 'Nichtmetall', 2: 'Edelgas', 3: 'Alkalimetall', 4: 'Erdalkalimetall', 5: 'Halbmetall',
  6: 'Nichtmetall', 7: 'Nichtmetall', 8: 'Nichtmetall', 9: 'Halogen', 10: 'Edelgas',
  11: 'Alkalimetall', 12: 'Erdalkalimetall', 13: 'Metall', 14: 'Halbmetall', 15: 'Nichtmetall',
  16: 'Nichtmetall', 17: 'Halogen', 18: 'Edelgas', 19: 'Alkalimetall', 20: 'Erdalkalimetall',
}

export const CATEGORY_COLOR_KEYS = ['Nichtmetall', 'Edelgas', 'Alkalimetall', 'Erdalkalimetall', 'Halbmetall', 'Halogen', 'Metall'] as const

export const CATEGORY_COLORS: Record<string, string> = {
  Nichtmetall: 'bg-sky-500',
  Edelgas: 'bg-violet-500',
  Alkalimetall: 'bg-rose-500',
  Erdalkalimetall: 'bg-orange-500',
  Halbmetall: 'bg-amber-500',
  Halogen: 'bg-emerald-500',
  Metall: 'bg-slate-500',
}

export function buildElements(t: TFn): ElementInfo[] {
  return ELEMENTS_STATIC.map((e) => ({
    ...e,
    name: t(`el.name.${e.z}`),
    cat: t(`el.cat.${EL_CATS[e.z]}`),
  }))
}

// ---------- Levels & Prüfung ----------

/** XP-Schwellen der Level (Index = level.<i> in den Sprachdateien). */
export const XP_STEPS: readonly number[] = [0, 100, 250, 450, 650, 850]

export function buildLevels(t: TFn): { xp: number; name: string }[] {
  return XP_STEPS.map((x, i) => ({ xp: x, name: t(`level.${i}`) }))
}

/** Abschlussprüfung: Anzahl Fragen und Bestehensgrenze. */
export const EXAM_SIZE = 15
export const EXAM_PASS_SCORE = 12

// ---------- Labor-Infos ----------

export interface LabInfoText {
  description: string
  howItWorks: string
}

export function buildLabInfos(t: TFn): Record<string, LabInfoText> {
  const out: Record<string, LabInfoText> = {}
  for (const meta of MODULE_META) {
    out[meta.id] = {
      description: t(`labinfo.${meta.id}.description`),
      howItWorks: t(`labinfo.${meta.id}.howItWorks`),
    }
  }
  return out
}

// ---------- TermText-Muster ----------

export interface TermPattern {
  match: string
  term: string
}

const PATTERN_LIMIT = 200 // Obergrenze für tp.*-Einträge (Schleife endet beim ersten fehlenden Key)

export function buildPatterns(dict: Dict | null): TermPattern[] {
  const out: TermPattern[] = []
  for (let i = 0; i < PATTERN_LIMIT; i++) {
    const match = translate(dict, `tp.${i}.match`)
    if (match === `tp.${i}.match`) break
    out.push({ match, term: translate(dict, `tp.${i}.term`) })
  }
  return out
}
