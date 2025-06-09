# ==== Builder Stage ====
FROM node:22 AS builder
WORKDIR /app

# Install esbuild globally first
RUN npm install -g esbuild

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild esbuild specifically
RUN npm rebuild esbuild

# Copy everything else
COPY . .

# Build the project
RUN npm run build
# RUN ls -l node_modules/.bin && file node_modules/.bin/vite && node_modules/.bin/vite --version

# ==== Production Stage ====
FROM node:22 AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./client/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/index.js"]