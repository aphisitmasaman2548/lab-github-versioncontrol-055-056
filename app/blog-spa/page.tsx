'use client';

import { useState, useEffect } from 'react';
import type { ExternalItem } from '@/lib/external';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BlogSpaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // อ่านค่าเริ่มต้นจาก URL (Task W.3 & W.4: อ่านค่า source จาก URL ตรงๆ)
    const initialSource = searchParams.get('source') || 'products';
    const initialQuery = searchParams.get('q') || '';
    const initialDetailId = searchParams.get('detail') || null;

    const [items, setItems] = useState<ExternalItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [source, setSource] = useState<string>(initialSource);
    const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
    const [selectedId, setSelectedId] = useState<string | null>(initialDetailId);

    // Sync state ขึ้น URL (Task W.3)
    function syncURL(s: string, q: string, d: string | null) {
        const params = new URLSearchParams();
        if (s) params.set('source', s);
        if (q.trim()) params.set('q', q.trim());
        if (d) params.set('detail', d);
        router.replace(`/blog-spa?${params.toString()}`);
    }

    // ดึงข้อมูลเมื่อ source เปลี่ยน (Task W.4 Error handling)
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch(`/api/aggregate?source=${source}`)
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok || data.error) {
                    throw new Error(data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
                }
                return data;
            })
            .then((data: { external: ExternalItem[] }) => {
                setItems(data.external || []);
                setIsLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setItems([]);
                setIsLoading(false);
            });
    }, [source]);

    function selectSource(s: string) {
        setSource(s);
        syncURL(s, searchTerm, selectedId);
    }

    function handleSearch(q: string) {
        setSearchTerm(q);
        syncURL(source, q, selectedId);
    }

    function openDetail(id: string) {
        setSelectedId(id);
        syncURL(source, searchTerm, id);
    }

    function closeDetail() {
        setSelectedId(null);
        syncURL(source, searchTerm, null);
    }

    // Task W.1: Client-side Filter
    const filteredItems = items.filter((item) => {
        const q = searchTerm.toLowerCase();
        return (
            item.title.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q))
        );
    });

    const selectedItem = items.find((item) => item.id === selectedId) || null;

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">
                🧩 Blog Aggregator (SPA)
            </h1>

            {/* Task W.1: Search Box & Source Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => selectSource('products')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            source === 'products'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => selectSource('news')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            source === 'news'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        News
                    </button>
                </div>

                {/* Input ค้นหา */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="ค้นหา..."
                    className="p-2 border rounded-lg w-full sm:w-64 text-sm focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Task W.4: Loading / Error / Empty States */}
            {isLoading ? (
                <p className="text-gray-400">กําลังโหลด...</p>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <p className="font-semibold">เกิดข้อผิดพลาด: {error}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <p className="text-gray-500 py-4">ไม่พบข้อมูลที่ค้นหา</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => openDetail(item.id)}
                            className="p-4 bg-white rounded-lg border hover:border-blue-500 cursor-pointer transition-all"
                        >
                            <h2 className="font-bold text-blue-800">{item.title}</h2>
                            <p className="text-gray-500 text-sm">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Task W.2: Modal รายละเอียด */}
            {selectedId && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
                    onClick={closeDetail}
                >
                    <div
                        className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                            รายละเอียดเพิ่มเติม
                        </h3>
                        {selectedItem ? (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ID: {selectedItem.id}</p>
                                <h4 className="font-bold text-gray-800 mb-2">{selectedItem.title}</h4>
                                <p className="text-sm text-gray-600 mb-4">{selectedItem.subtitle}</p>
                                {selectedItem.image && (
                                    <img
                                        src={selectedItem.image}
                                        alt={selectedItem.title}
                                        className="h-32 object-contain mx-auto mb-4"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm mb-4">ไม่พบรายละเอียดของรายการนี้</p>
                        )}
                        <button
                            onClick={closeDetail}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Task W.5: MVC Self-Mapping Table */}
            <div className="mt-12 pt-6 border-t">
                <h2 className="text-lg font-bold text-blue-900 mb-4">Task W.5 — MVC Self-Mapping</h2>
                <table className="w-full text-sm text-left border">
                    <thead>
                        <tr className="bg-gray-100 border-b text-black">
                            <th className="p-2 border">MVC Layer</th>
                            <th className="p-2 border">ไฟล์ในโปรเจกต์</th>
                            <th className="p-2 border">หน้าที่</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2 border font-semibold">Model</td>
                            <td className="p-2 border">lib/external.ts, app/api/aggregate/route.ts</td>
                            <td className="p-2 border">จัดการและรวมข้อมูลจาก External APIs (FakeStore, Hacker News)</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 border font-semibold">View</td>
                            <td className="p-2 border">app/blog-spa/page.tsx</td>
                            <td className="p-2 border">แสดงผล UI (Buttons, Search Box, List Grid, Loading/Empty/Error States, Modal)</td>
                        </tr>
                        <tr>
                            <td className="p-2 border font-semibold">Controller</td>
                            <td className="p-2 border">app/blog-spa/page.tsx</td>
                            <td className="p-2 border">ควบคุม State, เหตุการณ์ (onClick, onChange) และการ Sync State กับ URL (searchParams)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}