#!/bin/sh
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

function deploy(){
  yarn build
  yarn npm publish
  docker build -t spittal/vue-i18n-phrase:latest -t spittal/vue-i18n-phrase:$PACKAGE_VERSION .
  docker push spittal/vue-i18n-phrase:latest
  docker push spittal/vue-i18n-phrase:$PACKAGE_VERSION

  yarn build:function
  docker build -t spittal/vue-i18n-phrase-function:latest -t spittal/vue-i18n-phrase-function:$PACKAGE_VERSION -f Dockerfile.function .
  docker push spittal/vue-i18n-phrase-function:latest
  docker push spittal/vue-i18n-phrase-function:$PACKAGE_VERSION

  docker tag spittal/vue-i18n-phrase-function:latest gcr.io/springboardvr/vue-i18n-phrase:latest
  docker tag spittal/vue-i18n-phrase-function:$PACKAGE_VERSION gcr.io/springboardvr/vue-i18n-phrase:$PACKAGE_VERSION
  docker push gcr.io/springboardvr/vue-i18n-phrase:latest
  docker push gcr.io/springboardvr/vue-i18n-phrase:$PACKAGE_VERSION

  git tag $PACKAGE_VERSION
  git push origin $PACKAGE_VERSION
}

while true; do
    read -p "Have You Updated the version package? If not you can use yarn version [patch|minor|major] It is currently $PACKAGE_VERSION (y/n)" yn
    case $yn in
        [Yy]* ) deploy; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
