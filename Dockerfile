FROM node:alpine

ENV VUE_I18N_PHRASE_VERSION latest

RUN apk add yarn
RUN yarn global add vue-i18n-phrase@$VUE_I18N_PHRASE_VERSION
