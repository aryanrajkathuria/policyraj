FROM node:20-alpine

WORKDIR /app/backend

# Install dependencies first (cached layer unless package.json changes)
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY backend/ ./
COPY website/ ../website/

EXPOSE 3000
CMD ["node", "app.js"]
