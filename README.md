Please go to [wiki page](https://github.com/xebia-france/xwhois/wiki).

### Overview ###

--


### Technical stack ###

- templates : Jade (http://jade-lang.com/)
- styles : Sass (http://sass-lang.com/), Bourbon (Neat, Bitters) (http://bourbon.io/)
- mvw fmk : AngularJs (https://angularjs.org/)
- routes : ngRouteSegment (http://angular-route-segment.com/)
- build : coffee (http://coffeescript.org/), gulp (http://gulpjs.com/)
- tests : Jasmine (http://jasmine.github.io/), Karma (http://karma-runner.github.io/0.12/index.html), Chai (http://chaijs.com/), Mocha
- database: MongoDB


### Launch ###

    $ npm install
    $ npm install --global gulp
    
    # if OSX
    $ docker-machine create --driver virtualbox xwhois
    # or if already created
    $ docker-machine start xwhois
    $ eval "$(docker-machine env xwhois)
    # endif OSX
    
    $ docker run --name=xwhois-mongo --detach --publish=27017:27017 mongo
    
    # synchronize with confluence at startup
    $ gulp && CONFLUENCE=true CONFLUENCE_HOSTNAME=<hostname> CONFLUENCE_USER=<user> CONFLUENCE_PASSWORD=<password> CONFLUENCE_RESOURCE_ID=<trombinoscipePageId> MONGODB_URI=mongodb://$(docker-machine ip xwhois)/xwhois node server.js
    
    # or
    
    # use test dataset
    $ gulp && TESTDB=true MONGODB_URI=mongodb://$(docker-machine ip xwhois)/xwhois-test node server.js
    
    # or
    
    # use existing database
    $ gulp && MONGODB_URI=mongodb://$(docker-machine ip xwhois)/xwhois node server.js

Then go to [http://localhost:8081](http://localhost:8081)


### Connect to database ###

    $ docker run --interactive --tty --link xwhois-mongo:mongo --rm mongo sh -c 'exec mongo "$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/xwhois-test"'

### Tests ###

```
$ gulp test
$ MONGODB_URI=mongodb://$(docker-machine ip xwhois)/xwhois-test gulp test:mocha
```

For tests driven development :

```
$ gulp test:loop
```


### Routes ###

File 'src/app/conf/routes.yml' contains all routes.

Each root route contains one template that will be injected in the '<... app-view-segment="0">' dom element.
Each sub-route template will be injected in a 'app-view-segment="1"' dom element found in the root template.
Etc.
