import { fetchExternal } from "@/lib/external";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const sourceParam = url.searchParams.get('source');

    if (sourceParam && sourceParam !== 'products' && sourceParam !== 'news') {
        return Response.json(
            { source: sourceParam, external: [], error: `ไม่พบแหล่งข้อมูล "${sourceParam}" ที่ระบุในระบบ` },
            { status: 400 }
        );
    }

    const source = sourceParam === 'news' ? 'news' : 'products';
    try {
        const external = await fetchExternal(source);
        return Response.json({ source, external });
    } catch {
        // degrade gracefully ถ้า external API ล่ม
        return Response.json(
            { source, external: [], error: 'ไม่สามารถดึงข้อมูลจากระบบภายนอกได้ในขณะนี้' },
            { status: 500 }
        );
    }
}
