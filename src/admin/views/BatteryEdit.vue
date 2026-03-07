<script setup lang="ts">
import { watch } from 'vue'
import type { Battery } from '../../types/generated'
import PackageEdit from './PackageEdit.vue'

const props = defineProps<{
  battery: Battery
  canRemove: boolean
}>()

const emit = defineEmits<{
  remove: []
}>()

// Auto-generate slug from model
watch(
  () => props.battery.model,
  (model) => {
    if (!props.battery.slug) {
      props.battery.slug = model
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
  }
)

function ensurePhysical() {
  if (!props.battery.physical) {
    props.battery.physical = { widthMm: null, heightMm: null, depthMm: null, weightKg: null }
  }
  return props.battery.physical
}

function ensureFeatures() {
  if (!props.battery.features) {
    props.battery.features = { offGrid: false, p1Meter: { type: null } }
  }
  return props.battery.features
}

function ensureP1Meter() {
  const f = ensureFeatures()
  if (!f.p1Meter) {
    f.p1Meter = { type: null }
  }
  return f.p1Meter
}

function ensureExpansion() {
  if (!props.battery.expansion) {
    props.battery.expansion = {
      expansionModel: null,
      expansionCapacityWh: null,
      maxUnits: null,
      expansionPhysical: null,
    }
  }
  return props.battery.expansion!
}

function removeExpansion() {
  props.battery.expansion = undefined
}

function addPackage() {
  if (!props.battery.packages) props.battery.packages = []
  props.battery.packages.push({
    description: '',
    baseCount: 1,
    expansionCount: 0,
    offerings: [
      {
        retailer: '',
        url: '',
        price: 0,
        p1Meter: { available: false, price: 0 },
        startDate: new Date().toISOString().slice(0, 10),
        endDate: null,
      },
    ],
  })
}

function removePackage(index: number) {
  props.battery.packages?.splice(index, 1)
}

function numOrNull(val: string): number | null {
  const n = Number(val)
  return val === '' || isNaN(n) ? null : n
}

function intOrNull(val: string): number | null {
  const n = parseInt(val, 10)
  return val === '' || isNaN(n) ? null : n
}
</script>

<template>
  <div class="battery-edit">
    <div class="form-row">
      <div class="form-group">
        <label>Model</label>
        <input v-model="battery.model" placeholder="Bijv. Plug-In Battery" />
      </div>
      <div class="form-group">
        <label>Slug</label>
        <input v-model="battery.slug" placeholder="bijv. plug-in-battery" />
      </div>
    </div>

    <h4>Vermogen</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Basiscapaciteit (Wh)</label>
        <input type="number" :value="battery.capacityWh" @input="battery.capacityWh = Number(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Nominaal laadvermogen (W)</label>
        <input type="number" :value="battery.nominalChargePowerW" @input="battery.nominalChargePowerW = Number(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Max. laadvermogen (W)</label>
        <input type="number" :value="battery.maxChargePowerW" @input="battery.maxChargePowerW = Number(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Ontlaadvermogen (W)</label>
        <input type="number" :value="battery.maxDischargePowerW" @input="battery.maxDischargePowerW = Number(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Off-grid (W)</label>
        <input type="number" :value="battery.offGridPowerW ?? ''" @input="battery.offGridPowerW = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <h4>Afmetingen</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Breedte (mm)</label>
        <input type="number" :value="ensurePhysical().widthMm ?? ''" @input="ensurePhysical().widthMm = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Hoogte (mm)</label>
        <input type="number" :value="ensurePhysical().heightMm ?? ''" @input="ensurePhysical().heightMm = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Diepte (mm)</label>
        <input type="number" :value="ensurePhysical().depthMm ?? ''" @input="ensurePhysical().depthMm = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Gewicht (kg)</label>
        <input type="number" step="0.1" :value="ensurePhysical().weightKg ?? ''" @input="ensurePhysical().weightKg = numOrNull(($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <h4>Features</h4>
    <div class="form-row">
      <div class="form-group">
        <label>
          <input type="checkbox" :checked="ensureFeatures().offGrid" @change="ensureFeatures().offGrid = ($event.target as HTMLInputElement).checked" />
          Off-grid
        </label>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" :checked="ensureFeatures().hasMppt" @change="ensureFeatures().hasMppt = ($event.target as HTMLInputElement).checked" />
          MPPT (solar)
        </label>
      </div>
      <div class="form-group">
        <label>Solar input (W)</label>
        <input type="number" :value="ensureFeatures().solarInputW ?? ''" @input="ensureFeatures().solarInputW = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <h4>P1-meter</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Type</label>
        <input :value="ensureP1Meter().type ?? ''" @input="ensureP1Meter().type = ($event.target as HTMLInputElement).value || null" />
      </div>
    </div>

    <h4>
      Uitbreiding
      <button v-if="!battery.expansion" class="btn btn-secondary btn-sm" @click="ensureExpansion()">Toevoegen</button>
      <button v-else class="btn btn-danger btn-sm" @click="removeExpansion()">Verwijderen</button>
    </h4>
    <div v-if="battery.expansion" class="form-row">
      <div class="form-group">
        <label>Model uitbreiding</label>
        <input :value="battery.expansion.expansionModel ?? ''" @input="battery.expansion!.expansionModel = ($event.target as HTMLInputElement).value || null" />
      </div>
      <div class="form-group">
        <label>Capaciteit (Wh)</label>
        <input type="number" :value="battery.expansion.expansionCapacityWh ?? ''" @input="battery.expansion!.expansionCapacityWh = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Max. aantal</label>
        <input type="number" :value="battery.expansion.maxUnits ?? ''" @input="battery.expansion!.maxUnits = intOrNull(($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <h4>URLs</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Product URL</label>
        <input type="url" v-model="battery.productUrl" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>Forum URL</label>
        <input type="url" :value="battery.forumUrl ?? ''" @input="battery.forumUrl = ($event.target as HTMLInputElement).value || null" />
      </div>
    </div>

    <h4>
      Pakketten
      <button class="btn btn-secondary btn-sm" @click="addPackage">Toevoegen</button>
    </h4>
    <PackageEdit
      v-for="(pkg, i) in battery.packages"
      :key="i"
      :pkg="pkg"
      @remove="removePackage(i)"
    />

    <div v-if="canRemove" class="remove-section">
      <button class="btn btn-danger" @click="emit('remove')">Batterij verwijderen</button>
    </div>
  </div>
</template>

<style scoped>
.battery-edit {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
}

.remove-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>
