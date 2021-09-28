// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

const chromeArgs = process.env.CI ? ['--headless'] : [];
chromeDriver =
  process.env.CI && process.env.CHROMEWEBDRIVER
    ? process.env.CHROMEWEBDRIVER + '/chromedriver'
    : '';

exports.config = {
  allScriptsTimeout: 60000,
  specs: ['./**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: chromeArgs
    }
  },
  chromeDriver,
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 15000,
    print: function () {}
  },

  beforeLaunch: () => {
    require('../server');
  },

  onPrepare: () => {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine
      .getEnv()
      .addReporter(new SpecReporter({ spec: { displayStacktrace: StacktraceOption.PRETTY } }));
  }
};
