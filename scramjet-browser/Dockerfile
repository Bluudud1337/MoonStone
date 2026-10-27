FROM node:20-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY public ./public
COPY src ./src

EXPOSE 8080
CMD ["npm", "start"]
