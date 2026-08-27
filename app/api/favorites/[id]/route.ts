import { editFavorite, getFavoriteById, removeFavorite } from '@/lib/favoriteService';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const GET = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const favorite = await getFavoriteById(id);
  return Response.json({ favorite });
});

export const PATCH = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const updates = await request.json();
  const updated = await editFavorite(id, updates);
  return Response.json({ ok: true, item: updated });
});

export const DELETE = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await removeFavorite(id);
  return Response.json({ ok: true }, { status: 200 });
});
