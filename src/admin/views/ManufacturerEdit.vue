<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Manufacturer, Battery } from '../../types/generated'
import BatteryEdit from './BatteryEdit.vue'
import JsonPreview from '../components/JsonPreview.vue'
import DownloadButton from '../components/DownloadButton.vue'

const props = defineProps<{
  manufacturer: Manufacturer
  filename: string
}>()

const emit = defineEmits<{
  back: []
}>()

const data = ref<Manufacturer>(JSON.parse(JSON.stringify(props.manufacturer)))
const showJson = ref(false)
const activeBatteryIndex = ref(0)

watch(
  () => data.value.manufacturer,
  (name) => {
    if (!data.value.slug || data.value.slug === slugify(props.manufacturer.manufacturer)) {
      data.value.slug = slugify(name)
    }
  }
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addBattery() {
  const newBattery: Battery = {
    model: '',
    slug: '',
    capacityWh: 0,
    maxChargePowerW: 0,
    maxDischargePowerW: 0,
  }
  data.value.batteries.push(newBattery)
  activeBatteryIndex.value = data.value.batteries.length - 1
}

function removeBattery(index: number) {
  if (data.value.batteries.length <= 1) return
  data.value.batteries.splice(index, 1)
  if (activeBatteryIndex.value >= data.value.batteries.length) {
    activeBatteryIndex.value = data.value.batteries.length - 1
  }
}

const computedFilename = ref(props.filename)
watch(
  () => data.value.slug,
  (slug) => {
    if (slug) computedFilename.value = `${slug}.json`
  }
)
</script>

<template>
  <div>
    <div class="edit-header">
      <button class="btn btn-secondary" @click="emit('back')">Terug</button>
      <h2>{{ data.manufacturer || 'Nieuwe fabrikant' }}</h2>
      <div class="edit-actions">
        <button class="btn btn-secondary" @click="showJson = !showJson">
          {{ showJson ? 'Verberg' : 'Toon' }} JSON
        </button>
        <DownloadButton :data="data" :filename="computedFilename" />
      </div>
    </div>

    <div class="edit-layout">
      <div class="edit-form">
        <section class="section">
          <h3>Fabrikant</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Naam</label>
              <input v-model="data.manufacturer" placeholder="Bijv. HomeWizard" />
            </div>
            <div class="form-group">
              <label>Slug</label>
              <input v-model="data.slug" placeholder="bijv. homewizard" />
            </div>
            <div class="form-group">
              <label>Website</label>
              <input v-model="data.website" type="url" placeholder="https://..." />
            </div>
          </div>
        </section>

        <section class="section">
          <div class="battery-tabs">
            <button
              v-for="(bat, i) in data.batteries"
              :key="i"
              class="tab"
              :class="{ active: activeBatteryIndex === i }"
              @click="activeBatteryIndex = i"
            >
              {{ bat.model || `Batterij ${i + 1}` }}
            </button>
            <button class="tab tab-add" @click="addBattery">+</button>
          </div>

          <BatteryEdit
            v-if="activeBatteryIndex < data.batteries.length"
            :battery="data.batteries[activeBatteryIndex]!"
            :can-remove="data.batteries.length > 1"
            @remove="removeBattery(activeBatteryIndex)"
          />
        </section>
      </div>

      <JsonPreview v-if="showJson" :data="data" />
    </div>
  </div>
</template>

<style scoped>
.edit-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.edit-header h2 {
  flex: 1;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.edit-form {
  flex: 1;
  min-width: 0;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section h3 {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.battery-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px 6px 0 0;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.85rem;
}

.tab.active {
  background: white;
  border-bottom-color: white;
  font-weight: 600;
}

.tab-add {
  font-weight: bold;
  color: #1565c0;
}
</style>
