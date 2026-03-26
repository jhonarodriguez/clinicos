import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — verifica API y base de datos' })
  async check() {
    await this.prisma.$queryRaw`SELECT 1`

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }
  }
}
