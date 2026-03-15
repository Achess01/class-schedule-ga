import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { DATABASE_URL } from '../constants';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = `${DATABASE_URL}`;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
