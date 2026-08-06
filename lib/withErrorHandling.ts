type Handler = (req: Request, ctx: any) => Promise<Response>;

export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error('API Error:', err);
      const status = (err as any).status ?? 500;
      const message = (err as any).status ? (err as Error).message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      return Response.json(
        { error: message },
        { status }
      );
    }
  };
}
