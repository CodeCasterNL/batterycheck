import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const baseTitle = 'Battery Check - Thuisbatterijvergelijker'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: baseTitle } },
  {
    path: '/zoek',
    name: 'finder',
    component: () => import('./views/FinderView.vue'),
    meta: { title: `Welke batterij voor mij? - ${baseTitle}` },
  },
  {
    path: '/database',
    name: 'database',
    component: () => import('./views/DatabaseView.vue'),
    meta: { title: `Alle batterijen - ${baseTitle}` },
  },
  {
    path: '/vergelijk',
    name: 'compare',
    component: () => import('./views/CompareView.vue'),
    meta: { title: `Vergelijking - ${baseTitle}` },
  },
  {
    path: '/batterij/:mfr/:model',
    name: 'battery-detail',
    component: () => import('./views/BatteryDetailView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || baseTitle
})
