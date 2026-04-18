# Setup Instructions for Permission System

## Add Seeds to server.ts

You need to add the seed function call to your server startup. Here's what to add:

### 1. Import the seed function

```typescript
import { runSeeds } from './config/seedPermissions';
```

### 2. Call after database connection

```typescript
// After connectDB()
try {
  await connectDB();
  logger.info('📦 Database connected successfully');
  
  // Run seeds
  await runSeeds();
  
} catch (error) {
  logger.error('❌ Database connection failed:', error);
  process.exit(1);
}
```

## Complete server.ts Example

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import routes from './routes';
import { errorHandler } from './shared/middleware/errorHandler';
import { notFound } from './shared/middleware/notFound';
import { runSeeds } from './config/seedPermissions';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    logger.info('📦 Database connected successfully');
    
    // Seed permissions and roles
    await runSeeds();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

## Verify Installation

After starting the server, check the logs for:

```
🌱 Starting permission seeding...
✅ Created permission: permissions.view
✅ Created permission: permissions.create
...
✅ Permission seeding completed

🌱 Starting role seeding...
✅ Created role: admin
✅ Created role: user
✅ Created role: business
✅ Created role: driver
✅ Created role: packer
✅ Role seeding completed

🎉 All seeds completed successfully
```

## Test the System

### 1. Get all permissions
```bash
GET http://localhost:5000/api/permissions
Authorization: Bearer <admin_token>
```

### 2. Get all roles
```bash
GET http://localhost:5000/api/roles
Authorization: Bearer <admin_token>
```

### 3. Check user permissions
```bash
GET http://localhost:5000/api/permissions/user/:userId
Authorization: Bearer <admin_token>
```

## Next Steps

1. Update server.ts as shown above
2. Restart Docker containers: `docker-compose down && docker-compose up --build`
3. Check logs to verify seeds ran successfully
4. Test API endpoints with admin user
5. Start using permission middleware in your routes

## Need Help?

- See `PERMISSION_SYSTEM_SUMMARY.md` for quick reference
- See `PERMISSIONS_SYSTEM.md` for full documentation





