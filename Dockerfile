FROM sbvr/node

COPY ./ /home/app/
WORKDIR /home/app/

ENTRYPOINT [ "yarn", "node", "./bin/vue-i18n-phrase.js" ]
