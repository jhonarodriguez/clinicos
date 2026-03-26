import { PrismaClient } from '@prisma/client'
import { DANE_MUNICIPIOS } from './data/dane-municipios'
import { CIE10_CODES } from './data/cie10'
import { CUPS_CODES } from './data/cups'
import { IUM_MEDICATIONS } from './data/ium'

const prisma = new PrismaClient()

// ── Helpers ───────────────────────────────────────────────────────────────────

function chunk<T>(array: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size) as T[])
  }
  return chunks
}

// ── Seeders ───────────────────────────────────────────────────────────────────

async function seedDaneMunicipalities() {
  console.log(`  → Insertando ${DANE_MUNICIPIOS.length} municipios DANE...`)

  const batches = chunk(DANE_MUNICIPIOS, 100)
  let inserted = 0

  for (const batch of batches) {
    const result = await prisma.daneMunicipality.createMany({
      data: batch.map((m) => ({
        code: m.code,
        name: m.name,
        departmentCode: m.departmentCode,
        departmentName: m.department,
      })),
      skipDuplicates: true,
    })
    inserted += result.count
  }

  console.log(`  ✓ ${inserted} municipios insertados`)
}

async function seedCie10Codes() {
  console.log(`  → Insertando ${CIE10_CODES.length} códigos CIE-10...`)

  const batches = chunk(CIE10_CODES, 100)
  let inserted = 0

  for (const batch of batches) {
    const result = await prisma.cie10Code.createMany({
      data: batch.map((c) => ({
        code: c.code,
        description: c.description,
        // Store the full category string in chapter (truncated to schema limit)
        chapter: c.category.substring(0, 10),
      })),
      skipDuplicates: true,
    })
    inserted += result.count
  }

  console.log(`  ✓ ${inserted} códigos CIE-10 insertados`)
}

async function seedCupsCodes() {
  console.log(`  → Insertando ${CUPS_CODES.length} códigos CUPS...`)

  const batches = chunk(CUPS_CODES, 100)
  let inserted = 0

  for (const batch of batches) {
    const result = await prisma.cupsCode.createMany({
      data: batch.map((c) => ({
        code: c.code,
        description: c.description,
        groupName: c.group,
      })),
      skipDuplicates: true,
    })
    inserted += result.count
  }

  console.log(`  ✓ ${inserted} códigos CUPS insertados`)
}

async function seedIumMedications() {
  console.log(`  → Insertando ${IUM_MEDICATIONS.length} medicamentos IUM...`)

  const batches = chunk(IUM_MEDICATIONS, 100)
  let inserted = 0

  for (const batch of batches) {
    const result = await prisma.iumMedication.createMany({
      data: batch.map((m) => ({
        // `code` holds the INVIMA sanitary record (unique identifier)
        code: m.invimaSanitaryRecord,
        // `genericName` holds the active ingredient (INN / generic name)
        genericName: m.activeIngredient,
        atcCode: m.atcCode,
        pharmaceuticalForm: m.pharmaceuticalForm,
        concentration: m.concentration,
        administrationRoute: m.routeOfAdministration,
      })),
      skipDuplicates: true,
    })
    inserted += result.count
  }

  console.log(`  ✓ ${inserted} medicamentos insertados`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seeds...')

  await seedDaneMunicipalities()
  await seedCie10Codes()
  await seedCupsCodes()
  await seedIumMedications()

  console.log('✅ Seeds completados')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
