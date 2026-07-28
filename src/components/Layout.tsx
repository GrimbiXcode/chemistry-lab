import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LangLink as Link } from '@/i18n'
import { FlaskConical, Star, BookMarked, FlaskRound, Languages, Check, Home } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { useI18n, LANGS } from '@/i18n'

function LangSwitcher() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const active = LANGS.find((l) => l.code === lang)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('ui.lang.label')}
        className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{active?.native}</span>
      </button>
      {open && (
        <div className="fixed inset-x-3 top-16 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-96 sm:w-52">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                l.code === lang ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>
                <span className="block font-semibold">{l.native}</span>
                <span className="block text-xs text-slate-500">{l.name}</span>
              </span>
              {l.code === lang && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { t, dict } = useI18n()
  const { progress, level, nextLevel, levelProgress } = useProgress(dict)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white">
              <FlaskConical className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">{t('ui.brand')}</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              aria-label={t('ui.nav.home')}
              className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <Home className="h-4 w-4" /> <span className="hidden sm:inline">{t('ui.nav.home')}</span>
            </Link>
            <LangSwitcher />
            <Link
              to="/labore"
              className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <FlaskRound className="h-4 w-4" /> <span className="hidden sm:inline">{t('ui.nav.labs')}</span>
            </Link>
            <Link
              to="/glossar"
              className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <BookMarked className="h-4 w-4" /> <span className="hidden sm:inline">{t('ui.nav.glossary')}</span>
            </Link>
            <div className="hidden items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-sm font-bold text-amber-300 sm:flex">
              <Star className="h-4 w-4 fill-amber-300" /> {t('ui.xp', { xp: progress.xp })}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white">{level.name}</div>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style={{ width: `${levelProgress}%` }} />
                </div>
              </div>
              {nextLevel && <span className="hidden text-[10px] text-slate-500 md:inline">{t('ui.untilLevel', { name: nextLevel.name })}</span>}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
    </div>
  )
}
