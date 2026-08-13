# Reflection & Discussion Report - Database Integration Lab (PostgreSQL + Prisma)

## 1. Task 3.2 — อภิปราย Hard Delete vs Soft Delete

### ข้อดีของ Soft Delete เมื่อเทียบกับ Hard Delete:
* **การกู้คืนข้อมูล (Data Recovery)**: หากผู้ใช้ลบข้อมูลโดยไม่ตั้งใจ สามารถกู้คืนกลับมาได้ง่ายเพียงแค่เปลี่ยนสถานะ `isDeleted` กลับเป็น `false` ต่างจาก Hard Delete ที่ลบแถวออกจาก Database จริงจนกู้ไม่ได้
* **ความสมบูรณ์ของประวัติและ Audit Log**: รักษาความสัมพันธ์ของข้อมูล (Foreign Keys/Referential Integrity) และเก็บบันทึกประวัติเพื่อการตรวจสอบย้อนหลังทางธุรกิจได้

### ข้อเสียและความซับซ้อนที่เพิ่มขึ้น:
* **ความซับซ้อนใน Query Logic**: ทุกๆ การดึงข้อมูล (GET all / listMessages) จะต้องเพิ่มเงื่อนไขในการกรองเสมอ เช่น `where: { isDeleted: false }` ทำให้โค้ดซับซ้อนขึ้น
* **สิ้นเปลืองพื้นที่จัดเก็บ (Storage Capacity)**: ข้อมูลที่ถูกลบไปแล้วยังคงถูกเก็บอยู่ในระบบ ทำให้ขนาดฐานข้อมูลโตขึ้นเรื่อยๆ
* **ประเด็นเรื่องความเป็นส่วนตัว (GDPR / Privacy)**: กรณีผู้ใช้ร้องขอให้ลบข้อมูลส่วนบุคคลอย่างถาวร Soft Delete อาจไม่เพียงพอ ต้องมีกระบวนการ purging ข้อมูลจริงตามช่วงเวลา

---

## 2. Task W.5 — Layer Mapping

| ชั้น (Layer) | ไฟล์ในโปรเจกต์ | หน้าที่ (เขียนเอง) |
| :--- | :--- | :--- |
| **Controller** | `app/api/favorites/route.ts`<br>`app/api/favorites/[id]/route.ts` | รับ HTTP Request, ดึง Query/Body/Params, เรียก Service Layer และตอบกลับ HTTP JSON Response พร้อม Status Code |
| **Service** | `lib/favoriteService.ts` | ตรวจสอบความถูกต้องของข้อมูล (Validation), จัดการ Business Logic, ดักจับ Error Codes จาก Prisma (`P2002`, `P2025`) แปลงเป็น Custom App Errors |
| **Model (Prisma)** | `lib/favorites.ts` | ทำหน้าที่ส่งคำสั่ง Query (CRUD) ติดต่อกับฐานข้อมูล PostgreSQL ผ่าน Prisma Client (`prisma.favorite.findMany`, `create`, `update`, `delete`) |
| **Schema** | `prisma/schema.prisma` | กำหนดโครงสร้างตาราง `Favorite`, ชนิดข้อมูลของแต่ละ field (`id`, `title`, `url`, `category`, `createdAt`), และกำหนด Constraints (`@id @default(cuid())`, `@unique`) |

---

## 3. Task W.6 — Workshop Reflection

### ข้อ 1: อธิบาย Resource ที่เลือกออกแบบ (Favorites / Bookmarks System)
เลือกออกแบบระบบ **Favorites / Bookmarks** ซึ่งประกอบด้วยฟิลด์ `id` (cuid), `title` (String), `url` (String @unique), `category` (String) และ `createdAt` (DateTime @default(now())):
- **การเลือกชนิดข้อมูลและ Constraint**: เลือกให้ `url` เป็น `@unique` เพราะในทางปฏิบัติ รายการโปรดไม่ควรบันทึก URL เดิมซ้ำกันในระบบ และเลือกใช้ `@default(cuid())` สำหรับ `id` เพื่อสร้างรหัสเฉพาะที่ปลอดภัยและเหมาะกับระบบฐานข้อมูล

### ข้อ 2: การตัดสินใจในงานออกแบบ (Design Decisions)
- **การจัดการ Database Errors**: เลือกจัดการ error code `P2002` (กรณี URL ซ้ำ) โดยแปลงเป็น `ValidationError` ตอบ Status Code 400 พร้อมข้อความ `'URL นี้ถูกใช้ไปแล้วในระบบรายการโปรด'` และจัดการ `P2025` (กรณีไม่พบ ID ที่ลบ/แก้ไข) ตอบ Status Code 404 เพื่อให้ผู้ใช้ได้รับข้อความสื่อความหมายชัดเจน และไม่ปล่อยให้ Server ตอบ 500
- **การแยก Layer Architecture**: การแยก Model (`lib/favorites.ts`) ออกจาก Service (`lib/favoriteService.ts`) ช่วยให้ Controller สั้น กระชับ และเมื่อเปลี่ยนจากการจัดการ Array มาเป็น Prisma SQL ก็แก้ไขโค้ดเพียงเฉพาะในส่วนของ Model เท่านั้น

### ข้อ 3: เทียบกับตอนใช้ Array ใน Week 8
- **ความคงอยู่ของข้อมูล (Data Persistence)**: การใช้ฐานข้อมูลจริง (PostgreSQL + Prisma) ทำให้ข้อมูลถูกบันทึกอยู่อย่างถาวร แม้จะทำการ Restart dev server หรือ Re-deploy แอปพลิเคชัน ข้อมูลก็ยังคงอยู่ครบถ้วน ต่างจาก In-memory Array ใน Week 8 ที่ข้อมูลทั้งหมดจะหายไปทันทีเมื่อเซิร์ฟเวอร์รีสตาร์ท
- **ประสิทธิภาพและการจัดการข้อมูล**: ฐานข้อมูลจริงรองรับ Unique Constraint Validation, Ordering (`orderBy`), Filtering, และ Indexing ได้ในระดับ Database Engine ทำให้ระบบมีความน่าเชื่อถือสูงกว่าการใช้ Javascript Array
