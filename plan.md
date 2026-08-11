# plan.md — ระบบ e-utilities-cost

ระบบควบคุม/ติดตามค่าสาธารณูปโภค (Utility Expense Tracking & Control System)

## 1. ภาพรวมโครงการ (Overview)

ระบบเว็บแอปพลิเคชันสำหรับบันทึก ติดตาม และสรุปรายงานค่าสาธารณูปโภคของหน่วยงาน/สถานศึกษา
รองรับการเบิกจ่ายจากหลายหมวดเงินงบประมาณ พร้อม dashboard สรุปยอดรายเดือนและดูข้อมูลย้อนหลัง
ใช้งานได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และมือถือ

### เป้าหมายหลัก

- บันทึกรายการค่าใช้จ่ายสาธารณูปโภคแยกตามประเภท
- ผูกรายการค่าใช้จ่ายกับหมวดเงินที่ใช้เบิกจ่าย
- แสดง dashboard สรุปยอดรายเดือนเปรียบเทียบย้อนหลัง
- จัดการ (CRUD) ข้อมูลรายการค่าใช้จ่ายและหมวดเงินได้
- ระบบสมาชิก login/logout ด้วย JWT
- Deploy ด้วย Docker และ build image ขึ้น Docker Hub

## 2. เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนงาน | เทคโนโลยี |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | Vue 3 (Composition API) + Vite + Tailwind CSS |
| Database | MariaDB |
| DB Admin | phpMyAdmin |
| Authentication | JWT (jsonwebtoken) + bcrypt (hash password) |
| ORM/Query | Sequelize หรือ Prisma (แนะนำ Sequelize เพราะรองรับ MariaDB ดี) |
| Container | Docker + Docker Compose (Docker Desktop) |
| Image Registry | Docker Hub |
| Chart Library | Chart.js หรือ ApexCharts (สำหรับ dashboard) |
| State Management | Pinia |
| Routing | Vue Router |
| HTTP Client | Axios |

## 3. โครงสร้างโปรเจกต์ (Project Structure)

```
e-utilities-cost/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── expenseCategory.model.js
│   │   │   ├── budgetCategory.model.js
│   │   │   └── expense.model.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── expenseCategory.controller.js
│   │   │   ├── budgetCategory.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── category.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/ (Sidebar, Navbar, MobileMenu)
│   │   │   ├── charts/
│   │   │   └── forms/
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── ExpenseListView.vue
│   │   │   ├── ExpenseFormView.vue
│   │   │   ├── CategoryManageView.vue
│   │   │   └── ReportHistoryView.vue
│   │   ├── stores/ (Pinia: auth, expense, category)
│   │   ├── router/
│   │   ├── services/ (api.js, auth.service.js)
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml
├── .env
└── plan.md
```

## 4. ออกแบบฐานข้อมูล (Database Design — MariaDB)

### 4.1 ตาราง users

| Field | Type | หมายเหตุ |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE | |
| password | VARCHAR(255) | เก็บแบบ bcrypt hash |
| full_name | VARCHAR(100) | |
| role | ENUM('admin','staff') | สิทธิ์การใช้งาน |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 4.2 ตาราง expense_categories (รายการประเภทค่าใช้จ่าย)

| Field | Type | หมายเหตุ |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | เช่น ค่าไฟฟ้า, ค่าน้ำประปา |
| code | VARCHAR(20) | รหัสย่อ เช่น ELEC, WATER |
| unit | VARCHAR(20) | หน่วย (บาท) — เผื่อขยาย |
| is_active | BOOLEAN DEFAULT TRUE | |
| created_at | DATETIME | |

ข้อมูลเริ่มต้น (seed):
1. ค่าไฟฟ้า (ELEC)
2. ค่าพลังงาน (ENERGY)
3. ค่าน้ำประปา (WATER)
4. ค่าอินเตอร์เน็ต (INTERNET)
5. ค่าโทรศัพท์ (PHONE)
6. ค่าไปรษณีย์ (POST)
7. ค่าทิ้งขยะ (WASTE)

### 4.3 ตาราง budget_categories (หมวดเงินที่ใช้เบิกจ่าย)

| Field | Type | หมายเหตุ |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(150) | ชื่อหมวดเงิน |
| code | VARCHAR(20) | รหัสย่อ |
| is_active | BOOLEAN DEFAULT TRUE | |
| created_at | DATETIME | |

ข้อมูลเริ่มต้น (seed):
1. งบประมาณ (ปวช.)
2. งบประมาณ (ปวส.)
3. เงินรายได้สถานศึกษา

### 4.4 ตาราง expenses (รายการค่าใช้จ่าย)

| Field | Type | หมายเหตุ |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| expense_category_id | INT FK → expense_categories.id | ประเภทค่าใช้จ่าย |
| budget_category_id | INT FK → budget_categories.id | หมวดเงินที่เบิก |
| amount | DECIMAL(12,2) | จำนวนเงิน |
| billing_month | DATE | เดือน/ปีของบิล (เก็บเป็นวันที่ 1 ของเดือน) |
| paid_date | DATE | วันที่ชำระจริง |
| invoice_no | VARCHAR(50) | เลขที่ใบแจ้งหนี้ (ถ้ามี) |
| note | TEXT | หมายเหตุ |
| attachment_path | VARCHAR(255) | แนบไฟล์ใบเสร็จ (optional) |
| created_by | INT FK → users.id | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 4.5 ความสัมพันธ์ (ERD สรุป)

```
users (1) ───< (N) expenses
expense_categories (1) ───< (N) expenses
budget_categories (1) ───< (N) expenses
```

## 5. ระบบยืนยันตัวตน (Authentication — JWT)

- `POST /api/auth/login` → ตรวจสอบ username/password → คืน accessToken (JWT, อายุสั้น เช่น 1 ชม.) และ refreshToken (เก็บใน httpOnly cookie)
- `POST /api/auth/logout` → ล้าง refresh token
- `POST /api/auth/refresh` → ขอ accessToken ใหม่
- `GET /api/auth/me` → ดึงข้อมูล user ปัจจุบัน
- Middleware `auth.middleware.js` ตรวจสอบ `Authorization: Bearer <token>` ทุก endpoint ที่ต้อง login
- Frontend เก็บ accessToken ใน memory (Pinia store) ไม่เก็บใน localStorage เพื่อลดความเสี่ยง XSS
- Route guard ใน Vue Router redirect ไปหน้า login หาก token หมดอายุ/ไม่มี

## 6. ออกแบบ API (Backend Endpoints)

ทุก endpoint (ยกเว้น login) ต้องแนบ JWT และตรวจสอบสิทธิ์ผ่าน middleware

### Auth
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Expense Categories (รายการค่าใช้จ่าย)
```
GET    /api/expense-categories
POST   /api/expense-categories
PUT    /api/expense-categories/:id
DELETE /api/expense-categories/:id
```

### Budget Categories (หมวดเงิน)
```
GET    /api/budget-categories
POST   /api/budget-categories
PUT    /api/budget-categories/:id
DELETE /api/budget-categories/:id
```

### Expenses (รายการค่าใช้จ่ายจริง)
```
GET    /api/expenses?month=&year=&expense_category_id=&budget_category_id=
POST   /api/expenses
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

### Dashboard / Reports
```
GET /api/dashboard/summary?year=            # สรุปยอดรวมรายเดือนทั้งปี
GET /api/dashboard/by-category?year=        # สรุปแยกตามประเภทค่าใช้จ่าย
GET /api/dashboard/by-budget?year=          # สรุปแยกตามหมวดเงิน
GET /api/dashboard/compare?year1=&year2=    # เปรียบเทียบปีต่อปี
```

## 7. ออกแบบหน้าจอ (Frontend Pages)

| หน้าจอ | Path | รายละเอียด |
|---|---|---|
| Login | `/login` | ฟอร์ม username/password |
| Dashboard | `/` | การ์ดสรุปยอดเดือนปัจจุบัน, กราฟแท่ง/เส้นรายเดือน, กราฟวงกลมแยกตามประเภท, ตัวกรองปี/เดือน |
| รายการค่าใช้จ่าย | `/expenses` | ตารางรายการ + ค้นหา/กรอง + pagination |
| เพิ่ม/แก้ไขค่าใช้จ่าย | `/expenses/create`, `/expenses/:id/edit` | ฟอร์มบันทึกรายการ |
| จัดการประเภทค่าใช้จ่าย | `/settings/expense-categories` | CRUD |
| จัดการหมวดเงิน | `/settings/budget-categories` | CRUD |
| รายงานย้อนหลัง | `/reports` | เลือกช่วงเวลา/ปีเปรียบเทียบ, export (PDF/Excel เป็น optional เพิ่มเติม) |

### Dashboard UI (แนวคิด)

- Summary cards: ยอดรวมเดือนนี้ / เดือนก่อน / เปลี่ยนแปลง % / ยอดรวมปีนี้
- กราฟแท่งเปรียบเทียบยอดรายเดือน 12 เดือน
- กราฟวงกลม สัดส่วนค่าใช้จ่ายแต่ละประเภท (ไฟฟ้า, น้ำ, เน็ต ฯลฯ)
- กราฟแท่งซ้อนแยกตามหมวดเงิน (ปวช./ปวส./เงินรายได้)
- ตารางสรุปย้อนหลังแบบเลือกปีเปรียบเทียบ

### Responsive Design

- ใช้ Tailwind breakpoints: sm / md / lg / xl
- Desktop: Sidebar แบบ fixed ซ้ายมือ + เนื้อหาหลัก
- Tablet: Sidebar ยุบเป็นไอคอน (collapsible)
- Mobile: Sidebar เปลี่ยนเป็น bottom nav หรือ hamburger menu แบบ drawer
- ตารางข้อมูลบนมือถือ → ปรับเป็น card list แทน table (ใช้ `md:table hidden` + `block md:hidden` pattern)
- กราฟปรับขนาดอัตโนมัติด้วย responsive container ของ Chart.js

## 8. Docker Configuration

### 8.1 docker-compose.yml (แนวคิดโครงสร้าง)

```yaml
services:
  mariadb:
    image: mariadb:11
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: e_utilities_cost
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    ports:
      - "3306:3306"

  phpmyadmin:
    image: phpmyadmin:latest
    environment:
      PMA_HOST: mariadb
    ports:
      - "8081:80"
    depends_on:
      - mariadb

  backend:
    build: ./backend
    image: <dockerhub-username>/e-utilities-cost-backend:latest
    environment:
      DB_HOST: mariadb
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - mariadb

  frontend:
    build: ./frontend
    image: <dockerhub-username>/e-utilities-cost-frontend:latest
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  mariadb_data:
```

### 8.2 Backend Dockerfile (แนวคิด)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### 8.3 Frontend Dockerfile (multi-stage build)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 8.4 ขั้นตอน Build & Push ขึ้น Docker Hub (สำหรับนักศึกษา)

```bash
# 1. Login เข้า Docker Hub
docker login

# 2. Build image backend
docker build -t <dockerhub-username>/e-utilities-cost-backend:latest ./backend

# 3. Build image frontend
docker build -t <dockerhub-username>/e-utilities-cost-frontend:latest ./frontend

# 4. Push ขึ้น Docker Hub
docker push <dockerhub-username>/e-utilities-cost-backend:latest
docker push <dockerhub-username>/e-utilities-cost-frontend:latest

# 5. ทดสอบรันจาก image ที่ push แล้ว
docker compose up -d
```

## 9. Security & Best Practices

- Hash password ด้วย bcrypt (salt rounds ≥ 10)
- JWT secret เก็บใน `.env` ห้าม commit ขึ้น git
- ใช้ `helmet`, `cors` (จำกัด origin เฉพาะ frontend), `express-rate-limit` ป้องกัน brute force login
- Validate input ทุก endpoint (เช่น ใช้ `express-validator` หรือ `zod`)
- ใช้ HTTPS เมื่อ deploy จริง (reverse proxy เช่น Nginx/Traefik)
- แยก `.env.example` ไว้เป็นตัวอย่าง ไม่ commit `.env` จริง

## 10. แผนการพัฒนา (Milestones)

| Sprint | งาน |
|---|---|
| 1 | ออกแบบ DB, ตั้งค่า Docker Compose (MariaDB + phpMyAdmin), Init backend project |
| 2 | ระบบ Auth (JWT login/logout), Middleware ป้องกัน route |
| 3 | CRUD ประเภทค่าใช้จ่าย + หมวดเงิน (backend + frontend) |
| 4 | CRUD รายการค่าใช้จ่าย (ฟอร์มบันทึก + ตารางแสดงผล) |
| 5 | Dashboard สรุปยอดรายเดือน + กราฟ |
| 6 | หน้ารายงานย้อนหลัง/เปรียบเทียบ + Responsive ปรับจอมือถือ/แท็บเล็ต |
| 7 | ทดสอบระบบ (unit/manual test), แก้ bug |
| 8 | Build Docker image, Push ขึ้น Docker Hub, ทำเอกสารสรุปโครงการ |

## 11. รายการ Environment Variables (.env ตัวอย่าง)

```
# Database
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=e_utilities_cost
DB_USER=app_user
DB_PASSWORD=changeme
DB_ROOT_PASSWORD=changeme_root

# Backend
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

## 12. หมายเหตุเพิ่มเติม (ส่วนขยายในอนาคต — ไม่บังคับ)

- Export รายงานเป็น PDF/Excel
- ระบบแจ้งเตือนเมื่อค่าใช้จ่ายเดือนใดสูงผิดปกติ (threshold alert)
- ระบบแนบไฟล์ใบเสร็จ/สลิปโอนเงิน
- Multi-branch / multi-site support (กรณีมีหลายวิทยาเขต)
- Role-based permission ละเอียดขึ้น (ผู้ดูอย่างเดียว, ผู้บันทึก, ผู้อนุมัติ)
