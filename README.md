# understanding-graphql
Code and slides from Understanding GraphQL talk

To start up

Have a docker container running couchbase with a bucket called default

`docker run -d --hostname cb-db -p 8091-8094:8091-8094 -p 11210:11210 --name cb-db couchbase:latest`

Navigate to http://localhost:8091/ and setup your couchbase server with the default bucket

Install the dependencies for node

`npm install`

Start up the application

`npm run dev`
