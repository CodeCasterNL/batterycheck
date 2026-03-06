<script setup lang="ts">
const props = defineProps<{
  data: unknown
  filename: string
}>()

function download() {
  const json = JSON.stringify(props.data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <button class="btn btn-success" @click="download">
    Download {{ filename }}
  </button>
</template>
