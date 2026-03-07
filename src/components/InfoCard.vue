<template>
  <div class="info-card surface">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped>
.info-card {
  padding: 1.25rem;
}

.info-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.info-card :deep(p) {
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
