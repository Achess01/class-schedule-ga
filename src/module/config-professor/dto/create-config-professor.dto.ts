import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateConfigProfessorDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  configProfessorId: number;

  @ApiProperty({ example: 1001 })
  @IsInt()
  @Min(1)
  professorCode: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  scheduleConfigId: number;
}
