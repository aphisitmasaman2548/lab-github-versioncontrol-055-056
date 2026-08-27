import { addComment, getCommentsByItemId, getAllComments } from '@/lib/comments';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (itemId) {
    return Response.json({ comments: getCommentsByItemId(itemId) });
  }

  return Response.json({ comments: getAllComments() });
}

export async function POST(request: Request) {
  // Task W.3: Authentication Check ฝั่ง Server (ตรวจ Cookie)
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return Response.json(
      { error: 'กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น (Unauthorized)' },
      { status: 401 }
    );
  }

  const body = await request.json();

  // Task W.2: Server-side Validation (อย่างน้อย field ละ 1 เงื่อนไข)
  if (!body.itemId || typeof body.itemId !== 'string') {
    return Response.json({ error: 'ไม่พบรหัสสินค้า/โพสต์' }, { status: 400 });
  }

  if (!body.content || typeof body.content !== 'string' || body.content.trim().length < 5) {
    return Response.json(
      { error: 'ความคิดเห็นต้องมีความยาวอย่างน้อย 5 ตัวอักษร' },
      { status: 400 }
    );
  }

  // สมมติ author จาก Session ID
  const author = `User #${session.value}`;

  const saved = addComment({
    itemId: body.itemId.trim(),
    content: body.content.trim(),
    author,
  });

  return Response.json({ ok: true, item: saved }, { status: 201 });
}
