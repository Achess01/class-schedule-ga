import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigCourseController } from './config-course.controller';
import { ConfigCourseService } from './config-course.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigCourseController],
  providers: [ConfigCourseService],
})
export class ConfigCourseModule {}
