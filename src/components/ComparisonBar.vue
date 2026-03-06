<script setup lang="ts">
import { useComparison } from '../composables/useComparison'
import { useRouter } from 'vue-router'

const { count, ids, clear } = useComparison()
const router = useRouter()

function compare() {
  router.push({ name: 'compare', query: { ids: ids.value.join(',') } })
}
</script>

<template>
  <div class="comparison-bar">
    <div class="bar-inner">
      <span class="bar-text"><slot name="text">{{ count }} batterij{{ count === 1 ? '' : 'en' }} geselecteerd</slot></span>
      <div class="bar-actions">
        <slot>
          <button class="btn btn-light btn-sm" @click="compare" :disabled="count < 2">
            Vergelijk
          </button>
          <button class="btn btn-outline-light btn-sm" @click="clear">Wissen</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, var(--color-primary) 0%, #2a7a42 100%);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
}

.bar-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 2rem;
  min-height: 3rem;
}

.bar-text {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.bar-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
