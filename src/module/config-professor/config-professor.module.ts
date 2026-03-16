import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigProfessorController } from './config-professor.controller';
import { ConfigProfessorService } from './config-professor.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigProfessorController],
  providers: [ConfigProfessorService],
})
export class ConfigProfessorModule {}
