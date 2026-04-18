# Donation API Documentation

This document describes the Donation API endpoints and how to use them.

## Base URL
```
http://localhost:5000/api/donations
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### 1. Get All Donations
**GET** `/api/donations`

Get a list of all donations with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by donation status (pending, approved, assigned, in_transit, delivered, completed, cancelled, rejected)
- `type` (optional): Filter by donation type (food, clothing, electronics, furniture, books, toys, other)
- `donorId` (optional): Filter by donor ID
- `search` (optional): Search in title and description
- `isFood` (optional): Filter food donations (true/false)
- `city` (optional): Filter by city
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `sortBy` (optional, default: createdAt): Field to sort by
- `sortOrder` (optional, default: desc): Sort order (asc/desc)

**Example:**
```bash
GET /api/donations?status=pending&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "donorId": {
        "_id": "64a1b2c3d4e5f6789012346",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "123-456-7890"
      },
      "title": "Fresh Vegetables",
      "description": "Organic vegetables from my garden",
      "type": "food",
      "quantity": 10,
      "unit": "kg",
      "status": "pending",
      "pickupLocation": {
        "address": "123 Main St",
        "city": "New York",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "isFood": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 2. Create Donation
**POST** `/api/donations`

Create a new donation. Requires `business`, `user`, or `admin` role.

**Request Body:**
```json
{
  "title": "Fresh Vegetables",
  "description": "Organic vegetables from my garden",
  "type": "food",
  "quantity": 10,
  "unit": "kg",
  "images": ["https://example.com/image1.jpg"],
  "pickupLocation": {
    "address": "123 Main St",
    "city": "New York",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "pickupTimeWindow": {
    "start": "2024-01-15T09:00:00.000Z",
    "end": "2024-01-15T17:00:00.000Z"
  },
  "expiryDate": "2024-01-20T00:00:00.000Z",
  "isFood": true,
  "foodDetails": {
    "allergens": ["nuts"],
    "storageInstructions": "Keep refrigerated",
    "isCooked": false,
    "isPackaged": true
  },
  "estimatedValue": 50,
  "weight": 10.5,
  "notes": "Please call before pickup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "donorId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "123-456-7890"
    },
    "title": "Fresh Vegetables",
    "status": "pending",
    // ... rest of donation data
  }
}
```

---

### 3. Get My Donations
**GET** `/api/donations/my-donations`

Get donations created by the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```bash
GET /api/donations/my-donations?status=pending
```

---

### 4. Get Donation by ID
**GET** `/api/donations/:id`

Get a specific donation by its ID.

**Example:**
```bash
GET /api/donations/64a1b2c3d4e5f6789012345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "donorId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    // ... rest of donation data
  }
}
```

---

### 5. Update Donation
**PUT** `/api/donations/:id`

Update a donation. Only the donor or admin can update.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "quantity": 15,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation updated successfully",
  "data": {
    // updated donation object
  }
}
```

---

### 6. Delete Donation
**DELETE** `/api/donations/:id`

Delete a donation. Only the donor or admin can delete. Cannot delete donations that are assigned or in progress.

**Example:**
```bash
DELETE /api/donations/64a1b2c3d4e5f6789012345
```

**Response:**
```json
{
  "success": true,
  "message": "Donation deleted successfully"
}
```

---

### 7. Update Donation Status
**PATCH** `/api/donations/:id/status`

Update the status of a donation. Requires `admin` or `driver` role.

**Request Body:**
```json
{
  "status": "approved",
  "adminNotes": "Approved by admin",
  "rejectionReason": "Reason if rejected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation status updated successfully",
  "data": {
    // updated donation object
  }
}
```

---

### 8. Get Donation Statistics
**GET** `/api/donations/stats`

Get statistics about donations.

**Query Parameters:**
- `donorId` (optional): Get stats for a specific donor

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total": 150,
      "pending": 20,
      "approved": 50,
      "completed": 70,
      "totalValue": 15000
    },
    "typeDistribution": [
      { "_id": "food", "count": 80 },
      { "_id": "clothing", "count": 40 },
      { "_id": "furniture", "count": 30 }
    ]
  }
}
```

---

## Donation Status Flow

1. **PENDING** - Initial status when donation is created
2. **APPROVED** - Admin approves the donation
3. **ASSIGNED** - Driver/packer is assigned
4. **IN_TRANSIT** - Donation is being transported
5. **DELIVERED** - Donation has been delivered
6. **COMPLETED** - Donation process completed
7. **CANCELLED** - Donation cancelled by donor
8. **REJECTED** - Donation rejected by admin

---

## Validation Rules

### Create Donation:
- `title`: Required, max 200 characters
- `description`: Required, max 1000 characters
- `type`: Required, must be one of: food, clothing, electronics, furniture, books, toys, other
- `quantity`: Required, minimum 1
- `unit`: Required
- `pickupLocation`: Required with address, city, and coordinates
- `coordinates.latitude`: Required, between -90 and 90
- `coordinates.longitude`: Required, between -180 and 180
- `foodDetails`: Required if `isFood` is true

### Update Donation:
- All fields are optional
- Same validation rules apply for provided fields

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to update this donation"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Donation not found"
}
```

---

## Example Usage (curl)

### Create a donation:
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fresh Vegetables",
    "description": "Organic vegetables from my garden",
    "type": "food",
    "quantity": 10,
    "unit": "kg",
    "pickupLocation": {
      "address": "123 Main St",
      "city": "New York",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "isFood": true,
    "foodDetails": {
      "isCooked": false,
      "isPackaged": true
    }
  }'
```

### Get all donations:
```bash
curl -X GET "http://localhost:5000/api/donations?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update donation status:
```bash
curl -X PATCH http://localhost:5000/api/donations/64a1b2c3d4e5f6789012345/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "adminNotes": "Looks good!"
  }'
```





