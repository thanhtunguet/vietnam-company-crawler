FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY dist ./dist

ENTRYPOINT [ "/bin/sh" ]
CMD ["yarn", "start:prod"]
