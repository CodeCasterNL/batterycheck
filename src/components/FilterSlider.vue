<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  absMin: number
  absMax: number
  step: number
  suffix: string
}>()

const min = defineModel<number>('min', { required: true })
const max = defineModel<number>('max', { required: true })

function onMinInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  min.value = Math.min(val, max.value - props.step)
}

function onMaxInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  max.value = Math.max(val, min.value + props.step)
}

const trackStyle = computed(() => {
  const range = props.absMax - props.absMin
  const left = ((min.value - props.absMin) / range) * 100
  const right = ((max.value - props.absMin) / range) * 100
  return {
    left: `${left}%`,
    width: `${right - left}%`,
  }
})

const isFiltered = computed(() =>
  min.value > props.absMin || max.value < props.absMax
)

function formatVal(v: number): string {
  return v.toLocaleString('nl-NL')
}
</script>

<template>
  <div class="slider-group" :class="{ filtered: isFiltered }">
    <div class="slider-header">
      <span class="slider-label">{{ label }}</span>
      <span class="slider-value">
        {{ formatVal(min) }} – {{ formatVal(max) }} {{ suffix }}
      </span>
    </div>
    <div class="slider-track-container">
      <div class="slider-track">
        <div class="slider-fill" :style="trackStyle" />
      </div>
      <input
        type="range"
        class="thumb thumb-min"
        :min="absMin"
        :max="absMax"
        :step="step"
        :value="min"
        @input="onMinInput"
      />
      <input
        type="range"
        class="thumb thumb-max"
        :min="absMin"
        :max="absMax"
        :step="step"
        :value="max"
        @input="onMaxInput"
      />
    </div>
  </div>
</template>

<style scoped>
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 200px;
  flex: 1;
  max-width: 300px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.slider-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.slider-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.slider-group.filtered .slider-value {
  color: var(--color-primary);
  font-weight: 600;
}

.slider-track-container {
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
}

.slider-track {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
}

.slider-fill {
  position: absolute;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: left 0.05s, width 0.05s;
}

/* Reset both range inputs and overlay them */
.thumb {
  position: absolute;
  left: 0;
  width: 100%;
  height: 28px;
  margin: 0;
  padding: 0;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

/* Webkit thumb */
.thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.15s, box-shadow 0.15s;
}

.thumb::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.thumb::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

/* Firefox thumb */
.thumb::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.15s, box-shadow 0.15s;
}

.thumb::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* Hide the track on Firefox */
.thumb::-moz-range-track {
  background: transparent;
  border: none;
}

/* Ensure min thumb renders above when at same position */
.thumb-min {
  z-index: 2;
}

.thumb-max {
  z-index: 1;
}
</style>
