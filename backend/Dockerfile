FROM node:20-alpine

WORKDIR /app

# Install Prisma CLI globally for migrations
RUN npm install -g prisma

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code (but exclude node_modules)
COPY . .

# Generate Prisma Client after copying code
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Install netcat and OpenSSL compatibility for Prisma
RUN apk add --no-cache netcat-openbsd openssl-dev

# Start the application with wait script
CMD ["sh", "-c", "echo 'Waiting for database...' && until nc -z postgres 5432; do echo 'Waiting for postgres...'; sleep 2; done && echo 'Database is ready!' && npm run dev"]

