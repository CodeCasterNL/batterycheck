import { computed, type Ref } from 'vue'
import type { CatalogBattery } from '../types/generated'
import { pkgCapacityWh } from './usePackageSelection'

export interface DatasetRanges {
  priceMin: number
  priceMax: number
  capMin: number
  capMax: number
}

const PRICE_STEP = 50
const CAP_STEP = 500

function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

export function computeDatasetRanges(batteries: CatalogBattery[]): DatasetRanges {
  let maxPrice = 0
  let maxCap = 0

  for (const b of batteries) {
    for (const pkg of b.packages ?? []) {
      const capWh = pkgCapacityWh(b, pkg)
      if (capWh > maxCap) maxCap = capWh

      for (const o of pkg.offerings ?? []) {
        if (o.price != null && o.price > maxPrice) maxPrice = o.price
      }
    }
  }

  return {
    priceMin: 0,
    priceMax: roundUpTo(maxPrice, PRICE_STEP),
    capMin: 0,
    capMax: roundUpTo(maxCap, CAP_STEP),
  }
}

export function useDatasetRanges(batteries: Ref<CatalogBattery[]>) {
  return computed(() => computeDatasetRanges(batteries.value))
}
