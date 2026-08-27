'use client';
import { useState } from 'react';

export default function PriceCalculator() {
  const [quantity, setQuantity] = useState(1);
  const pricePerItem = 150;
  const total = quantity * pricePerItem; 

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Live Price Calculator (Derived State)</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">จำนวนสินค้า:</label>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border p-2 rounded w-32"
          />
        </div>
        <p className="text-lg font-semibold">ราคารวม: {total.toLocaleString()} บาท</p>
      </div>
    </div>
  );
}
