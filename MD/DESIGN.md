# KindLoop - Design & Architecture Document

## 🎨 Color Palette

### Primary Colors
- **Primary Green** (Main Brand Color)
  - `#359364` - Main green
  - `#58ad81` - Light green
  - `#24754f` - Dark green
  - Usage: Navigation, primary buttons, main brand elements

### Secondary Colors
- **Warm Orange** (Call-to-Action)
  - `#f97316` - Main orange
  - `#fb923c` - Light orange
  - `#ea580c` - Dark orange
  - Usage: Secondary buttons, highlights, emphasis

### Accent Colors
- **Warm Yellow** (Highlights)
  - `#fbbf24` - Main yellow
  - `#fcd34d` - Light yellow
  - `#d97706` - Dark yellow
  - Usage: Warnings, highlights, badges

### Semantic Colors
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Info**: `#3b82f6` (Blue)

### Neutral Colors
- **Background**: `#f9fafb` (Light gray)
- **Paper**: `#ffffff` (White)
- **Text Primary**: `#111827` (Dark gray)
- **Text Secondary**: `#6b7280` (Medium gray)

### Color Philosophy
The color palette reflects:
- **Green**: Growth, sustainability, giving, nature
- **Orange**: Warmth, community, energy, action
- **Yellow**: Hope, optimism, positivity
- Clean, modern, and accessible design suitable for all ages

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │   Stores   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Hooks    │  │    API     │  │   i18n     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │  │Controllers │  │  Services  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Middleware  │  │   Models   │  │   Utils    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                           MongoDB
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Database (MongoDB)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Users    │  │ Donations  │  │  Requests  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Businesses │  │  Drivers   │  │  Packers   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Google Maps │  │   Stripe   │  │Socket.IO   │            │
│  │    API     │  │  Payments  │  │  Real-time │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend Structure (Feature-Based)

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── socket.ts
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.routes.ts
│   │   ├── donations/
│   │   │   ├── donation.model.ts
│   │   │   ├── donation.controller.ts
│   │   │   └── donation.routes.ts
│   │   ├── requests/
│   │   ├── businesses/
│   │   ├── drivers/
│   │   ├── packers/
│   │   ├── admin/
│   │   ├── payments/
│   │   └── notifications/
│   ├── shared/              # Shared utilities
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── utils/
│   │   │   ├── AppError.ts
│   │   │   ├── jwt.ts
│   │   │   └── password.ts
│   │   └── types/
│   │       └── enums.ts
│   ├── routes/
│   │   └── index.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Frontend Structure (Feature-Based)

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   └── shared/
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── donations/
│   │   │   └── DonationsPage.tsx
│   │   └── requests/
│   │       └── RequestsPage.tsx
│   ├── stores/              # Zustand stores
│   │   └── authStore.ts
│   ├── lib/                 # Library configurations
│   │   ├── axios.ts
│   │   └── socket.ts
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── i18n.ts              # Internationalization
│   ├── theme.ts             # MUI theme
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile
```

---

## 🗄️ Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  phone?: string,
  role: enum ['admin', 'user', 'business', 'driver', 'packer'],
  status: enum ['active', 'inactive', 'suspended', 'pending_verification'],
  language: enum ['en', 'he'],
  isEmailVerified: boolean,
  address: {
    street: string,
    city: string,
    coordinates: { latitude, longitude }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Donations Collection
```typescript
{
  _id: ObjectId,
  donorId: ObjectId (ref: Users),
  title: string,
  description: string,
  type: enum ['food', 'clothing', 'electronics', 'furniture', 'books', 'toys', 'other'],
  quantity: number,
  unit: string,
  images: string[],
  status: enum ['pending', 'approved', 'assigned', 'in_transit', 'delivered', 'completed', 'cancelled'],
  pickupLocation: {
    address: string,
    city: string,
    coordinates: { latitude, longitude }
  },
  assignedDriverId?: ObjectId,
  assignedPackerId?: ObjectId,
  isFood: boolean,
  foodDetails?: {
    allergens: string[],
    storageInstructions: string,
    isCooked: boolean,
    isPackaged: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Requests Collection
```typescript
{
  _id: ObjectId,
  requesterId: ObjectId (ref: Users),
  title: string,
  description: string,
  requestedTypes: enum[],
  urgency: enum ['low', 'medium', 'high'],
  status: enum ['pending', 'approved', 'matched', 'fulfilled', 'cancelled'],
  deliveryLocation: {
    address: string,
    coordinates: { latitude, longitude }
  },
  matchedDonationId?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Strategy
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- Tokens stored in Zustand store with persistence
- Automatic token refresh on API calls

### User Roles & Permissions

| Role     | Permissions |
|----------|-------------|
| Admin    | Full system access, user management, approve/reject donations |
| Business | Create donations, manage business profile |
| User     | Request donations, view available donations |
| Driver   | Accept delivery assignments, update delivery status |
| Packer   | Accept packing assignments, update packing status |

---

## 🌐 Internationalization (i18n)

### Supported Languages
- **English (en)** - Default
- **Hebrew (he)** - RTL support included

### Implementation
- React-i18next for translations
- Dynamic language switching
- RTL layout support for Hebrew
- Translation files in JSON format

---

## 🔄 Real-Time Features (Socket.IO)

### Events
- **Donation Updates**: Real-time status changes
- **Driver Location**: Live tracking for deliveries
- **Notifications**: Instant notifications for users
- **Assignment Updates**: Real-time driver/packer assignments

---

## 🎯 Key Features

### For Businesses
- Register business profile
- Create food/item donations
- Set pickup times and locations
- Track donation status
- View donation history

### For Users
- Register and request donations
- Browse available donations
- Match with donations
- Track delivery status

### For Drivers
- Accept delivery assignments
- Update location in real-time
- Update delivery status
- Navigation integration (Google Maps)

### For Packers
- Accept packing assignments
- Update packing status
- View assigned donations

### For Admins
- Dashboard with statistics
- Approve/reject donations and requests
- User management
- System monitoring

---

## 🔌 API Integrations

### Google Maps API
- **Purpose**: Location services, geocoding, route optimization
- **Features**: 
  - Address autocomplete
  - Distance calculation
  - Route visualization
  - Driver tracking

### Stripe API (Test Mode)
- **Purpose**: Payment processing for donations
- **Features**:
  - Payment intents
  - Webhooks for payment status
  - Refund handling
  - Test mode only (no real charges)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Design Principles
- Mobile-first approach
- Touch-friendly interfaces
- Optimized for all screen sizes
- Progressive Web App ready

---

## 🔒 Security Measures

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting on sensitive endpoints
- Input validation with express-validator and Zod
- CORS protection
- Helmet.js for security headers
- MongoDB injection prevention
- XSS protection

---

## 🚀 Performance Optimizations

- Lazy loading of routes and components
- Image optimization
- Code splitting
- Compression middleware
- Database indexing
- Query optimization
- Caching strategies

---

## 📊 Monitoring & Logging

- Winston logger for backend
- Structured logging
- Error tracking
- Request/response logging
- Performance monitoring

---

## 🧪 Testing Strategy

### Backend
- Jest for unit and integration tests
- Test coverage reporting
- API endpoint testing

### Frontend
- Vitest for unit tests
- React Testing Library for component tests
- Test coverage reporting

---

## 🐳 Docker Configuration

### Services
- **Backend**: Node.js application
- **Frontend**: React application (Vite dev server)
- **MongoDB**: Database service

### Volumes
- MongoDB data persistence
- Hot reload for development

---

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered donation matching
- [ ] SMS notifications
- [ ] Rating and review system
- [ ] Social media integration
- [ ] Gamification features
- [ ] Multi-currency support
- [ ] Advanced reporting
- [ ] Email templates
- [ ] Push notifications
- [ ] Calendar integration

---

## 🤝 Contributing

This is a course project, but contributions are welcome for learning purposes!

---

## 📝 License

MIT License - This is an educational project for first-degree coursework.






