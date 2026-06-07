# Ikonex Academy Student Management System

A full-stack web application built as a Software Developer Internship Assessment for Ikonex Systems.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript     |
| ORM        | Prisma                              |
| Database   | MySQL                               |
| Auth       | JWT (JSON Web Tokens)               |
| PDF        | jsPDF + jsPDF-AutoTable             |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

---

## ✨ Features

- 🔐 JWT Authentication with role-based access
- 🏫 Class Stream Management (CRUD + subject assignment)
- 👨‍🎓 Student Management (register, edit, delete, search, filter)
- 📚 Subject Management (CRUD)
- 📝 Assessment Scoring (CAT 0–40, Exam 0–60, duplicate prevention)
- 📊 Results Processing (totals, averages, grades, class rankings)
- ⚙️ Configurable Grading Scales (admin panel)
- 📄 PDF Reports (individual report cards + class performance)
- 📱 Fully responsive dashboard

---

## 🗂️ Project Structure

```
ikonex/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # Helpers (grading, response)
│   │   ├── types/          # TypeScript interfaces
│   │   ├── index.ts        # App entry point
│   │   └── seed.ts         # Database seeder
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── login/          # Login page
    │   ├── dashboard/      # Dashboard
    │   ├── streams/        # Class streams
    │   ├── students/       # Students + detail
    │   ├── subjects/       # Subjects
    │   ├── assessments/    # Score entry
    │   ├── reports/        # PDF generation
    │   └── settings/       # Grading config
    ├── components/
    │   ├── layout/         # Sidebar, TopNav, Layout
    │   └── ui/             # Modal, Badge, StatCard
    ├── lib/                # API client, auth helpers
    ├── hooks/              # useAuth
    ├── types/              # TypeScript types
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MySQL 8+ (local) OR use Railway (recommended)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ikonex-sms.git
cd ikonex-sms
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/ikonex_db"
JWT_SECRET="your-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with default data
npm run seed

# Start dev server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default login:**
- Email: `admin@ikonex.ac.ke`
- Password: `Admin@1234`

---

## 🌐 Deployment

### Database — Railway MySQL
1. Go to [railway.app](https://railway.app) → New Project → MySQL
2. Copy the `DATABASE_URL` from Railway dashboard

### Backend — Railway
1. New Project → Deploy from GitHub repo
2. Set root directory: `backend`
3. Add environment variables:
   ```
   DATABASE_URL=<from Railway MySQL>
   JWT_SECRET=<strong random string>
   PORT=5000
   FRONTEND_URL=<your Vercel URL>
   ```
4. After deploy, run seed:
   ```bash
   railway run npm run seed
   ```

### Frontend — Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set root directory: `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=<your Railway backend URL>/api/v1
   ```
4. Deploy

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Create user |
| GET  | `/api/v1/auth/me` | Get current user |

### Class Streams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/streams` | List all streams |
| GET    | `/api/v1/streams/:id` | Get stream detail |
| POST   | `/api/v1/streams` | Create stream |
| PUT    | `/api/v1/streams/:id` | Update stream |
| DELETE | `/api/v1/streams/:id` | Delete stream |
| POST   | `/api/v1/streams/:id/subjects` | Assign subjects |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/students` | List (supports ?search=, ?streamId=) |
| GET    | `/api/v1/students/:id` | Student detail |
| POST   | `/api/v1/students` | Register student |
| PUT    | `/api/v1/students/:id` | Update student |
| DELETE | `/api/v1/students/:id` | Delete student |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/subjects` | List subjects |
| POST   | `/api/v1/subjects` | Create subject |
| PUT    | `/api/v1/subjects/:id` | Update |
| DELETE | `/api/v1/subjects/:id` | Delete |

### Assessments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/assessments/dashboard` | Dashboard stats |
| GET    | `/api/v1/assessments/student/:id` | Student scores |
| GET    | `/api/v1/assessments/class/:streamId` | Class rankings |
| POST   | `/api/v1/assessments` | Record score |
| PUT    | `/api/v1/assessments/:id` | Update score |

### Grading
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/grading` | Get grading scales |
| POST   | `/api/v1/grading` | Update grading scales |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens with 24h expiry
- **Helmet.js** for HTTP security headers
- **Rate limiting** (100 req/15min)
- **CORS** configured for frontend origin only
- Prisma ORM prevents SQL injection
- Input validation on all routes
- Duplicate score prevention via database unique constraint

---

## 📄 Default Grading Scale

| Grade | Range | Points |
|-------|-------|--------|
| A | 80–100 | 12 |
| B | 70–79 | 11 |
| C | 60–69 | 10 |
| D | 50–59 | 7 |
| E | 0–49 | 4 |

Grading scales are configurable from the Settings page.

---

## 👤 Submission

- **GitHub:** [link to your repo]
- **Live App:** [your Vercel URL]

Built by: George Ngugi | KCA University | June 2026
