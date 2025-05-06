// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  const browsers = [];
  if (process.env.CHROME_BIN) {
    browsers.push('ChromeHeadless');
  } else if (process.env.CHROMIUM_BIN) {
    browsers.push('ChromiumHeadless');
  }
  if (browsers.length === 0) {
    if (process.platform === 'win32') {
      browsers.push('EdgeHeadless');
    } else {
      browsers.push('ChromiumHeadless');
    }
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      sourceMapSupport: true
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: { level: 'info' },
    autoWatch: true,
    browsers: browsers,
    singleRun: true,
    restartOnFileChange: true
  });
};
