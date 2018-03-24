
const fs = require('fs');
fs.copyFileSync('LICENSE', 'src/uploadx/LICENSE');
fs.copyFileSync('README.md', 'src/uploadx/README.md');
const packageJson = JSON.parse(fs.readFileSync('package.json'));
delete packageJson['devDependencies'];
delete packageJson['scripts'];
delete packageJson['private'];
delete packageJson['dependencies'];
packageJson.peerDependencies = {
  '@angular/core': '^5.0.0',
  '@angular/common': '^5.0.0',
  'rxjs': '^5.5.2'
}
fs.writeFileSync('src/uploadx/package.json', JSON.stringify(packageJson, undefined, 2));
