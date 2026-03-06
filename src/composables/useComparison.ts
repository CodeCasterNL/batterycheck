import { ref, computed, readonly } from 'vue'

const selectedIds = ref<Set<string>>(new Set())

export function useComparison() {
  function toggle(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
    // Trigger reactivity
    selectedIds.value = new Set(selectedIds.value)
  }

  function isSelected(id: string) {
    return selectedIds.value.has(id)
  }

  function clear() {
    selectedIds.value = new Set()
  }

  const count = computed(() => selectedIds.value.size)
  const ids = computed(() => [...selectedIds.value])

  return {
    selectedIds: readonly(selectedIds),
    toggle,
    isSelected,
    clear,
    count,
    ids,
  }
}
