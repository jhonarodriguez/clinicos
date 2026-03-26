/**
 * Tests de aislamiento entre tenants (RLS)
 *
 * Verifica que un usuario de un tenant NO puede ver datos de otro tenant.
 * Requiere la DB con RLS habilitado y migraciones aplicadas.
 *
 * Ejecutar: pnpm --filter @clinicos/api test:e2e
 */
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import * as bcrypt from 'bcrypt'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('Tenant Isolation (RLS)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let tenantAId: string
  let tenantBId: string
  let tokenA: string
  let tokenB: string
  let userBId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()

    prisma = moduleRef.get(PrismaService)

    // Crear tenant A
    const tA = await prisma.tenant.create({
      data: { name: 'Test Tenant A', nit: 'TEST-A-001', subscriptionPlan: 'starter', subscriptionStatus: 'active' },
    })
    tenantAId = tA.id

    // Crear tenant B
    const tB = await prisma.tenant.create({
      data: { name: 'Test Tenant B', nit: 'TEST-B-001', subscriptionPlan: 'starter', subscriptionStatus: 'active' },
    })
    tenantBId = tB.id

    const hash = await bcrypt.hash('Test123!', 12)

    // Usuario en tenant A
    await prisma.user.create({
      data: { tenantId: tenantAId, email: 'userA@test.io', passwordHash: hash, firstName: 'User', lastName: 'A', isActive: true },
    })

    // Usuario en tenant B
    const uB = await prisma.user.create({
      data: { tenantId: tenantBId, email: 'userB@test.io', passwordHash: hash, firstName: 'User', lastName: 'B', isActive: true },
    })
    userBId = uB.id

    // Login tenant A
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'userA@test.io', password: 'Test123!' })
    tokenA = (resA.body as { data: { accessToken: string } }).data.accessToken

    // Login tenant B
    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'userB@test.io', password: 'Test123!' })
    tokenB = (resB.body as { data: { accessToken: string } }).data.accessToken
  })

  afterAll(async () => {
    // Cleanup — eliminar datos de prueba
    await prisma.user.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } })
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } })
    await app.close()
  })

  it('GET /users — tenant A solo ve sus propios usuarios', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    const users = (res.body as { data: { tenantId?: string }[] }).data
    const hasLeakage = users.some((u) => u.tenantId === tenantBId)
    expect(hasLeakage).toBe(false)
  })

  it('GET /users/:id — tenant A no puede obtener usuario de tenant B', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404)
  })

  it('GET /users — tenant B solo ve sus propios usuarios', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    const users = (res.body as { data: { tenantId?: string }[] }).data
    const hasLeakage = users.some((u) => u.tenantId === tenantAId)
    expect(hasLeakage).toBe(false)
  })

  it('GET /tenants — usuario normal recibe 403', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tenants')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403)
  })
})
