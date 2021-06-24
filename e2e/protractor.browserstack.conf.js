const { SpecReporter } = require('jasmine-spec-reporter');
const browserstack = require('browserstack-local');
const { StacktraceOption } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 180_000,
  specs: ['./**/*.e2e-spec.ts'],
  browserstackUser: process.env.BROWSERSTACK_USERNAME,
  browserstackKey: process.env.BROWSERSTACK_ACCESS_KEY,

  commonCapabilities: {
    projectName: 'ngx-uploadx',
    build: 'browserstack-e2e',
    'browserstack.local': true
  },

  multiCapabilities: [
    {
      browserName: 'Chrome',
      name: 'Chrome'
    },
    {
      browserName: 'Safari',
      browser_version: '14.0',
      name: 'Safari'
    },
    {
      browserName: 'Firefox',
      name: 'Firefox'
    }
  ],

  baseUrl: 'http://localhost:9091/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000,
    print: function () {}
  },
  onPrepare: () => {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine
      .getEnv()
      .addReporter(new SpecReporter({ spec: { displayStacktrace: StacktraceOption.PRETTY } }));
  },

  beforeLaunch: () => {
    require('../server');
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({ key: exports.config.browserstackKey }, error => {
        if (error) {
          return reject(error);
        }
        console.log('√ Started BrowserStackLocal');
        resolve();
      });
    });
  },

  afterLaunch: () =>
    new Promise(resolve => {
      exports.bs_local.stop(() => {
        console.log('√ Stopped BrowserStackLocal');
        resolve();
      });
    })
};

exports.config.multiCapabilities.forEach(caps => {
  for (const i in exports.config.commonCapabilities) {
    caps[i] = caps[i] || exports.config.commonCapabilities[i];
  }
});
