//@ts-check
const { execSync } = require('child_process');
const { copySync } = require('cpx');
const { writeFileSync, copyFileSync } = require('fs');

try {
  execSync('npm install', { cwd: 'integrations/ng10', stdio: [0, 1, 2] });
  copyFileSync('src/styles.scss', 'integrations/ng10/src/styles.scss');
  copySync('src/app/**/*', 'integrations/ng10/src/app', { clean: true });
  copySync('e2e/**/*', 'integrations/ng10/e2e', { clean: true });
  copySync('src/environments/**/*', 'integrations/ng10/src/environments', { clean: true });
  copySync('dist/uploadx/**/*', 'integrations/ng10/node_modules/ngx-uploadx', { clean: true });
  writeFileSync(
    'integrations/ng10/src/app/package.json',
    JSON.stringify({ sideEffects: false, name: 'ng10', private: true }, undefined, 2)
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}
