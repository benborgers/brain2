FROM node:16
ARG DATABASE_URL
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
