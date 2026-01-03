# Dayflow HRMS - Docker Setup Guide

This guide will help you set up and run the Dayflow HRMS system using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Start all services (Database + Backend)**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop all services**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (fresh start)**
   ```bash
   docker-compose down -v
   ```

## Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: dayflow_db
- **Username**: postgres
- **Password**: postgres
- **Container**: dayflow-postgres

### Backend API
- **Port**: 5000
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Container**: dayflow-backend

## First Time Setup

When you run `docker-compose up` for the first time:

1. **Database will be created automatically**
2. **Prisma migrations will run automatically**
3. **Database will be seeded with demo users:**
   - Admin: `admin@dayflow.com` / `Password123!`
   - HR: `hr@dayflow.com` / `Password123!`
   - Employee: `john.doe@dayflow.com` / `Password123!`
   - Employee: `jane.smith@dayflow.com` / `Password123!`

## Development Workflow

### View Backend Logs
```bash
docker-compose logs -f backend
```

### View Database Logs
```bash
docker-compose logs -f postgres
```

### Access Backend Container
```bash
docker exec -it dayflow-backend sh
```

### Access Database Container
```bash
docker exec -it dayflow-postgres psql -U postgres -d dayflow_db
```

### Run Prisma Commands
```bash
# Generate Prisma Client
docker exec -it dayflow-backend npx prisma generate

# Run migrations
docker exec -it dayflow-backend npx prisma migrate dev

# Open Prisma Studio
docker exec -it dayflow-backend npx prisma studio
# Then access at http://localhost:5555 (if port is exposed)
```

### Reset Database
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Environment Variables

The environment variables are set in `docker-compose.yml`. To change them:

1. Edit `docker-compose.yml`
2. Restart the services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Troubleshooting

### Backend won't start
1. Check if database is healthy:
   ```bash
   docker-compose ps
   ```
2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

### Database connection errors
1. Ensure PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```
2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Port already in use
If port 5000 or 5432 is already in use:
1. Stop the conflicting service
2. Or change ports in `docker-compose.yml`

### Reset everything
```bash
# Stop and remove everything
docker-compose down -v

# Remove images (optional)
docker-compose rm -f

# Start fresh
docker-compose up -d --build
```

## Production Considerations

For production deployment:

1. **Change JWT secrets** in `docker-compose.yml`
2. **Use environment files** instead of hardcoded values
3. **Set up proper database backups**
4. **Use Docker secrets** for sensitive data
5. **Configure SSL/TLS**
6. **Set up monitoring and logging**

## Next Steps

Once the backend is running:

1. Start the frontend (in a separate terminal):
   ```bash
   cd src
   npm install
   npm run dev
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - API Docs: See `backend/API_DOCUMENTATION.md`

3. Login with demo credentials:
   - Admin: `admin@dayflow.com` / `Password123!`
   - Employee: `john.doe@dayflow.com` / `Password123!`

