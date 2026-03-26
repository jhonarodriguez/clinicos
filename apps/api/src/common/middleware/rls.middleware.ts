import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * RLS Middleware
 *
 * Inyecta `app.current_tenant` en la sesión de PostgreSQL al inicio
 * de cada request autenticado, lo que activa las políticas de Row-Level
 * Security en todas las tablas multi-tenant.
 *
 * Este middleware corre DESPUÉS del AuthGuard, por lo que `req.user`
 * ya está disponible con el tenantId.
 */
@Injectable()
export class RlsMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request & { user?: { tenantId: string } }, _res: Response, next: NextFunction) {
    const tenantId = req.user?.tenantId

    if (!tenantId) {
      return next()
    }

    // UUID validation — evita SQL injection en SET LOCAL
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_REGEX.test(tenantId)) {
      throw new UnauthorizedException('tenant_id inválido')
    }

    await this.prisma.$executeRawUnsafe(
      `SET app.current_tenant = '${tenantId}'`,
    )

    next()
  }
}
