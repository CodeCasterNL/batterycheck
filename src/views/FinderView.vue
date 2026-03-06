<script setup lang="ts">
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalog } from '../composables/useCatalog'
import { pkgCapacityWh, formatPkgLabel } from '../composables/usePackageSelection'
import { useDatasetRanges } from '../composables/useDatasetRanges'
import FilterSlider from '../components/FilterSlider.vue'
import CollapsibleMobile from '../components/CollapsibleMobile.vue'
import { formatEur, formatEurDecimal } from '../utils/format'
import type { CatalogBattery, CatalogPackage, CatalogOffering } from '../types/generated'

const route = useRoute()
const router = useRouter()
const { batteries } = useCatalog()
const ranges = useDatasetRanges(batteries)

// --- State ---
const q = route.query
const hasParams = Object.keys(q).length > 0
const step = ref(hasParams ? 0 : 1)

const priceMin = ref(q.pmin != null ? Number(q.pmin) : 0)
const priceMax = ref(q.pmax != null ? Number(q.pmax) : 0)
const capMin = ref(q.cmin != null ? Number(q.cmin) : 0)
const capMax = ref(q.cmax != null ? Number(q.cmax) : 0)
const wantSolar = ref(q.solar === '1')
const wantOffGrid = ref(q.offgrid === '1')
const wantExpandable = ref(q.expand === '1')

// --- Flat offering list ---
interface OfferingEntry {
  battery: CatalogBattery
  pkg: CatalogPackage
  offering: CatalogOffering
  capWh: number
}

const allEntries = computed<OfferingEntry[]>(() => {
  const entries: OfferingEntry[] = []
  for (const b of batteries.value) {
    for (const pkg of b.packages ?? []) {
      const capWh = pkgCapacityWh(b, pkg)
      for (const o of pkg.offerings ?? []) {
        if (o.price != null) entries.push({ battery: b, pkg, offering: o, capWh })
      }
    }
  }
  return entries
})

// Entries filtered by price selection (for capacity step)
const priceFilteredEntries = computed(() =>
  allEntries.value.filter(e =>
    e.offering.price! >= priceMin.value && e.offering.price! <= priceMax.value
  ),
)

// --- Dynamic brackets ---
interface Bracket { label: string; min: number; max: number; count: number }

function buildBrackets(
  values: number[], roundTo: number, absMin: number, absMax: number,
  fmt: (v: number) => string,
): Bracket[] {
  const sorted = values.filter(v => v > 0).sort((a, b) => a - b)
  if (sorted.length === 0) return []

  const rawBreaks = [0.25, 0.5, 0.75].map(p =>
    Math.round(sorted[Math.floor(sorted.length * p)]! / roundTo) * roundTo,
  )
  const breaks = [...new Set(rawBreaks)].filter(b => b > absMin).sort((a, b) => a - b)

  const brackets: Bracket[] = []
  let prev = absMin
  for (const bp of breaks) {
    if (bp <= prev) continue
    brackets.push({
      label: prev === absMin ? `Tot ${fmt(bp)}` : `${fmt(prev)} – ${fmt(bp)}`,
      min: prev, max: bp,
      count: sorted.filter(v => v >= prev && v < bp).length,
    })
    prev = bp
  }
  brackets.push({
    label: `Vanaf ${fmt(prev)}`,
    min: prev, max: absMax,
    count: sorted.filter(v => v >= prev).length,
  })
  return brackets
}

function bestDefaultBracket(brackets: Bracket[]): Bracket | null {
  if (brackets.length === 0) return null
  return brackets.reduce((best, br) => br.count > best.count ? br : best, brackets[0]!)
}

// --- Bracket step config ---
interface BracketStepConfig {
  title: string
  brackets: ComputedRef<Bracket[]>
  allCount: ComputedRef<number>
  min: Ref<number>
  max: Ref<number>
  absMin: ComputedRef<number>
  absMax: ComputedRef<number>
}

const priceBrackets = computed(() =>
  buildBrackets(allEntries.value.map(e => e.offering.price!), 500, ranges.value.priceMin, ranges.value.priceMax, formatEur),
)
const capBrackets = computed(() =>
  buildBrackets(
    priceFilteredEntries.value.map(e => e.capWh), 1000, ranges.value.capMin, ranges.value.capMax,
    v => `${(v / 1000).toLocaleString('nl-NL')} kWh`,
  ),
)

const bracketSteps: BracketStepConfig[] = [
  {
    title: 'Wat is je budget?',
    brackets: priceBrackets,
    allCount: computed(() => allEntries.value.length),
    min: priceMin, max: priceMax,
    absMin: computed(() => ranges.value.priceMin),
    absMax: computed(() => ranges.value.priceMax),
  },
  {
    title: 'Hoeveel opslagcapaciteit?',
    brackets: capBrackets,
    allCount: computed(() => priceFilteredEntries.value.length),
    min: capMin, max: capMax,
    absMin: computed(() => ranges.value.capMin),
    absMax: computed(() => ranges.value.capMax),
  },
]

function selectBracket(cfg: BracketStepConfig, br: Bracket) { cfg.min.value = br.min; cfg.max.value = br.max }
function selectAll(cfg: BracketStepConfig) { cfg.min.value = cfg.absMin.value; cfg.max.value = cfg.absMax.value }
function isSel(cfg: BracketStepConfig, br: Bracket) { return cfg.min.value === br.min && cfg.max.value === br.max }
function isAll(cfg: BracketStepConfig) { return cfg.min.value === cfg.absMin.value && cfg.max.value === cfg.absMax.value }

function selectDefaults() {
  for (const cfg of bracketSteps) {
    const best = bestDefaultBracket(cfg.brackets.value)
    if (best) { cfg.min.value = best.min; cfg.max.value = best.max }
    else { cfg.min.value = cfg.absMin.value; cfg.max.value = cfg.absMax.value }
  }
}

// --- Initialization ---
if (hasParams) {
  // Results page: fill in missing max values from dataset
  watch(ranges, (r) => {
    if (q.pmax == null) priceMax.value = r.priceMax
    if (q.cmax == null) capMax.value = r.capMax
  }, { immediate: true })
} else {
  // Wizard: auto-select best brackets when data loads
  watch(() => allEntries.value.length, (len) => {
    if (len > 0) selectDefaults()
  }, { immediate: true })
}

// --- URL sync ---
function buildQuery(): Record<string, string> {
  const r = ranges.value
  const query: Record<string, string> = {}
  if (priceMin.value > r.priceMin) query.pmin = String(priceMin.value)
  if (priceMax.value < r.priceMax) query.pmax = String(priceMax.value)
  if (capMin.value > r.capMin) query.cmin = String(capMin.value)
  if (capMax.value < r.capMax) query.cmax = String(capMax.value)
  if (wantSolar.value) query.solar = '1'
  if (wantOffGrid.value) query.offgrid = '1'
  if (wantExpandable.value) query.expand = '1'
  return query
}

function syncQuery() {
  const query = buildQuery()
  if (Object.keys(query).length === 0) query.r = '1'
  router.replace({ query })
}

watch([priceMin, priceMax, capMin, capMax, wantSolar, wantOffGrid, wantExpandable], () => {
  if (step.value === 0) syncQuery()
})

// --- Navigation ---
const totalSteps = 1 + bracketSteps.length // bracket steps + features

function next() {
  if (step.value < totalSteps) step.value++
  else { step.value = 0; syncQuery() }
}
function back() {
  if (step.value === 0) step.value = totalSteps
  else if (step.value > 1) step.value--
}
function restart() {
  wantSolar.value = false
  wantOffGrid.value = false
  wantExpandable.value = false
  selectDefaults()
  step.value = 1
  router.replace({ query: {} })
}

// --- Results ---
interface ResultEntry {
  battery: CatalogBattery
  pkg: CatalogPackage
  offering: CatalogOffering
  capacityKwh: number
  pricePerKwh: number
}

function matchesFeatures(b: CatalogBattery): boolean {
  if (wantSolar.value && !b.computed?.hasSolar) return false
  if (wantOffGrid.value && !b.features?.offGrid) return false
  if (wantExpandable.value && !b.computed?.isExpandable) return false
  return true
}

const results = computed<ResultEntry[]>(() => {
  const entries = allEntries.value
    .filter(e => {
      if (!matchesFeatures(e.battery)) return false
      if (e.capWh < capMin.value || e.capWh > capMax.value) return false
      if (e.offering.price! < priceMin.value || e.offering.price! > priceMax.value) return false
      return true
    })
    .map(e => ({
      battery: e.battery, pkg: e.pkg, offering: e.offering,
      capacityKwh: e.capWh / 1000,
      pricePerKwh: e.offering.price! / (e.capWh / 1000),
    }))
  entries.sort((a, b) => a.pricePerKwh - b.pricePerKwh)
  return entries
})

const totalMatchingFeatures = computed(() =>
  allEntries.value.filter(e => matchesFeatures(e.battery)).length,
)
const outsideRange = computed(() => totalMatchingFeatures.value - results.value.length)

const databaseQuery = computed(() => {
  const query = buildQuery()
  query.sort = 'price-kwh-asc'
  return query
})

</script>

<template>
  <div class="finder">
    <h2>Zoek een batterij</h2>

    <!-- Wizard -->
    <template v-if="step > 0">
      <div class="progress">
        <div
          v-for="s in totalSteps" :key="s"
          class="progress-step"
          :class="{ active: s === step, done: s < step }"
        >{{ s }}</div>
      </div>

      <!-- Bracket steps (budget, capacity) -->
      <div v-for="(cfg, i) in bracketSteps" :key="i">
        <div v-if="step === i + 1" class="step-card surface">
          <h3>{{ cfg.title }}</h3>
          <div class="bracket-options">
            <button
              v-for="(br, j) in cfg.brackets.value" :key="j"
              class="bracket-btn" :class="{ selected: isSel(cfg, br) }"
              @click="selectBracket(cfg, br)"
            >
              <span class="bracket-label">{{ br.label }}</span>
              <span class="bracket-count">{{ br.count }} resultaten</span>
            </button>
            <button
              class="bracket-btn" :class="{ selected: isAll(cfg) }"
              @click="selectAll(cfg)"
            >
              <span class="bracket-label">Maakt niet uit</span>
              <span class="bracket-count">{{ cfg.allCount.value }} resultaten</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Features step -->
      <div v-if="step === bracketSteps.length + 1" class="step-card surface">
        <h3>Welke functies zijn belangrijk?</h3>
        <p class="step-hint">Optioneel — sla over als je geen voorkeur hebt.</p>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="wantSolar" /> Zonne-invoer (MPPT)</label>
          <label><input type="checkbox" v-model="wantOffGrid" /> Off-grid / noodstroom</label>
          <label><input type="checkbox" v-model="wantExpandable" /> Uitbreidbaar</label>
        </div>
      </div>

      <div class="step-nav">
        <button v-if="step > 1" class="btn btn-secondary" @click="back">Vorige</button>
        <span v-else />
        <button class="btn btn-primary" @click="next">
          {{ step < totalSteps ? 'Volgende' : 'Bekijk resultaten' }}
        </button>
      </div>
    </template>

    <!-- Results -->
    <template v-if="step === 0">
      <div class="filters-bar surface">
        <CollapsibleMobile label="Filters">
          <div class="filter-sliders">
            <FilterSlider
              v-model:min="priceMin" v-model:max="priceMax"
              label="Budget" :abs-min="ranges.priceMin" :abs-max="ranges.priceMax" :step="50" suffix="EUR"
            />
            <FilterSlider
              v-model:min="capMin" v-model:max="capMax"
              label="Capaciteit" :abs-min="ranges.capMin" :abs-max="ranges.capMax" :step="500" suffix="Wh"
            />
          </div>
          <div class="filter-group">
            <span class="filter-label">Functies</span>
            <div class="filter-options">
              <label :class="{ selected: wantSolar }"><input type="checkbox" v-model="wantSolar" />Zonne-invoer</label>
              <label :class="{ selected: wantOffGrid }"><input type="checkbox" v-model="wantOffGrid" />Off-grid</label>
              <label :class="{ selected: wantExpandable }"><input type="checkbox" v-model="wantExpandable" />Uitbreidbaar</label>
            </div>
          </div>
        </CollapsibleMobile>
      </div>

      <div class="results-header">
        <div class="results-counts">
          <span class="result-count">{{ results.length }} resultaat{{ results.length === 1 ? '' : 'en' }}</span>
          <span v-if="outsideRange > 0" class="outside-count">{{ outsideRange }} buiten filterbereik</span>
        </div>
        <div class="results-actions">
          <button class="btn btn-secondary btn-sm" @click="restart">Opnieuw zoeken</button>
          <router-link :to="{ path: '/database', query: databaseQuery }" class="btn btn-primary btn-sm">
            Bekijk in database
          </router-link>
        </div>
      </div>

      <div v-if="results.length === 0" class="no-results surface">
        Geen batterijen gevonden met deze criteria. Pas je filters hierboven aan.
      </div>

      <div class="result-cards">
        <div v-for="(r, i) in results" :key="i" class="result-card surface">
          <div class="rc-top">
            <router-link :to="`/batterij/${r.battery.manufacturerSlug}/${r.battery.modelSlug}`" class="rc-identity">
              <strong>{{ r.battery.manufacturer }}</strong>
              <span class="rc-model">{{ r.battery.model }}</span>
            </router-link>
            <span class="rc-price-kwh">{{ formatEurDecimal(r.pricePerKwh) }}/kWh</span>
          </div>
          <div class="rc-stats">
            <span class="rc-stat rc-capacity" title="Capaciteit">
              <svg class="icon-bolt" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1L4 9h4l-1.5 6L13 7H9l.5-6z"/></svg>
              {{ r.capacityKwh % 1 === 0 ? r.capacityKwh.toFixed(1) : r.capacityKwh.toFixed(2) }} kWh
            </span>
            <span v-if="(r.pkg.baseCount ?? 1) > 1 || (r.pkg.expansionCount ?? 0) > 0" class="rc-stat rc-pkg">{{ formatPkgLabel(r.pkg) }}</span>
          </div>
          <div class="rc-retailer">
            Kopen: <a :href="r.offering.url" target="_blank" rel="noopener" class="rc-buy">
              {{ r.offering.retailer }}
            </a>
            <span class="rc-offering-price">{{ r.offering.price != null ? formatEur(r.offering.price) : '-' }}</span>
          </div>
          <div class="rc-bottom">
            <div class="rc-badges">
              <span v-if="r.battery.computed?.hasSolar" class="badge">Zonne-invoer</span>
              <span v-if="r.battery.features?.offGrid" class="badge">Off-grid</span>
              <span v-if="r.battery.computed?.isExpandable" class="badge">Uitbreidbaar</span>
              <span v-if="r.battery.features?.ups" class="badge">UPS</span>
            </div>
            <router-link :to="`/batterij/${r.battery.manufacturerSlug}/${r.battery.modelSlug}`" class="rc-detail-link">Alle specificaties</router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.finder {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.finder h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Progress */
.progress {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.progress-step {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-border);
  color: var(--color-text-muted);
}
.progress-step.active { background: var(--color-primary); color: white; }
.progress-step.done { background: var(--color-primary-light); color: var(--color-primary); }

/* Wizard step cards */
.step-card {
  padding: 1.5rem;
}
.step-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.step-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

/* Bracket buttons */
.bracket-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
@media (max-width: 500px) {
  .bracket-options { flex-direction: column; }
  .bracket-btn { width: 100%; }
}
.bracket-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.6rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.12s;
  min-width: 7rem;
}
.bracket-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.bracket-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: 0 0 0 1px var(--color-primary);
}
.bracket-label {
  font-size: 0.88rem;
  font-weight: 600;
}
.bracket-count {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

/* Feature checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}
.checkbox-group label:hover { background: var(--color-primary-light); }

.step-nav {
  display: flex;
  justify-content: space-between;
}

/* Filter bar */
.filters-bar {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.filter-sliders {
  display: flex;
  gap: 1.5rem;
}
@media (max-width: 500px) {
  .filter-sliders { flex-direction: column; }
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  min-width: 5.5rem;
  flex-shrink: 0;
}
.filter-options {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.filter-options label {
  display: inline-flex;
  align-items: center;
  gap: 0;
  font-size: 0.8rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  cursor: pointer;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  transition: all 0.12s;
  white-space: nowrap;
}
.filter-options label:hover { border-color: var(--color-primary); }
.filter-options label.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}
.filter-options input[type="checkbox"] { display: none; }

/* Results header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.results-counts {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.results-actions {
  display: flex;
  gap: 0.4rem;
}
.result-count {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
.outside-count {
  font-size: 0.78rem;
  color: var(--color-accent);
  font-weight: 500;
}
.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

/* Result cards */
.result-cards {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.result-card {
  padding: 0.85rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.rc-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}
.rc-identity {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}
.rc-identity:hover strong {
  color: var(--color-primary);
}
.rc-identity strong { font-size: 0.92rem; }
.rc-model {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-price-kwh {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--color-primary);
  white-space: nowrap;
}
.rc-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.rc-stat {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.rc-capacity {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}
.icon-bolt {
  width: 0.85em;
  height: 0.85em;
  color: var(--color-accent);
  flex-shrink: 0;
}
.rc-pkg { font-style: italic; }
.rc-retailer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rc-buy {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
.rc-buy:hover { text-decoration: underline; }
.rc-offering-price {
  font-size: 0.85rem;
  font-weight: 600;
}
.rc-badges {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.rc-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.rc-detail-link {
  font-size: 0.78rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}
.rc-detail-link:hover { text-decoration: underline; }
</style>
