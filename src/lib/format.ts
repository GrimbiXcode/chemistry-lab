/**
 * Zahlen sprachabhängig formatieren (z. B. „35,5“ auf Deutsch, „35.5“ auf Englisch).
 * Ganze Zahlen werden ohne Nachkommastellen ausgegeben.
 */
export function formatNumber(value: number, lang: string, maxFractionDigits = 1): string {
  try {
    return new Intl.NumberFormat(lang, { maximumFractionDigits: maxFractionDigits }).format(value)
  } catch {
    return String(value)
  }
}

/** Wie formatNumber, aber mit fester Anzahl Nachkommastellen (z. B. pH 7,0). */
export function formatFixed(value: number, lang: string, fractionDigits: number): string {
  try {
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  } catch {
    return value.toFixed(fractionDigits)
  }
}
