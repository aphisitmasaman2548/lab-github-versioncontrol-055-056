import LikeButton from '../../components/LikeButton';

// ✨ TypeScript: กําหนด interface ให้ข้อมูลจาก API
interface User {
    id: number;
    name: string;
    email: string;
    company: {
        name: string;
    };
}
// async Server Component — fetch ข้อมูลโดยตรง ไม่ต้องใช้useEffect
export default async function UsersPage() {
    const res = await fetch(
        'https://jsonplaceholder.typicode.com/users',
        { cache: 'no-store' }
    );
    const users: User[] = await res.json(); // ← บอก TypeScript ว่าได้User[]
    return (
        <main className="p-12">
            <h1 className="text-3xl font-bold text-blue-900 mb-6">
                👥 Users ({users.length} คน)
            </h1>
            <div className="mb-6">
                <LikeButton /> {/* Client Component ใน Server Component */}
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-2xl">
                {users.map((user: User) => (
                    <div key={user.id}
                        className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="font-bold text-blue-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-xs">{user.company.name}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}