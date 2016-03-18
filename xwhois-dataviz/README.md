A web server ready to deliver stats on top of xwhois.

Needs some environment variables to be defined in order to start properly :

 - `DATABASE_HOST`
 - `DATABASE_USER`
 - `DATABASE_PASSWORD`
 - `PORT`

### Deploy ###

First time

    $ heroku apps:create --remote heroku-dataviz xwhois-dataviz --region eu
    $ mkdir -p ../.heroku-deploy/xwhois-dataviz
    $ cd ../.heroku-deploy/xwhois-dataviz
    $ git init
    $ heroku git:remote --app xwhois-dataviz
    $ heroku config:set "DATABASE_USER=${DATABASE_USER}"
    $ heroku config:set "DATABASE_HOST=${DATABASE_HOST}"
    $ heroku config:set "DATABASE_PASSWORD=${DATABASE_PASSWORD}"
    $ cd -
    
For each deploy

    $ cp -R src/ pom.xml Procfile ../.heroku-deploy/xwhois-dataviz
    $ cd ../.heroku-deploy/xwhois-dataviz
    $ git add .
    $ git commit --message "release" && git push heroku master
    $ cd -
