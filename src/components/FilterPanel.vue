<script setup lang="ts">
import type { FilterState, SortOption } from '../composables/useFilters'
import { sortLabels } from '../composables/useFilters'
import type { DatasetRanges } from '../composables/useDatasetRanges'
import FilterToggle from './FilterToggle.vue'
import FilterSlider from './FilterSlider.vue'
import CollapsibleMobile from './CollapsibleMobile.vue'

defineProps<{
  filters: FilterState
  ranges: DatasetRanges
}>()

const sort = defineModel<SortOption>('sort', { required: true })

defineEmits<{
  reset: []
}>()

const sortOptions = Object.entries(sortLabels) as [SortOption, string][]
</script>

<template>
  <div class="filter-panel surface">
    <CollapsibleMobile label="Filters" :breakpoint="768">
      <div class="filter-panel-content">
        <div class="filter-section">
          <span class="section-title">Kenmerken</span>
          <div class="toggle-group">
            <FilterToggle v-model="filters.hasSolar" label="Zonne-invoer" />
            <FilterToggle v-model="filters.isExpandable" label="Uitbreidbaar" />
            <FilterToggle v-model="filters.offGrid" label="Off-grid" />
          </div>
        </div>
        <div class="filter-divider" />
        <div class="filter-section sliders">
          <FilterSlider
            v-model:min="filters.priceMin"
            v-model:max="filters.priceMax"
            label="Prijs"
            :abs-min="ranges.priceMin"
            :abs-max="ranges.priceMax"
            :step="50"
            suffix="EUR"
          />
          <FilterSlider
            v-model:min="filters.capacityMin"
            v-model:max="filters.capacityMax"
            label="Capaciteit"
            :abs-min="ranges.capMin"
            :abs-max="ranges.capMax"
            :step="500"
            suffix="Wh"
          />
        </div>
        <div class="filter-divider" />
        <div class="filter-section">
          <span class="section-title">Sorteren</span>
          <select
            class="sort-select"
            :value="sort"
            @change="sort = ($event.target as HTMLSelectElement).value as SortOption"
          >
            <option
              v-for="[value, label] in sortOptions"
              :key="value"
              :value="value"
            >{{ label }}</option>
          </select>
        </div>
        <div class="filter-divider" />
        <button class="reset-btn" @click="$emit('reset')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Filters wissen
        </button>
      </div>
    </CollapsibleMobile>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 0.75rem 1rem;
}
.filter-panel-content {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-section.sliders {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  min-width: 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
  align-self: center;
}

.sort-select {
  font-size: 0.82rem;
  padding: 0.35rem 0.5rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s;
  min-width: 180px;
}

.sort-select:hover {
  border-color: var(--color-primary);
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: all 0.15s;
}

.reset-btn:hover {
  background: var(--color-bg);
  border-color: var(--color-text-muted);
  color: var(--color-text);
}

@media (max-width: 768px) {
  .filter-panel-content {
    flex-direction: column;
    align-items: stretch;
    padding-top: 0.5rem;
  }

  .filter-divider {
    width: 100%;
    height: 1px;
  }

  .filter-section.sliders {
    flex-direction: column;
  }
}
</style>
