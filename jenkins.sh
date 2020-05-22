if [ $COVID_ENV_DIRECTORY ]; then
  echo "building image for the $COVID_ENV_DIRECTORY instance"
  cp ./credentials/$COVID_ENV_DIRECTORY/.env .env
fi

/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose down --volumes
/usr/local/bin/docker-compose run --entrypoint ./build.sh covid-ui
/usr/local/bin/docker-compose build image
/usr/local/bin/docker-compose down --volumes

if [ $COVID_ENV_DIRECTORY == "covid-ref" ]; then
  echo "pushing image for reference instance"
  docker tag openlmis/covid-ui:latest openlmis/covid-ui:${version}
  docker push openlmis/covid-ui:${version}
else
  echo "pushing image for production instance"
  docker tag openlmis/covid-ui:latest openlmis/${COVID_ENV_DIRECTORY}-ui:${version}
  docker push openlmis/${COVID_ENV_DIRECTORY}-ui:${version}
fi

rm -Rf ./credentials
rm -f .env