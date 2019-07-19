import * as util from 'util';
import { build } from 'ng-packagr';
import * as fs from 'fs';
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

(async () => {
  try {
    const oldPackage = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
    const newPackage: any = {};
    newPackage.name = oldPackage.name;
    newPackage.version = oldPackage.version;
    newPackage.description = oldPackage.description;
    newPackage.keywords = oldPackage.keywords;
    newPackage.author = oldPackage.author;
    newPackage.repository = oldPackage.repository;
    newPackage.homepage = oldPackage.homepage;
    newPackage.license = oldPackage.license;
    newPackage.peerDependencies = oldPackage.peerDependencies;
    newPackage.ngPackage = {
      lib: {
        entryFile: 'src/public_api.ts'
      },
      dest: '../../dist/uploadx',
      deleteDestPath: true
    };
    await writeFile('src/uploadx/package.json', JSON.stringify(newPackage, undefined, 2));
    await build({ project: 'src/uploadx/package.json' });
    await copyFile('LICENSE', 'dist/uploadx/LICENSE');
    await copyFile('README.md', 'dist/uploadx/README.md');
    await unlink('src/uploadx/package.json');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
