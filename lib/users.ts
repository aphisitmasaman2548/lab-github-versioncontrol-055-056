import bcrypt from 'bcrypt';
import { prisma } from './prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, plainPassword: string) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({ data: { email, password: hashedPassword } });
}
