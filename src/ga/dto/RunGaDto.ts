import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class RunGaDto {
  @ApiProperty({
    description: 'Generated schedule name',
    example: 'Primer Semestre 2026',
  })
  @IsString()
  @MaxLength(255)
  name: string;
}
