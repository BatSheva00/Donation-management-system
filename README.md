# KindLoop — Donation Management System

**Author:** Bat Sheva Nifoosi  

Full-stack donation platform: **Node.js/Express** API, **MongoDB** (Atlas or local), **React/Vite** frontend, real-time features with Socket.IO.

---

## Architecture

| Layer | Stack |
|--------|--------|
| Frontend | React 18, TypeScript, Vite, MUI, TanStack Query, Zustand, Axios |
| Backend | Node.js 20+, Express, Mongoose, JWT, Socket.IO |
| Database | **MongoDB Atlas** (recommended) or local MongoDB |

- API base path: `http://localhost:5000/api`
- Frontend dev: `http://localhost:5173`
- Auth: Bearer JWT; refresh token flow in `frontend/src/lib/axios.ts`

---

## Prerequisites

- **Node.js** 20+
- **MongoDB Atlas account** (free tier is fine) **or** local MongoDB
- **Git**

---

## 1. MongoDB Atlas (cloud database)

### Create a cluster

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in.
2. Create a **project** if needed, then **Build a Database** → choose a **free M0** cluster.
3. Choose a region close to you, create the cluster.

### Network access

1. **Network Access** → **Add IP Address**.
2. For development you can use **Allow Access from Anywhere** (`0.0.0.0/0`) temporarily, or add your current IP.

### Database user

1. **Database Access** → **Add New Database User**.
2. Choose **Password** authentication, save the **username** and **password** (you will not see the password again unless you reset it).

### Connection string

1. **Database** → your cluster → **Connect** → **Drivers**.
2. Copy the **connection string**. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
3. Replace `<password>` with your database user password.
4. **Insert the database name** before `?`, e.g. `/kindloop`:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/kindloop?retryWrites=true&w=majority`

---

## 2. Backend configuration

```bash
cd backend
copy .env.example .env
```

Edit **`backend/.env`**:

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | Full Atlas URI (see above), **or** |
| `MONGO_ATLAS_USER`, `MONGO_ATLAS_PASSWORD`, `MONGO_ATLAS_HOST`, `MONGO_ATLAS_DB` | Alternative if you prefer not to use one long line |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Long random strings (required) |
| `FRONTEND_URL` | `http://localhost:5173` (must match where you open the UI) |

**Never commit `.env`** — it is listed in `.gitignore`.

Optional: `STRIPE_SECRET_KEY` for payment intents (server starts without it; payment routes return 503 until set).

---

## 3. Frontend configuration

```bash
cd frontend
copy .env.example .env
```

Minimum:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

These must match the backend port (`5000`) and include **`/api`** in `VITE_API_URL`.

---

## 4. Run locally (no Docker)

**Terminal 1 — backend**

```bash
cd backend
npm install
npm run dev
```

Expect: `Connected to MongoDB` and `Server running on port 5000`.

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

Health check: **http://localhost:5000/health**

---

## 5. Docker (optional)

Default **`docker-compose.yml`** runs **backend + frontend + AI microservice** and expects **Atlas** credentials in **`backend/.env`** (via `env_file`).

```bash
docker compose up --build
```

**Local MongoDB in Docker** (instead of Atlas):

```bash
docker compose -f docker-compose.yml -f docker-compose.mongodb.yml up --build
```

The override file starts MongoDB and sets `MONGO_URI` to the container. For a mixed setup, comment out `MONGO_URI` in `.env` when using only the local compose override, or rely on the override’s `environment` block (it overrides `env_file` for that key).

---

## 6. Troubleshooting

| Issue | What to check |
|--------|----------------|
| `bad auth` / Atlas | Username/password in Atlas **Database Access**; URI must match user; reset password and update `.env`. |
| `ECONNREFUSED 127.0.0.1:27017` | No `MONGO_URI` / Atlas configured — app fell back to local MongoDB; set Atlas URI or start local MongoDB. |
| CORS / login from browser | `FRONTEND_URL` and actual URL (`localhost` vs `127.0.0.1`); backend allows both on port 5173. |
| Frontend cannot reach API | `VITE_API_URL=http://localhost:5000/api`; backend running on 5000. |

---

## 7. Scripts (backend)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with nodemon |
| `npm run build` / `npm start` | Production build & run |
| `npm run db:reset` | Destructive DB reset (use with care) |

---

## License

MIT
