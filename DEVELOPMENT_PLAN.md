# 📋 แผนงานพัฒนาโปรแกรมบริหารจัดการโรงแรม (Hotel Management System)

**สำหรับโรงแรมขนาด 20 ห้อง**

### 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend & Backend:** Next.js (App Router)
* **Database:** PostgreSQL
* **Database Tool (ORM):** Prisma
* **Styling & UI:** Tailwind CSS ร่วมกับ shadcn/ui
* **Infrastructure & Deployment:** Docker & Docker Compose

---

### 📅 แผนการแบ่งระยะเวลาพัฒนา (Development Phases)

#### Phase 1: Setup & Infrastructure (เตรียมโครงสร้างโปรเจกต์)
* สร้าง Git Repository สำหรับจัดการ Source Code
* เขียนไฟล์ `docker-compose.yml` เพื่อจำลอง Database (PostgreSQL) และ Environment สำหรับการพัฒนา
* ติดตั้ง (Initialize) โปรเจกต์ Next.js และตั้งค่า Tailwind CSS / UI Component
* ตั้งค่าระบบ Authentication พื้นฐาน (NextAuth.js หรือ Auth.js) สำหรับระบบล็อกอินของพนักงาน

#### Phase 2: Database Design & API Core (ออกแบบฐานข้อมูลและระบบหลังบ้าน)
* ออกแบบ ER Diagram และสร้าง Schema สำหรับ 5 ตารางหลัก: `Users` (พนักงาน), `Rooms` (ห้องพัก), `Guests` (ลูกค้า), `Reservations` (การจอง), `Payments` (การชำระเงิน)
* เชื่อมต่อ Next.js กับ PostgreSQL ผ่าน ORM
* เขียน API / Server Actions สำหรับฟังก์ชัน CRUD (Create, Read, Update, Delete) ของข้อมูลห้องพักและลูกค้า

#### Phase 3: Frontend Development - Core Features (พัฒนาระบบการจองและหน้าจอหลัก)
* **Layout & Navigation:** สร้างเมนูนำทางด้านข้าง (Sidebar) สำหรับสลับไปหน้าต่างๆ
* **Booking Calendar (หน้าปฏิทินการจอง):** นำ Library ปฏิทินมาเชื่อมต่อกับข้อมูลการจองจริง เพื่อดูสถานะห้องทั้ง 20 ห้อง
* **Check-in / Check-out Flow:** สร้างฟอร์มสำหรับบันทึกการเข้าพัก, รับมัดจำ, และคืนห้อง
* **Room Management:** หน้าจอสำหรับดูและอัปเดตสถานะห้อง (ว่าง, มีแขก, กำลังทำความสะอาด)

#### Phase 4: Billing, Reports & Polish (ระบบการเงินและรายงานผล)
* **Payment & Invoice:** สร้างฟังก์ชันคำนวณยอดเงินรวม (ค่าห้อง + ค่าใช้จ่ายเพิ่มเติม) และหน้าจอสำหรับพิมพ์ใบเสร็จ
* **Dashboard (หน้าแรก):** แสดงสถิติเบื้องต้น เช่น วันนี้มีแขกเข้าพักกี่ห้อง, รายได้รายวัน, อัตราการเข้าพัก (Occupancy Rate)
* ตรวจสอบบั๊ก (Bug fixing) และปรับปรุง UI/UX ให้ทำงานได้ลื่นไหล ไม่ซับซ้อน

#### Phase 5: Testing & Deployment (ทดสอบและนำขึ้นเซิร์ฟเวอร์จริง)
* สร้าง `Dockerfile` สำหรับ Build ตัวโปรเจกต์ Next.js ให้พร้อมใช้งานบน Production
* ทดสอบระบบร่วมกัน (UAT)
* นำระบบขึ้น Deploy บน Server จริง (VPS) ผ่าน Docker Container

---

### 📌 ข้อมูลที่รอการยืนยันจากธุรกิจ

1. **ประเภทห้องพัก (Room Types):** ทั้ง 20 ห้อง มีกี่ประเภท ราคาต่างกันอย่างไร?
2. **นโยบายการจอง:** มีการรับมัดจำล่วงหน้าไหม? ถ้าลูกค้ายกเลิก ริบมัดจำอย่างไร?
3. **การกำหนดสิทธิ์ (Roles):** พนักงานหน้าเคาน์เตอร์ กับ เจ้าของโรงแรม จะเห็นหน้าจอและมีสิทธิ์ลบ/แก้ไขข้อมูลต่างกันหรือไม่?
