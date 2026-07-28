import { useEffect, useRef, useState } from 'react'
import { useParams, Navigate } from 'react-router'
import { LangLink as Link } from '@/i18n'
import {
  Waves, Atom, Grid3X3, Link as LinkIcon, FlaskConical, Zap, Droplets,
  ArrowLeft, ArrowRight, Trophy, Target, BookOpen, PencilRuler, Microscope,
  Filter, Flame, Scale, Lightbulb, Eye,
} from 'lucide-react'
import { useProgress, readProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'
import Quiz from '@/components/Quiz'
import TermText from '@/components/TermText'
import { LABS } from '@/components/labs'

const ICONS: Record<string, typeof Waves> = {
  Waves, Atom, Grid3X3, Link: LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale,
}

type Phase = 'learn' | 'practice' | 'lab' | 'done'

function savedPositionFor(moduleId: string): { phase: Phase; step: number } {
  const p = readProgress()
  const saved = p.positions?.[moduleId]
  if (saved && !p.completed.includes(moduleId)) return { phase: saved.phase, step: saved.step }
  return { phase: 'learn', step: 0 }
}

export default function ModulePage() {
  const { id } = useParams()
  const { t, dict } = useI18n()
  const { modules } = useI18nData()
  const module = modules.find((m) => m.id === id)
  const { markLabDone, completeModule, savePosition, clearPosition, progress } = useProgress(dict)
  const [phase, setPhase] = useState<Phase>(() => (module ? savedPositionFor(module.id).phase : 'learn'))
  const [step, setStep] = useState(() => (module ? savedPositionFor(module.id).step : 0))
  const [labDoneNow, setLabDoneNow] = useState(false)
  const [earnedLabXp, setEarnedLabXp] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Beim Wechsel von Lektion oder Phase zum Inhaltsanfang scrollen,
  // damit der neue Text von oben lesbar ist (Header ist sticky).
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }, [step, phase])

  // Beim Modulwechsel (z. B. über „Nächstes Modul") Position wiederherstellen bzw. zurücksetzen
  useEffect(() => {
    if (!module) return
    const saved = savedPositionFor(module.id)
    setPhase(saved.phase)
    setStep(saved.step)
    setLabDoneNow(false)
    setEarnedLabXp(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module?.id])

  // Aktuelle Position laufend speichern (bei Abschluss löschen)
  useEffect(() => {
    if (!module) return
    if (phase === 'done') {
      clearPosition(module.id)
    } else {
      savePosition(module.id, { phase: phase as 'learn' | 'practice' | 'lab', step, updatedAt: Date.now() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module?.id, phase, step])

  if (!module) return <Navigate to="/" replace />

  const Icon = ICONS[module.icon]
  const LabComponent = LABS[module.steps[0].interactive ?? 'particles']
  const nextModule = modules.find((m) => m.number === module.number + 1)
  const labPreviouslyDone = progress.labsDone.includes(module.id)

  const handleLabComplete = () => {
    const isNew = !labDoneNow && !labPreviouslyDone
    if (isNew) {
      markLabDone(module.id)
      setEarnedLabXp(true)
    }
    completeModule(module.id)
    setLabDoneNow(true)
    setTimeout(() => setPhase('done'), 1200)
  }

  const phases = [
    { key: 'learn', label: t('mod.learn'), icon: BookOpen },
    { key: 'practice', label: t('mod.practice'), icon: PencilRuler },
    { key: 'lab', label: t('mod.lab'), icon: Microscope },
  ]
  const phaseOrder: Phase[] = ['learn', 'practice', 'lab', 'done']
  const currentPhaseIdx = phaseOrder.indexOf(phase)

  return (
    <Layout>
      <div className="py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('common.backToPlan')}
        </Link>

        {/* Header */}
        <div className={`mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br ${module.color} p-[1px]`}>
          <div className="rounded-3xl bg-slate-950/80 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-5">
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${module.color} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('common.moduleOf', { n: module.number, total: modules.length })}</div>
                <h1 className="text-2xl font-black text-white sm:text-3xl">{module.title}</h1>
                <p className="text-slate-400">{module.subtitle}</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span><b className="text-cyan-300">{t('mod.goal')}</b> {module.goal}</span>
            </div>
          </div>
        </div>

        {/* Phase nav */}
        {phase !== 'done' && (
          <div className="mt-6 flex flex-wrap gap-2">
            {phases.map((p, i) => {
              const active = phase === p.key
              const passed = currentPhaseIdx > i
              return (
                <div
                  key={p.key}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                    active
                      ? `bg-gradient-to-r ${module.color} text-white`
                      : passed
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-800/70 text-slate-500'
                  }`}
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                </div>
              )
            })}
          </div>
        )}

        {/* LEARN PHASE */}
        {phase === 'learn' && (
          <div ref={contentRef} className="mt-6">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
              <span>{t('mod.lessonOf', { i: step + 1, n: module.steps.length })}</span>
              <div className="flex gap-1.5">
                {module.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 w-8 rounded-full transition ${i === step ? `bg-gradient-to-r ${module.color}` : i < step ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">{module.steps[step].title}</h2>
              <div className="mt-3 space-y-3">
                {module.steps[step].text.split('\n\n').map((para, i) => (
                  <p key={i} className="leading-relaxed text-slate-300">
                    <TermText text={para} />
                  </p>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">{t('mod.termHint')}</p>
            </div>
            {/* Merksatz */}
            {module.steps[step].takeaway && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-300">{t('mod.takeaway')}</div>
                  <p className="mt-0.5 font-semibold text-amber-100">{module.steps[step].takeaway}</p>
                </div>
              </div>
            )}
            {/* Predict–Observe–Explain */}
            {module.steps[step].poe && (
              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">{t('mod.poe.title')}</div>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="text-slate-200"><b className="text-cyan-300">{t('mod.poe.predict')}</b> {module.steps[step].poe!.predict}</p>
                  <p className="text-slate-200"><b className="text-cyan-300">{t('mod.poe.observe')}</b> {module.steps[step].poe!.observe}</p>
                  <p className="flex items-start gap-1.5 text-slate-400"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> {t('mod.poe.explain')}</p>
                </div>
              </div>
            )}
            {module.steps[step].interactive && (
              <div className="mt-4">
                <LabComponent mode="explore" />
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> {t('common.back')}
              </button>
              {step + 1 < module.steps.length ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${module.color} px-5 py-2.5 font-bold text-white transition hover:opacity-90`}
                >
                  {t('common.next')} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setPhase('practice')}
                  className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${module.color} px-5 py-2.5 font-bold text-white transition hover:opacity-90`}
                >
                  {t('mod.toPractice')} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRACTICE PHASE */}
        {phase === 'practice' && (
          <div ref={contentRef} className="mt-6">
            <p className="mb-4 text-slate-400">
              {t('mod.practiceIntro')}
            </p>
            <Quiz questions={module.questions} color={module.color} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPhase('lab')}
                className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${module.color} px-5 py-2.5 font-bold text-white transition hover:opacity-90`}
              >
                {t('mod.toLab', { title: module.labTitle })} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* LAB PHASE */}
        {phase === 'lab' && (
          <div ref={contentRef} className="mt-6">
            <div className={`mb-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white`}>
                  <Microscope className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white">{module.labTitle}</h2>
                  <p className="text-sm text-slate-400">{module.labTask}</p>
                </div>
              </div>
            </div>
            <LabComponent mode="exercise" onComplete={handleLabComplete} />
            {labPreviouslyDone && !labDoneNow && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-emerald-400">{t('mod.labDoneNote')}</p>
                <button
                  onClick={() => { completeModule(module.id); setPhase('done') }}
                  className={`rounded-xl bg-gradient-to-r ${module.color} px-5 py-2.5 font-bold text-white`}
                >
                  {t('mod.finishModule')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <div className="mt-10 text-center">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${module.color} shadow-2xl`}>
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-white">{t('mod.done.title')}</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-400">
              {t('mod.done.text', { title: module.title, xp: earnedLabXp ? t('mod.done.xp') : '' })}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/" className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-slate-200 transition hover:bg-slate-700">
                {t('mod.done.toPlan')}
              </Link>
              {nextModule && (
                <Link
                  to={`/modul/${nextModule.id}`}
                  className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${nextModule.color} px-6 py-3 font-bold text-white transition hover:opacity-90`}
                >
                  {t('mod.done.next', { title: nextModule.title })} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            {!nextModule && (
              <p className="mt-4 text-lg font-bold text-amber-300">
                {t('mod.done.all')}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
