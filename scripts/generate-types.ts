import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { compile } from 'json-schema-to-typescript'

const ROOT = resolve(import.meta.dirname, '..')
const SCHEMAS_DIR = resolve(ROOT, 'schemas')
const OUTPUT = resolve(ROOT, 'src/types/generated.ts')

async function main() {
  const manufacturerSchema = JSON.parse(
    readFileSync(resolve(SCHEMAS_DIR, 'manufacturer.schema.json'), 'utf-8')
  )
  const catalogSchema = JSON.parse(
    readFileSync(resolve(SCHEMAS_DIR, 'catalog.schema.json'), 'utf-8')
  )

  const manufacturerTypes = await compile(manufacturerSchema, 'Manufacturer', {
    additionalProperties: false,
    bannerComment: '',
  })

  const catalogTypes = await compile(catalogSchema, 'Catalog', {
    additionalProperties: false,
    bannerComment: '',
  })

  const output = `// Auto-generated from JSON schemas — do not edit manually
// Run \`npm run generate-types\` to regenerate

${manufacturerTypes}

${catalogTypes}
`

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, output, 'utf-8')
  console.log(`Generated types at ${OUTPUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
