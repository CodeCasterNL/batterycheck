<script setup lang="ts">
import { useCatalog } from '../composables/useCatalog'
import { useFilters } from '../composables/useFilters'
import { useComparison } from '../composables/useComparison'
import FilterPanel from '../components/FilterPanel.vue'
import BatteryGrid from '../components/BatteryGrid.vue'
import ComparisonBar from '../components/ComparisonBar.vue'

const { batteries } = useCatalog()
const { filters, filtered, sort, reset, ranges } = useFilters(() => batteries.value)
const { count } = useComparison()
</script>

<template>
  <div class="database">
    <FilterPanel :filters="filters" :ranges="ranges" v-model:sort="sort" @reset="reset" />
    <div class="result-count">{{ filtered.length }} batterij{{ filtered.length === 1 ? '' : 'en' }}</div>
    <BatteryGrid :batteries="filtered" :filters="filters" />
    <ComparisonBar v-if="count > 0" />
  </div>
</template>

<style scoped>
.database {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-count {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-weight: 500;
  padding-left: 0.25rem;
}
</style>
