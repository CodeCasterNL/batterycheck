import { ref, type Ref } from 'vue'
import type { Catalog, CatalogBattery } from '../types/generated'

const batteries = ref<CatalogBattery[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
let loaded = false

async function load() {
  if (loaded) return
  loaded = true
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}catalog.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const catalog: Catalog = await res.json()
    batteries.value = catalog.batteries
  } catch (e) {
    error.value = `Kan gegevens niet laden: ${e instanceof Error ? e.message : e}`
  } finally {
    isLoading.value = false
  }
}

/** Pre-load catalog data (used by SSR to inject data before rendering). */
export function setCatalogData(data: CatalogBattery[]) {
  batteries.value = data
  isLoading.value = false
  error.value = null
  loaded = true
}

/** Reset module state (needed between SSR renders since refs are module-level singletons). */
export function resetCatalog() {
  batteries.value = []
  isLoading.value = true
  error.value = null
  loaded = false
}

export function useCatalog(): {
  batteries: Ref<CatalogBattery[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
} {
  if (!loaded) load()
  return { batteries, isLoading, error }
}
