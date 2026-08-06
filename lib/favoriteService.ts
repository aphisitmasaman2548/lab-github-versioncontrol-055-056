import * as FavoriteModel from './favorites';
import { NotFoundError, ValidationError } from './errors';

export function listFavorites(search?: string, category?: string) {
  let all = FavoriteModel.getFavorites();
  if (search) {
    const s = search.toLowerCase();
    all = all.filter(
      (f) => f.title.toLowerCase().includes(s) || f.url.toLowerCase().includes(s)
    );
  }
  if (category) {
    all = all.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }
  return all;
}

export function getFavoriteById(id: string) {
  const item = FavoriteModel.getFavorites().find((f) => f.id === id);
  if (!item) {
    throw new NotFoundError('ไม่พบรายการโปรดนี้');
  }
  return item;
}

export function createFavorite(data: { title: string; url: string; category?: string }) {
  if (!data.title || data.title.trim() === '') {
    throw new ValidationError('หัวข้อรายการโปรดห้ามเป็นค่าว่าง');
  }
  if (!data.url || data.url.trim() === '') {
    throw new ValidationError('URL ห้ามเป็นค่าว่าง');
  }

  return FavoriteModel.addFavorite({
    title: data.title.trim(),
    url: data.url.trim(),
    category: data.category?.trim() || 'General',
  });
}

export function editFavorite(
  id: string,
  updates: Partial<{ title: string; url: string; category: string }>
) {
  if (updates.title !== undefined && updates.title.trim() === '') {
    throw new ValidationError('หัวข้อรายการโปรดห้ามเป็นค่าว่าง');
  }
  if (updates.url !== undefined && updates.url.trim() === '') {
    throw new ValidationError('URL ห้ามเป็นค่าว่าง');
  }

  const updated = FavoriteModel.updateFavorite(id, updates);
  if (!updated) {
    throw new NotFoundError('ไม่พบรายการโปรดนี้');
  }
  return updated;
}

export function removeFavorite(id: string) {
  const deleted = FavoriteModel.deleteFavorite(id);
  if (!deleted) {
    throw new NotFoundError('ไม่พบรายการโปรดนี้');
  }
  return deleted;
}
