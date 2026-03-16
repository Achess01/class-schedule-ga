import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateConfigProfessorDto } from './create-config-professor.dto';

export class UpdateConfigProfessorDto extends PartialType(
  CreateConfigProfessorDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
