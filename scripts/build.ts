import * as util from 'util';
import { build } from 'ng-packagr';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
const copyFile = util.promisify(fs.copyFile);

(async () => {
  rimraf.sync('dist');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
    delete packageJson['devDependencies'];
    delete packageJson['scripts'];
    delete packageJson['private'];
    delete packageJson['dependencies'];
    packageJson.peerDependencies = {
      '@angular/core': '^5.2.0 || ^6.0.0',
      '@angular/common': '^5.2.0 || ^6.0.0',
      rxjs: '^6.0.0'
    };
    fs.writeFileSync(
      'src/uploadx/package.json',
      JSON.stringify(packageJson, undefined, 2)
    );
    await build({ project: 'src/uploadx/package.json' });
    await copyFile('LICENSE', 'dist/uploadx/LICENSE');
    await copyFile('README.md', 'dist/uploadx/README.md');
    try {
      await copyFile('CHANGELOG.md', 'dist/uploadx/CHANGELOG.md');
    } catch (e) {}
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
