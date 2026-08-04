import { getMessages } from '@/lib/messages';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const messages = getMessages(); // Server Component — เรียก Model ตรงได้
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard (ต้อง Login ก่อน)</h1>
      <p className="text-lg">
        จำนวนข้อความที่ได้รับ: <span className="font-bold text-blue-600">{messages.length}</span>
      </p>
    </main>
  );
}
