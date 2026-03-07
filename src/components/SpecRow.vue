<script setup lang="ts">
import type { CatalogBattery } from '../types/generated'
import { mmToCm } from '../utils/format'

const props = defineProps<{
  specKey: string
  label: string
  batteries: CatalogBattery[]
}>()

function isLinkKey(key: string): boolean {
  return key === 'forumUrl' || key === 'productUrl'
}

function getLink(battery: CatalogBattery): { url: string; label: string; favicon: string } | null {
  switch (props.specKey) {
    case 'forumUrl': {
      const url = battery.forumUrl
      if (!url) return null
      return {
        url,
        label: 'Gathering of Tweakers',
        favicon: '/favicon-tweakers.ico',
      }
    }
    case 'productUrl': {
      const url = battery.productUrl
      if (!url) return null
      try {
        const host = new URL(url).hostname.replace(/^www\./, '')
        return {
          url,
          label: host,
          favicon: `https://${new URL(url).hostname}/favicon.ico`,
        }
      } catch {
        return { url, label: url, favicon: '' }
      }
    }
    default:
      return null
  }
}

function getValue(battery: CatalogBattery): string {
  switch (props.specKey) {
    case 'manufacturer':
      return battery.manufacturer
    case 'capacityKwh':
      return battery.computed?.capacityKwh
        ? `${battery.computed.capacityKwh.toLocaleString('nl-NL')} kWh`
        : '-'
    case 'nominalChargePowerW':
      return battery.nominalChargePowerW
        ? `${battery.nominalChargePowerW.toLocaleString('nl-NL')} W`
        : '-'
    case 'maxChargePowerW':
      return `${battery.maxChargePowerW?.toLocaleString('nl-NL') ?? '-'} W`
    case 'maxDischargePowerW':
      return `${battery.maxDischargePowerW?.toLocaleString('nl-NL') ?? '-'} W`
    case 'offGridPowerW':
      return battery.offGridPowerW
        ? `${battery.offGridPowerW.toLocaleString('nl-NL')} W`
        : 'Nee'
    case 'offGridPeakPowerW':
      return battery.offGridPeakPowerW
        ? `${battery.offGridPeakPowerW.toLocaleString('nl-NL')} W`
        : '-'
    case 'ups':
      if (!battery.features?.ups) return 'Nee'
      if (battery.features.upsSwitchMs != null)
        return `Ja (${battery.features.upsSwitchMs} ms)`
      return 'Ja'
    case 'dimensions': {
      const p = battery.physical
      if (!p?.widthMm && !p?.heightMm && !p?.depthMm) return '-'
      return `${mmToCm(p.widthMm)} × ${mmToCm(p.heightMm)} × ${mmToCm(p.depthMm)} cm`
    }
    case 'weightKg':
      return battery.physical?.weightKg
        ? `${battery.physical.weightKg.toLocaleString('nl-NL')} kg`
        : '-'
    case 'ipRating':
      return battery.electrical?.ipRating ? `IP${battery.electrical.ipRating}` : '-'
    case 'chemistry':
      return battery.electrical?.chemistry ?? '-'
    case 'cycleLife':
      return battery.electrical?.cycleLife
        ? `${battery.electrical.cycleLife.toLocaleString('nl-NL')} cycli`
        : '-'
    case 'warrantyYears':
      return battery.electrical?.warrantyYears
        ? `${battery.electrical.warrantyYears} jaar`
        : '-'
    case 'efficiency':
      return battery.electrical?.efficiencyPercent
        ? `${battery.electrical.efficiencyPercent.toLocaleString('nl-NL')}%`
        : '-'
    case 'noiseDb':
      return battery.electrical?.noiseDb
        ? `${battery.electrical.noiseDb.toLocaleString('nl-NL')} dB`
        : '-'
    case 'dodPercent':
      return battery.electrical?.depthOfDischargePercent
        ? `${battery.electrical.depthOfDischargePercent}%`
        : '-'
    case 'solar':
      if (!battery.features?.hasMppt) return 'Nee'
      return battery.features.solarInputW
        ? `${battery.features.solarInputW.toLocaleString('nl-NL')} W`
        : 'Ja'
    case 'solarConnections':
      return battery.features?.solarConnections
        ? `${battery.features.solarConnections}× MPPT`
        : '-'
    case 'expansion':
      return battery.expansion ? 'Ja' : 'Nee'
    case 'expansionModel':
      return battery.expansion?.expansionModel ?? '-'
    case 'expansionCapacity': {
      const expWh = battery.expansion?.expansionCapacityWh
      if (!expWh) return '-'
      return `${(expWh / 1000).toLocaleString('nl-NL')} kWh`
    }
    case 'expansionMaxUnits':
      return battery.expansion?.maxUnits?.toString() ?? '-'
    case 'expansionMaxCapacity': {
      const maxKwh = battery.computed?.maxCapacityKwh
      if (!maxKwh || !battery.expansion) return '-'
      return `${maxKwh.toLocaleString('nl-NL')} kWh`
    }
    case 'p1Meter':
      return battery.features?.p1Meter?.type ?? '-'
    default:
      return '-'
  }
}
</script>

<template>
  <tr>
    <td class="label-col">{{ label }}</td>
    <template v-if="isLinkKey(specKey)">
      <td v-for="b in batteries" :key="b.id">
        <a
          v-if="getLink(b)"
          :href="getLink(b)!.url"
          target="_blank"
          rel="noopener"
          class="spec-link"
        >
          <img
            v-if="getLink(b)!.favicon"
            :src="getLink(b)!.favicon"
            class="favicon"
            width="16"
            height="16"
            alt=""
          />
          {{ getLink(b)!.label }}
        </a>
        <span v-else>-</span>
      </td>
    </template>
    <template v-else>
      <td v-for="b in batteries" :key="b.id">{{ getValue(b) }}</td>
    </template>
  </tr>
</template>

<style scoped>
.label-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--color-surface);
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  padding-left: 1.5rem !important;
}

@media (max-width: 500px) {
  .label-col {
    position: static;
  }
}

.spec-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.82rem;
}

.spec-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}

.favicon {
  flex-shrink: 0;
}
</style>
