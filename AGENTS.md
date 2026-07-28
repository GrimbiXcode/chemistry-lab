# AGENTS.md – ChemieLab

Hinweise für KI-Coding-Agenten. Du kennst das Projekt nicht – lies diese Datei zuerst.

## Projektübersicht

**ChemieLab** ist eine interaktive Lern-Webapp für Chemie (Schulniveau), komplett als
Frontend-Single-Page-App ohne Backend. Die App ist auf Deutsch aufgebaut (Standardsprache
`de`) und in 20 Sprachen übersetzt. Inhalte: 10 Lernmodule (Materie, Atome, Periodensystem,
Bindungen, Formeln, Reaktionen, pH, Trennung, Energie, Mol) mit je 3 Lernschritten,
Quizfragen und einem interaktiven Labor, dazu Glossar, Fehlerwiederholung und Prüfungsmodus.
Gamification über XP, Level und Fortschritt – alles in `localStorage` persistiert
(Schlüssel `chemielab-progress-v1`, `chemielab-lang-v1`).

## Technologie-Stack

- **React 19 + TypeScript** (strict), **Vite 7** als Build-Tool/Dev-Server
- **react-router 7** mit `HashRouter` (statisches Hosting ohne Server-Rewrites)
- **Tailwind CSS 3.4** + **shadcn/ui** (New-York-Style, Radix-Primitives) in `src/components/ui/`
- **lucide-react** für Icons, **recharts**, **react-hook-form**/**zod** sind installiert
- Node.js 26 (siehe `.nvmrc`; Dockerfile nutzt `node:26-alpine`)
- Pfad-Alias `@/` → `src/` (in `vite.config.ts` und `tsconfig.app.json` konfiguriert)

## Build- und Test-Befehle

```bash
npm ci            # Abhängigkeiten installieren (package-lock.json vorhanden)
npm run dev       # Dev-Server auf Port 3000
npm run build     # tsc -b && vite build → dist/ (muss fehlerfrei durchlaufen)
npm run preview   # Produktions-Build lokal ansehen
npm run lint      # ESLint (flat config, eslint.config.js)
```

- **Es gibt kein Test-Framework** (kein Vitest/Jest, keine Tests). Verifikation erfolgt über
  `npm run build` (TypeScript-Check inklusive) und `npm run lint`.
- Achtung: `npm run lint` schlägt aktuell mit vorhandenen Fehlern fehl (15 errors,
  8 warnings, u. a. `react-hooks`-Regeln in `Quiz.tsx`, `TermText.tsx`, `ParticleLab.tsx`).
  Das ist Bestand, nicht deine Änderung – verschlimmere es nicht, siehe aber nicht als
  grünes Quality-Gate an.
- `npm run build` ist verifiziert fehlerfrei.

## Code-Organisation

```
src/
  main.tsx              Einstieg: StrictMode + HashRouter + I18nGate
  App.tsx               Routen: /, /modul/:id, /glossar, /fehler, /pruefung, /labore, /labor/:id
                        (alle Routen doppelt: ohne und mit Sprachpräfix /:lang)
  pages/                Home, ModulePage, Glossary, Review, Exam, Labs, LabPage
  components/
    Layout.tsx          App-Rahmen (Navigation, Footer)
    Quiz.tsx            Quiz-Komponente (mc/tf)
    TermText.tsx        Rendert Text mit Fachbegriff-Hervorhebung
    ui/                 shadcn/ui-Komponenten (nicht von Hand umschreiben)
    labs/               10 interaktive Labore + index.ts (LABS-Registry)
  data/
    appData.ts          MODULE_META + Builder-Funktionen (buildModules, buildGlossary, ...)
    labContent.ts       Sprachunabhängige Labor-Aufgabendaten
  hooks/
    useProgress.ts      XP/Fortschritt in localStorage, Custom-Event bei Änderung
    useI18nData.ts      Baut sprachabhängige Datensätze per useMemo neu
    use-mobile.ts       Breakpoint-Hook (von shadcn)
  i18n/
    index.tsx           I18nGate, I18nProvider, useI18n, LangLink, translate()
    locales/*.json      20 Sprachdateien, flache Dotted-Keys (de.json = Quelle & Fallback)
  lib/utils.ts          cn() (clsx + tailwind-merge)
```

Wichtige Konfigurationsdateien: `vite.config.ts` (Alias, Port 3000, `base: './'`),
`tsconfig.app.json` (strict, `noUnusedLocals`, `noUncheckedSideEffectImports`),
`tailwind.config.js`, `postcss.config.js`, `components.json` (shadcn), `eslint.config.js`.
Keine CI-/Deploy-Konfiguration vorhanden.

## Zentrale Konventionen (unbedingt beachten)

### i18n ist das Herzstück

- **Jeder sichtbare Text kommt über `t('key')`** aus den Locale-JSONs. Keine hart codierten
  UI-Texte. Neue Keys müssen in **allen 20 Locale-Dateien** ergänzt werden (Fallback ist
  `de.json`, fehlende Keys fallen auf Deutsch zurück – trotzdem alle pflegen).
- Keys sind flach und dotted, z. B. `m.materie.s1.title`, `level.0`, `home.hero1`.
- `de.json` ist die Referenz; Interpolation mit `{name}`-Platzhaltern via
  `t(key, { name: value })`.
- **`MODULE_META` in `src/data/appData.ts` NIEMALS übersetzen oder sprachabhängig machen** –
  dort liegen Reihenfolge, Quiz-Lösungen (`questionCorrect`) und Struktur-Metadaten.
  Sprachabhängige Inhalte werden zur Laufzeit über die `build*`-Funktionen aus den
  Übersetzungs-Keys zusammengesetzt (Zugriff in Komponenten über `useI18nData()`).
- Interne Links immer über **`LangLink`** aus `@/i18n` (setzt das Sprachpräfix automatisch),
  nicht direkt `Link` aus react-router.
- Sprachdateien werden per dynamischem Import lazy geladen (Code-Splitting pro Sprache).
  Neue Sprache: JSON-Datei in `src/i18n/locales/` + Eintrag in `LANGS` in `src/i18n/index.tsx`.
- RTL wird für `ar` und `ur` automatisch über `document.dir` gesetzt.

### Labore

- Jedes Labor ist eine Komponente in `src/components/labs/` mit Props
  `{ mode: 'explore' | 'exercise', onComplete?: () => void }` (Typ `LabComponentType`).
- Registrierung in `src/components/labs/index.ts` in der `LABS`-Map; der Schlüssel
  entspricht `MODULE_META[].interactive` (z. B. `particles`, `atom`, `ph`).
- Sprachunabhängige Aufgabendaten (Zahlen, Antworten, IDs) gehören in
  `src/data/labContent.ts`; Texte wiederum über i18n-Keys.

### Fortschritt/State

- Kein State-Management, kein Server. State = React-Hooks + `localStorage` über
  `useProgress()`. Änderungen feuern das Window-Event `chemielab-progress-updated`,
  damit mehrere Komponenten synchron bleiben.
- XP-Logik: +10 pro richtiger Frage (einmalig), +50 pro abgeschlossenem Labor,
  Prüfungs-XP nur für Verbesserung des Bestwerts. Level-Schwellen in `XP_STEPS`.

### Stil & Code-Stil

- **Kommentare und UI-Texte im Projekt sind auf Deutsch** – neue Code-Kommentare ebenfalls
  auf Deutsch schreiben. Bezeichner auf Englisch.
- Styling ausschließlich mit Tailwind-Klassen; Theme über CSS-Variablen in `src/index.css`
  (`hsl(var(--...))`), dunkles Slate-Design. `cn()` aus `@/lib/utils` zum Zusammenführen.
- shadcn/ui-Komponenten aus `@/components/ui` verwenden statt neue Basis-Komponenten zu bauen.
- TypeScript strict ist aktiv; `verbatimModuleSyntax` → Typ-Imports mit `import type`.
- ESLint: flat config mit `typescript-eslint`, `react-hooks`, `react-refresh`.

## Deployment

- `npm run build` erzeugt statische Dateien in `dist/`; dank `base: './'` und `HashRouter`
  läuft der Build von jedem statischen Host/Unterpfad ohne Server-Konfiguration.
- Es gibt kein CI/CD, keine GitHub Actions, kein Backend, keine Umgebungsvariablen.

## Sicherheit

- Keine Secrets, keine API-Keys, keine Netzwerk-Calls – die App ist vollständig clientseitig.
- Nutzereingaben werden nur lokal verarbeitet (Quiz/Labore); Fortschritt liegt ausschließlich
  im `localStorage` des Browsers. Keine sensiblen Daten.
