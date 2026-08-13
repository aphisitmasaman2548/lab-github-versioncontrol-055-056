import { createFavorite, listFavorites } from '@/lib/favoriteService';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;

  const favorites = await listFavorites(search, category);
  return Response.json({ favorites });
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  const saved = await createFavorite(body);
  return Response.json({ ok: true, item: saved }, { status: 201 });
});
