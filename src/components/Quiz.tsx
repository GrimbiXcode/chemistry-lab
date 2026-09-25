import { useMemo, useState } from 'react'
import type { QuizQuestion } from '@/data/appData'
import { useProgress, readProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { shuffledOptions } from '@/lib/quiz'

export default function Quiz({ questions, color, completionNote }: { questions: QuizQuestion[]; color: string; completionNote?: string }) {
  const { t, dict } = useI18n()
  const { progress, markQuestionCorrect, markQuestionWrong } = useProgress(dict)
  // Wiedereinstieg: direkt bei der ersten noch nicht gelösten Frage weitergehen
  const [idx, setIdx] = useState(() => {
    const first = questions.findIndex((q) => !progress.correctQuestions.includes(q.id))
    return first === -1 ? questions.length : first
  })
  const [pickedIdx, setPickedIdx] = useState<number | null>(null)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [hintLevel, setHintLevel] = useState(0)

  const q = questions[idx]
  // t wechselt mit der Sprache – dann werden auch die Richtig/Falsch-Labels neu gebaut.
  const options = useMemo(() => (q ? shuffledOptions(q, [t('quiz.tf.true'), t('quiz.tf.false')]) : []), [q, t])
  const answered = pickedIdx !== null
  const isCorrect = pickedIdx !== null && options[pickedIdx]?.correct === true
  const alreadyKnown = q !== undefined && progress.correctQuestions.includes(q.id)

  const pick = (oi: number) => {
    if (answered) return
    setPickedIdx(oi)
    if (options[oi].correct) {
      const isNew = markQuestionCorrect(q.id)
      if (isNew) setFirstTryCorrect((c) => c + 1)
    } else {
      markQuestionWrong(q.id)
    }
  }

  const next = () => {
    setPickedIdx(null)
    setHintLevel(0)
    // Falsch beantwortete Fragen werden nicht übersprungen: Kommt danach keine
    // ungelöste Frage mehr, kehren wir zur ersten ungelösten zurück (Wiederholung).
    const answered = readProgress().correctQuestions
    const later = questions.findIndex((qq, i) => i > idx && !answered.includes(qq.id))
    const any = questions.findIndex((qq) => !answered.includes(qq.id))
    setIdx(later !== -1 ? later : any !== -1 ? any : questions.length)
  }

  if (idx >= questions.length) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
        <div className="text-5xl">🏆</div>
        <h3 className="mt-3 text-2xl font-bold text-white">{t('quiz.done.title')}</h3>
        <p className="mt-2 text-slate-300">
          {t('quiz.done.text', {
            correct: questions.filter((x) => progress.correctQuestions.includes(x.id)).length,
            total: questions.length,
            xp: firstTryCorrect > 0 ? t('quiz.done.xp', { n: firstTryCorrect }) : '',
          })}
        </p>
        <p className="mt-1 text-sm text-emerald-300">{completionNote ?? t('quiz.done.note')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{t('quiz.questionOf', { i: idx + 1, n: questions.length })}</span>
        <div className="flex gap-1" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} className={`h-2 w-6 rounded-full ${i < idx ? 'bg-emerald-500' : i === idx ? `bg-gradient-to-r ${color}` : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
        <h3 className="text-lg font-bold text-white">{q.question}</h3>
        {alreadyKnown && !answered && <p className="mt-1 text-xs text-emerald-400">{t('quiz.alreadyCorrect')}</p>}
        {/* Tipp: gestufte Hilfe vor und nach dem ersten Versuch */}
        {!answered && hintLevel === 0 && q.hint && (
          <button
            onClick={() => setHintLevel(1)}
            className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            {t('quiz.showHint')}
          </button>
        )}
        {hintLevel === 1 && !answered && (
          <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            <b>{t('quiz.hint')}</b> {q.hint}
          </div>
        )}
        {answered && !isCorrect && hintLevel === 1 && (
          <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            <b>{t('quiz.hint')}</b> {q.hint}
            <button onClick={() => setHintLevel(2)} className="ml-2 font-bold underline">{t('quiz.strongerHint')}</button>
          </div>
        )}
        {answered && !isCorrect && hintLevel >= 2 && (
          <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            <b>{t('quiz.hint2')}</b> {q.hint}{t('quiz.hint2text')}
          </div>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((opt, oi) => {
            const isPickedWrong = answered && oi === pickedIdx && !opt.correct
            let cls = 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
            if (answered) {
              if (opt.correct) cls = 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
              else if (isPickedWrong) cls = 'border-rose-500 bg-rose-500/15 text-rose-200'
              else cls = 'border-slate-800 bg-slate-900/40 text-slate-500'
            }
            return (
              <button
                key={oi}
                onClick={() => pick(oi)}
                disabled={answered}
                className={`rounded-xl border px-4 py-3 text-left font-medium transition ${cls}`}
              >
                {opt.text}
                {answered && opt.correct && <span className="ml-2">✓</span>}
                {answered && isPickedWrong && <span className="ml-2">✗</span>}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className={`mt-4 rounded-xl border p-4 ${isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
            <div className={`font-bold ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
              {t(isCorrect ? 'quiz.correct' : 'quiz.wrong')}
            </div>
            <p className="mt-1 text-sm text-slate-200">{q.explanation}</p>
            <button
              onClick={next}
              className={`mt-3 rounded-xl bg-gradient-to-r ${color} px-5 py-2 font-bold text-white transition hover:opacity-90`}
            >
              {t(idx + 1 >= questions.length ? 'quiz.evaluate' : 'quiz.nextQuestion')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
