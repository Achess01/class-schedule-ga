import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CourseCareerController } from './course-career.controller';
import { CourseCareerService } from './course-career.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourseCareerController],
  providers: [CourseCareerService],
})
export class CourseCareerModule {}
