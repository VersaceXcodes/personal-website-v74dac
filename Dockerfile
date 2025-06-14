FROM node:20-slim

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY vitereact/package*.json ./vitereact/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --production
RUN cd vitereact && npm install --legacy-peer-deps --production
RUN cd backend && npm install --production

# Copy app source
COPY . .

# Build frontend
RUN cd vitereact && npm run build

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "backend/server.js"]