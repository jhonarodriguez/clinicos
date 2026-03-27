import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TenantsModule } from './tenants/tenants.module'
import { RolesModule } from './roles/roles.module'
import { SitesController } from './sites/sites.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [UsersModule, TenantsModule, RolesModule, PrismaModule],
  controllers: [SitesController],
})
export class IdentityModule {}
