FROM node:lts-alpine3.14

LABEL mantaner="joson.chou@outlook.com"

# 工作目录
WORKDIR /usr/app

COPY package*.json ./

COPY yarn*.lock ./

RUN npm config set registry https://registry.npm.taobao.org && \
    npm config set disturl https://npm.taobao.org/dist && \
    npm config set phantomjs_cdnurl https://npm.taobao.org/mirrors/phantomjs

RUN yarn install

COPY . .

RUN npm run build


VOLUME /usr/app/config /usr/app/storage /usr/app/node_modules /usr/app/src

EXPOSE 3000

CMD [ "node", "dist/main" ]
