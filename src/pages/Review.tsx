import { useState } from 'react'
import { LangLink as Link } from '@/i18n'
import { ArrowLeft, Repeat, CheckCircle2 } from 'lucide-react'
import { type QuizQuestion } from '@/data/appData'
import { useProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'
import Quiz from '@/components/Quiz'

export default function Review() {
  const { t, dict } = useI18n()
  const { modules } = useI18nData()
  const { progress } = useProgress(dict)

  // Übungsliste pro Besuch fixieren: Sonst springt die Seite nach der letzten
  // richtig beantworteten Frage sofort auf „leer" und der Abschluss verschwindet.
  const [sessionItems] = useState(() =>
    modules.flatMap((m) =>
      m.questions
        .filter((q) => progress.wrongQuestions.includes(q.id))
        .map((q) => ({ q, module: m })),
    ),
  )
  const wrongQuestions: QuizQuestion[] = sessionItems.map((x) => x.q)
  const listKey = wrongQuestions.map((q) => q.id).join(',')
  const remaining = wrongQuestions.filter((q) => !progress.correctQuestions.includes(q.id)).length

  return (
    <Layout>
      <div className="py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('common.backToPlan')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-lg">
            <Repeat className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t('review.title')}</h1>
            <p className="text-slate-400">
              {t('review.sub')}
            </p>
          </div>
        </div>

        {wrongQuestions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="mt-3 text-xl font-bold text-white">{t('review.empty.title')}</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-300">
              {t('review.empty.text')}
            </p>
            <Link to="/" className="mt-5 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400">
              {t('review.empty.button')}
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-sm font-bold text-rose-300">
                {t(remaining === 1 ? 'review.open.one' : 'review.open.other', { n: remaining })}
              </span>
              {[...new Set(sessionItems.map((x) => x.module.id))].map((mid) => {
                const m = modules.find((x) => x.id === mid)!
                return (
                  <span key={mid} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    {t('review.moduleTag', { n: m.number, title: m.title })}
                  </span>
                )
              })}
            </div>
            <Quiz
              key={listKey}
              questions={wrongQuestions}
              color="from-rose-500 to-orange-600"
              completionNote={t('review.completionNote')}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
