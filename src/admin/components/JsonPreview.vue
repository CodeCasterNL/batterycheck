<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: unknown
}>()

const formatted = computed(() => JSON.stringify(props.data, null, 2))
</script>

<template>
  <div class="json-preview">
    <h4>JSON Preview</h4>
    <pre><code>{{ formatted }}</code></pre>
  </div>
</template>

<style scoped>
.json-preview {
  width: 400px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
}

.json-preview h4 {
  margin-bottom: 0.5rem;
}

pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow: auto;
  max-height: 80vh;
}
</style>
