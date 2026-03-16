import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateConfigClassroomDto } from './create-config-classroom.dto';

export class UpdateConfigClassroomDto extends PartialType(
  CreateConfigClassroomDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
