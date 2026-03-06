<script setup lang="ts">
import { ref } from 'vue'
import ManufacturerList from './views/ManufacturerList.vue'
import ManufacturerEdit from './views/ManufacturerEdit.vue'
import type { Manufacturer } from '../types/generated'

const currentView = ref<'list' | 'edit'>('list')
const editData = ref<Manufacturer | null>(null)
const editFilename = ref<string>('')

function openEdit(manufacturer: Manufacturer, filename: string) {
  editData.value = JSON.parse(JSON.stringify(manufacturer))
  editFilename.value = filename
  currentView.value = 'edit'
}

function backToList() {
  currentView.value = 'list'
  editData.value = null
}
</script>

<template>
  <div class="admin">
    <header class="admin-header">
      <h1>
        <a href="#" @click.prevent="backToList">Thuisbatterij Admin</a>
      </h1>
    </header>
    <main class="admin-main">
      <ManufacturerList
        v-if="currentView === 'list'"
        @edit="openEdit"
      />
      <ManufacturerEdit
        v-else-if="currentView === 'edit' && editData"
        :manufacturer="editData"
        :filename="editFilename"
        @back="backToList"
      />
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #1a1a1a;
  line-height: 1.5;
}

.admin-header {
  background: #1565c0;
  color: white;
  padding: 1rem 2rem;
}

.admin-header a {
  color: white;
  text-decoration: none;
}

.admin-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1565c0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-primary {
  background: #1565c0;
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-danger {
  background: #c62828;
  color: white;
}

.btn-success {
  background: #2e7d32;
  color: white;
}
</style>
