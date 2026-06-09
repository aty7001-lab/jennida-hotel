# Jennida Hotel — ระบบบริหารจัดการโรงแรม

ระบบบริหารจัดการโรงแรมแบบครบวงจร รองรับหลายสาขา พัฒนาด้วย Next.js + PostgreSQL + Docker

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 16 (App Router, Server Actions) |
| Database | PostgreSQL 15 |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | NextAuth v4 (JWT) |
| Styling | Tailwind CSS v4 |
| Container | Docker + Docker Compose |

---

## Features

- **Dashboard** — สรุปห้องว่าง, แขก Check-in, รายได้วันนี้
- **Booking Calendar** — ปฏิทินแสดงการจองรายเดือน (เฉพาะห้องที่มีข้อมูล)
- **New Booking** — สร้างการจองพร้อม auto-คำนวณราคาจากห้องและจำนวนคืน
- **Rooms** — จัดการห้องพัก (CRUD), อัปเดตสถานะ (ว่าง/มีแขก/ทำความสะอาด/ซ่อมบำรุง)
- **Guests** — ข้อมูลลูกค้าทั้งหมด
- **Payments** — บันทึกการชำระเงิน (เงินสด/โอน/บัตร)
- **Reports** — Daily Summary, Revenue (ADR/RevPAR), Occupancy Rate
- **OTA Webhook** — รับข้อมูลจาก Agoda / Booking.com
- **Multi-branch** — รองรับหลายสาขา, Admin เห็นทุกสาขา
- **i18n** — รองรับภาษาลาวและอังกฤษ

---

## ติดตั้งด้วย Docker Compose (แนะนำ)

### ความต้องการ
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### ขั้นตอน

```bash
# 1. Clone repo
git clone https://github.com/aty7001-lab/jennida-hotel.git
cd jennida-hotel

# 2. สร้างไฟล์ .env
cp .env.example .env
# แก้ NEXTAUTH_SECRET ให้เป็น random string ที่ปลอดภัย

# 3. Build และ Start
docker compose up --build -d

# 4. Migrate database
docker exec hotel_web npx prisma migrate deploy

# 5. Seed ข้อมูลตัวอย่าง
docker exec hotel_web node prisma/seed.js
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000**

### บัญชีเริ่มต้น

| Email | Password | Role |
|---|---|---|
| `admin@hotel.com` | `admin123` | Admin (ทุกสาขา) |
| `staff.bkk@hotel.com` | `staff123` | Staff (Bangkok) |

---

## ติดตั้งแบบ Local Development

### ความต้องการ
- Node.js 22+
- PostgreSQL 15+

```bash
# 1. Clone และติดตั้ง dependencies
git clone https://github.com/aty7001-lab/jennida-hotel.git
cd jennida-hotel
npm install

# 2. ตั้งค่า Environment
cp .env.example .env
# แก้ DATABASE_URL ให้ตรงกับ PostgreSQL ของคุณ

# 3. Migrate database
npx prisma migrate deploy

# 4. Seed ข้อมูล
node prisma/seed.js

# 5. Start dev server
npm run dev
```

เปิด **http://localhost:3000**

---

## โครงสร้าง Docker

```
docker-compose.yml
├── hotel_web      (Next.js)    → port 3000
└── hotel_postgres (PostgreSQL) → port 5432
                                  volume: hotel_pgdata
```

**Build ใหม่หลังแก้โค้ด:**
```bash
docker compose up --build -d
```

**ดู logs:**
```bash
docker logs hotel_web -f
docker logs hotel_postgres -f
```

**หยุด:**
```bash
docker compose down
```

**หยุด + ลบข้อมูลทั้งหมด:**
```bash
docker compose down -v
```

---

## Database Schema

```
Branch ──< Room ──< Reservation >── Guest
                         │
                    Payment[]
User ──< AuditLog
```

**Enums:**
- `RoomStatus`: AVAILABLE · OCCUPIED · CLEANING · MAINTENANCE
- `ReservationStatus`: PENDING · CONFIRMED · CHECKED_IN · CHECKED_OUT · CANCELLED
- `ReservationSource`: WALK_IN · PHONE · OTA_AGODA · OTA_BOOKING
- `PaymentMethod`: CASH · TRANSFER · CREDIT_CARD
- `Role`: ADMIN · MANAGER · STAFF

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key สำหรับ JWT (random 32+ chars) |
| `NEXTAUTH_URL` | URL ของแอป เช่น `http://localhost:3000` |

---

## Deploy บน VPS

```bash
git clone https://github.com/aty7001-lab/jennida-hotel.git
cd jennida-hotel
cp .env.example .env
# แก้ .env ให้ครบ โดยเฉพาะ NEXTAUTH_SECRET และ NEXTAUTH_URL

docker compose up --build -d
docker exec hotel_web npx prisma migrate deploy
docker exec hotel_web node prisma/seed.js
```

ถ้าใช้ domain จริง ให้ตั้ง Nginx reverse proxy มาที่ port 3000
