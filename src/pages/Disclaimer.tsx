import { LangLink as Link } from '@/i18n'
import { ArrowLeft, ShieldAlert, Github } from 'lucide-react'
import { useI18n } from '@/i18n'
import Layout from '@/components/Layout'

const ISSUES_URL = 'https://github.com/GrimbiXcode/chemistry-lab/issues'

export default function Disclaimer() {
  const { t } = useI18n()

  const sections = [
    { title: t('disclaimer.hobby.title'), text: t('disclaimer.hobby.text') },
    { title: t('disclaimer.content.title'), text: t('disclaimer.content.text') },
    { title: t('disclaimer.liability.title'), text: t('disclaimer.liability.text') },
  ]

  return (
    <Layout>
      <div className="py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('common.backToPlan')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t('disclaimer.title')}</h1>
            <p className="text-slate-400">{t('disclaimer.intro')}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-bold text-white">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-300">{s.text}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-bold text-white">{t('disclaimer.feedback.title')}</h2>
            <p className="mt-2 leading-relaxed text-slate-300">{t('disclaimer.feedback.text')}</p>
            <a
              href={ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Github className="h-4 w-4" /> {t('disclaimer.feedback.link')}
            </a>
          </section>
        </div>
      </div>
    </Layout>
  )
}
