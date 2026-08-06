# Reflection & Discussion Report - Server-side Development Lab

## 1. Task 3.2 — อภิปราย Hard Delete vs Soft Delete

### ข้อดีของ Soft Delete เมื่อเทียบกับ Hard Delete:
* **การกู้คืนข้อมูล (Data Recovery)**: หากผู้ใช้ลบข้อมูลโดยไม่ตั้งใจ สามารถกู้คืนกลับมาได้ง่ายเพียงแค่เปลี่ยนสถานะ `isDeleted` กลับเป็น `false` ต่างจาก Hard Delete ที่ลบแถวออกจาก Database/Array จริงจนกู้ไม่ได้
* **ความสมบูรณ์ของประวัติและ Audit Log**: รักษาความสัมพันธ์ของข้อมูล (Foreign Keys/Referential Integrity) และเก็บบันทึกประวัติเพื่อการตรวจสอบย้อนหลังทางธุรกิจได้

### ข้อเสียและความซับซ้อนที่เพิ่มขึ้น:
* **ความซับซ้อนใน Query Logic**: ทุกๆ การดึงข้อมูล (GET all / listMessages) จะต้องเพิ่มเงื่อนไขในการกรองเสมอ เช่น `.filter(m => !m.isDeleted)` ทำให้โค้ดซับซ้อนขึ้น
* **สิ้นเปลืองพื้นที่จัดเก็บ (Storage Capacity)**: ข้อมูลที่ถูกลบไปแล้วยังคงถูกเก็บอยู่ในระบบ ทำให้ขนาดฐานข้อมูลโตขึ้นเรื่อยๆ
* **ประเด็นเรื่องความเป็นส่วนตัว (GDPR / Privacy)**: กรณีผู้ใช้ร้องขอให้ลบข้อมูลส่วนบุคคลอย่างถาวร Soft Delete อาจไม่เพียงพอ ต้องมีกระบวนการ purging ข้อมูลจริงตามช่วงเวลา

---

## 2. Task W.5 — Workshop Reflection

### ข้อ 1: อธิบาย Resource ที่เลือกออกแบบ (Favorites System)
ระบบที่เลือกออกแบบคือ **Favorites / Bookmarks Resource** ซึ่งประกอบด้วยฟิลด์ `id` (รหัสอ้างอิง), `title` (ชื่อรายการ), `url` (ลิงก์), `category` (หมวดหมู่) และ `createdAt` (วันที่สร้าง) สำหรับการทำงาน CRUD:
- **Create (POST)**: เพิ่มรายการโปรดใหม่พร้อมตรวจสอบไม่ให้ชื่อและ URL เป็นค่าว่าง
- **Read (GET)**: อ่านรายการโปรดทั้งหมด รองรับค้นหา (`?search=`) และกรองตามหมวดหมู่ (`?category=`) รวมถึงอ่านเฉพาะรายการตาม ID (`/api/favorites/[id]`)
- **Update (PATCH)**: แก้ไขข้อมูลชื่อ URL หรือหมวดหมู่เฉพาะฟิลด์ที่ส่งมา
- **Delete (DELETE)**: ลบรายการโปรดออกจากระบบตาม ID

### ข้อ 2: การตัดสินใจในการออกแบบ (Design Decisions)
- **การเลือก PATCH แทน PUT**: เลือกใช้ `PATCH` สำหรับการแก้ไขข้อมูล เพราะยืดหยุ่นกว่า ผู้ใช้สามารถเลือกส่งเฉพาะฟิลด์ที่ต้องการอัปเดตมาได้ โดยไม่ต้องส่งโครงสร้างข้อมูลทั้งหมดมาเหมือน `PUT`
- **การตัดสินใจแยก Service Layer**: การมี `favoriteService.ts` มีประโยชน์อย่างยิ่งในการแยก Business Logic และ Validation ออกจาก Controller ทำให้ไฟล์ `route.ts` สั้น กะทัดรัด และนำ Logic ไปใช้ซ้ำหรือเขียน Unit Test ได้ง่ายขึ้น

### ข้อ 3: การเตรียมพร้อมสำหรับการเปลี่ยนสู่ฐานข้อมูลจริง (Week 9 Prep)
เมื่อเปลี่ยนโครงสร้างข้อมูลจาก In-memory Array เป็นฐานข้อมูลจริง (เช่น PostgreSQL/Prisma/MongoDB):
- **ไฟล์ที่ต้องแก้ไข**: มีเพียงไฟล์ในชั้น **Model** (`lib/favorites.ts`) เพียงไฟล์เดียว เพื่อเปลี่ยนคำสั่ง CRUD จากการจัดการกับ JavaScript Array เป็นการ Query ฐานข้อมูลจริง
- **ไฟล์ที่ไม่ต้องแก้ไขเลย**: ชั้น **Controller** (`app/api/favorites/route.ts`, `app/api/favorites/[id]/route.ts`) และชั้น **Service** (`lib/favoriteService.ts`) รวมถึง `withErrorHandling.ts` จะไม่มีการเปลี่ยนแปลงใดๆ เนื่องจากมี Interface/Abstraction คั่นกลางอย่างชัดเจนตามหลัก 3-Layer Architecture
