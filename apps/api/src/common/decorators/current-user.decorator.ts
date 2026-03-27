import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export interface JwtPayload {
  sub: string
  email: string
  tenantId: string
  roles: string[]
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>()
    return data ? request.user[data] : request.user
  },
)
