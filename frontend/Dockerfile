FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy application code
COPY . .

# Expose the application port
EXPOSE 5173

# Start the frontend server
CMD ["pnpm", "dev"]
