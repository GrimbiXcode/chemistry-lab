import { useState, useEffect, useCallback } from 'react'
import { MODULE_META, XP_STEPS } from '@/data/appData'
import { translate } from '@/i18n'
import type { Dict } from '@/i18n'

export type PhaseKey = 'learn' | 'practice' | 'lab'

export interface ModulePosition {
  phase: PhaseKey
  step: number
  updatedAt: number
}

export interface Progress {
  xp: number
  completed: string[]
  correctQuestions: string[]
  wrongQuestions: string[]
  labsDone: string[]
  positions: Record<string, ModulePosition>
  examBest: number | null
}

const KEY = 'chemielab-progress-v1'
const EVENT = 'chemielab-progress-updated'

const DEFAULT: Progress = { xp: 0, completed: [], correctQuestions: [], wrongQuestions: [], labsDone: [], positions: {}, examBest: null }

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    /* defekte oder gesperrte Speicherung: mit leerem Fortschritt weiterarbeiten */
  }
  return DEFAULT
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* z. B. Privatmodus oder voller Speicher – die Sitzung läuft dann ohne Persistenz weiter */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Direkter (nicht-reaktiver) Lesezugriff, z. B. für Initialwerte. */
export function readProgress(): Progress {
  return load()
}

export function useProgress(dict?: Dict | null) {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    const handler = () => setProgress(load())
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  const addXp = useCallback((amount: number) => {
    const p = load()
    save({ ...p, xp: p.xp + amount })
  }, [])

  const markQuestionCorrect = useCallback((qid: string) => {
    const p = load()
    const wrongQuestions = p.wrongQuestions.filter((id) => id !== qid)
    if (p.correctQuestions.includes(qid)) {
      save({ ...p, wrongQuestions })
      return false
    }
    save({ ...p, correctQuestions: [...p.correctQuestions, qid], wrongQuestions, xp: p.xp + 10 })
    return true
  }, [])

  const markQuestionWrong = useCallback((qid: string) => {
    const p = load()
    if (p.correctQuestions.includes(qid) || p.wrongQuestions.includes(qid)) return
    save({ ...p, wrongQuestions: [...p.wrongQuestions, qid] })
  }, [])

  /** Speichert den Prüfungs-Bestwert und vergibt XP für die Verbesserung. Gibt die gewonnenen XP zurück. */
  const saveExamScore = useCallback((score: number) => {
    const p = load()
    const old = p.examBest ?? 0
    if (score <= old) return 0
    const gained = (score - old) * 10
    save({ ...p, examBest: score, xp: p.xp + gained })
    return gained
  }, [])

  const markLabDone = useCallback((mid: string) => {
    const p = load()
    if (p.labsDone.includes(mid)) return false
    save({ ...p, labsDone: [...p.labsDone, mid], xp: p.xp + 50 })
    return true
  }, [])

  const completeModule = useCallback((mid: string) => {
    const p = load()
    if (p.completed.includes(mid)) return
    save({ ...p, completed: [...p.completed, mid] })
  }, [])

  const savePosition = useCallback((mid: string, pos: ModulePosition) => {
    const p = load()
    save({ ...p, positions: { ...p.positions, [mid]: pos } })
  }, [])

  const clearPosition = useCallback((mid: string) => {
    const p = load()
    if (!p.positions[mid]) return
    const positions = { ...p.positions }
    delete positions[mid]
    save({ ...p, positions })
  }, [])

  const resetAll = useCallback(() => {
    save(DEFAULT)
  }, [])

  const li = XP_STEPS.reduce((acc, x, i) => (progress.xp >= x ? i : acc), 0)
  const ni = XP_STEPS.findIndex((x) => x > progress.xp)
  const level = { xp: XP_STEPS[li], idx: li }
  const nextLevel = ni === -1 ? undefined : { xp: XP_STEPS[ni], idx: ni }
  const levelProgress = nextLevel
    ? Math.round(((progress.xp - level.xp) / (nextLevel.xp - level.xp)) * 100)
    : 100

  const totalTasks = MODULE_META.reduce((acc, m) => acc + m.questionIds.length + 1, 0)
  const doneTasks = progress.correctQuestions.length + progress.labsDone.length
  const overallProgress = Math.min(100, Math.round((doneTasks / totalTasks) * 100))

  const t = (k: string) => translate(dict ?? null, k)
  const levelNamed = { ...level, name: t(`level.${level.idx}`) }
  const nextLevelNamed = nextLevel ? { ...nextLevel, name: t(`level.${nextLevel.idx}`) } : undefined

  return {
    progress,
    addXp,
    markQuestionCorrect,
    markQuestionWrong,
    saveExamScore,
    markLabDone,
    completeModule,
    savePosition,
    clearPosition,
    resetAll,
    level: levelNamed,
    nextLevel: nextLevelNamed,
    levelProgress,
    overallProgress,
  }
}
