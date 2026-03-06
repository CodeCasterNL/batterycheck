import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve } from 'path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ROOT = resolve(import.meta.dirname, '..')
const MANUFACTURERS_DIR = resolve(ROOT, 'data/manufacturers')
const SCHEMA_PATH = resolve(ROOT, 'schemas/manufacturer.schema.json')
const OUTPUT_PATH = resolve(ROOT, 'public/catalog.json')

interface ManufacturerInput {
  manufacturer: string
  slug: string
  website: string
  batteries: BatteryInput[]
}

interface BatteryInput {
  model: string
  slug: string
  capacityWh: number
  maxChargePowerW: number
  maxDischargePowerW: number
  offGridPowerW?: number | null
  offGridPeakPowerW?: number | null
  physical?: Record<string, unknown>
  electrical?: Record<string, unknown>
  features?: {
    hasMppt?: boolean
    solarInputW?: number | null
    solarConnections?: number | null
    offGrid?: boolean
    p1Meter?: Record<string, unknown>
    app?: string | null
    ups?: boolean
    upsSwitchMs?: number | null
  }
  expansion?: {
    expansionModel?: string | null
    expansionCapacityWh?: number | null
    maxUnits?: number | null
    expansionPhysical?: Record<string, unknown>
  } | null
  packages?: {
    description: string
    baseCount?: number
    expansionCount?: number
    offerings: {
      retailer: string
      url: string
      price: number
      p1Meter?: { available?: boolean; price?: number }
      startDate: string
      endDate?: string | null
    }[]
  }[]
  productUrl?: string
  forumUrl?: string | null
}

const TODAY = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

type OfferingInput = BatteryInput['packages'] extends (infer P)[] | undefined
  ? P extends { offerings: (infer O)[] } ? O : never
  : never

function isOfferingValid(offering: OfferingInput): boolean {
  if (offering.startDate > TODAY) return false
  if (offering.endDate && offering.endDate < TODAY) return false
  return true
}

/** Filter packages to only include currently valid offerings, drop empty packages */
function filterValidPackages(battery: BatteryInput): BatteryInput['packages'] {
  if (!battery.packages) return []
  return battery.packages
    .map(pkg => ({
      ...pkg,
      offerings: pkg.offerings.filter(isOfferingValid),
    }))
    .filter(pkg => pkg.offerings.length > 0)
}

/** Strip source-only fields (startDate, endDate) from offerings for catalog output */
function catalogPackages(packages: NonNullable<BatteryInput['packages']>) {
  return packages.map(pkg => ({
    description: pkg.description,
    baseCount: pkg.baseCount,
    expansionCount: pkg.expansionCount,
    offerings: pkg.offerings.map(o => ({
      retailer: o.retailer,
      url: o.url,
      price: o.price,
      p1Meter: {
        available: o.p1Meter?.available ?? false,
        price: o.p1Meter?.price ?? 0,
      },
    })),
  }))
}

function main() {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'))
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  const files = readdirSync(MANUFACTURERS_DIR).filter((f) => f.endsWith('.json'))
  const catalogBatteries: Record<string, unknown>[] = []
  let errors = 0

  for (const file of files) {
    const filePath = resolve(MANUFACTURERS_DIR, file)
    const data: ManufacturerInput = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (!validate(data)) {
      console.error(`Validation failed for ${file}:`)
      console.error(JSON.stringify(validate.errors, null, 2))
      errors++
      continue
    }

    for (const battery of data.batteries) {
      const id = `${data.slug}--${battery.slug}`
      const capacityKwh = battery.capacityWh / 1000
      const validPackages = filterValidPackages(battery)
      const hasSolar = battery.features?.hasMppt === true
      const isExpandable = battery.expansion != null

      let maxCapacityWh: number | null = null
      let maxCapacityKwh: number | null = null
      if (isExpandable && battery.expansion?.expansionCapacityWh && battery.expansion?.maxUnits) {
        maxCapacityWh = battery.capacityWh + battery.expansion.maxUnits * battery.expansion.expansionCapacityWh
        maxCapacityKwh = maxCapacityWh / 1000
      } else if (battery.capacityWh > 0) {
        maxCapacityWh = battery.capacityWh
        maxCapacityKwh = capacityKwh
      }

      catalogBatteries.push({
        id,
        manufacturer: data.manufacturer,
        manufacturerSlug: data.slug,
        manufacturerWebsite: data.website,
        model: battery.model,
        modelSlug: battery.slug,
        capacityWh: battery.capacityWh,
        maxChargePowerW: battery.maxChargePowerW,
        maxDischargePowerW: battery.maxDischargePowerW,
        offGridPowerW: battery.offGridPowerW ?? null,
        offGridPeakPowerW: battery.offGridPeakPowerW ?? null,
        physical: battery.physical ?? null,
        electrical: battery.electrical ?? null,
        features: battery.features ?? null,
        expansion: battery.expansion ?? null,
        packages: catalogPackages(validPackages),
        productUrl: battery.productUrl ?? null,
        forumUrl: battery.forumUrl ?? null,
        computed: {
          capacityKwh,
          hasSolar,
          isExpandable,
          maxCapacityWh,
          maxCapacityKwh,
        },
      })
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} file(s) failed validation.`)
    process.exit(1)
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    batteries: catalogBatteries,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), 'utf-8')
  console.log(`Compiled ${catalogBatteries.length} batteries from ${files.length} manufacturers → ${OUTPUT_PATH}`)
}

main()
