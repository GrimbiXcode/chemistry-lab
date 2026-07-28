import { useState } from 'react'
import { useParams, Navigate } from 'react-router'
import { LangLink as Link } from '@/i18n'
import {
  Waves, Atom, Grid3X3, Link as LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale, ArrowLeft, ArrowRight, Microscope, Info, Settings2,
  BookOpen, FlaskRound, Sparkles, CheckCircle2, GraduationCap,
} from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'
import { LABS } from '@/components/labs'

const ICONS: Record<string, typeof Waves> = {
  Waves, Atom, Grid3X3, Link: LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale,
}

export default function LabPage() {
  const { id } = useParams()
  const { t, dict } = useI18n()
  const { modules, labInfos } = useI18nData()
  const module = modules.find((m) => m.id === id)
  const { markLabDone, progress } = useProgress(dict)
  const [mode, setMode] = useState<'explore' | 'exercise'>('explore')
  const [justFinished, setJustFinished] = useState(false)
  const [earnedXp, setEarnedXp] = useState(false)

  if (!module) return <Navigate to="/labore" replace />

  const Icon = ICONS[module.icon]
  const info = labInfos[module.id]
  const LabComponent = LABS[module.steps[0].interactive ?? 'particles']
  const labAlreadyDone = progress.labsDone.includes(module.id)

  const handleComplete = () => {
    const isNew = markLabDone(module.id)
    if (isNew) setEarnedXp(true)
    setJustFinished(true)
  }

  return (
    <Layout>
      <div className="py-6">
        <Link to="/labore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('lab.back')}
        </Link>

        {/* Header */}
        <div className={`mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br ${module.color} p-[1px]`}>
          <div className="rounded-3xl bg-slate-950/80 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-5">
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${module.color} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1"><FlaskRound className="h-3.5 w-3.5" /> {t('lab.kicker')}</span>
                  {labAlreadyDone && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 normal-case tracking-normal">
                      <CheckCircle2 className="h-3 w-3" /> {t('lab.doneBadge')}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{module.labTitle}</h1>
                <p className="text-slate-400">{t('lab.fromModule', { n: module.number, title: module.title })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Beschreibung & Funktionsweise */}
        {info && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Info className="h-4 w-4" /> {t('lab.what')}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{info.description}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-violet-300">
                <Settings2 className="h-4 w-4" /> {t('lab.how')}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{info.howItWorks}</p>
            </div>
          </div>
        )}

        {/* Sprung ins Modul */}
        <Link
          to={`/modul/${module.id}`}
          className={`group mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-600`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white`}>
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white">{t('lab.learnMore')}</div>
            <div className="text-xs text-slate-400">
              {t('lab.learnMoreSub', { n: module.number, title: module.title })}
            </div>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold text-cyan-300 transition group-hover:translate-x-0.5">
            {t('lab.toModule')} <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* Modus-Wahl */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setMode('explore')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === 'explore'
                ? `bg-gradient-to-r ${module.color} text-white`
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" /> {t('lab.explore')}
          </button>
          <button
            onClick={() => setMode('exercise')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === 'exercise'
                ? `bg-gradient-to-r ${module.color} text-white`
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <Microscope className="h-4 w-4" /> {t('lab.exercise')}
          </button>
        </div>

        {mode === 'exercise' && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            <span><b className="text-cyan-300">{t('lab.task')}</b> {module.labTask}</span>
          </div>
        )}

        {/* Labor */}
        <div className="mt-4">
          <LabComponent key={mode} mode={mode} onComplete={handleComplete} />
        </div>

        {/* Abschluss-Meldung */}
        {justFinished && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-black text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> {t('lab.passed.title')}
              {earnedXp && <span className="text-amber-300">{t('lab.passed.xp')}</span>}
            </div>
            <p className="mt-1 text-sm text-slate-300">
              {labAlreadyDone
                ? t('lab.passed.moduleNote')
                : t('lab.passed.freeNote')}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setMode('explore')}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
              >
                {t('lab.passed.explore')}
              </button>
              <Link
                to={`/modul/${module.id}`}
                className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${module.color} px-4 py-2 text-sm font-bold text-white transition hover:opacity-90`}
              >
                {t('lab.passed.toModule')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
