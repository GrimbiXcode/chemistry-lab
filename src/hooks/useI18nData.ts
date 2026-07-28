import { useMemo } from 'react'
import { useI18n } from '@/i18n'
import { buildModules, buildGlossary, buildElements, buildLevels, buildLabInfos } from '@/data/appData'

/** Sprachabhängige Datensätze des Kurses – bauen sich neu bei Sprachwechsel. */
export function useI18nData() {
  const { t, lang } = useI18n()
  // lang als Teil der Abhängigkeit: t ändert seine Identität mit dem Dict.
  const modules = useMemo(() => buildModules(t), [t, lang])
  const glossary = useMemo(() => buildGlossary(t), [t, lang])
  const elements = useMemo(() => buildElements(t), [t, lang])
  const levels = useMemo(() => buildLevels(t), [t, lang])
  const labInfos = useMemo(() => buildLabInfos(t), [t, lang])
  return { modules, glossary, elements, levels, labInfos }
}
