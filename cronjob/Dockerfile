FROM ubuntu:latest

RUN apt-get update && apt-get install curl -y

COPY docker-entrypoint.sh ./

RUN chmod a+x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
