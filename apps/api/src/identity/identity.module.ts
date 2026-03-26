import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TenantsModule } from './tenants/tenants.module'
import { RolesModule } from './roles/roles.module'

@Module({
  imports: [UsersModule, TenantsModule, RolesModule],
})
export class IdentityModule {}
