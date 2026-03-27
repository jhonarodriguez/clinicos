import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PrismaService } from '../../prisma/prisma.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Sites')
@ApiBearerAuth()
@Controller('sites')
export class SitesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sedes activas del tenant actual' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.prisma.tenantSite.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, city: true, address: true, isMain: true },
      orderBy: { isMain: 'desc' },
    })
  }
}
