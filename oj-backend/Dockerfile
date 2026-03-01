FROM node:lts-alpine

RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate

RUN npx tsc                

EXPOSE 5000

CMD ["npm", "run", "dev"]