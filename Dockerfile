FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

# Run migrate deploy at container startup
CMD sh -c "npx prisma migrate deploy && npm run start"
