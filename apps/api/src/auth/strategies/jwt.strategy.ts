import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../../common/decorators/current-user.decorator'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(config.getOrThrow<string>('JWT_PUBLIC_KEY'), 'base64').toString(),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: { id: true, tenantId: true, email: true, roles: { select: { role: { select: { name: true } } } } },
    })
    if (!user) throw new UnauthorizedException('Usuario no encontrado')
    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles.map((r) => r.role.name),
    } satisfies JwtPayload
  }
}
