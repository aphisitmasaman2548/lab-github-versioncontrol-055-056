'use client';
import { useState } from 'react';

export default function WarmupPage() {
  const [text, setText] = useState('aphisit');

  return (
    <div className="p-8">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded"
        placeholder="ลองพิมพ์ข้อความ..."
      />
      <p className="mt-2">พิมพ์ว่า: {text}</p>
    </div>
  );
}
