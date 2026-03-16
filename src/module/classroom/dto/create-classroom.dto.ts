import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ example: 101 })
  @IsInt()
  @Min(1)
  classroomId: number;

  @ApiProperty({ example: 'A-101' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'THEORY' })
  @IsString()
  @MaxLength(255)
  type: string;
}
