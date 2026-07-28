import { LangLink as Link } from '@/i18n'
import {
  Waves, Atom, Grid3X3, Link as LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale, Microscope, ChevronRight, CheckCircle2, BookOpen, FlaskRound,
} from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'

const ICONS: Record<string, typeof Waves> = {
  Waves, Atom, Grid3X3, Link: LinkIcon, FlaskConical, Zap, Droplets,
  Filter, Flame, Scale,
}

export default function Labs() {
  const { t, dict } = useI18n()
  const { modules, labInfos } = useI18nData()
  const { progress } = useProgress(dict)

  return (
    <Layout>
      <div className="py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-white shadow-lg">
            <FlaskRound className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-black text-white">{t('labs.title')}</h1>
            <p className="text-slate-400">
              {t('labs.sub')}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-slate-300">
          <Microscope className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span>
            {t('labs.note')}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((m) => {
            const Icon = ICONS[m.icon]
            const info = labInfos[m.id]
            const labDone = progress.labsDone.includes(m.id)
            return (
              <Link
                key={m.id}
                to={`/labor/${m.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl"
              >
                <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${m.color} opacity-10 blur-2xl transition group-hover:opacity-25`} />
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('labs.moduleTag', { n: m.number, title: m.title })}
                      </span>
                      {labDone && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> {t('labs.done')}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-0.5 text-lg font-bold text-white">{m.labTitle}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{info?.description}</p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-slate-300" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <BookOpen className="h-3.5 w-3.5" /> {t('labs.readMore')}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
