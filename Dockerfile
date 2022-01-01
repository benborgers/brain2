FROM node:16
ARG DATABASE_URL
WORKDIR /usr/src/app
COPY package*.json ./
# --unsafe-perm means that postinstall scripts will be executed,
# even though this is a root user. We need this to run Prisma generate.
RUN npm install --unsafe-perm=true
COPY . .
RUN npm run build
CMD ["npm", "start"]
