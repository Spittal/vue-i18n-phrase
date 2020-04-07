FROM node:alpine

RUN npm install -g vue-i18n-phrase
WORKDIR /home/app

ENTRYPOINT [ "vue-i18n-phrase" ]
