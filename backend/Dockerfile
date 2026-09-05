# Use the official Node.js image as the base image
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package and lock files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Install pnpm for script running
RUN npm install -g pnpm

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["pnpm", "start:prod"]
