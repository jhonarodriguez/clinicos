import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtPayload } from '../decorators/current-user.decorator'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * RLS Interceptor
 *
 * Corre DESPUÉS de JwtAuthGuard (los interceptors se ejecutan post-guards),
 * por lo que req.user ya está disponible.
 *
 * Inyecta app.current_tenant en la sesión de PostgreSQL para activar
 * las políticas de Row-Level Security en todas las tablas multi-tenant.
 *
 * Superadmin: usa el sentinel 'SUPERADMIN' para bypass de políticas RLS.
 */
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const user = req.user

    if (user?.tenantId) {
      const isSuperAdmin = user.roles.includes('SUPER_ADMIN')

      if (isSuperAdmin) {
        await this.prisma.$executeRawUnsafe(`SET app.current_tenant = 'SUPERADMIN'`)
      } else if (UUID_REGEX.test(user.tenantId)) {
        await this.prisma.$executeRawUnsafe(`SET app.current_tenant = '${user.tenantId}'`)
      }
    }

    return next.handle()
  }
}
