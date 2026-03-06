<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CatalogBattery, CatalogOffering } from '../types/generated'
import type { FilterState } from '../composables/useFilters'
import { usePackageSelection, getFilteredPackages, cheapestOfferingPrice, pkgCapacityWh } from '../composables/usePackageSelection'
import { formatEur, formatEurDecimal } from '../utils/format'
import BatteryCard from './BatteryCard.vue'
import SpecRow from './SpecRow.vue'

const props = defineProps<{
  batteries: CatalogBattery[]
  filters?: FilterState
}>()

const specSections = [
  {
    label: 'Basis',
    rows: [
      { key: 'manufacturer', label: 'Merk' },
      { key: 'capacityKwh', label: 'Basiscapaciteit' },
      { key: 'maxChargePowerW', label: 'Laadvermogen' },
      { key: 'maxDischargePowerW', label: 'Ontlaadvermogen' },
      { key: 'expansion', label: 'Uitbreidbaar' },
      { key: 'forumUrl', label: 'Forum' },
    ],
  },
  {
    label: 'Uitbreiding',
    rows: [
      { key: 'expansionModel', label: 'Model' },
      { key: 'expansionCapacity', label: 'Capaciteit' },
      { key: 'expansionMaxUnits', label: 'Max. aantal' },
      { key: 'expansionMaxCapacity', label: 'Max. capaciteit' },
    ],
  },
  {
    label: 'Off-grid / noodstroom',
    rows: [
      { key: 'offGridPowerW', label: 'Vermogen' },
      { key: 'offGridPeakPowerW', label: 'Piekvermogen' },
      { key: 'ups', label: 'UPS' },
    ],
  },
  {
    label: 'Fysiek',
    rows: [
      { key: 'dimensions', label: 'Afmetingen' },
      { key: 'weightKg', label: 'Gewicht' },
      { key: 'ipRating', label: 'IP-rating' },
    ],
  },
  {
    label: 'Elektrisch',
    rows: [
      { key: 'chemistry', label: 'Chemie' },
      { key: 'cycleLife', label: 'Levensduur' },
      { key: 'warrantyYears', label: 'Garantie' },
      { key: 'efficiency', label: 'Rendement' },
      { key: 'noiseDb', label: 'Geluid' },
      { key: 'dodPercent', label: 'Ontladingsdiepte' },
    ],
  },
  {
    label: 'Solar',
    rows: [
      { key: 'solar', label: 'Vermogen' },
      { key: 'solarConnections', label: 'Aansluitingen' },
    ],
  },
  {
    label: 'Connectiviteit',
    rows: [
      { key: 'p1Meter', label: 'P1-meter' },
    ],
  },
]

const { getSelectedIndex, setSelectedIndex, resetOutOfBounds } = usePackageSelection()

function getPackages(battery: CatalogBattery) {
  return getFilteredPackages(battery, props.filters)
}

const hasAnyPackages = computed(() =>
  props.batteries.some(b => getPackages(b).length > 0)
)

// Reset selection when filtered packages change
watch(() => props.filters, () => {
  resetOutOfBounds(props.batteries, props.filters)
}, { deep: true })

function getIdx(battery: CatalogBattery): number {
  return getSelectedIndex(battery, props.filters)
}

function selectedCapacityWh(battery: CatalogBattery): number | null {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg) return null
  return pkgCapacityWh(battery, pkg)
}

function pkgPrice(battery: CatalogBattery): string {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg) return '-'
  return formatEur(cheapestOfferingPrice(pkg))
}

function pkgPricePerKwh(battery: CatalogBattery): string {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg) return '-'
  const price = cheapestOfferingPrice(pkg)
  if (price == null) return '-'
  const wh = selectedCapacityWh(battery)
  if (!wh) return '-'
  return formatEurDecimal(price / (wh / 1000))
}

function pkgCapacity(battery: CatalogBattery): string {
  const wh = selectedCapacityWh(battery)
  if (wh == null) return '-'
  return `${(wh / 1000).toLocaleString('nl-NL')} kWh`
}

function formatCm(mm: number): string {
  const cm = Math.floor(mm / 10)
  const remainder = mm % 10
  return `${cm},${remainder}`
}

function pkgHeight(battery: CatalogBattery): string {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg) return '-'
  const baseH = battery.physical?.heightMm
  if (baseH == null) return '-'
  const expansionCount = pkg.expansionCount ?? 0
  const expH = battery.expansion?.expansionPhysical?.heightMm ?? 0
  return `${formatCm(baseH + expansionCount * expH)} cm`
}

function pkgWeight(battery: CatalogBattery): string {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg) return '-'
  const baseW = battery.physical?.weightKg
  if (baseW == null) return '-'
  const expansionCount = pkg.expansionCount ?? 0
  const expW = battery.expansion?.expansionPhysical?.weightKg ?? 0
  return `${(baseW + expansionCount * expW).toLocaleString('nl-NL')} kg`
}

function dropdownLabel(battery: CatalogBattery, index: number): string {
  const pkg = getPackages(battery)[index]
  if (!pkg) return '-'
  const kwh = (pkgCapacityWh(battery, pkg) / 1000).toLocaleString('nl-NL')
  return `${kwh} kWh`
}

function pkgOfferings(battery: CatalogBattery): CatalogOffering[] {
  const pkg = getPackages(battery)[getIdx(battery)]
  if (!pkg?.offerings) return []
  return [...pkg.offerings].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
}
</script>

<template>
  <div class="grid-wrapper surface" v-if="batteries.length > 0">
    <div class="grid-scroll">
      <table class="battery-table">
        <thead>
          <tr>
            <th class="label-col"></th>
            <th v-for="b in batteries" :key="b.id" class="battery-col">
              <BatteryCard :battery="b" />
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="section in specSections" :key="section.label">
            <tr class="section-header">
              <td class="label-col section-label">{{ section.label }}</td>
              <td v-for="b in batteries" :key="b.id"></td>
            </tr>
            <SpecRow
              v-for="row in section.rows"
              :key="row.key"
              :spec-key="row.key"
              :label="row.label"
              :batteries="batteries"
            />
          </template>
          <template v-if="hasAnyPackages">
            <tr class="section-header">
              <td class="label-col section-label">Pakket</td>
              <td v-for="b in batteries" :key="b.id">
                <select
                  v-if="getPackages(b).length > 1"
                  :value="getIdx(b)"
                  class="pkg-select"
                  @change="setSelectedIndex(b.id, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="(_pkg, idx) in getPackages(b)"
                    :key="idx"
                    :value="idx"
                  >{{ dropdownLabel(b, idx) }}</option>
                </select>
                <span v-else-if="getPackages(b).length === 1">
                  {{ dropdownLabel(b, 0) }}
                </span>
                <span v-else>-</span>
              </td>
            </tr>
            <tr>
              <td class="label-col sub-label">Prijs</td>
              <td v-for="b in batteries" :key="b.id" class="price-cell">{{ pkgPrice(b) }}</td>
            </tr>
            <tr>
              <td class="label-col sub-label">Prijs per kWh</td>
              <td v-for="b in batteries" :key="b.id">{{ pkgPricePerKwh(b) }}</td>
            </tr>
            <tr>
              <td class="label-col sub-label">Capaciteit</td>
              <td v-for="b in batteries" :key="b.id">{{ pkgCapacity(b) }}</td>
            </tr>
            <tr>
              <td class="label-col sub-label">Hoogte</td>
              <td v-for="b in batteries" :key="b.id">{{ pkgHeight(b) }}</td>
            </tr>
            <tr>
              <td class="label-col sub-label">Gewicht</td>
              <td v-for="b in batteries" :key="b.id">{{ pkgWeight(b) }}</td>
            </tr>
            <tr>
              <td class="label-col sub-label">Kopen</td>
              <td v-for="b in batteries" :key="b.id">
                <div v-if="pkgOfferings(b).length > 0" class="offerings-list">
                  <a
                    v-for="(o, oi) in pkgOfferings(b)"
                    :key="oi"
                    :href="o.url"
                    target="_blank"
                    rel="noopener"
                    class="buy-link offering-item"
                  >{{ o.retailer }}: {{ formatEur(o.price) }}<template v-if="o.p1Meter?.available && (o.p1Meter?.price ?? 0) > 0"> (P1: {{ formatEur(o.p1Meter.price) }})</template><template v-else-if="o.p1Meter?.available"> (P1: gratis)</template></a>
                </div>
                <span v-else>-</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="empty">
    <p>Geen batterijen gevonden met de huidige filters.</p>
  </div>
</template>

<style scoped>
.grid-wrapper {
  overflow: hidden;
  max-width: 100%;
  min-width: 0;
}

.grid-scroll {
  overflow: auto;
  max-height: calc(100vh - 6rem);
}

.battery-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
}

.battery-table thead {
  border-bottom: 2px solid var(--color-primary);
}

.battery-table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--color-surface);
}

.battery-table thead th.label-col {
  z-index: 4;
}

.battery-table th,
.battery-table :deep(td) {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
  white-space: nowrap;
  font-size: 0.88rem;
}

/* Alternating row colors */
.battery-table tbody tr:nth-child(even) :deep(td) {
  background: var(--color-row-alt);
}

.battery-table tbody tr:hover :deep(td) {
  background: var(--color-primary-light);
}

/* Keep label-col background consistent on hover/stripe */
.battery-table tbody tr:nth-child(even) .label-col {
  background: var(--color-row-alt);
}

.battery-table tbody tr:hover .label-col {
  background: var(--color-primary-light);
}

.label-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--color-surface);
  min-width: 140px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.battery-col {
  min-width: 180px;
  vertical-align: top;
}

.section-header td {
  border-bottom: 2px solid var(--color-primary);
  padding-top: 1rem;
  background: var(--color-surface) !important;
}

.section-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-primary) !important;
}

.sub-label {
  padding-left: 1.5rem !important;
  font-size: 0.8rem;
}

.price-cell {
  font-weight: 600;
  color: var(--color-primary);
}

.offerings-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.buy-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.15s;
}

.buy-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}

.offering-item {
  display: block;
  font-size: 0.82rem;
  white-space: nowrap;
}

.pkg-select {
  font-size: 0.82rem;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: inherit;
  max-width: 180px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.pkg-select:hover {
  border-color: var(--color-primary);
}

@media (max-width: 500px) {
  .label-col {
    position: static;
    min-width: auto;
  }
  .battery-table thead th.label-col {
    position: static;
  }
}

.empty {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: 1rem;
}
</style>
