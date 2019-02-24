import * as util from 'util';
import { build } from 'ng-packagr';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);

(async () => {
  rimraf.sync('dist');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
    delete packageJson['devDependencies'];
    delete packageJson['scripts'];
    delete packageJson['private'];
    delete packageJson['dependencies'];
    packageJson.peerDependencies = {
      '@angular/common': '^6.0.0 || ^7.0.0',
      rxjs: '^6.0.0'
    };
    packageJson.ngPackage = {
      $schema: './node_modules/ng-packagr/ng-package.schema.json',
      lib: {
        entryFile: 'src/public_api.ts'
      },
      dest: '../../dist/uploadx'
    };
    fs.writeFileSync('src/uploadx/package.json', JSON.stringify(packageJson, undefined, 2));
    await build({ project: 'src/uploadx/package.json' });
    await copyFile('LICENSE', 'dist/uploadx/LICENSE');
    await copyFile('README.md', 'dist/uploadx/README.md');
    await unlink('src/uploadx/package.json');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
