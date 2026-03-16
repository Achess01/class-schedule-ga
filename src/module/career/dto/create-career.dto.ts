import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateCareerDto {
  @ApiProperty({ description: 'Career name', example: 'Computer Science' })
  @IsString()
  @MaxLength(255)
  name: string;
}
