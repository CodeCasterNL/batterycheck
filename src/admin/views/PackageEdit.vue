<script setup lang="ts">
import type { Package, Offering } from '../../types/generated'

const props = defineProps<{
  pkg: Package
}>()

const emit = defineEmits<{
  remove: []
}>()

function initP1Meter(offering: Offering) {
  if (!offering.p1Meter) offering.p1Meter = { available: false, price: 0 }
  return offering.p1Meter
}

function addOffering() {
  props.pkg.offerings.push({
    retailer: '',
    url: '',
    price: 0,
    p1Meter: { available: false, price: 0 },
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
  })
}

function removeOffering(index: number) {
  if (props.pkg.offerings.length <= 1) return
  props.pkg.offerings.splice(index, 1)
}
</script>

<template>
  <div class="package-card">
    <div class="package-card-header">
      <h5>{{ pkg.description || 'Nieuw pakket' }}</h5>
      <button class="btn btn-danger btn-sm" @click="emit('remove')">Verwijderen</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Beschrijving</label>
        <input v-model="pkg.description" placeholder="Bijv. Basis pakket" />
      </div>
      <div class="form-group">
        <label>Aantal basis</label>
        <input type="number" :value="pkg.baseCount ?? 1" @input="pkg.baseCount = Number(($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-group">
        <label>Aantal uitbreidingen</label>
        <input type="number" :value="pkg.expansionCount ?? 0" @input="pkg.expansionCount = Number(($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <div v-for="(offering, oi) in pkg.offerings" :key="oi" class="offering-section">
      <div class="offering-header">
        <span>Aanbieding {{ oi + 1 }}</span>
        <button v-if="pkg.offerings.length > 1" class="btn-text" @click="removeOffering(oi)">verwijderen</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Winkelier</label>
          <input v-model="offering.retailer" placeholder="Bijv. Coolblue" />
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" v-model="offering.url" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>Prijs</label>
          <input type="number" step="0.01" :value="offering.price" @input="offering.price = Number(($event.target as HTMLInputElement).value)" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" :checked="offering.p1Meter?.available ?? false" @change="initP1Meter(offering).available = ($event.target as HTMLInputElement).checked" />
            P1-meter beschikbaar
          </label>
        </div>
        <div v-if="offering.p1Meter?.available" class="form-group">
          <label>P1-meter prijs</label>
          <input type="number" step="0.01" :value="offering.p1Meter?.price ?? 0" @input="initP1Meter(offering).price = Number(($event.target as HTMLInputElement).value)" />
        </div>
        <div class="form-group">
          <label>Startdatum</label>
          <input type="date" v-model="offering.startDate" />
        </div>
        <div class="form-group">
          <label>Einddatum</label>
          <input type="date" :value="offering.endDate ?? ''" @input="offering.endDate = ($event.target as HTMLInputElement).value || null" />
        </div>
      </div>
    </div>
    <button class="btn btn-secondary btn-sm" @click="addOffering">Aanbieding toevoegen</button>
  </div>
</template>

<style scoped>
.package-card {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.package-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.package-card-header h5 {
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
}

.offering-section {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #ddd;
}

.offering-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.3rem;
}

.btn-text {
  background: none;
  border: none;
  color: #c62828;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-sm {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
}
</style>
