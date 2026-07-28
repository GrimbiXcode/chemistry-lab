import { useMemo, useState } from 'react'
import { LangLink as Link } from '@/i18n'
import { ArrowLeft, BookMarked, Search } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useI18nData } from '@/hooks/useI18nData'
import Layout from '@/components/Layout'

export default function Glossary() {
  const { t } = useI18n()
  const { glossary, modules } = useI18nData()
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState<number | null>(null)

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase()
    return glossary.filter((t) => {
      if (moduleFilter !== null && t.module !== moduleFilter) return false
      if (!q) return true
      return t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    })
  }, [query, moduleFilter, glossary])

  return (
    <Layout>
      <div className="py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('common.backToPlan')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg">
            <BookMarked className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t('gloss.title')}</h1>
            <p className="text-slate-400">{t('gloss.sub', { n: glossary.length })}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('gloss.search')}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2.5 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
          </div>
          <select
            value={moduleFilter ?? ''}
            onChange={(e) => setModuleFilter(e.target.value === '' ? null : Number(e.target.value))}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-white outline-none focus:border-sky-400"
          >
            <option value="">{t('gloss.allModules')}</option>
            {modules.map((m) => (
              <option key={m.id} value={m.number}>{t('gloss.moduleOption', { n: m.number, title: m.title })}</option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-sm text-slate-500">{t(terms.length === 1 ? 'gloss.count.one' : 'gloss.count.other', { n: terms.length })}</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {terms.map((term) => {
            const mod = modules.find((m) => m.number === term.module)
            return (
              <div key={term.term} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white">{term.term}</h3>
                  {mod && (
                    <Link to={`/modul/${mod.id}`} className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-700 hover:text-white">
                      {t('gloss.moduleBadge', { n: term.module })}
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{term.def}</p>
              </div>
            )
          })}
        </div>
        {terms.length === 0 && (
          <p className="mt-8 text-center text-slate-400">{t('gloss.empty')}</p>
        )}
      </div>
    </Layout>
  )
}
