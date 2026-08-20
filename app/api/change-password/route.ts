import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { z, ZodError } from 'zod';
import { cookies } from 'next/headers';
import { ValidationError, ForbiddenError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/withErrorHandling';

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'),
});

export const POST = withErrorHandling(async (request: Request) => {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('session')?.value;

  if (!sessionUserId) {
    throw new ForbiddenError('ต้องเข้าสู่ระบบก่อน');
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
  if (!user) {
    throw new ForbiddenError('ไม่พบข้อมูลผู้ใช้');
  }

  const raw = await request.json();
  let data;
  try {
    data = changePasswordSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError(err.issues[0].message);
    throw err;
  }

  const isValid = await bcrypt.compare(data.oldPassword, user.password);
  if (!isValid) {
    throw new ValidationError('รหัสผ่านเดิมไม่ถูกต้อง');
  }

  const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return Response.json({ ok: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
});
