# docker build --build-arg VUE_I18N_PHRASE_VERSION=0.3.4 -t spittal/vue-i18n-phrase:latest -t spittal/vue-i18n-phrase:0.3.4 . && docker push spittal/vue-i18n-phrase

FROM node:alpine

ARG VUE_I18N_PHRASE_VERSION=latest

RUN apk add yarn
RUN yarn global add vue-i18n-phrase@$VUE_I18N_PHRASE_VERSION
