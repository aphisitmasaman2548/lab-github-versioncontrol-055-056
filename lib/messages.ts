export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// ใช้ globalThis เพื่อให้ใน-memory array แชร์ตัวเดียวกันข้าม bundle chunks ใน Next.js
const globalForMessages = globalThis as unknown as {
  messages: ContactMessage[];
};

if (!globalForMessages.messages) {
  globalForMessages.messages = [];
}

export function addMessage(data: Omit<ContactMessage, 'id' | 'createdAt'>) {
  const item: ContactMessage = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  globalForMessages.messages.push(item);
  return item;
}

export function getMessages() {
  return globalForMessages.messages;
}
