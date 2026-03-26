import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from '../common/decorators/current-user.decorator'

const REFRESH_COOKIE = 'refresh_token'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /* ── Login ── */
  async login(dto: LoginDto, req: Request, res: Response) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: { roles: { include: { role: true } } },
    })

    // Cuenta bloqueada
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Cuenta bloqueada temporalmente. Intenta más tarde.')
    }

    const valid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false

    if (!user || !valid) {
      // Incrementar contador de intentos fallidos
      if (user) {
        const failedCount = user.failedLoginCount + 1
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failedCount,
            lockedUntil: failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
          },
        })
      }
      throw new UnauthorizedException('Credenciales incorrectas')
    }

    if (!user.isActive) {
      throw new ForbiddenException('Usuario desactivado')
    }

    // Reset intentos fallidos
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: req.ip },
    })

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles.map((r) => r.role.name),
    }

    const accessToken = this.signAccess(payload)
    const refreshToken = this.signRefresh(payload)

    // Guardar sesión en BD
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        refreshToken,
        ipAddress: req.ip ?? '0.0.0.0',
        userAgent: req.headers['user-agent'],
        expiresAt,
      },
    })

    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles: payload.roles,
      },
    }
  }

  /* ── Refresh ── */
  async refresh(req: Request, res: Response) {
    const token: string | undefined = (req.cookies as Record<string, string>)[REFRESH_COOKIE]
    if (!token) throw new UnauthorizedException('Sin token de refresco')

    // Verificar JWT
    let payload: JwtPayload
    try {
      payload = this.jwt.verify<JwtPayload>(token, {
        secret: Buffer.from(this.config.getOrThrow<string>('JWT_PUBLIC_KEY'), 'base64').toString(),
        algorithms: ['RS256'],
      })
    } catch {
      throw new UnauthorizedException('Token de refresco inválido')
    }

    // Buscar sesión en BD
    const session = await this.prisma.session.findFirst({
      where: { refreshToken: token, revokedAt: null, expiresAt: { gt: new Date() } },
    })
    if (!session) throw new UnauthorizedException('Sesión no encontrada o expirada')

    // Limpiar claims de tiempo del payload verificado antes de firmar nuevos tokens
    const { exp: _exp, iat: _iat, ...freshPayload } = payload as JwtPayload & { exp?: number; iat?: number }

    // Rotar refresh token
    const newRefreshToken = this.signRefresh(freshPayload)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.$transaction([
      this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } }),
      this.prisma.session.create({
        data: {
          userId: freshPayload.sub,
          tenantId: freshPayload.tenantId,
          refreshToken: newRefreshToken,
          ipAddress: req.ip ?? '0.0.0.0',
          userAgent: req.headers['user-agent'],
          expiresAt,
        },
      }),
    ])

    res.cookie(REFRESH_COOKIE, newRefreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { accessToken: this.signAccess(freshPayload) }
  }

  /* ── Logout ── */
  async logout(req: Request, res: Response) {
    const token: string | undefined = (req.cookies as Record<string, string>)[REFRESH_COOKIE]
    if (token) {
      await this.prisma.session.updateMany({
        where: { refreshToken: token },
        data: { revokedAt: new Date() },
      })
    }
    res.clearCookie(REFRESH_COOKIE, COOKIE_OPTS)
    return { message: 'Sesión cerrada' }
  }

  /* ── Me ── */
  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
    })
    return user
  }

  /* ── Helpers ── */
  private signAccess(payload: JwtPayload) {
    return this.jwt.sign(payload, {
      algorithm: 'RS256',
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    })
  }

  private signRefresh(payload: JwtPayload) {
    return this.jwt.sign(payload, {
      algorithm: 'RS256',
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })
  }
}
