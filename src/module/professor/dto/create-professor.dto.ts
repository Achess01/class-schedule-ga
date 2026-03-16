import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({ example: 1001 })
  @IsInt()
  @Min(1)
  professorCode: number;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiPropertyOptional({ example: 'María' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  secondName?: string;

  @ApiProperty({ example: 'López' })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  secondLastName?: string;

  @ApiProperty({ example: '2026-03-15T07:00:00.000Z' })
  @IsDateString()
  entryTime: string;

  @ApiProperty({ example: '2026-03-15T15:00:00.000Z' })
  @IsDateString()
  exitTime: string;
}
