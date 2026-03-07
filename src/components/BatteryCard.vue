<script setup lang="ts">
import type { CatalogBattery } from '../types/generated'
import { useComparison } from '../composables/useComparison'

const props = defineProps<{
  battery: CatalogBattery
}>()

const { toggle, isSelected } = useComparison()
</script>

<template>
  <div class="card" :class="{ selected: isSelected(battery.id) }">
    <router-link :to="`/batterij/${battery.manufacturerSlug}/${battery.modelSlug}`" class="card-link">
      <div class="card-name">{{ battery.model }}</div>
      <div class="card-manufacturer">{{ battery.manufacturer }}</div>
    </router-link>
    <label class="compare-check">
      <input
        type="checkbox"
        :checked="isSelected(battery.id)"
        @change="toggle(battery.id)"
      />
      <span>Vergelijk</span>
    </label>
  </div>
</template>

<style scoped>
.card {
  padding: 0.4rem 0;
  border-left: 3px solid transparent;
  padding-left: 0.5rem;
  transition: border-color 0.2s;
}

.card.selected {
  border-left-color: var(--color-primary);
}

.card-link {
  display: block;
}

.card-link:hover .card-name {
  color: var(--color-primary);
}

.card-name {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
  transition: color 0.15s;
  text-decoration: underline;
}

.card-manufacturer {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.compare-check {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  margin-top: 0.3rem;
  cursor: pointer;
  color: var(--color-text-muted);
  user-select: none;
  transition: color 0.15s;
}

.compare-check:hover {
  color: var(--color-primary);
}

.compare-check input {
  cursor: pointer;
  accent-color: var(--color-primary);
}
</style>
