import { LangLink as Link } from '@/i18n'
import {
  Waves, Atom, Grid3X3, Link as LinkIcon, FlaskConical, Zap, Droplets,
  CheckCircle2, ChevronRight, BookOpen, PencilRuler, Microscope, Sparkles, RotateCcw, Play,
  Filter, Flame, Scale, Repeat, GraduationCap, BookMarked, FlaskRound,
} from 'lucide-react'
import { type ChemModule } from '@/data/appData'
import type { ModulePosition } from '@/hooks/useProgress'
import { useProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'

const ICONS: Record<string, typeof Waves> = {
  Waves, Atom, Grid3X3, Link: LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale,
}

export default function Home() {
  const { t, dict } = useI18n()
  const { modules } = useI18nData()
  const { progress, overallProgress, level, resetAll } = useProgress(dict)

  const positionLabel = (m: ChemModule, pos: ModulePosition): string => {
    if (pos.phase === 'learn') return t('home.pos.lesson', { i: pos.step + 1, n: m.steps.length })
    if (pos.phase === 'practice') return t('home.pos.practice')
    return t('home.pos.lab')
  }

  // Zuletzt bearbeitetes, noch nicht abgeschlossenes Modul finden
  const resumeEntry = Object.entries(progress.positions ?? {})
    .filter(([mid]) => !progress.completed.includes(mid))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]
  const resumeModule = resumeEntry ? modules.find((m) => m.id === resumeEntry[0]) : undefined
  const ResumeIcon = resumeModule ? ICONS[resumeModule.icon] : undefined

  return (
    <Layout>
      {/* Hero */}
      <section className="py-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-300">
          <Sparkles className="h-4 w-4" /> {t('home.badge')}
        </div>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          {t('home.hero1')}{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">{t('home.hero2')}</span>
          {' '}{t('home.hero3')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          {t('home.heroSub')}
        </p>
        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2">
          <div className="flex w-full items-center justify-between text-sm">
            <span className="font-semibold text-slate-300">{t('home.overall', { level: level.name })}</span>
            <span className="font-bold text-cyan-300">{overallProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-rose-500 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {progress.xp > 0 && (
            <button onClick={resetAll} className="mt-2 flex items-center gap-1 text-xs text-slate-600 transition hover:text-slate-400">
              <RotateCcw className="h-3 w-3" /> {t('home.reset')}
            </button>
          )}
        </div>
      </section>

      {/* Weiterlernen-Banner */}
      {resumeModule && resumeEntry && ResumeIcon && (
        <section className="mb-10">
          <Link
            to={`/modul/${resumeModule.id}`}
            className={`group block rounded-2xl bg-gradient-to-r ${resumeModule.color} p-[1px] transition hover:-translate-y-0.5 hover:shadow-xl`}
          >
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-950/90 p-5">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${resumeModule.color} text-white shadow-lg`}>
                <ResumeIcon className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">{t('home.resume.kicker')}</div>
                <div className="truncate text-lg font-bold text-white">
                  {t('home.resume.title', { n: resumeModule.number, title: resumeModule.title })}
                </div>
                <div className="text-sm text-slate-400">
                  {t('home.resume.at', { position: positionLabel(resumeModule, resumeEntry[1]) })}
                </div>
              </div>
              <span className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-slate-950 transition group-hover:bg-cyan-200">
                <Play className="h-4 w-4 fill-slate-950" /> {t('home.resume.button')}
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Didaktik */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: t('home.step1.title'), text: t('home.step1.text'), color: 'text-cyan-300 bg-cyan-500/10' },
          { icon: PencilRuler, title: t('home.step2.title'), text: t('home.step2.text'), color: 'text-violet-300 bg-violet-500/10' },
          { icon: Microscope, title: t('home.step3.title'), text: t('home.step3.text'), color: 'text-rose-300 bg-rose-500/10' },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-bold text-white">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{s.text}</p>
          </div>
        ))}
      </section>

      {/* Verankerung */}
      <section className="mb-10">
        <h2 className="text-2xl font-black text-white">{t('home.anchor.title')}</h2>
        <p className="mt-1 text-slate-400">{t('home.anchor.sub')}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/fehler"
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-rose-500/50 hover:shadow-xl"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
              <Repeat className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-bold text-white">{t('home.review.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {progress.wrongQuestions.length === 0
                ? t('home.review.empty')
                : t(progress.wrongQuestions.length === 1 ? 'home.review.count.one' : 'home.review.count.other', { n: progress.wrongQuestions.length })}
            </p>
            {progress.wrongQuestions.length > 0 && (
              <span className="mt-2 inline-block rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                {t('home.review.badge', { n: progress.wrongQuestions.length })}
              </span>
            )}
          </Link>
          <Link
            to="/pruefung"
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-xl"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <GraduationCap className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-bold text-white">{t('home.exam.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('home.exam.text')}</p>
            {progress.examBest !== null && (
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${progress.examBest >= 12 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                {t('home.exam.best', { n: progress.examBest })} {progress.examBest >= 12 ? t('home.exam.passed') : ''}
              </span>
            )}
          </Link>
          <Link
            to="/glossar"
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-sky-500/50 hover:shadow-xl"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <BookMarked className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-bold text-white">{t('home.glossary.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('home.glossary.text')}</p>
          </Link>
          <Link
            to="/labore"
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-xl"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <FlaskRound className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-bold text-white">{t('home.labs.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('home.labs.text')}</p>
            {progress.labsDone.length > 0 && (
              <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                {t('home.labs.badge', { n: progress.labsDone.length })}
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* Lehrplan */}
      <section>
        <h2 className="text-2xl font-black text-white">{t('home.plan.title')}</h2>
        <p className="mt-1 text-slate-400">{t('home.plan.sub')}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {modules.map((m) => {
            const Icon = ICONS[m.icon]
            const done = progress.completed.includes(m.id)
            const pos = progress.positions?.[m.id]
            const correct = m.questions.filter((q) => progress.correctQuestions.includes(q.id)).length
            const labDone = progress.labsDone.includes(m.id)
            return (
              <Link
                key={m.id}
                to={`/modul/${m.id}`}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-xl ${
                  done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${m.color} opacity-10 blur-2xl transition group-hover:opacity-25`} />
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.module', { n: m.number })}</span>
                      {done && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> {t('home.card.done')}
                        </span>
                      )}
                      {!done && pos && (
                        <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-300">
                          <Play className="h-3 w-3" /> {t('home.card.inProgress', { position: positionLabel(m, pos) })}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-0.5 text-lg font-bold text-white">{m.title}</h3>
                    <p className="text-sm text-slate-400">{m.subtitle}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{t('home.card.lessons', { n: m.steps.length })}</span>
                      <span>{t('home.card.quiz', { correct, total: m.questions.length })}</span>
                      <span className={labDone ? 'font-bold text-emerald-400' : ''}>{t(labDone ? 'home.card.labDone' : 'home.card.labOpen')}</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-slate-300" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </Layout>
  )
}
