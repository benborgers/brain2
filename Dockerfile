FROM node:16
ARG DATABASE_URL
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
