<script setup lang="ts">
defineProps<{
  count: number
  variantCount?: number
  outsideRange: number
}>()
</script>

<template>
  <div class="filter-results">
    <div class="results-counts">
      <span class="result-count">{{ count }} batterij{{ count === 1 ? '' : 'en' }}<template v-if="variantCount != null">
          ({{ variantCount }} variant{{ variantCount === 1 ? '' : 'en' }})</template></span>
      <span v-if="outsideRange > 0" class="outside-count">{{ outsideRange }} buiten filterbereik</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.filter-results {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.results-counts {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.result-count {
  color: var(--color-text-muted);
}

.outside-count {
  color: var(--color-accent);
}
</style>
