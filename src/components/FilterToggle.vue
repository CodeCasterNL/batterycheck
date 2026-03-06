<script setup lang="ts">
const model = defineModel<boolean | null>({ required: true })

defineProps<{
  label: string
}>()

function cycle() {
  if (model.value === null) model.value = true
  else if (model.value === true) model.value = null
  else model.value = null
}
</script>

<template>
  <button
    class="toggle"
    :class="{ active: model === true }"
    @click="cycle"
  >
    <svg v-if="model === true" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {{ label }}
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
  transition: all 0.2s;
  white-space: nowrap;
  user-select: none;
}

.toggle:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.toggle.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(26, 92, 46, 0.3);
}

.toggle.active:hover {
  background: var(--color-primary-hover);
}

.check-icon {
  flex-shrink: 0;
}
</style>
