export interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

const globalForFavorites = globalThis as unknown as {
  favorites: FavoriteItem[];
};

if (!globalForFavorites.favorites) {
  globalForFavorites.favorites = [
    {
      id: 'fav-1',
      title: 'Next.js Documentation',
      url: 'https://nextjs.org/docs',
      category: 'Documentation',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fav-2',
      title: 'TypeScript Handbook',
      url: 'https://www.typescriptlang.org/docs/',
      category: 'Tutorial',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getFavorites() {
  return globalForFavorites.favorites;
}

export function addFavorite(data: Omit<FavoriteItem, 'id' | 'createdAt'>) {
  const item: FavoriteItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  globalForFavorites.favorites.push(item);
  return item;
}

export function updateFavorite(id: string, updates: Partial<FavoriteItem>) {
  const index = globalForFavorites.favorites.findIndex((f) => f.id === id);
  if (index === -1) return null;
  globalForFavorites.favorites[index] = { ...globalForFavorites.favorites[index], ...updates };
  return globalForFavorites.favorites[index];
}

export function deleteFavorite(id: string) {
  const index = globalForFavorites.favorites.findIndex((f) => f.id === id);
  if (index === -1) return false;
  globalForFavorites.favorites.splice(index, 1);
  return true;
}
