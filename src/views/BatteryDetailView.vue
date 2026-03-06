<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalog } from '../composables/useCatalog'
import { pkgCapacityWh, formatPkgLabel } from '../composables/usePackageSelection'
import { formatEur, formatEurDecimal, mmToCm } from '../utils/format'
import type { CatalogBattery, CatalogPackage } from '../types/generated'

const route = useRoute()
const { batteries } = useCatalog()

const battery = computed<CatalogBattery | undefined>(() => {
  const mfr = route.params.mfr as string
  const model = route.params.model as string
  return batteries.value.find(b => b.manufacturerSlug === mfr && b.modelSlug === model)
})

function pricePerKwh(price: number, b: CatalogBattery, pkg: CatalogPackage): string {
  const wh = pkgCapacityWh(b, pkg)
  if (wh <= 0) return '-'
  return formatEurDecimal(price / (wh / 1000))
}

// Set page title (client-side only)
import { watch } from 'vue'
if (typeof document !== 'undefined') {
  watch(battery, (b) => {
    if (b) {
      document.title = `${b.manufacturer} ${b.model} - Battery Check`
    }
  }, { immediate: true })
}
</script>

<template>
  <div class="detail" v-if="battery">
    <nav class="breadcrumb">
      <router-link to="/database">Alle batterijen</router-link>
      <span class="sep">/</span>
      <span>{{ battery.manufacturer }} {{ battery.model }}</span>
    </nav>

    <div class="detail-header">
      <div>
        <h2>{{ battery.manufacturer }} {{ battery.model }}</h2>
        <p class="subtitle">
          {{ battery.computed?.capacityKwh?.toLocaleString('nl-NL') }} kWh basiscapaciteit
          <template v-if="battery.computed?.maxCapacityKwh && battery.computed.maxCapacityKwh !== battery.computed.capacityKwh">
            &middot; tot {{ battery.computed.maxCapacityKwh.toLocaleString('nl-NL') }} kWh uitbreidbaar
          </template>
        </p>
      </div>
      <div class="header-links">
        <a v-if="battery.productUrl" :href="battery.productUrl" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Productpagina</a>
        <a v-if="battery.forumUrl" :href="battery.forumUrl" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><img src="/favicon-tweakers.ico" width="16" height="16" alt="" class="btn-icon" />Tweakers</a>
      </div>
    </div>

    <!-- Badges -->
    <div class="badges">
      <span v-if="battery.computed?.hasSolar" class="badge">Zonne-invoer (MPPT)</span>
      <span v-if="battery.features?.offGrid" class="badge">Off-grid / noodstroom</span>
      <span v-if="battery.computed?.isExpandable" class="badge">Uitbreidbaar</span>
      <span v-if="battery.features?.ups" class="badge">UPS</span>
    </div>

    <!-- Specs grid -->
    <div class="specs-grid">
      <!-- Basic -->
      <section class="spec-section surface">
        <h3>Basis</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>Merk</dt><dd>{{ battery.manufacturer }}</dd></div>
          <div class="spec-item"><dt>Model</dt><dd>{{ battery.model }}</dd></div>
          <div class="spec-item"><dt>Basiscapaciteit</dt><dd>{{ battery.computed?.capacityKwh?.toLocaleString('nl-NL') ?? '-' }} kWh</dd></div>
          <div class="spec-item"><dt>Laadvermogen</dt><dd>{{ battery.maxChargePowerW?.toLocaleString('nl-NL') ?? '-' }} W</dd></div>
          <div class="spec-item"><dt>Ontlaadvermogen</dt><dd>{{ battery.maxDischargePowerW?.toLocaleString('nl-NL') ?? '-' }} W</dd></div>
        </dl>
      </section>

      <!-- Expansion -->
      <section v-if="battery.expansion" class="spec-section surface">
        <h3>Uitbreiding</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>Model</dt><dd>{{ battery.expansion.expansionModel ?? '-' }}</dd></div>
          <div class="spec-item"><dt>Capaciteit per eenheid</dt><dd>{{ battery.expansion.expansionCapacityWh ? `${(battery.expansion.expansionCapacityWh / 1000).toLocaleString('nl-NL')} kWh` : '-' }}</dd></div>
          <div class="spec-item"><dt>Max. aantal</dt><dd>{{ battery.expansion.maxUnits ?? '-' }}</dd></div>
          <div class="spec-item"><dt>Max. totaalcapaciteit</dt><dd>{{ battery.computed?.maxCapacityKwh ? `${battery.computed.maxCapacityKwh.toLocaleString('nl-NL')} kWh` : '-' }}</dd></div>
        </dl>
      </section>

      <!-- Off-grid -->
      <section class="spec-section surface">
        <h3>Off-grid / noodstroom</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>Off-grid vermogen</dt><dd>{{ battery.offGridPowerW ? `${battery.offGridPowerW.toLocaleString('nl-NL')} W` : 'Nee' }}</dd></div>
          <div class="spec-item"><dt>Piekvermogen</dt><dd>{{ battery.offGridPeakPowerW ? `${battery.offGridPeakPowerW.toLocaleString('nl-NL')} W` : '-' }}</dd></div>
          <div class="spec-item"><dt>UPS</dt><dd>{{ battery.features?.ups ? (battery.features.upsSwitchMs != null ? `Ja (${battery.features.upsSwitchMs} ms)` : 'Ja') : 'Nee' }}</dd></div>
        </dl>
      </section>

      <!-- Physical -->
      <section class="spec-section surface">
        <h3>Fysiek</h3>
        <dl class="spec-list">
          <div class="spec-item">
            <dt>Afmetingen (B x H x D)</dt>
            <dd v-if="battery.physical?.widthMm || battery.physical?.heightMm || battery.physical?.depthMm">
              {{ mmToCm(battery.physical?.widthMm) }} &times; {{ mmToCm(battery.physical?.heightMm) }} &times; {{ mmToCm(battery.physical?.depthMm) }} cm
            </dd>
            <dd v-else>-</dd>
          </div>
          <div class="spec-item"><dt>Gewicht</dt><dd>{{ battery.physical?.weightKg ? `${battery.physical.weightKg.toLocaleString('nl-NL')} kg` : '-' }}</dd></div>
          <div class="spec-item"><dt>IP-rating</dt><dd>{{ battery.electrical?.ipRating ? `IP${battery.electrical.ipRating}` : '-' }}</dd></div>
        </dl>
      </section>

      <!-- Electrical -->
      <section class="spec-section surface">
        <h3>Elektrisch</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>Chemie</dt><dd>{{ battery.electrical?.chemistry ?? '-' }}</dd></div>
          <div class="spec-item"><dt>Levensduur</dt><dd>{{ battery.electrical?.cycleLife ? `${battery.electrical.cycleLife.toLocaleString('nl-NL')} cycli` : '-' }}</dd></div>
          <div class="spec-item"><dt>Garantie</dt><dd>{{ battery.electrical?.warrantyYears ? `${battery.electrical.warrantyYears} jaar` : '-' }}</dd></div>
          <div class="spec-item"><dt>Rendement</dt><dd>{{ battery.electrical?.efficiencyPercent ? `${battery.electrical.efficiencyPercent.toLocaleString('nl-NL')}%` : '-' }}</dd></div>
          <div class="spec-item"><dt>Geluid</dt><dd>{{ battery.electrical?.noiseDb ? `${battery.electrical.noiseDb.toLocaleString('nl-NL')} dB` : '-' }}</dd></div>
          <div class="spec-item"><dt>Ontladingsdiepte</dt><dd>{{ battery.electrical?.depthOfDischargePercent ? `${battery.electrical.depthOfDischargePercent}%` : '-' }}</dd></div>
          <div v-if="battery.electrical?.certifications?.length" class="spec-item">
            <dt>Certificeringen</dt>
            <dd>{{ battery.electrical.certifications.join(', ') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Solar -->
      <section v-if="battery.features?.hasMppt" class="spec-section surface">
        <h3>Zonne-invoer</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>Vermogen</dt><dd>{{ battery.features.solarInputW ? `${battery.features.solarInputW.toLocaleString('nl-NL')} W` : 'Ja' }}</dd></div>
          <div class="spec-item"><dt>Aansluitingen</dt><dd>{{ battery.features.solarConnections ? `${battery.features.solarConnections}× MPPT` : '-' }}</dd></div>
        </dl>
      </section>

      <!-- Connectivity -->
      <section class="spec-section surface">
        <h3>Connectiviteit</h3>
        <dl class="spec-list">
          <div class="spec-item"><dt>P1-meter</dt><dd>{{ battery.features?.p1Meter?.type ?? '-' }}</dd></div>
          <div class="spec-item"><dt>App</dt><dd>{{ battery.features?.app ?? '-' }}</dd></div>
        </dl>
      </section>
    </div>

    <!-- Packages / Pricing -->
    <section v-if="battery.packages && battery.packages.length > 0" class="packages-section surface">
      <h3>Pakketten &amp; prijzen</h3>
      <div class="packages-grid">
        <div v-for="(pkg, i) in battery.packages" :key="i" class="package-card">
          <div class="pkg-header">
            <strong>{{ formatPkgLabel(pkg) }}</strong>
            <span class="pkg-capacity">
              <svg class="icon-bolt" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1L4 9h4l-1.5 6L13 7H9l.5-6z"/></svg>
              {{ (pkgCapacityWh(battery, pkg) / 1000).toLocaleString('nl-NL') }} kWh
            </span>
          </div>
          <div class="pkg-offerings">
            <div v-for="(o, oi) in pkg.offerings ?? []" :key="oi" class="offering-row">
              <a :href="o.url" target="_blank" rel="noopener" class="offering-retailer">{{ o.retailer }}</a>
              <span class="offering-price">{{ formatEur(o.price) }}</span>
              <span class="offering-pkwh">{{ pricePerKwh(o.price!, battery, pkg) }}/kWh</span>
              <span v-if="o.p1Meter?.available" class="offering-p1">
                P1: {{ (o.p1Meter?.price ?? 0) > 0 ? formatEur(o.p1Meter?.price) : 'gratis' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="detail-footer">
      <router-link to="/database" class="back-link">Terug naar alle batterijen</router-link>
    </div>
  </div>

  <div v-else-if="batteries.length > 0" class="not-found">
    <h2>Batterij niet gevonden</h2>
    <p>Deze batterij bestaat niet of is niet meer beschikbaar.</p>
    <router-link to="/database" class="back-link">Bekijk alle batterijen</router-link>
  </div>
</template>

<style scoped>
.detail {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.breadcrumb {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
}
.breadcrumb a:hover { text-decoration: underline; }
.sep { margin: 0 0.4rem; }

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.detail-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
.subtitle {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}
.header-links {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon { flex-shrink: 0; }

.badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 650px) {
  .specs-grid { grid-template-columns: 1fr; }
}

.spec-section {
  padding: 1rem 1.25rem;
}
.spec-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--color-primary-light);
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.spec-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.88rem;
  padding: 0.2rem 0;
}
.spec-item dt {
  color: var(--color-text-muted);
  font-weight: 500;
  flex-shrink: 0;
}
.spec-item dd {
  text-align: right;
  font-weight: 600;
}

/* Packages */
.packages-section {
  padding: 1rem 1.25rem;
}
.packages-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--color-primary-light);
}
.packages-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.package-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
}
.pkg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.pkg-header strong { font-size: 0.9rem; }
.pkg-capacity {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-weight: 600;
}
.icon-bolt {
  width: 0.85em;
  height: 0.85em;
  color: var(--color-accent);
  flex-shrink: 0;
}
.pkg-offerings {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.offering-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  flex-wrap: wrap;
}
.offering-retailer {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}
.offering-retailer:hover { text-decoration: underline; }
.offering-price { font-weight: 700; }
.offering-pkwh {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
.offering-p1 {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.detail-footer {
  padding-top: 0.5rem;
}
.back-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}
.back-link:hover { text-decoration: underline; }

.not-found {
  text-align: center;
  padding: 3rem;
}
.not-found h2 { font-size: 1.4rem; margin-bottom: 0.5rem; }
.not-found p { color: var(--color-text-muted); margin-bottom: 1rem; }
</style>
