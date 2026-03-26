/**
 * Seed de desarrollo — crea tenant piloto + usuario admin
 * Ejecutar: pnpm --filter @clinicos/database db:seed:dev
 */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creando datos de desarrollo...\n')

  // ── Tenant ───────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { nit: '9001234567' },
    update: {},
    create: {
      name: 'Gastromedicall Ltda',
      nit: '9001234567',
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      isActive: true,
    },
  })
  console.log(`✓ Tenant: ${tenant.name} (${tenant.id})`)

  // ── Sede ─────────────────────────────────────────────────────────────────
  const site = await prisma.tenantSite.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Sede Principal' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Sede Principal',
      address: 'Calle 100 # 15-20, Bogotá',
      city: 'Bogotá',
      isMain: true,
    },
  })
  console.log(`✓ Sede: ${site.name}`)

  // ── Roles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Admin' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Admin', description: 'Administrador del sistema' },
  })

  const medicoRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Médico' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Médico', description: 'Médico tratante' },
  })

  const recepcionRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Recepcionista' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Recepcionista', description: 'Personal de recepción' },
  })
  console.log(`✓ Roles: Admin, Médico, Recepcionista`)

  // ── Usuarios ─────────────────────────────────────────────────────────────
  const users = [
    { email: 'admin@gastromedicall.com',     password: 'Admin123!',   firstName: 'Admin',    lastName: 'ClinicOS',  roleId: adminRole.id },
    { email: 'medico@gastromedicall.com',    password: 'Medico123!',  firstName: 'Fabián',   lastName: 'Varón',     roleId: medicoRole.id },
    { email: 'recepcion@gastromedicall.com', password: 'Recep123!',   firstName: 'Laura',    lastName: 'Gómez',     roleId: recepcionRole.id },
  ]

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12)
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: true,
      },
    })
    // Assign role (skip if already exists)
    await prisma.userRole.createMany({
      data: [{ userId: user.id, roleId: u.roleId }],
      skipDuplicates: true,
    })
    console.log(`✓ Usuario: ${user.email} / ${u.password}`)
  }

  // ── Tenant plataforma (sentinel para superadmin) ─────────────────────────
  const platformTenant = await prisma.tenant.upsert({
    where: { nit: '0000000000' },
    update: {},
    create: {
      name: 'ClinicOS Platform',
      nit: '0000000000',
      subscriptionPlan: 'platform',
      subscriptionStatus: 'active',
      isActive: true,
    },
  })

  const superAdminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: platformTenant.id, name: 'SUPER_ADMIN' } },
    update: {},
    create: { tenantId: platformTenant.id, name: 'SUPER_ADMIN', description: 'Administrador de plataforma', isSystem: true },
  })

  const superAdminHash = await bcrypt.hash('SuperAdmin123!', 12)
  const superAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: platformTenant.id, email: 'superadmin@clinicos.io' } },
    update: {},
    create: {
      tenantId: platformTenant.id,
      email: 'superadmin@clinicos.io',
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      isActive: true,
    },
  })

  await prisma.userRole.createMany({
    data: [{ userId: superAdmin.id, roleId: superAdminRole.id }],
    skipDuplicates: true,
  })
  console.log(`✓ SuperAdmin: ${superAdmin.email}`)

  console.log('\n✅ Datos de desarrollo listos.')
  console.log('\n📋 Credenciales:')
  console.log('   admin@gastromedicall.com    /  Admin123!')
  console.log('   medico@gastromedicall.com   /  Medico123!')
  console.log('   recepcion@gastromedicall.com / Recep123!')
  console.log('   superadmin@clinicos.io       /  SuperAdmin123!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
