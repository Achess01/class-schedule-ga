import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { PrismaUserRepository } from './repositories/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
