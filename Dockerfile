FROM sbvr/node

COPY ./ /home/app/
WORKDIR /home/app/

ENTRYPOINT [ "yarn", "node", "./dist/vue-i18n-phrase.umd.js" ]
