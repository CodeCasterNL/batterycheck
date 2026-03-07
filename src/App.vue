<script setup lang="ts">
import { useCatalog } from './composables/useCatalog'
import { useRoute } from 'vue-router'

const { isLoading, error } = useCatalog()
const route = useRoute()

const needsCatalog = () => !!route.meta.needsCatalog
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="header-brand">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <line x1="10" y1="6" x2="14" y2="6" />
            <rect x="8" y="10" width="8" height="8" rx="1" opacity="0.3" fill="currentColor" />
          </svg>
          <div>
            <h1>Battery Check</h1>
            <p class="header-tagline">Thuisbatterijvergelijker - vind de beste thuisbatterij voor jouw situatie.</p>
          </div>
        </router-link>
        <nav class="header-nav">
          <router-link to="/zoek" active-class="nav-active">Welke batterij voor mij?</router-link>
          <router-link to="/database" active-class="nav-active">Bekijk alle modellen</router-link>
          <router-link to="/faq" active-class="nav-active">Veelgestelde Vragen</router-link>
        </nav>
      </div>
    </header>
    <main>
      <div v-if="needsCatalog() && isLoading" class="loading">
        <div class="loading-spinner" />
        Laden...
      </div>
      <div v-else-if="needsCatalog() && error" class="error">{{ error }}</div>
      <router-view v-else />
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

:root {
  --color-bg: #f0f2f5;
  --color-surface: #ffffff;
  --color-primary: #1a5c2e;
  --color-primary-hover: #165127;
  --color-primary-light: #e8f5e9;
  --color-text: #1a1a1a;
  --color-text-muted: #666;
  --color-border: #e0e0e0;
  --color-accent: #ff6b00;
  --color-row-alt: #f8faf8;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

/* Shared utility classes */
.surface {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-sm { padding: 0.35rem 0.9rem; font-size: 0.82rem; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { background: var(--color-primary-hover); }
.btn-secondary { background: var(--color-primary-light); color: var(--color-primary); }
.btn-secondary:hover { background: #d0e8d2; }
.btn-light { background: white; color: var(--color-primary); }
.btn-light:hover:not(:disabled) { background: var(--color-primary-light); }
.btn-light:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline-light { background: transparent; color: white; border-color: rgba(255, 255, 255, 0.4); }
.btn-outline-light:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.7); }

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 999px;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, #2a7a42 100%);
  color: white;
  padding: 0;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  max-width: 100%;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.header-nav {
  display: flex;
  gap: 0.25rem;
}

.header-nav a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.header-nav a:hover {
  color: white;
  background: rgba(255, 255, 255, 0.12);
}

.header-nav a.nav-active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  text-decoration: none;
}

.header-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.header-brand h1 {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.header-tagline {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: 400;
}

main {
  padding: 1.25rem 1.5rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #c62828;
}
</style>
