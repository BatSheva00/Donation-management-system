db = db.getSiblingDB('kindloop');

db.createCollection('users');
db.createCollection('donations');
db.createCollection('requests');
db.createCollection('businesses');
db.createCollection('drivers');
db.createCollection('packers');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.donations.createIndex({ status: 1 });
db.donations.createIndex({ createdAt: -1 });
db.requests.createIndex({ status: 1 });
db.businesses.createIndex({ userId: 1 });
db.drivers.createIndex({ userId: 1 });
db.drivers.createIndex({ status: 1 });

print('✅ MongoDB initialized successfully for KindLoop');






