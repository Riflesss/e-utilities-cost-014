# e-utilities-cost — ระบบควบคุม/ติดตามค่าสาธารณูปโภค

ระบบเว็บแอปสำหรับบันทึก ติดตาม และสรุปรายงานค่าสาธารณูปโภค (ไฟฟ้า, น้ำ, เน็ต ฯลฯ)
รายละเอียดออกแบบทั้งหมดอยู่ใน [`plan.md`](./plan.md)

## โครงสร้างโปรเจกต์

```
e-utilities-cost/
├── backend/     # Node.js + Express + Sequelize (REST API)
├── frontend/    # Vue 3 + Vite + Tailwind + Pinia
├── docker-compose.yml
└── .env.example
```

## วิธีรันด้วย Docker (แนะนำ — เร็วที่สุด)

1. คัดลอกไฟล์ env ตัวอย่าง แล้วแก้ค่าตามต้องการ (อย่างน้อยควรเปลี่ยน `JWT_SECRET`, `JWT_REFRESH_SECRET`, รหัสผ่าน DB):

   ```bash
   cp .env.example .env
   ```

2. สั่ง build และรันทุก service พร้อมกัน:

   ```bash
   docker compose up -d --build
   ```

   จะได้ 4 containers:
   | Service | URL | หมายเหตุ |
   |---|---|---|
   | frontend | http://localhost:8080 | เว็บแอปหลัก |
   | backend | http://localhost:3000/api | REST API |
   | phpmyadmin | http://localhost:8081 | จัดการฐานข้อมูล |
   | mariadb | localhost:3306 | ฐานข้อมูล |

3. สร้างข้อมูลเริ่มต้น (ประเภทค่าใช้จ่าย, หมวดเงิน, ผู้ใช้ admin) — รันครั้งเดียวหลัง container backend ขึ้นแล้ว:

   ```bash
   docker compose exec backend npm run seed
   ```

   จะได้ผู้ใช้เริ่มต้น:
   - **username:** `admin`
   - **password:** `admin1234`

   > ⚠️ ควรเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก (หรือลบ user แล้วสร้างใหม่ผ่าน DB)

4. เปิดเบราว์เซอร์ไปที่ **http://localhost:8080** แล้ว login ได้เลย

## วิธีรันแบบ Dev (ไม่ผ่าน Docker)

### เตรียมฐานข้อมูล
ต้องมี MariaDB/MySQL รันอยู่แล้ว (หรือรันแค่ `docker compose up -d mariadb phpmyadmin`)

### Backend
```bash
cd backend
cp .env.example .env   # แก้ DB_HOST เป็น localhost ถ้าไม่ได้ใช้ docker
npm install
npm run seed            # สร้างข้อมูลเริ่มต้น (ครั้งแรกครั้งเดียว)
npm run dev              # ใช้ nodemon รันที่ port 3000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # รันที่ http://localhost:5173
```

## Build & Push image ขึ้น Docker Hub

```bash
docker login

docker build -t <dockerhub-username>/e-utilities-cost-backend:latest ./backend
docker build -t <dockerhub-username>/e-utilities-cost-frontend:latest ./frontend \
  --build-arg VITE_API_BASE_URL=https://your-api-domain.com/api

docker push <dockerhub-username>/e-utilities-cost-backend:latest
docker push <dockerhub-username>/e-utilities-cost-frontend:latest
```

## สิ่งที่ทำไว้แล้ว

- ✅ Auth ด้วย JWT (accessToken ใน memory + refreshToken ใน httpOnly cookie) พร้อม auto-refresh ฝั่ง frontend
- ✅ CRUD ประเภทค่าใช้จ่าย, หมวดเงิน, รายการค่าใช้จ่าย
- ✅ Dashboard: การ์ดสรุปยอด, กราฟแท่งรายเดือน, กราฟวงกลมแยกตามประเภท
- ✅ หน้ารายงานย้อนหลัง เปรียบเทียบ 2 ปี
- ✅ Responsive: Desktop sidebar / Tablet ยุบไอคอน / Mobile bottom nav + card list
- ✅ Security: bcrypt hash password, helmet, cors, rate-limit ที่ login, JWT middleware ทุก endpoint ที่ต้อง login

## สิ่งที่ยังไม่ได้ทำ (ตามหัวข้อ "ส่วนขยายในอนาคต" ใน plan.md)

- Export รายงานเป็น PDF/Excel
- ระบบแจ้งเตือนเมื่อค่าใช้จ่ายสูงผิดปกติ (threshold alert)
- แนบไฟล์ใบเสร็จ/สลิปโอนเงิน (ฟิลด์ `attachment_path` เตรียมไว้ใน DB แล้ว แต่ยังไม่มี upload endpoint)
- Multi-branch / multi-site support
- Role-based permission ละเอียดขึ้น (ตอนนี้มีแค่ admin/staff แบบพื้นฐาน)

## หมายเหตุด้านความปลอดภัยก่อนขึ้น production

- เปลี่ยน `JWT_SECRET`, `JWT_REFRESH_SECRET`, รหัสผ่าน DB ทั้งหมดให้เป็นค่าสุ่มที่ปลอดภัย
- เปลี่ยนรหัสผ่าน admin เริ่มต้นทันที
- ใช้ HTTPS จริงผ่าน reverse proxy (Nginx/Traefik) พร้อม SSL certificate
- ปิดพอร์ต 3306 และ 8081 (mariadb, phpmyadmin) ไม่ให้เปิดสู่ public internet
