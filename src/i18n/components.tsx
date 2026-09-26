// React-Komponenten der i18n-Schicht (nur Komponenten – Logik liegt in core.ts).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, Link as RouterLink } from 'react-router'
import {
  DEFAULT_LANG,
  LANGS,
  LANG_STORAGE_KEY,
  I18nContext,
  dictCache,
  detectInitialLang,
  isSupportedLang,
  loadDict,
  stripLang,
  translate,
  useI18n,
  type Dict,
  type TFn,
} from './core'

/** Wartet an der Wurzel auf die initiale Sprache und rendert dann die App. */
export function I18nGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const initial = detectInitialLang()
    const hashPath = window.location.hash.replace(/^#/, '') || '/'
    const seg = stripLang(hashPath).lang
    const wanted = seg ?? initial
    if (!seg && wanted !== DEFAULT_LANG) {
      // Kein Sprachsegment im Hash: auf gespeicherte/erkannte Sprache umschreiben.
      const target = `#/${wanted}${hashPath === '/' ? '' : hashPath}`
      window.history.replaceState(null, '', target)
    }
    loadDict(wanted).then(() => setReady(true))
  }, [])
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg font-semibold">ChemieLab …</div>
      </div>
    )
  }
  return <>{children}</>
}

/** Pro Route: stellt Sprachkontext + html lang/dir und synchronisiert URL-Wechsel. */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { lang: paramLang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const active = isSupportedLang(paramLang) ? paramLang : DEFAULT_LANG
  const [dict, setDict] = useState<Dict | null>(dictCache[active] ?? null)
  const lastRef = useRef(active)

  useEffect(() => {
    lastRef.current = active
    try {
      localStorage.setItem(LANG_STORAGE_KEY, active)
    } catch {
      /* ignorieren */
    }
    let alive = true
    loadDict(active).then((d) => {
      if (alive) setDict(d)
    })
    return () => {
      alive = false
    }
  }, [active])

  useEffect(() => {
    const info = LANGS.find((l) => l.code === active)
    document.documentElement.lang = active
    document.documentElement.dir = info?.rtl ? 'rtl' : 'ltr'
  }, [active])

  const setLang = useCallback(
    (code: string) => {
      if (code === lastRef.current) return
      const { path } = stripLang(location.pathname)
      navigate(code === DEFAULT_LANG ? path : `/${code}${path === '/' ? '' : path}`)
    },
    [location.pathname, navigate],
  )

  const t = useCallback<TFn>((key, vars) => translate(dict, key, vars), [dict])
  const prefix = active === DEFAULT_LANG ? '' : `/${active}`
  const value = useMemo(() => ({ lang: active, dict, t, ready: dict !== null, setLang, prefix }), [active, dict, t, setLang, prefix])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Link, der das Sprachpräfix automatisch voranstellt. */
export function LangLink({ to, ...props }: import('react-router').LinkProps) {
  const { prefix } = useI18n()
  const target = typeof to === 'string' ? prefix + to : to
  return <RouterLink to={target} {...props} />
}
