// Sprachunabhängiger Kern der i18n-Schicht: Sprachliste, Wörterbuch-Cache,
// translate()-Helper und der React-Kontext. Enthält bewusst keine Komponenten
// (siehe components.tsx), damit Fast Refresh sauber funktioniert.
import { createContext, useContext } from 'react'
import de from './locales/de.json'

export const DEFAULT_LANG = 'de'
export const LANG_STORAGE_KEY = 'chemielab-lang-v1'

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
export const DE_DICT: Dict = de as Dict

export const dictCache: Record<string, Dict> = { de: DE_DICT }

// Alle Sprachdateien ausser Deutsch als Lazy-Loader (ein Chunk pro Sprache).
// Deutsch ist als Fallback statisch eingebunden und wird deshalb ausgenommen.
const dictLoaders = import.meta.glob<{ default: Dict }>(['./locales/*.json', '!./locales/de.json'])

export function isSupportedLang(code: string | undefined | null): code is string {
  return !!code && LANGS.some((l) => l.code === code)
}

/**
 * Eine Sprachdatei nachladen (Code-Splitting: nur die aktive Sprache wird geladen).
 * Schlägt der Import fehl (z. B. offline), fällt die App auf Deutsch zurück,
 * statt dauerhaft im Ladezustand zu hängen.
 */
export async function loadDict(code: string): Promise<Dict> {
  if (dictCache[code]) return dictCache[code]
  const loader = dictLoaders[`./locales/${code}.json`]
  if (!loader) return DE_DICT
  try {
    const mod = await loader()
    dictCache[code] = mod.default
    return dictCache[code]
  } catch (err) {
    console.warn(`[i18n] Sprachdatei „${code}“ konnte nicht geladen werden – Fallback auf Deutsch.`, err)
    return DE_DICT
  }
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

export interface I18nCtx {
  lang: string
  dict: Dict | null
  t: TFn
  ready: boolean
  setLang: (code: string) => void
  prefix: string
}

export const I18nContext = createContext<I18nCtx>({
  lang: DEFAULT_LANG,
  dict: DE_DICT,
  t: (k, v) => translate(DE_DICT, k, v),
  ready: true,
  setLang: () => {},
  prefix: '',
})

export const useI18n = () => useContext(I18nContext)

/** Zerlegt einen Pfad in optionales Sprachsegment und Rest: „/fr/glossar“ → { lang: 'fr', path: '/glossar' }. */
export function stripLang(pathname: string): { lang: string | null; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/.*)?$/)
  if (m && isSupportedLang(m[1])) {
    return { lang: m[1], path: m[2] || '/' }
  }
  return { lang: null, path: pathname }
}

/** Gespeicherte Sprache, sonst Browsersprache, sonst Deutsch. */
export function detectInitialLang(): string {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (isSupportedLang(stored)) return stored
  } catch {
    /* localStorage kann z. B. im Privatmodus gesperrt sein */
  }
  const nav = (navigator.language || '').slice(0, 2).toLowerCase()
  if (isSupportedLang(nav)) return nav
  return DEFAULT_LANG
}
