# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --production=false
COPY server/ ./
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine
WORKDIR /app

# Server runtime deps
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built assets
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Serve frontend as static files from the server
RUN mkdir -p data

EXPOSE 4000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/kanban.db
ENV CORS_ORIGIN=http://localhost:4000

CMD ["node", "server/dist/index.js"]
