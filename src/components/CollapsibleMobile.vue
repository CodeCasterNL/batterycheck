<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  breakpoint?: number
}>(), {
  label: 'Filters',
  breakpoint: 500,
})

const open = ref(false)
const isMobile = ref(false)

let mql: MediaQueryList | null = null

function updateMobile(e: MediaQueryListEvent | MediaQueryList) {
  isMobile.value = e.matches
}

onMounted(() => {
  mql = window.matchMedia(`(max-width: ${props.breakpoint}px)`)
  updateMobile(mql)
  mql.addEventListener('change', updateMobile)
})

onUnmounted(() => {
  mql?.removeEventListener('change', updateMobile)
})

const showToggle = computed(() => isMobile.value)
const showContent = computed(() => !isMobile.value || open.value)
</script>

<template>
  <div class="collapsible-mobile">
    <button v-if="showToggle" class="collapsible-toggle" @click="open = !open">
      {{ label }}
      <svg class="collapsible-icon" :class="{ open }" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 6L8 9.5 11.5 6z"/></svg>
    </button>
    <div v-show="showContent" class="collapsible-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.collapsible-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
}
.collapsible-icon {
  width: 1.2em;
  height: 1.2em;
  transition: transform 0.2s;
}
.collapsible-icon.open {
  transform: rotate(180deg);
}
</style>
