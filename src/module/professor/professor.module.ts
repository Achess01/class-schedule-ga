import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProfessorController } from './professor.controller';
import { ProfessorService } from './professor.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessorController],
  providers: [ProfessorService],
})
export class ProfessorModule {}
