# Pet Adoption Management System

A full-stack **MERN** application for managing pet adoptions. Users can browse available pets, apply to adopt, and track their applications. Admins can manage pets and review adoption requests.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email notifications)

### 1. Clone the repository

```bash
git clone https://github.com/TanyaMudgal12/pet-adoption-system.git
cd pet-adoption-system
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

Backend runs on: `http://localhost:5000`
Swagger docs at: `http://localhost:5000/api/docs`

### 3. Seed the Database (Optional but recommended)

```bash
# Make sure backend .env is configured first
node seed.js
```

This creates:
- 15 sample pets with photos uploaded to Cloudinary
- 1 admin user: `admin@petadoption.com` / `admin123`
- 1 regular user: `john@example.com` / `user123`

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# .env contains: VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get profile |
| PUT | `/api/auth/me` | Private | Update profile |
| GET | `/api/auth/notifications` | Private | Get notifications |
| PUT | `/api/auth/notifications/read` | Private | Mark all read |

### Pets
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/pets` | Public | List pets (search, filter, paginate) |
| GET | `/api/pets/:id` | Public | Pet detail |
| GET | `/api/pets/admin/all` | Admin | All pets (all statuses) |
| POST | `/api/pets` | Admin | Create pet (with photo) |
| PUT | `/api/pets/:id` | Admin | Update pet |
| DELETE | `/api/pets/:id` | Admin | Delete pet |

### Adoptions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/adoptions` | User | Apply for adoption |
| GET | `/api/adoptions/my` | User | My applications |
| GET | `/api/adoptions` | Admin | All applications |
| GET | `/api/adoptions/:id` | Private | Single application |
| PUT | `/api/adoptions/:id/review` | Admin | Approve / Reject |
| DELETE | `/api/adoptions/:id` | User | Withdraw application |

---

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@petadoption.com | admin123 |
| User | john@example.com | user123 |