/**
 * Post-build script: uses Vite SSR to render Vue components into static HTML
 * for the homepage, per-battery detail pages, and a 404 fallback.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs'
import { resolve, dirname } from 'path'
import { build } from 'vite'

const ROOT = resolve(import.meta.dirname, '..')
const DIST = resolve(ROOT, 'dist')
const SSR_OUT = resolve(DIST, '.ssr')
const CATALOG_PATH = resolve(ROOT, 'public/catalog.json')

interface CatalogBattery {
  id: string
  manufacturer: string
  manufacturerSlug: string
  model: string
  modelSlug: string
  capacityWh: number
  computed?: { capacityKwh: number }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function main() {
  if (!existsSync(CATALOG_PATH)) {
    console.error('catalog.json not found — run `npm run compile` first.')
    process.exit(1)
  }

  const indexPath = resolve(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }

  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))
  const batteries: CatalogBattery[] = catalog.batteries
  const template = readFileSync(indexPath, 'utf-8')

  /*
  * SSR build: compile entry-server.ts into a Node-importable bundle
  */
  console.log('Building SSR bundle...')
  await build({
    root: ROOT,
    logLevel: 'warn',
    build: {
      ssr: resolve(ROOT, 'src/entry-server.ts'),
      outDir: SSR_OUT,
      rollupOptions: { output: { format: 'es' } },
    },
  })

  const { render } = await import(`file://${resolve(SSR_OUT, 'entry-server.js').replace(/\\/g, '/')}`)

  /*
  * Render Homepage.
  */
  const homeHtml = await render('/', batteries)
  const homeMeta = `<title>Battery Check - Thuisbatterijvergelijker</title>\n    <meta name="description" content="Vergelijk thuisbatterijen: vind de beste thuisbatterij voor jouw situatie. Objectief, onafhankelijk en actueel." />`
  const homePage = template
    .replace(/<title>.*?<\/title>/, homeMeta)
    .replace('<div id="app"></div>', `<div id="app">${homeHtml}</div>`)
  writeFileSync(indexPath, homePage, 'utf-8')
  console.log('Generated: index.html (SSR homepage)')

  /*
  * Render FAQ.
  */
  const faqHtml = await render('/faq')
  const faqMeta = `<title>Veelgestelde Vragen - Battery Check - Thuisbatterijvergelijker</title>\n    <meta name="description" content="Vergelijk thuisbatterijen: veelgestelde vragen over thuisbatterijen, zoals 'Wat is een P1-meter?' en 'Wat is het maximale laadvermogen?'." />`
  const faqPage = template
    .replace(/<title>.*?<\/title>/, faqMeta)
    .replace('<div id="app"></div>', `<div id="app">${faqHtml}</div>`)
  const faqPath = resolve(DIST, 'faq', 'index.html')
  mkdirSync(dirname(faqPath), { recursive: true })
  writeFileSync(faqPath, faqPage, 'utf-8')
  console.log('Generated: faq/index.html')

  /*
  * 404.html for GitHub Pages SPA fallback.
  */
  writeFileSync(resolve(DIST, '404.html'), template, 'utf-8')
  console.log('Generated: 404.html (SPA fallback)')

  /*
  * Per-battery detail pages.
  */
  let count = 0
  for (const b of batteries) {
    const url = `/batterij/${b.manufacturerSlug}/${b.modelSlug}`
    const html = await render(url, batteries)

    const capKwh = b.computed?.capacityKwh ?? b.capacityWh / 1000
    const title = `${b.manufacturer} ${b.model} - Battery Check`
    const desc = `Specificaties en prijzen van de ${b.manufacturer} ${b.model} (${capKwh.toLocaleString('nl-NL')} kWh). Vergelijk thuisbatterijen op Battery Check.`
    const meta = `<title>${escHtml(title)}</title>\n    <meta name="description" content="${escHtml(desc)}" />`

    const page = template
      .replace(/<title>.*?<\/title>/, meta)
      .replace('<div id="app"></div>', `<div id="app">${html}</div>`)

    const pagePath = resolve(DIST, 'batterij', b.manufacturerSlug, b.modelSlug, 'index.html')
    mkdirSync(dirname(pagePath), { recursive: true })
    writeFileSync(pagePath, page, 'utf-8')
    count++
  }
  console.log(`Generated: ${count} battery detail pages (SSR)`)

  /*
  * Clean up SSR build artifacts.
  */
  rmSync(SSR_OUT, { recursive: true, force: true })
}

main().catch(e => { console.error(e); process.exit(1) })
