import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUserData,
  IUserRepository,
  User,
} from '../interfaces/user-repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prismaService.user.create({ data });
  }
}
