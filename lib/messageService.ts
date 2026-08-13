import * as MessageModel from './messages';
import { NotFoundError, ValidationError } from './errors';
import { Prisma } from '@prisma/client';

export async function createMessage(data: { name: string; email: string; message: string }) {
  if (!data.name || !data.email || !data.message) {
    throw new ValidationError('ข้อมูลไม่ครบ');
  }
  try {
    return await MessageModel.addMessage(data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('อีเมลนี้ถูกใช้แล้ว');
    }
    throw err;
  }
}

export async function listMessages() {
  return await MessageModel.getMessages();
}

export async function getMessageById(id: string) {
  const item = await MessageModel.getMessageById(id);
  if (!item) {
    throw new NotFoundError('ไม่พบข้อความนี้');
  }
  return item;
}

export async function editMessage(id: string, updates: Partial<{ message: string; name?: string; email?: string }>) {
  if (updates.message !== undefined && updates.message.trim() === '') {
    throw new ValidationError('ข้อความห้ามเป็นค่าว่าง');
  }
  try {
    return await MessageModel.updateMessage(id, updates);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null; // คืนค่า null เพื่อให้ Controller ตอบ Status 404 เหมือนเดิม
    }
    throw err;
  }
}

export async function removeMessage(id: string) {
  try {
    return await MessageModel.deleteMessage(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}
