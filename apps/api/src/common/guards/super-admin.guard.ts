import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { JwtPayload } from '../decorators/current-user.decorator'

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>().user
    if (!user) throw new UnauthorizedException()
    if (!user.roles.includes('SUPER_ADMIN')) throw new ForbiddenException('Solo el superadmin puede realizar esta acción')
    return true
  }
}
