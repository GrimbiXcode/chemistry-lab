import { useMemo } from 'react'
import { useI18n } from '@/i18n'
import { buildModules, buildGlossary, buildElements, buildLevels, buildLabInfos } from '@/data/appData'

/** Sprachabhängige Datensätze des Kurses – bauen sich neu bei Sprachwechsel. */
export function useI18nData() {
  const { t } = useI18n()
  // t wechselt seine Identität, sobald ein neues Wörterbuch geladen ist –
  // damit bauen sich alle Datensätze automatisch beim Sprachwechsel neu.
  const modules = useMemo(() => buildModules(t), [t])
  const glossary = useMemo(() => buildGlossary(t), [t])
  const elements = useMemo(() => buildElements(t), [t])
  const levels = useMemo(() => buildLevels(t), [t])
  const labInfos = useMemo(() => buildLabInfos(t), [t])
  return { modules, glossary, elements, levels, labInfos }
}
