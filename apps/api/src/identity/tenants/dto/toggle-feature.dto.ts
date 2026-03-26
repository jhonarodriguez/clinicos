import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class ToggleFeatureDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled!: boolean
}
