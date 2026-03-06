<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalog } from '../composables/useCatalog'
import { useComparison } from '../composables/useComparison'
import BatteryGrid from '../components/BatteryGrid.vue'
import ComparisonBar from '../components/ComparisonBar.vue'

const route = useRoute()
const router = useRouter()
const { batteries } = useCatalog()
const { clear } = useComparison()

const selected = computed(() => {
  const ids = (route.query.ids as string)?.split(',') ?? []
  return batteries.value.filter((b) => ids.includes(b.id))
})

function exitComparison() {
  clear()
  router.push('/database')
}
</script>

<template>
  <div class="compare">
    <h2>Vergelijking</h2>
    <p v-if="selected.length === 0">Geen batterijen geselecteerd. Ga terug en selecteer batterijen om te vergelijken.</p>
    <BatteryGrid v-else :batteries="selected" />
    <ComparisonBar>
      <template #text>{{ selected.length }} batterij{{ selected.length === 1 ? '' : 'en' }} vergeleken</template>
      <button class="btn btn-light btn-sm" @click="exitComparison">Terug naar alle batterijen</button>
    </ComparisonBar>
  </div>
</template>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 3.5rem;
}

.compare h2 {
  font-size: 1.5rem;
}

</style>
