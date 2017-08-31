function KarmaConf(config) {
  const karmaBaseConfig = {
    frameworks: ['jasmine'],

    basePath: './',

    files: [
      {
        pattern: '../node_modules/angular/angular.js',
        watched: false,
      },
      {
        pattern: '../node_modules/bardjs/dist/bard.js',
        watched: false,
      },
      {
        pattern: '../node_modules/angular-mocks/angular-mocks.js',
        watched: false,
      },
      {
        pattern: '../src/**/*!(.spec).js',
        included: false,
      },
      'dataTable.mock.js',
      './karma.helper.js',
      '../src/**/*.spec.js',
    ],

    excludes: [
      'node_modules',
    ],

    preprocessors: {
      'dataTable.mock.js': ['babel', 'coverage'],
      'karma.helper.js': ['babel', 'coverage'],
      '../src/**/*.spec.js': ['babel', 'coverage'],
    },

    browsers: ['ChromeHeadless'],
    reporters: ['mocha', 'coverage'],
    colors: true,
    singleRun: true,

    coverageReporter: {
      dir: './coverage',
      reporters: [
        {
          type: 'html',
        },
        {
          type: 'text-summary',
        },
        {
          type: 'lcovonly',
        },
        {
          type: 'json',
        },
      ],
    },

    captureTimeout: 60000,
    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 100000,
  };

  config.set(karmaBaseConfig);
}

module.exports = KarmaConf;
