.PHONY: up down logs restart build clean

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f backend

# Restart services
restart:
	docker-compose restart

# Build and start
build:
	docker-compose up -d --build

# Stop and remove volumes (fresh start)
clean:
	docker-compose down -v

# Full reset
reset: clean build

# Access backend container
shell:
	docker exec -it dayflow-backend sh

# Access database
db:
	docker exec -it dayflow-postgres psql -U postgres -d dayflow_db

# Run Prisma Studio
studio:
	docker exec -it dayflow-backend npx prisma studio

# View status
status:
	docker-compose ps

