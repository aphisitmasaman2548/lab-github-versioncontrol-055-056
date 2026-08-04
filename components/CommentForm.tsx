'use client';

import { useState } from 'react';

interface CommentFormProps {
  itemId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ itemId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Task W.2: Client-side Validation
  const isValid = content.trim().length >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError('ความคิดเห็นต้องมีความยาวอย่างน้อย 5 ตัวอักษร');
      return;
    }

    setError('');
    setStatus('sending');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการแสดงความคิดเห็น');
        setStatus('error');
        return;
      }

      setStatus('success');
      setContent('');
      onCommentAdded();
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
      <h4 className="font-bold text-sm text-gray-700">💬 เพิ่มความคิดเห็น (ต้อง Login ก่อน)</h4>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="เขียนความคิดเห็นเกี่ยวกับรายการนี้ (อย่างน้อย 5 ตัวอักษร)..."
          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:border-blue-500"
          rows={3}
        />
        <p className="text-xs text-gray-400 mt-1">จำนวนตัวอักษร: {content.trim().length} / 5 ตัวอักษรขั้นต่ำ</p>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {status === 'success' && <p className="text-xs text-green-600 font-medium">ส่งความคิดเห็นเรียบร้อยแล้ว!</p>}

      <button
        type="submit"
        disabled={!isValid || status === 'sending'}
        className={`px-4 py-2 text-xs font-semibold rounded-md text-white transition-all ${
          isValid && status !== 'sending'
            ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {status === 'sending' ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
      </button>
    </form>
  );
}
