# Dayflow HRMS API Documentation

Complete API reference for Dayflow HRMS Backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE" // Optional: ADMIN, HR, or EMPLOYEE (default: EMPLOYEE)
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "employeeId": "EMP001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### Login

Authenticate user and get tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "employeeId": "EMP001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "department": "Engineering",
      "designation": "Software Engineer"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

### Logout

Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get My Profile

Get current user's profile.

**Endpoint:** `GET /api/users/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "EMP001",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "department": "Engineering",
    "designation": "Software Engineer",
    "phone": "+1234567890",
    "address": "123 Street, City",
    "salary": 70000,
    "employmentStatus": "ACTIVE",
    "joinDate": "2024-01-01T00:00:00.000Z",
    "profileImage": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update My Profile

Update own profile. Employees can only update: phone, address, profileImage.

**Endpoint:** `PUT /api/users/me`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "address": "123 New Street, City",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### Get All Users (Admin Only)

Get list of all users with optional filters.

**Endpoint:** `GET /api/users`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Query Parameters:**
- `department` (optional): Filter by department
- `role` (optional): Filter by role (ADMIN, HR, EMPLOYEE)
- `employmentStatus` (optional): Filter by status (ACTIVE, INACTIVE, TERMINATED, ON_LEAVE)
- `search` (optional): Search in firstName, lastName, email, employeeId

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "EMP001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "department": "Engineering",
      "designation": "Software Engineer",
      "phone": "+1234567890",
      "employmentStatus": "ACTIVE",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "profileImage": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get User By ID (Admin Only)

Get user details by ID.

**Endpoint:** `GET /api/users/:id`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Create User (Admin Only)

Create a new user.

**Endpoint:** `POST /api/users`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:**
```json
{
  "employeeId": "EMP002",
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EMPLOYEE",
  "department": "Marketing",
  "designation": "Marketing Manager",
  "phone": "+1234567891",
  "address": "456 Street, City",
  "salary": 75000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

---

### Update User (Admin Only)

Update user details.

**Endpoint:** `PUT /api/users/:id`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:** (All fields optional)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "department": "Marketing",
  "designation": "Senior Marketing Manager",
  "phone": "+1234567891",
  "address": "456 Street, City",
  "salary": 80000,
  "role": "EMPLOYEE",
  "employmentStatus": "ACTIVE"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

---

## Attendance Endpoints

### Check In

Record attendance check-in.

**Endpoint:** `POST /api/attendance/checkin`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "date": "2024-01-15" // Optional, defaults to today
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": null,
    "status": "PRESENT",
    "duration": null,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  }
}
```

---

### Check Out

Record attendance check-out.

**Endpoint:** `POST /api/attendance/checkout`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "date": "2024-01-15" // Optional, defaults to today
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": "2024-01-15T18:00:00.000Z",
    "status": "PRESENT",
    "duration": 540, // minutes
    "updatedAt": "2024-01-15T18:00:00.000Z"
  }
}
```

---

### Get My Attendance

Get own attendance records.

**Endpoint:** `GET /api/attendance/me`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "date": "2024-01-15T00:00:00.000Z",
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkOutTime": "2024-01-15T18:00:00.000Z",
      "status": "PRESENT",
      "duration": 540
    }
  ],
  "count": 1
}
```

---

### Get All Attendance (Admin Only)

Get all attendance records.

**Endpoint:** `GET /api/attendance`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Query Parameters:**
- `employeeId` (optional): UUID
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date
- `status` (optional): PRESENT, ABSENT, HALF_DAY, LEAVE

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "date": "2024-01-15T00:00:00.000Z",
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkOutTime": "2024-01-15T18:00:00.000Z",
      "status": "PRESENT",
      "duration": 540,
      "employee": {
        "id": "uuid",
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "department": "Engineering"
      }
    }
  ],
  "count": 1
}
```

---

## Leave Request Endpoints

### Create Leave Request

Submit a leave request.

**Endpoint:** `POST /api/leave`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "leaveType": "PAID", // PAID, SICK, UNPAID, CASUAL, EMERGENCY
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "reason": "Family vacation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "leaveType": "PAID",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-03T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "PENDING",
    "adminComment": null,
    "decisionBy": null,
    "employee": { ... },
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### Get My Leave Requests

Get own leave requests.

**Endpoint:** `GET /api/leave/me`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `status` (optional): PENDING, APPROVED, REJECTED, CANCELLED

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 1
}
```

---

### Get All Leave Requests (Admin Only)

Get all leave requests.

**Endpoint:** `GET /api/leave`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Query Parameters:**
- `employeeId` (optional): UUID
- `status` (optional): PENDING, APPROVED, REJECTED, CANCELLED
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "leaveType": "PAID",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-03T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "PENDING",
      "employee": { ... },
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Approve Leave Request (Admin Only)

Approve a leave request.

**Endpoint:** `PUT /api/leave/:id/approve`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:**
```json
{
  "adminComment": "Approved. Enjoy your vacation!" // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": { ... }
}
```

---

### Reject Leave Request (Admin Only)

Reject a leave request.

**Endpoint:** `PUT /api/leave/:id/reject`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:**
```json
{
  "adminComment": "Rejected due to peak workload period." // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Leave request rejected",
  "data": { ... }
}
```

---

## Payroll Endpoints

### Get My Payroll

Get own payroll records.

**Endpoint:** `GET /api/payroll/me`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `payableMonth` (optional): ISO 8601 date (e.g., "2024-01-01")

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "baseSalary": "70000",
      "allowances": "5000",
      "deductions": "2000",
      "netSalary": "73000",
      "payableMonth": "2024-01-01T00:00:00.000Z",
      "status": "PROCESSED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get All Payroll (Admin Only)

Get all payroll records.

**Endpoint:** `GET /api/payroll`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Query Parameters:**
- `employeeId` (optional): UUID
- `payableMonth` (optional): ISO 8601 date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "baseSalary": "70000",
      "allowances": "5000",
      "deductions": "2000",
      "netSalary": "73000",
      "payableMonth": "2024-01-01T00:00:00.000Z",
      "status": "PROCESSED",
      "employee": { ... }
    }
  ],
  "count": 1
}
```

---

### Create Payroll (Admin Only)

Create a payroll record.

**Endpoint:** `POST /api/payroll`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:**
```json
{
  "employeeId": "uuid",
  "baseSalary": 70000,
  "allowances": 5000,
  "deductions": 2000,
  "payableMonth": "2024-01-01",
  "status": "PENDING" // Optional: PENDING, PROCESSED, PAID (default: PENDING)
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payroll created successfully",
  "data": { ... }
}
```

---

### Update Payroll (Admin Only)

Update a payroll record.

**Endpoint:** `PUT /api/payroll/:id`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Request Body:** (All fields optional)
```json
{
  "baseSalary": 75000,
  "allowances": 6000,
  "deductions": 2000,
  "status": "PROCESSED"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payroll updated successfully",
  "data": { ... }
}
```

---

## Dashboard Endpoints

### Get Admin Dashboard (Admin Only)

Get admin dashboard statistics and data.

**Endpoint:** `GET /api/dashboard/admin`

**Headers:** `Authorization: Bearer <access_token>` (Admin/HR only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 50,
    "employeesPresentToday": 45,
    "pendingLeaveCount": 5,
    "approvedLeaveCount": 3,
    "payrollStats": {
      "totalPaid": 3500000,
      "employeeCount": 50
    },
    "attendanceSummary": [
      {
        "date": "2024-01-15T00:00:00.000Z",
        "_count": { "id": 45 },
        "_sum": { "duration": 24300 }
      }
    ],
    "recentActivities": [ ... ]
  }
}
```

---

### Get Employee Dashboard

Get employee dashboard data.

**Endpoint:** `GET /api/dashboard/employee`

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendanceSummary": {
      "presentDays": 20,
      "absentDays": 2,
      "totalWorkHours": 160,
      "totalDays": 22
    },
    "activeLeaveRequests": [ ... ],
    "payrollSummary": {
      "payableMonth": "2024-01-01T00:00:00.000Z",
      "netSalary": 73000,
      "status": "PROCESSED"
    },
    "todayAttendance": {
      "checkInTime": "2024-01-15T09:00:00.000Z",
      "checkOutTime": null,
      "status": "PRESENT"
    }
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin or HR privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Record not found."
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Duplicate entry. This record already exists."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate entry)
- `500` - Internal Server Error

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or full ISO datetime)
- JWT access tokens expire after 15 minutes (configurable)
- JWT refresh tokens expire after 7 days (configurable)
- Password must be at least 8 characters with uppercase, lowercase, and number
- Employees can only update their phone, address, and profileImage
- All admin actions are logged in ActivityLog for audit purposes

