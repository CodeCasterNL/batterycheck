import { reactive, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CatalogBattery } from '../types/generated'
import { usePackageSelection, pkgCapacityWh } from './usePackageSelection'
import { computeDatasetRanges } from './useDatasetRanges'

export interface FilterState {
  hasSolar: boolean | null
  isExpandable: boolean | null
  offGrid: boolean | null
  priceMin: number
  priceMax: number
  capacityMin: number
  capacityMax: number
}

export type SortOption =
  | 'name-asc'
  | 'price-kwh-asc'
  | 'price-kwh-desc'
  | 'capacity-asc'
  | 'capacity-desc'

export const sortLabels: Record<SortOption, string> = {
  'name-asc': 'Merk + Model (A-Z)',
  'price-kwh-asc': 'Prijs/kWh (laag-hoog)',
  'price-kwh-desc': 'Prijs/kWh (hoog-laag)',
  'capacity-asc': 'Max. capaciteit (laag-hoog)',
  'capacity-desc': 'Max. capaciteit (hoog-laag)',
}

function maxCapacity(b: CatalogBattery): number {
  return b.computed?.maxCapacityKwh ?? b.computed?.capacityKwh ?? b.capacityWh / 1000
}

export function useFilters(batteries: () => CatalogBattery[]) {
  const route = useRoute()
  const router = useRouter()
  const { selectedPricePerKwh } = usePackageSelection()

  const ranges = computed(() => computeDatasetRanges(batteries()))

  const defaults: FilterState = {
    hasSolar: null,
    isExpandable: null,
    offGrid: null,
    priceMin: 0,
    priceMax: 0,
    capacityMin: 0,
    capacityMax: 0,
  }

  const filters = reactive<FilterState>({ ...defaults })
  const sort = ref<SortOption>('name-asc')

  // Initialize from URL query params
  const q = route.query
  if (q.solar === '1') filters.hasSolar = true
  if (q.solar === '0') filters.hasSolar = false
  if (q.expand === '1') filters.isExpandable = true
  if (q.offgrid === '1') filters.offGrid = true
  if (q.pmin) filters.priceMin = Number(q.pmin)
  if (q.pmax) filters.priceMax = Number(q.pmax)
  if (q.cmin) filters.capacityMin = Number(q.cmin)
  if (q.cmax) filters.capacityMax = Number(q.cmax)
  if (typeof q.sort === 'string' && q.sort in sortLabels) sort.value = q.sort as SortOption

  // When data loads, update max values if not set by query params
  watch(ranges, (r) => {
    if (!q.pmax) filters.priceMax = r.priceMax
    if (!q.cmax) filters.capacityMax = r.capMax
  }, { immediate: true })

  // Sync filters to URL
  watch([filters, sort], () => {
    const query: Record<string, string> = {}
    if (filters.hasSolar === true) query.solar = '1'
    if (filters.hasSolar === false) query.solar = '0'
    if (filters.isExpandable === true) query.expand = '1'
    if (filters.offGrid === true) query.offgrid = '1'
    if (filters.priceMin > 0) query.pmin = String(filters.priceMin)
    if (filters.priceMax < ranges.value.priceMax) query.pmax = String(filters.priceMax)
    if (filters.capacityMin > 0) query.cmin = String(filters.capacityMin)
    if (filters.capacityMax < ranges.value.capMax) query.cmax = String(filters.capacityMax)
    if (sort.value !== 'name-asc') query.sort = sort.value
    router.replace({ query })
  })

  const filtered = computed(() => {
    const result = batteries().filter((b) => {
      if (filters.hasSolar === true && !b.computed?.hasSolar) return false
      if (filters.hasSolar === false && b.computed?.hasSolar) return false
      if (filters.isExpandable === true && !b.computed?.isExpandable) return false
      if (filters.offGrid === true && !b.features?.offGrid) return false

      const pkgs = b.packages ?? []
      if (pkgs.length === 0) return true

      const anyPriceMatch = pkgs.some(p =>
        (p.offerings ?? []).some(o => {
          if (o.price == null) return true
          return o.price >= filters.priceMin && o.price <= filters.priceMax
        })
      )
      if (!anyPriceMatch) return false

      const anyCapMatch = pkgs.some(p => {
        const cap = pkgCapacityWh(b, p)
        return cap >= filters.capacityMin && cap <= filters.capacityMax
      })
      if (!anyCapMatch) return false

      return true
    })

    // Sort
    result.sort((a, b) => {
      switch (sort.value) {
        case 'name-asc': {
          const cmp = a.manufacturer.localeCompare(b.manufacturer, 'nl')
          return cmp !== 0 ? cmp : a.model.localeCompare(b.model, 'nl')
        }
        case 'price-kwh-asc': {
          const pa = selectedPricePerKwh(a, filters)
          const pb = selectedPricePerKwh(b, filters)
          if (pa == null && pb == null) return 0
          if (pa == null) return 1
          if (pb == null) return -1
          return pa - pb
        }
        case 'price-kwh-desc': {
          const pa = selectedPricePerKwh(a, filters)
          const pb = selectedPricePerKwh(b, filters)
          if (pa == null && pb == null) return 0
          if (pa == null) return 1
          if (pb == null) return -1
          return pb - pa
        }
        case 'capacity-asc':
          return maxCapacity(a) - maxCapacity(b)
        case 'capacity-desc':
          return maxCapacity(b) - maxCapacity(a)
        default:
          return 0
      }
    })

    return result
  })

  function reset() {
    Object.assign(filters, {
      hasSolar: null,
      isExpandable: null,
      offGrid: null,
      priceMin: 0,
      priceMax: ranges.value.priceMax,
      capacityMin: 0,
      capacityMax: ranges.value.capMax,
    })
    sort.value = 'name-asc'
  }

  return { filters, filtered, sort, reset, ranges }
}
