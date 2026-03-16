import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigCourseProfessorController } from './config-course-professor.controller';
import { ConfigCourseProfessorService } from './config-course-professor.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigCourseProfessorController],
  providers: [ConfigCourseProfessorService],
})
export class ConfigCourseProfessorModule {}
