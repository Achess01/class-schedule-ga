import * as dotenv from 'dotenv';

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET ?? 'default-dev-secret';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? '1h';
export const STUDENT_SCHEDULES_URL = process.env.STUDENT_SCHEDULES_URL ?? '';
