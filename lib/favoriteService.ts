import * as FavoriteModel from './favorites';
import { NotFoundError, ValidationError } from './errors';
import { Prisma } from '@prisma/client';

export async function listFavorites(search?: string, category?: string) {
  return await FavoriteModel.getFavorites(search, category);
}

export async function getFavoriteById(id: string) {
  const item = await FavoriteModel.getFavoriteById(id);
  if (!item) {
    throw new NotFoundError('ไม่พบรายการโปรดนี้');
  }
  return item;
}

export async function createFavorite(data: { title: string; url: string; category?: string }) {
  if (!data.title || data.title.trim() === '') {
    throw new ValidationError('หัวข้อรายการโปรดห้ามเป็นค่าว่าง');
  }
  if (!data.url || data.url.trim() === '') {
    throw new ValidationError('URL ห้ามเป็นค่าว่าง');
  }

  try {
    return await FavoriteModel.addFavorite({
      title: data.title.trim(),
      url: data.url.trim(),
      category: data.category?.trim() || 'General',
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('URL นี้ถูกใช้ไปแล้วในระบบรายการโปรด');
    }
    throw err;
  }
}

export async function editFavorite(
  id: string,
  updates: Partial<{ title: string; url: string; category: string }>
) {
  if (updates.title !== undefined && updates.title.trim() === '') {
    throw new ValidationError('หัวข้อรายการโปรดห้ามเป็นค่าว่าง');
  }
  if (updates.url !== undefined && updates.url.trim() === '') {
    throw new ValidationError('URL ห้ามเป็นค่าว่าง');
  }

  try {
    return await FavoriteModel.updateFavorite(id, updates);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('ไม่พบรายการโปรดนี้');
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('URL นี้ถูกใช้ไปแล้วในระบบรายการโปรด');
    }
    throw err;
  }
}

export async function removeFavorite(id: string) {
  try {
    return await FavoriteModel.deleteFavorite(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('ไม่พบรายการโปรดนี้');
    }
    throw err;
  }
}
