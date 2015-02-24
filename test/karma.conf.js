'use strict';

module.exports = function (config) {

    config.set({
        basePath: '../',
        files: [],
        preprocessors: {
            // 'test/unit/**/*.coffee': 'coffee',
            'src/!(vendors)/**/*.js': 'coverage'
        },
        autoWatch: true,
        colors: true,
        logLevel: config.LOG_INFO,
        frameworks: ['mocha', 'sinon-chai', 'chai'],
        browsers: ['PhantomJS'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-junit-reporter',
            'karma-chai',
            'karma-sinon-chai',
            'karma-spec-reporter',
            'karma-coffee-preprocessor',
            'karma-coverage'
        ],
        // Junit test report for Jenkins
        singleRun: true,
        reporters: ['dots', 'junit', 'spec', 'coverage'],
        junitReporter: {
            outputFile: './logs/test-results.xml'
        },
        coverageReporter: {
            type: 'cobertura',
            dir: './logs/coverage',
            reporters: [
                {type: 'lcov', subdir: '.'}
            ]
        }
    });

};
