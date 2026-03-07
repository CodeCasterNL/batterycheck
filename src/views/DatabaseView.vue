<script setup lang="ts">
import { computed } from 'vue'
import { useCatalog } from '../composables/useCatalog'
import { useFilters } from '../composables/useFilters'
import { useComparison } from '../composables/useComparison'
import { getFilteredPackages } from '../composables/usePackageSelection'
import FilterPanel from '../components/FilterPanel.vue'
import BatteryGrid from '../components/BatteryGrid.vue'
import ComparisonBar from '../components/ComparisonBar.vue'
import FilterResults from '../components/FilterResults.vue'

const { batteries } = useCatalog()
const { filters, filtered, sort, reset, ranges } = useFilters(() => batteries.value)
const { count } = useComparison()
const filteredPkgCount = computed(() =>
  filtered.value.reduce((sum, b) => sum + getFilteredPackages(b, filters).length, 0),
)
const totalPkgCount = computed(() =>
  batteries.value.reduce((sum, b) => sum + (b.packages?.length ?? 0), 0),
)
const outsideRange = computed(() => totalPkgCount.value - filteredPkgCount.value)
</script>

<template>
  <div class="database">
    <FilterPanel :filters="filters" :ranges="ranges" v-model:sort="sort" @reset="reset" />
    <FilterResults :count="filtered.length" :variant-count="filteredPkgCount" :outside-range="outsideRange" />
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

</style>
