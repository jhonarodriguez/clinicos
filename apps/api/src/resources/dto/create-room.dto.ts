import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator'

export const ROOM_TYPES = ['consulting', 'surgery', 'recovery', 'diagnostic', 'other'] as const

export class CreateRoomDto {
  @ApiProperty({ example: 'uuid-del-site' })
  @IsString()
  siteId!: string

  @ApiProperty({ example: 'Consultorio 1' })
  @IsString()
  name!: string

  @ApiPropertyOptional({ example: 'C-01' })
  @IsOptional() @IsString()
  code?: string

  @ApiProperty({ enum: ROOM_TYPES })
  @IsIn(ROOM_TYPES)
  roomType!: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsInt() @Min(1)
  capacity?: number

  @ApiPropertyOptional({ example: '2' })
  @IsOptional() @IsString()
  floor?: string
}
