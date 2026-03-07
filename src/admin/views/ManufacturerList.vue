<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Manufacturer } from '../../types/generated'

const emit = defineEmits<{
  edit: [manufacturer: Manufacturer, filename: string]
}>()

interface ManufacturerEntry {
  filename: string
  data: Manufacturer
}

const entries = ref<ManufacturerEntry[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // In dev mode, fetch the list of manufacturer files from the data directory
    // We load from known files - these are the manufacturer slugs
    const knownFiles = [
      'aeg', 'anker-solix', 'homewizard', 'hoymiles', 'indevolt',
      'lunergy', 'marstek', 'nextenergy', 'sunpura', 'zendure', 'zinvolt'
    ]

    const results = await Promise.all(
      knownFiles.map(async (slug) => {
        const filename = `${slug}.json`
        try {
          const res = await fetch(`/data/manufacturers/${filename}`)
          if (!res.ok) return null
          const data: Manufacturer = await res.json()
          return { filename, data }
        } catch {
          return null
        }
      })
    )
    entries.value = results.filter((r): r is ManufacturerEntry => r !== null)
  } catch (e) {
    error.value = `Kan fabrikanten niet laden: ${e instanceof Error ? e.message : e}`
  } finally {
    isLoading.value = false
  }
})

function importFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data: Manufacturer = JSON.parse(text)
      if (!data.manufacturer || !data.slug || !data.batteries) {
        throw new Error('Ongeldig fabrikant JSON bestand')
      }
      emit('edit', data, `${data.slug}.json`)
    } catch (e) {
      alert(`Fout bij importeren: ${e instanceof Error ? e.message : e}`)
    }
  }
  input.click()
}

function createNew() {
  const newManufacturer: Manufacturer = {
    manufacturer: '',
    slug: '',
    website: '',
    batteries: [
      {
        model: '',
        slug: '',
        capacityWh: 0,
        nominalChargePowerW: 0,
        maxChargePowerW: 0,
        maxDischargePowerW: 0,
      },
    ],
  }
  emit('edit', newManufacturer, 'nieuwe-fabrikant.json')
}
</script>

<template>
  <div>
    <div class="list-header">
      <h2>Fabrikanten</h2>
      <div class="list-actions">
        <button class="btn btn-primary" @click="createNew">Nieuwe fabrikant</button>
        <button class="btn btn-secondary" @click="importFile">JSON importeren</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Laden...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="manufacturer-grid">
      <div
        v-for="entry in entries"
        :key="entry.filename"
        class="manufacturer-card"
        @click="emit('edit', entry.data, entry.filename)"
      >
        <h3>{{ entry.data.manufacturer }}</h3>
        <p>{{ entry.data.batteries.length }} batterij{{ entry.data.batteries.length === 1 ? '' : 'en' }}</p>
        <p class="filename">{{ entry.filename }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.manufacturer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.manufacturer-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.15s;
}

.manufacturer-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.manufacturer-card h3 {
  margin-bottom: 0.25rem;
}

.manufacturer-card p {
  color: #666;
  font-size: 0.9rem;
}

.filename {
  font-family: monospace;
  font-size: 0.8rem !important;
  color: #999 !important;
  margin-top: 0.5rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
}
</style>
