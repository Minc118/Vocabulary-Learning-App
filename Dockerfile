FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Vite env vars must be available at build/dev startup time
ARG VITE_API_BASE_URL=http://localhost:5001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
