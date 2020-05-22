if [ $COVID_ENV_DIRECTORY ]; then
  echo "building image for production instance"
  cp ./credentials/{$COVID_ENV_DIRECTORY}/.env .env
else
  echo "building image for reference instance"
  cp ./credentials/covid-ref/.env .env
fi

/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose down --volumes
/usr/local/bin/docker-compose run --entrypoint ./build.sh covid-ui
/usr/local/bin/docker-compose build image
/usr/local/bin/docker-compose down --volumes

if [ $COVID_ENV_DIRECTORY ]; then
  echo "pushing image for production instance"
  docker tag openlmis/covid-ui:latest openlmis/covid-production-ui:${version}
  docker push openlmis/covid-production-ui:${version}
else
  echo "pushing image for reference instance"
  docker tag openlmis/covid-ui:latest openlmis/covid-ui:${version}
  docker push openlmis/covid-ui:${version}
fi

rm -Rf ./credentials
rm -f .env