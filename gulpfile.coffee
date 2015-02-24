'use strict';


# use dependencies

gulp = require 'gulp'
$ = do require 'gulp-load-plugins'
$.if = require 'gulp-if-else'
rm = require 'del'
sequence = require 'run-sequence'
karma = (require 'karma').server
css =
    minify: (require 'gulp-minify-css')
    compile: $.sass
ng =
    annotate: (require 'gulp-ng-annotate')
    templates: (require 'gulp-ng-templates')
    configuration: (require 'gulp-ng-config')
bowerFiles = require 'main-bower-files'
browserSync = require 'browser-sync'
{ reload } = browserSync


# more gulp files

(require 'require-dir') './gulp';


# global variables

args =
    env: if $.util.env.mode? then $.util.env.mode else 'development'
    compressed: $.util.env.mode is 'production'
    debug: $.util.env.debug?
paths =
    bower: 'src/vendors/bower_components'
    web: 'src/app'
    conf: 'src/conf'
    build: 'build'
    exploded: 'build/exploded'
    test: 'test'


# shortcuts / helpers

from = -> gulp.src arguments...
to = -> gulp.dest arguments...
watch = -> gulp.watch arguments...
task = -> gulp.task arguments...
log = -> $.util.log arguments...


# some prints

log 'Build in ' + $.util.colors.red(args.env) + ' mode.'
log 'Debug is ' + $.util.colors.red(if args.debug then 'enabled' else 'disabled') + '.'
log 'Paths are :\n', paths


# preprocessing tasks

task 'compile:sass', [], ->
    from [
        paths.web + '/styles/style.scss'
    ]
    .pipe do $.sourcemaps.init
    .pipe css.compile
        errLogToConsole: args.debug
        includePaths: [
            paths.bower + '/bourbon/dist'
            paths.bower + '/neat/app/assets/stylesheets'
            paths.web + '/**/*.scss'
        ]
    .pipe $.if !args.compressed, -> $.sourcemaps.write debug: args.debug
    .pipe $.concat 'styles.css'
    .pipe $.if args.compressed, css.minify
    .pipe $.size title: 'styles'
    .pipe to paths.build
    .pipe reload stream: true


# build tasks

task 'build:statics-root-files', ->
    from [
        paths.web + '/*.html'
        paths.web + '/*.ico'
    ]
    .pipe to paths.build

task 'build:statics', (cb) ->
    sequence ['build:statics-root-files'], cb

task 'build:vendors', [], ->
    vendorsFiles = do bowerFiles
    log vendorsFiles if args.debug
    from vendorsFiles
    .pipe $.filter '**/*.js'
    .pipe $.concat 'vendors.js'
    .pipe $.if args.compressed, $.uglify
    .pipe $.size title: 'vendors'
    .pipe to paths.build + '/libs'

task 'build:ng-conf', [], ->
    from [
        "#{ paths.conf }/#{ args.env }.yml"
        "#{ paths.conf }/!(development|production).yml"
    ]
    .pipe do $.yaml
    .pipe $.extend 'conf.json'
    .pipe ng.configuration 'app.conf'
    .pipe $.rename basename: 'conf'
    .pipe $.size title: 'ng-conf'
    .pipe to paths.exploded

task 'build:ng-templates', [], ->
    jadeFilter = $.filter '**/*.jade'
    from [
        "#{ paths.web }/**/*.html"
        "#{ paths.web }/**/*.jade"
    ]
    .pipe jadeFilter
    .pipe $.jade pretty: true
    .pipe do jadeFilter.restore
    .pipe ng.templates filename: 'templates.js', module: 'app.templates', standalone: true
    .pipe $.if args.compressed, $.uglify
    .pipe $.size title: 'ng-templates'
    .pipe to paths.exploded

task 'build:ng-app', [], ->
    from paths.web + '/**/*.js'
    .pipe do ng.annotate
    .pipe $.concat 'app.js'
    .pipe $.if args.compressed, $.uglify
    .pipe $.if args.compressed, $.obfuscate
    .pipe $.size title: 'ng-app'
    .pipe to paths.exploded

task 'build:ng', (cb) ->
    sequence ['build:ng-conf', 'build:ng-templates', 'build:ng-app'], cb


# dev helpers tasks

task 'hints:html', ->
    from paths.web + '/*.html'
    .pipe reload stream: true, once: true
    .pipe do $.htmlhint
    .pipe do $.htmlhint.reporter

task 'hints:js', ->
    from paths.web + '/**/*.js'
    .pipe reload stream: true, once: true
    .pipe $.jshint '.jshintrc'
    .pipe $.jshint.reporter 'jshint-stylish'
    .pipe $.if !browserSync.active, -> $.jshint.reporter 'fail'


# packaging tasks

task 'package:ng', [], ->
    from paths.exploded + '/*.js'
    .pipe $.concat 'app.final.js'
    .pipe to paths.build


# clean tasks

task 'clean', ['clean:before-build'], (cb) ->
    rm [
        '*.log', 'logs'
    ], cb

task 'clean:before-build', (cb) ->
    rm [
        'build'
    ], cb

task 'clean:after-build', ->
    rm paths.exploded if args.compressed
    #  rm [
    #    paths.build + '/app.js'
    #    paths.build + '/templates.js'
    #    paths.build + '/conf.js'
    #  ], cb
    do $.util.beep


# tests tasks

task 'test', ['build'], (cb) ->
    karma.start
        configFile: __dirname + '/test/karma.conf.js',
        files: bowerFiles({includeDev: true, filter: /.+\.js/}).concat([
            'build/exploded/conf.js'
            'build/exploded/templates.js'
            'test/unit/**/*.js'
            'src/app/*.js'
            'src/app/**/*.js'
        ]),
        reporters: ['spec', 'junit', 'coverage']
        singleRun: true
    , cb


# development tasks

task 'serve', ['build'], ->
    browserSync {
        server: {baseDir: paths.build}
        port: 4000
        browser: 'default'
        startPath: '/'
        notify: true
        open: false
    }
    watch [
        "#{ paths.web }/**/*.scss"
    ], ['compile:sass', reload]
    watch "#{ paths.web }/*.html", ['build:statics', reload]
    watch [
        "#{ paths.web }/**/*.html"
        "#{ paths.web }/**/*.jade"
    ], ['build:ng-templates', reload]
    watch "#{ paths.web }/**/*.js", ['build:ng-app', reload]
    watch "#{ paths.conf }/*.yml", ['build:ng-conf', reload]
    watch "#{ paths.exploded }/*.js", ['package:ng', reload]


# final build task

task 'build', [], (cb) ->
    sequence 'clean:before-build',
        'compile:sass', ['hints:js', 'hints:html'],
        ['build:statics', 'build:vendors'], 'build:ng', 'package:ng',
        'clean:after-build', cb

task 'default', ['build']
