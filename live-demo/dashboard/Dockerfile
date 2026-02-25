FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Development mode (with hot reload)
EXPOSE 3000

CMD ["npm", "run", "dev"]
