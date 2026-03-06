import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import type { CatalogBattery } from './types/generated'
import { setCatalogData, resetCatalog } from './composables/useCatalog'

function createSsrRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      {
        path: '/batterij/:mfr/:model',
        name: 'battery-detail',
        component: () => import('./views/BatteryDetailView.vue'),
      },
    ],
  })
}

export async function render(url: string, catalogBatteries: CatalogBattery[]): Promise<string> {
  resetCatalog()
  setCatalogData(catalogBatteries)

  const app = createSSRApp(App)
  const router = createSsrRouter()
  app.use(router)

  await router.push(url)
  await router.isReady()

  const html = await renderToString(app)
  return html
}
