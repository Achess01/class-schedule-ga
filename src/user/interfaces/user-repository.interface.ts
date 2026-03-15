export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
