import { useMemo, useState } from 'react'
import { LangLink as Link } from '@/i18n'
import { ArrowLeft, GraduationCap, Printer, RotateCcw, Award } from 'lucide-react'
import { EXAM_SIZE, EXAM_PASS_SCORE as PASS_SCORE, type ChemModule, type QuizQuestion } from '@/data/appData'
import { useProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import { shuffledOptions } from '@/lib/quiz'
import Layout from '@/components/Layout'

interface ExamQuestion extends QuizQuestion {
  moduleTitle: string
  moduleNumber: number
}

function drawQuestions(modules: ChemModule[]): ExamQuestion[] {
  const all = modules.flatMap((m) =>
    m.questions.map((q) => ({ ...q, moduleTitle: m.title, moduleNumber: m.number })),
  )
  // Zufällig mischen (jede Prüfung anders)
  const a = [...all]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, EXAM_SIZE)
}

interface Answer {
  qid: string
  correct: boolean
  pickedText: string
  correctText: string
}

export default function Exam() {
  const { t, dict, lang } = useI18n()
  const { modules } = useI18nData()
  const { progress, saveExamScore } = useProgress(dict)
  const [runId, setRunId] = useState(0)
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => drawQuestions(modules))
  const [idx, setIdx] = useState(0)
  const [pickedIdx, setPickedIdx] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [name, setName] = useState('')
  const [xpGained, setXpGained] = useState<number | null>(null)

  const finished = idx >= questions.length
  const score = answers.filter((a) => a.correct).length
  const passed = score >= PASS_SCORE

  // t wechselt mit der Sprache – dann werden auch die Richtig/Falsch-Labels neu gebaut.
  const optionSets = useMemo(
    () => questions.map((q) => shuffledOptions(q, [t('quiz.tf.true'), t('quiz.tf.false')])),
    [questions, t],
  )

  const pick = (oi: number) => {
    if (pickedIdx !== null) return
    setPickedIdx(oi)
    const opts = optionSets[idx]
    setAnswers((prev) => [
      ...prev,
      {
        qid: questions[idx].id,
        correct: opts[oi].correct,
        pickedText: opts[oi].text,
        correctText: opts.find((o) => o.correct)!.text,
      },
    ])
  }

  const next = () => {
    const ni = idx + 1
    setPickedIdx(null)
    setIdx(ni)
    if (ni >= questions.length) {
      // answers enthält die soeben gegebene Antwort bereits (pick läuft vor next)
      setXpGained(saveExamScore(answers.filter((a) => a.correct).length))
    }
  }

  const restart = () => {
    setQuestions(drawQuestions(modules))
    setIdx(0)
    setPickedIdx(null)
    setAnswers([])
    setXpGained(null)
    setRunId((r) => r + 1)
  }

  const today = new Date().toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Layout>
      <div className="py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white print:hidden">
          <ArrowLeft className="h-4 w-4" /> {t('common.backToPlan')}
        </Link>

        {!finished ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg">
                <GraduationCap className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-white sm:text-3xl">{t('exam.title')}</h1>
                <p className="text-slate-400">
                  {t('exam.sub', { size: EXAM_SIZE, pass: PASS_SCORE })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <span>{t('exam.questionOf', { i: idx + 1, n: questions.length })}</span>
              <div className="flex gap-1" aria-hidden="true">
                {questions.map((_, i) => (
                  <span key={i} className={`h-2 w-4 rounded-full ${i < idx ? 'bg-amber-500' : i === idx ? 'bg-amber-300' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <div key={`${runId}-${idx}`} className="mt-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {t('exam.moduleTag', { n: questions[idx].moduleNumber, title: questions[idx].moduleTitle })}
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">{questions[idx].question}</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {optionSets[idx].map((opt, oi) => {
                  let cls = 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-amber-400 hover:bg-slate-800'
                  if (pickedIdx !== null) {
                    if (oi === pickedIdx) cls = opt.correct ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-rose-500 bg-rose-500/15 text-rose-200'
                    else cls = 'border-slate-800 bg-slate-900/40 text-slate-500'
                  }
                  return (
                    <button key={oi} onClick={() => pick(oi)} disabled={pickedIdx !== null} className={`rounded-xl border px-4 py-3 text-left font-medium transition ${cls}`}>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
              {pickedIdx !== null && (
                <div className="mt-4 flex items-center justify-between">
                  <span className={`font-bold ${optionSets[idx][pickedIdx].correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t(optionSets[idx][pickedIdx].correct ? 'exam.correct' : 'exam.wrong')}
                  </span>
                  <button onClick={next} className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-2 font-bold text-slate-950 transition hover:opacity-90">
                    {t(idx + 1 >= questions.length ? 'exam.toResults' : 'quiz.nextQuestion')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Auswertung */}
            <div className={`mt-6 rounded-3xl border p-8 text-center ${passed ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50'}`}>
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-slate-700'}`}>
                {passed ? <Award className="h-10 w-10 text-white" /> : <GraduationCap className="h-10 w-10 text-slate-300" />}
              </div>
              <h1 className="mt-4 text-3xl font-black text-white">
                {t('exam.score', { score, total: questions.length })}
              </h1>
              <p className={`mt-2 text-lg font-bold ${passed ? 'text-amber-300' : 'text-slate-300'}`}>
                {passed ? t('exam.passed') : t('exam.failed', { pass: PASS_SCORE })}
              </p>
              {xpGained !== null && xpGained > 0 && (
                <p className="mt-1 text-sm font-semibold text-emerald-300">{t('exam.newBest', { xp: xpGained })}</p>
              )}
              {progress.examBest !== null && (
                <p className="mt-1 text-sm text-slate-400">{t('exam.yourBest', { best: progress.examBest, size: EXAM_SIZE })}</p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3 print:hidden">
                <button onClick={restart} className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 font-bold text-slate-200 transition hover:bg-slate-700">
                  <RotateCcw className="h-4 w-4" /> {t('exam.restart')}
                </button>
                <Link to="/fehler" className="rounded-xl bg-rose-500/80 px-5 py-2.5 font-bold text-white transition hover:bg-rose-400">
                  {t('exam.reviewLink')}
                </Link>
                <Link to="/" className="rounded-xl bg-slate-800 px-5 py-2.5 font-bold text-slate-200 transition hover:bg-slate-700">
                  {t('exam.toPlan')}
                </Link>
              </div>
            </div>

            {/* Urkunde */}
            {passed && (
              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-center gap-3 print:hidden">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('exam.namePlaceholder')}
                    className="min-w-60 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                  />
                  <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-amber-400">
                    <Printer className="h-4 w-4" /> {t('exam.print')}
                  </button>
                </div>
                <div id="certificate" className="rounded-3xl border-4 border-amber-500/70 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 text-center">
                  <div className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">ChemieLab</div>
                  <h2 className="mt-2 text-4xl font-black text-white">{t('exam.cert.title')}</h2>
                  <p className="mt-6 text-slate-300">{t('exam.cert.pre')}</p>
                  <p className="mt-2 border-b-2 border-dashed border-amber-500/50 pb-2 text-3xl font-black text-amber-300">
                    {name.trim() || t('exam.cert.blank')}
                  </p>
                  <p className="mt-6 text-slate-300">
                    {t('exam.cert.text1')}{' '}
                    <b className="text-white">{t('exam.cert.text2', { score, total: questions.length })}</b>
                    {score === questions.length ? t('exam.cert.distinction') : '.'}
                  </p>
                  <div className="mt-8 flex items-end justify-between text-sm text-slate-400">
                    <span>{today}</span>
                    <span className="text-right">
                      <span className="block border-t border-slate-600 pt-1">{t('exam.cert.signature')}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Review aller Fragen */}
            <div className="mt-8 print:hidden">
              <h2 className="text-xl font-black text-white">{t('exam.detail.title')}</h2>
              <p className="text-sm text-slate-400">{t('exam.detail.sub')}</p>
              <div className="mt-4 space-y-3">
                {questions.map((q, i) => {
                  const a = answers[i]
                  return (
                    <div key={q.id} className={`rounded-2xl border p-4 ${a.correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-black ${a.correct ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                          {a.correct ? '✓' : '✗'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('common.module', { n: q.moduleNumber })}</div>
                          <p className="font-semibold text-white">{q.question}</p>
                          {!a.correct && (
                            <p className="mt-1 text-sm text-slate-300">
                              {t('exam.detail.yourAnswer')} <b className="text-rose-300">{a.pickedText}</b> · {t('exam.detail.correctAnswer')} <b className="text-emerald-300">{a.correctText}</b>
                            </p>
                          )}
                          <p className="mt-1 text-sm text-slate-400">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
