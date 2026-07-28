import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, Link as RouterLink } from 'react-router'
import de from './locales/de.json'

export const DEFAULT_LANG = 'de'
const STORAGE_KEY = 'chemielab-lang-v1'

export interface LangInfo {
  code: string
  name: string
  native: string
  rtl?: boolean
}

// Die 20 meistgesprochenen Sprachen der Welt.
export const LANGS: LangInfo[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh', name: 'Mandarin Chinese', native: '中文' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'ko', name: 'Korean', native: '한국어' },
]

export type Dict = Record<string, string>
const DE_DICT: Dict = de as Dict

const cache: Record<string, Dict> = { de: DE_DICT }

// Eine Sprachdatei nachladen (Code-Splitting: nur aktive Sprache wird geladen).
async function loadDict(code: string): Promise<Dict> {
  if (cache[code]) return cache[code]
  const mod = await import(`./locales/${code}.json`)
  cache[code] = mod.default as Dict
  return cache[code]
}

/** Interpolation {name} und Fallback auf Deutsch. */
export function translate(dict: Dict | null, key: string, vars?: Record<string, string | number>): string {
  let s = (dict && dict[key]) ?? DE_DICT[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
  }
  return s
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string

interface I18nCtx {
  lang: string
  dict: Dict | null
  t: TFn
  ready: boolean
  setLang: (code: string) => void
  prefix: string
}

const Ctx = createContext<I18nCtx>({
  lang: DEFAULT_LANG,
  dict: DE_DICT,
  t: (k, v) => translate(DE_DICT, k, v),
  ready: true,
  setLang: () => {},
  prefix: '',
})

export const useI18n = () => useContext(Ctx)

export function stripLang(pathname: string): { lang: string | null; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/.*)?$/)
  if (m && LANGS.some((l) => l.code === m[1])) {
    return { lang: m[1], path: m[2] || '/' }
  }
  return { lang: null, path: pathname }
}

function detectInitialLang(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LANGS.some((l) => l.code === stored)) return stored
  const nav = (navigator.language || '').slice(0, 2).toLowerCase()
  if (LANGS.some((l) => l.code === nav)) return nav
  return DEFAULT_LANG
}

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
  const active = LANGS.some((l) => l.code === paramLang) ? paramLang! : DEFAULT_LANG
  const [dict, setDict] = useState<Dict | null>(cache[active] ?? null)
  const lastRef = useRef(active)

  useEffect(() => {
    lastRef.current = active
    localStorage.setItem(STORAGE_KEY, active)
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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Link, der das Sprachpräfix automatisch voranstellt. */
export function LangLink({ to, ...props }: import('react-router').LinkProps) {
  const { prefix } = useI18n()
  const target = typeof to === 'string' ? prefix + to : to
  return <RouterLink to={target} {...props} />
}
