🌟 KindLoop - Donation Management System

<div align="center">

![KindLoop Logo](https://via.placeholder.com/200x200/359364/ffffff?text=KindLoop)

**Connecting donors with those in need, one donation at a time**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.3.2-blue)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**KindLoop** is a comprehensive donation management system designed to bridge the gap between donors and those in need. The platform enables:

- 🏢 **Businesses** to donate leftover food and items at the end of the day
- 👥 **Individuals** to request donations and donate items
- 🚗 **Volunteer drivers** to deliver donations
- 📦 **Volunteer packers** to prepare donations
- 👨‍💼 **Admins** to manage the entire system with roles and permissions

This is a full-stack TypeScript application built as a first-degree course project, demonstrating modern web development practices, real-time features, and international accessibility.

---

## ✨ Features

### Core Functionality

- ✅ User registration and authentication (JWT with refresh tokens)
- ✅ Multi-role system (Admin, Business, User, Driver, Packer)
- ✅ Donation creation and management
- ✅ Request system for people in need
- ✅ Real-time updates with Socket.IO
- ✅ Driver assignment and tracking
- ✅ Packer assignment and coordination
- ✅ Admin dashboard with full system control

### Additional Features

- 🌍 Multi-language support (English & Hebrew with RTL)
- 📍 Google Maps integration for location services
- 💳 Stripe integration (test mode) for donations
- 📧 Optional email verification
- 🔔 Real-time notifications
- 📱 100% responsive design
- 🎨 Modern, accessible UI with Material-UI and Tailwind CSS
- 🔒 Comprehensive security measures
- 📊 Logging and monitoring

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **UI Framework**: Material-UI (MUI)
- **Styling**: Tailwind CSS
- **Internationalization**: i18next
- **Testing**: Vitest + React Testing Library

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (with refresh tokens)
- **Password Hashing**: Bcrypt
- **Validation**: Express Validator
- **Logging**: Winston
- **Real-time**: Socket.IO
- **Testing**: Jest

### DevOps & Tools

- **Containerization**: Docker + Docker Compose
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git

### External APIs

- 🗺️ Google Maps API (location services)
- 💰 Stripe API (payment processing - test mode)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: v20.0.0 or higher

  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm**: v10.0.0 or higher (comes with Node.js)

  - Verify: `npm --version`

- **Docker**: Latest version

  - Download: https://www.docker.com/get-started
  - Verify: `docker --version`

- **Docker Compose**: v2.0.0 or higher
  - Usually included with Docker Desktop
  - Verify: `docker-compose --version`

### Optional (for local development without Docker)

- **MongoDB**: v7.0 or higher
  - Download: https://www.mongodb.com/try/download/community

### API Keys (Required for full functionality)

- **Google Maps API Key**

  - Get it from: https://console.cloud.google.com/
  - Enable: Maps JavaScript API, Geocoding API, Places API

- **Stripe Test API Keys**
  - Get it from: https://dashboard.stripe.com/test/apikeys
  - Use test mode keys (starts with `pk_test_` and `sk_test_`)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd kindloop
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Create Environment Files

#### Backend Environment

Create `backend/.env`:

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/kindloop?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your-stripe-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend Environment

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key

# App Configuration
VITE_APP_NAME=KindLoop
VITE_APP_VERSION=1.0.0
```

---

## 🎮 Running the Application

### Option 1: Using Docker (Recommended)

This is the easiest way to run the entire application:

```bash
# From the project root directory
docker-compose up
```

This will start:

- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 5173

Access the application at: http://localhost:5173

To stop the application:

```bash
docker-compose down
```

To rebuild after code changes:

```bash
docker-compose up --build
```

### Connecting with MongoDB Compass

To connect to MongoDB using **MongoDB Compass** (recommended GUI tool):

#### Step 1: Add hostname to your hosts file

**Windows:**

1. Open Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add this line: `127.0.0.1    mongodb`
4. Save and close

**macOS/Linux:**

1. Open terminal
2. Run: `sudo nano /etc/hosts`
3. Add this line: `127.0.0.1    mongodb`
4. Save (Ctrl+X, Y, Enter)

#### Step 2: Use this connection string

```
mongodb://admin:admin123@mongodb:27017/kindloop?authSource=admin
```

**Alternative (without hosts file):** Use `localhost` directly:

```
mongodb://admin:admin123@localhost:27017/kindloop?authSource=admin
```

### Option 2: Manual Setup (Development)

#### Start MongoDB

If you have MongoDB installed locally:

```bash
mongod --dbpath /path/to/your/data
```

Or use Docker for MongoDB only:

```bash
docker run -d -p 27017:27017 --name kindloop-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

#### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:5000

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

---

## ⚙️ Configuration

### Environment Variables

#### Backend Variables

| Variable              | Description                   | Default       |
| --------------------- | ----------------------------- | ------------- |
| `NODE_ENV`            | Environment mode              | `development` |
| `PORT`                | Backend server port           | `5000`        |
| `MONGODB_URI`         | MongoDB connection string     | Required      |
| `JWT_SECRET`          | JWT access token secret       | Required      |
| `JWT_REFRESH_SECRET`  | JWT refresh token secret      | Required      |
| `JWT_EXPIRE`          | Access token expiration       | `15m`         |
| `JWT_REFRESH_EXPIRE`  | Refresh token expiration      | `7d`          |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key           | Required      |
| `STRIPE_SECRET_KEY`   | Stripe secret key (test mode) | Required      |

#### Frontend Variables

| Variable                      | Description            | Default                     |
| ----------------------------- | ---------------------- | --------------------------- |
| `VITE_API_URL`                | Backend API URL        | `http://localhost:5000/api` |
| `VITE_SOCKET_URL`             | Socket.IO server URL   | `http://localhost:5000`     |
| `VITE_GOOGLE_MAPS_API_KEY`    | Google Maps API key    | Required                    |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Required                    |

---

## 📂 Project Structure

```
kindloop/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── features/       # Feature modules (auth, users, donations, etc.)
│   │   ├── shared/         # Shared utilities and middleware
│   │   ├── routes/         # Route definitions
│   │   └── server.ts       # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # State management (Zustand)
│   │   ├── lib/           # Library configurations
│   │   ├── hooks/         # Custom React hooks
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Application entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml      # Docker Compose configuration
├── mongo-init.js          # MongoDB initialization script
├── DESIGN.md              # Design & architecture documentation
├── README.md              # This file
└── .gitignore
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Protected Endpoints

All protected endpoints require authentication:

```http
Authorization: Bearer <access-token>
```

### Available Routes

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/donations` - Donation management
- `/api/requests` - Request management
- `/api/businesses` - Business profiles
- `/api/drivers` - Driver management
- `/api/packers` - Packer management
- `/api/admin` - Admin operations
- `/api/payments` - Payment processing
- `/api/notifications` - Notifications

For detailed API documentation, see the route files in `backend/src/features/*/routes.ts`

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 🔧 Development Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

---

## 🎨 Design System

For detailed information about the design system, color palette, and architecture, see [DESIGN.md](./DESIGN.md).

### Quick Color Reference

- **Primary**: `#359364` (Green - represents growth and giving)
- **Secondary**: `#f97316` (Orange - represents warmth and community)
- **Accent**: `#fbbf24` (Yellow - represents hope and optimism)

---

## 🌐 Internationalization

The application supports:

- **English (en)** - Left-to-right (LTR)
- **Hebrew (he)** - Right-to-left (RTL)

Switch languages using the language selector in the navigation bar.

---

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- MongoDB injection prevention
- XSS protection

---

## 🐛 Troubleshooting

### Common Issues

#### Docker containers won't start

```bash
# Clean up and restart
docker-compose down -v
docker-compose up --build
```

#### Port already in use

```bash
# Change ports in docker-compose.yml or kill the process using the port
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

#### MongoDB connection issues

- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file
- Verify Docker network connectivity

#### Frontend can't connect to backend

- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Verify CORS settings in backend

---

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contributing

This is a course project, but contributions for learning purposes are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

Created as a first-degree course project.

---

## 🙏 Acknowledgments

- Course instructors and mentors
- Open-source community
- All contributors and supporters of this project

---

<div align="center">

**Made with ❤️ for connecting donors with those in need**

⭐ Star this repository if you find it helpful!

</div>
