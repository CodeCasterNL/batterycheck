import { reactive } from 'vue'
import type { CatalogBattery, CatalogPackage } from '../types/generated'
import type { FilterState } from './useFilters'

// Global selected-package-index per battery id
const selectedPkg: Record<string, number> = reactive({})

export function formatPkgLabel(pkg: CatalogPackage): string {
  const base = pkg.baseCount ?? 1
  const exp = pkg.expansionCount ?? 0
  if (base === 1 && exp === 0) return '1 basisbatterij'
  if (base > 1 && exp > 0) {
    return `${base} basisbatterijen met ${exp} uitbreiding${exp === 1 ? '' : 'en'}`
  }
  if (base > 1) return `${base} basisbatterijen`
  return `1 basisbatterij met ${exp} uitbreiding${exp === 1 ? '' : 'en'}`
}

export function cheapestOfferingPrice(pkg: CatalogPackage): number | null {
  if (!pkg.offerings || pkg.offerings.length === 0) return null
  let lowest: number | null = null
  for (const o of pkg.offerings) {
    if (o.price != null && (lowest === null || o.price < lowest)) lowest = o.price
  }
  return lowest
}

export function pkgCapacityWh(battery: CatalogBattery, pkg: CatalogPackage): number {
  const baseCount = pkg.baseCount ?? 1
  const expansionCount = pkg.expansionCount ?? 0
  return baseCount * battery.capacityWh
    + expansionCount * (battery.expansion?.expansionCapacityWh ?? 0)
}

export function getFilteredPackages(battery: CatalogBattery, filters?: FilterState): CatalogPackage[] {
  const all = battery.packages ?? []
  const filtered = !filters ? all : all.filter(p => {
    const price = cheapestOfferingPrice(p)
    if (price != null && (price < filters.priceMin || price > filters.priceMax)) return false
    const cap = pkgCapacityWh(battery, p)
    if (cap < filters.capacityMin || cap > filters.capacityMax) return false
    return true
  })
  return filtered.sort((a, b) => (cheapestOfferingPrice(a) ?? 0) - (cheapestOfferingPrice(b) ?? 0))
}

export function usePackageSelection() {
  function getSelectedIndex(battery: CatalogBattery, filters?: FilterState): number {
    const idx = selectedPkg[battery.id] ?? 0
    const pkgs = getFilteredPackages(battery, filters)
    return idx < pkgs.length ? idx : 0
  }

  function setSelectedIndex(batteryId: string, index: number) {
    selectedPkg[batteryId] = index
  }

  function resetOutOfBounds(batteries: CatalogBattery[], filters?: FilterState) {
    for (const b of batteries) {
      const pkgs = getFilteredPackages(b, filters)
      if ((selectedPkg[b.id] ?? 0) >= pkgs.length) {
        selectedPkg[b.id] = 0
      }
    }
  }

  /** Price/kWh for the currently selected package of a battery */
  function selectedPricePerKwh(battery: CatalogBattery, filters?: FilterState): number | null {
    const pkgs = getFilteredPackages(battery, filters)
    const pkg = pkgs[getSelectedIndex(battery, filters)]
    if (!pkg) return null
    const price = cheapestOfferingPrice(pkg)
    if (price == null) return null
    const wh = pkgCapacityWh(battery, pkg)
    if (wh <= 0) return null
    return price / (wh / 1000)
  }

  return { getSelectedIndex, setSelectedIndex, resetOutOfBounds, selectedPricePerKwh }
}
