import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CareerModule } from './module/career/career.module';
import { ClassroomModule } from './module/classroom/classroom.module';
import { ConfigClassroomModule } from './module/config-classroom/config-classroom.module';
import { ConfigCourseProfessorModule } from './module/config-course-professor/config-course-professor.module';
import { ConfigCourseModule } from './module/config-course/config-course.module';
import { ConfigProfessorModule } from './module/config-professor/config-professor.module';
import { CourseCareerModule } from './module/course-career/course-career.module';
import { CourseModule } from './module/course/course.module';
import { ProfessorModule } from './module/professor/professor.module';
import { ScheduleConfigModule } from './module/schedule-config/schedule-config.module';
import { TimeSlotModule } from './module/time-slot/time-slot.module';
import { PrismaModule } from './prisma/prisma.module';
import { GaModule } from './ga/ga.module';
import { GeneratedScheduleModule } from './module/generated-schedule/generated-schedule.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CareerModule,
    ClassroomModule,
    CourseModule,
    ProfessorModule,
    ScheduleConfigModule,
    TimeSlotModule,
    ConfigClassroomModule,
    ConfigCourseModule,
    ConfigProfessorModule,
    ConfigCourseProfessorModule,
    CourseCareerModule,
    GaModule,
    GeneratedScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
