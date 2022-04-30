FROM node:lts-alpine3.14

LABEL mantaner="joson.chou@outlook.com"

# 工作目录
WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


VOLUME /usr/app/config /usr/app/storage

EXPOSE 3000

CMD [ "node", "dist/main" ]
