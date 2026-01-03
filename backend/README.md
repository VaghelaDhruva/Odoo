# Dayflow HRMS Backend API

A secure, scalable, and modular backend API for Dayflow - a SaaS-grade Human Resource Management System.

## 🚀 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dayflow_db?schema=public"

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your_super_secret_access_token_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_this_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Prisma client
│   │   └── env.js       # Environment variables
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Custom middlewares
│   ├── validations/     # Input validation rules
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding
├── package.json
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles

- **ADMIN**: Full system access
- **HR**: Human Resources management access
- **EMPLOYEE**: Limited access to own data

### Authentication Flow

1. **Sign Up**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login` → Returns access token and refresh token
3. **Protected Routes**: Include `Authorization: Bearer <access_token>` header
4. **Refresh Token**: `POST /api/auth/refresh` → Get new access token
5. **Logout**: `POST /api/auth/logout`

### Role-Based Access Control

- **Employees** can only access their own data (profile, attendance, leave, payroll)
- **Admins/HR** can access all employee data and perform administrative actions

## 📡 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user (requires auth)

### Users

- `GET /api/users/me` - Get current user profile (requires auth)
- `PUT /api/users/me` - Update own profile (requires auth, employees can only update: phone, address, profileImage)
- `GET /api/users` - Get all users (requires admin)
- `GET /api/users/:id` - Get user by ID (requires admin)
- `POST /api/users` - Create new user (requires admin)
- `PUT /api/users/:id` - Update user (requires admin)

### Attendance

- `POST /api/attendance/checkin` - Check in (requires auth)
- `POST /api/attendance/checkout` - Check out (requires auth)
- `GET /api/attendance/me` - Get own attendance (requires auth)
  - Query params: `startDate`, `endDate`
- `GET /api/attendance` - Get all attendance (requires admin)
  - Query params: `employeeId`, `startDate`, `endDate`, `status`

### Leave Requests

- `POST /api/leave` - Create leave request (requires auth)
- `GET /api/leave/me` - Get own leave requests (requires auth)
  - Query params: `status`
- `GET /api/leave` - Get all leave requests (requires admin)
  - Query params: `employeeId`, `status`, `startDate`, `endDate`
- `PUT /api/leave/:id/approve` - Approve leave request (requires admin)
- `PUT /api/leave/:id/reject` - Reject leave request (requires admin)

### Payroll

- `GET /api/payroll/me` - Get own payroll (requires auth)
  - Query params: `payableMonth`
- `GET /api/payroll` - Get all payroll (requires admin)
  - Query params: `employeeId`, `payableMonth`
- `POST /api/payroll` - Create payroll (requires admin)
- `PUT /api/payroll/:id` - Update payroll (requires admin)

### Dashboard

- `GET /api/dashboard/admin` - Get admin dashboard data (requires admin)
- `GET /api/dashboard/employee` - Get employee dashboard data (requires auth)

### Health Check

- `GET /health` - Server health check

## 📝 Request/Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // For validation errors
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Access tokens (15min) and Refresh tokens (7days)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **CORS**: Configurable origin
- **Input Validation**: express-validator on all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: Input sanitization and validation
- **Role-Based Access Control**: Strict permission enforcement

## 🧪 Testing

### Sample Test Data (from seed)

After running `npm run db:seed`, you can use these credentials:

- **Admin**: `admin@dayflow.com` / `Password123!`
- **HR**: `hr@dayflow.com` / `Password123!`
- **Employee**: `john.doe@dayflow.com` / `Password123!`
- **Employee**: `jane.smith@dayflow.com` / `Password123!`

### Example API Request

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@dayflow.com",
    "password": "Password123!"
  }'

# Get profile (replace TOKEN with access token from login)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Database Schema

### Models

- **User**: Employee information, authentication
- **Attendance**: Check-in/check-out records
- **LeaveRequest**: Leave applications and approvals
- **Payroll**: Salary and payroll information
- **ActivityLog**: Audit trail for all actions

See `prisma/schema.prisma` for detailed schema.

## 🔄 Workflows

### Employee Workflow

1. Register/Login
2. View own profile
3. Update limited profile fields (phone, address, profile image)
4. Check in/out for attendance
5. View own attendance history
6. Apply for leave
7. Track leave status
8. View own payroll

### Admin/HR Workflow

1. Login
2. View employee directory
3. Create/edit employees
4. View all attendance
5. Approve/reject leave requests
6. Manage payroll
7. View activity logs
8. Access dashboard insights

## 🛡️ Validation Rules

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Leave Request Validation

- End date must be after start date
- No overlapping leave requests
- Reason must be 10-1000 characters

### Other Validations

- Email must be valid and unique
- Employee ID must be unique
- Phone number format validation
- Date format validation (ISO 8601)

## 📈 Activity Logging

All significant actions are logged in the `ActivityLog` table, including:

- User creation/updates
- Login/logout
- Attendance check-in/out
- Leave request creation/approval/rejection
- Payroll creation/updates

This provides a complete audit trail for compliance and security.

## 🚀 Production Deployment

Before deploying to production:

1. **Change JWT secrets** to strong, random strings
2. **Set NODE_ENV=production**
3. **Use environment-specific DATABASE_URL**
4. **Configure CORS_ORIGIN** to your frontend domain
5. **Set up SSL/TLS** (HTTPS)
6. **Configure database backups**
7. **Set up monitoring and logging**
8. **Review rate limiting settings**
9. **Enable database connection pooling**
10. **Set up CI/CD pipeline**

## 📚 Additional Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (Database GUI)
npm run db:studio

# Seed database
npm run db:seed

# Start production server
npm start

# Start development server (with nodemon)
npm run dev
```

## 🤝 Contributing

This is a production-ready backend API. When extending:

1. Follow the existing architecture patterns
2. Add validation for all inputs
3. Implement role-based access control
4. Add activity logging for admin actions
5. Write proper error handling
6. Update this README with new endpoints

## 📄 License

This project is part of the Dayflow HRMS system.

---

**Built with ❤️ for Dayflow HRMS**

