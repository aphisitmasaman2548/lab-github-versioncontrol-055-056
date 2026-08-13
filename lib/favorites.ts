import { prisma } from './prisma';

export async function getFavorites(search?: string, category?: string) {
  const where: any = {};

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { url: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.favorite.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFavoriteById(id: string) {
  return prisma.favorite.findUnique({
    where: { id },
  });
}

export async function addFavorite(data: { title: string; url: string; category: string }) {
  return prisma.favorite.create({
    data,
  });
}

export async function updateFavorite(id: string, updates: Partial<{ title: string; url: string; category: string }>) {
  return prisma.favorite.update({
    where: { id },
    data: updates,
  });
}

export async function deleteFavorite(id: string) {
  return prisma.favorite.delete({
    where: { id },
  });
}
