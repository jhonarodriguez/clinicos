import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => ReturnType<typeof import('cookie-parser')>
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // ── Cookie parser (refresh token HttpOnly) ─────────────────────────────────
  app.use(cookieParser())

  // ── Prefijo global ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1')

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env['NEXT_PUBLIC_API_URL'] ? [process.env['NEXT_PUBLIC_API_URL']] : '*',
    credentials: true,
  })

  // ── Validación global ──────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,
      transform: true,        // transforma tipos automáticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ── Swagger ────────────────────────────────────────────────────────────────
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ClinicOS API')
      .setDescription('API del sistema de gestión clínica ClinicOS')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
    logger.log('Swagger disponible en /api/docs')
  }

  // ── Arranque ───────────────────────────────────────────────────────────────
  const port = process.env['API_PORT'] ?? 3001
  await app.listen(port)
  logger.log(`API corriendo en http://localhost:${port}/api/v1`)
}

bootstrap().catch((err: unknown) => {
  console.error('Error al arrancar la API:', err)
  process.exit(1)
})
