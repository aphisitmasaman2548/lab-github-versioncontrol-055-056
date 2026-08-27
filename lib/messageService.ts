import * as MessageModel from './messages';
import { NotFoundError, ValidationError, ForbiddenError } from './errors';
import { Prisma } from '@prisma/client';
import { messageSchema } from './schemas';
import { ZodError } from 'zod';
import { cleanRichText } from './sanitize';

export async function createMessage(raw: unknown, sessionUserId?: string) {
  let data;
  try {
    data = messageSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError(err.issues[0].message);
    throw err;
  }

  const safeText = cleanRichText(data.message);

  try {
    return await MessageModel.addMessage({ ...data, message: safeText, authorId: sessionUserId });
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

export async function editMessage(id: string, updates: any, sessionUserId?: string) {
  const message = await getMessageById(id);

  if (message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
  }

  let data;
  try {
    data = messageSchema.partial().parse(updates);
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError(err.issues[0].message);
    throw err;
  }

  if (data.message) {
    data.message = cleanRichText(data.message);
  }

  try {
    return await MessageModel.updateMessage(id, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}

export async function removeMessage(id: string, sessionUserId?: string) {
  const message = await getMessageById(id);
  if (message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์ลบข้อความนี้');
  }

  try {
    return await MessageModel.deleteMessage(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}
// เพิ่มมาใหม่ตาม Task 1.2
// Task 2.3: เพิ่ม comment เพื่อตั้งใจให้เกิด conflict
export async function listMessages(search?: string) {
  const all = await MessageModel.getMessages();
  if (!search) return all;
  return all.filter((m) =>
    m.name.includes(search) ||
    m.message.includes(search)
  );
}
