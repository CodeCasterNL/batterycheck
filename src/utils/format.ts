const eurWhole = new Intl.NumberFormat('nl-NL', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
})

const eurDecimal = new Intl.NumberFormat('nl-NL', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
})

export function formatEur(value: number | null | undefined): string {
  if (value == null) return '-'
  return eurWhole.format(value)
}

export function formatEurDecimal(value: number | null | undefined): string {
  if (value == null) return '-'
  return eurDecimal.format(value)
}

export function mmToCm(mm: number | null | undefined): string {
  if (mm == null) return '?'
  return (mm / 10).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
