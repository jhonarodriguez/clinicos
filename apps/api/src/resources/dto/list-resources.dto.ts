import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class ListResourcesDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  siteId?: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'false' ? false : value === 'true' ? true : value)
  @IsBoolean()
  isActive?: boolean
}
