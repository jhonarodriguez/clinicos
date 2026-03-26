import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class AssignPermissionDto {
  @ApiProperty({ example: 'uuid-del-permiso' })
  @IsUUID()
  permissionId!: string
}
