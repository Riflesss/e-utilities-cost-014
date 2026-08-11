# e-utilities-cost

ระบบจัดการและติดตามค่าใช้จ่ายประจำเดือนสำหรับครัวเรือนหรือองค์กรเล็ก

รายละเอียดการออกแบบและแผนงานอยู่ที่ [plan.md](./plan.md)

## สารบัญ

- ภาพรวมโปรเจกต์
- เทคโนโลยีที่ใช้
- โครงสร้างโปรเจกต์
- การติดตั้งและรันด้วย Docker
- การสร้างข้อมูลเริ่มต้น
- การเข้าถึงระบบ
- การพัฒนาในเครื่อง local
- ข้อควรระวังด้านความปลอดภัย

## ภาพรวมโปรเจกต์

โปรเจกต์นี้ประกอบด้วย:

- Frontend: Vue 3 + Vite + Tailwind CSS
- Backend: Node.js + Express + Sequelize
- Database: MariaDB
- Admin tools: phpMyAdmin

ฟังก์ชันที่มีอยู่ประกอบด้วย:

- Login / Auth กับ JWT
- จัดการหมวดค่าใช้จ่าย
- จัดการรายการรายจ่าย
- Dashboard สรุปยอดและกราฟ
- รายงานย้อนหลัง
- การจัดการผู้ใช้

## เทคโนโลยีที่ใช้

- Node.js 20
- Express.js
- Sequelize
- MariaDB 11
- Vue 3
- Vite
- Tailwind CSS
- Docker / Docker Compose

## โครงสร้างโปรเจกต์

text
.
├── backend/                  # REST API
│   ├── src/
│   ├── package.json
│   └── .env.example
├── frontend/                 # Vue app
│   ├── src/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── .env.example
├── README.md
├── plan.md
└── validate_end_to_end.ps1

## การติดตั้งและรันด้วย Docker

### 1) เตรียม environment file

คัดลอกไฟล์ตัวอย่างสำหรับ root environment:

copy .env.example .env

ไฟล์ .env.example มีค่าตั้งต้นที่ใช้สำหรับ Docker Compose เช่น:

env
DB_NAME=e_utilities_cost
DB_USER=app_user
DB_PASSWORD=changeme
DB_ROOT_PASSWORD=changeme_root
JWT_SECRET=change_this_to_a_long_random_secret
JWT_REFRESH_SECRET=change_this_to_another_long_random_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:3000/api
DOCKERHUB_USERNAME=yourname

ควรเปลี่ยนค่ารหัสผ่านและ secret ให้เป็นค่าเฉพาะของคุณก่อนใช้งานจริง


### 2) รัน project ทั้งหมด

docker compose up -d --build

### 3) ตรวจสอบสถานะ

docker ps

### 4) URL ที่เข้าถึงได้

| Service | URL | หมายเหตุ |
|---|---|---|
| Frontend | http://localhost:8080 | แอปหลัก |
| Backend API | http://localhost:3000 | API ของระบบ |
| phpMyAdmin | http://localhost:8081 | จัดการฐานข้อมูล |
| MariaDB | localhost:3306 | Port ฐานข้อมูล |

## การสร้างข้อมูลเริ่มต้น

หลังจาก container backend เริ่มทำงานแล้ว ให้รันคำสั่งนี้ครั้งเดียว:

docker compose exec backend npm run seed

ผู้ใช้เริ่มต้นที่ seed ขึ้นมาจะมีค่าแบบนี้:

- username: admin
- password: admin1234

แนะนำให้เปลี่ยนรหัสผ่านหลัง login ครั้งแรกทันที


## การเข้าถึงระบบ

เปิด browser ไปที่:

text
http://localhost:8080

แล้วเข้าสู่ระบบด้วย account ที่สร้างจาก seed หรือ account ที่คุณเพิ่มจากระบบเอง

## การพัฒนาในเครื่อง local

### Backend

cd backend
copy .env.example .env
npm install
npm run dev

Backend จะรันที่:

text
http://localhost:3000

### Frontend

cd frontend
copy .env.example .env
npm install
npm run dev

Frontend จะรันที่:

text
http://localhost:5173

## การหยุดและล้าง container

หยุด service:

docker compose down

หยุดและล้าง volume (เช่น DB data):

docker compose down -v

## ข้อควรระวังด้านความปลอดภัย

- เปลี่ยน JWT secret ให้เป็นค่า random ที่ปลอดภัย
- เปลี่ยนรหัสผ่าน DB และรหัสผ่าน admin เริ่มต้นทันที
- ใน production ให้ใช้ HTTPS และ reverse proxy จริง
- อย่าเปิดพอร์ตฐานข้อมูลหรือ phpMyAdmin ให้เข้าถึงจาก Internet โดยตรง

## หมายเหตุ

หากต้องการใช้ Docker Hub สำหรับเผยแพร่ image สามารถใช้คำสั่งต่อไปนี้:

docker login

docker build -t <dockerhub-username>/e-utilities-cost-backend:latest ./backend
docker build -t <dockerhub-username>/e-utilities-cost-frontend:latest ./frontend

docker push <dockerhub-username>/e-utilities-cost-backend:latest
docker push <dockerhub-username>/e-utilities-cost-frontend:latest