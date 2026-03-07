<script setup lang="ts">
defineProps<{
  hash: string
  title?: string
}>()
</script>

<template>
  <router-link :to="`/faq#${hash}`" class="help-link" :title="title">?</router-link>
</template>

<style scoped>
.help-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.72em;
  font-weight: 700;
  text-decoration: none;
  line-height: 1;
  vertical-align: super;
  margin-left: 0.2em;
}
.help-link:hover {
  background: var(--color-primary);
  color: white;
}
</style>
