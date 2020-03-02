import { promises as fsp } from 'fs';
import { build } from 'ng-packagr';

(async () => {
  try {
    const rootPackage = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    const libPackage: any = {};
    libPackage.name = rootPackage.name;
    libPackage.version = rootPackage.version;
    libPackage.description = rootPackage.description;
    libPackage.keywords = rootPackage.keywords;
    libPackage.author = rootPackage.author;
    libPackage.repository = rootPackage.repository;
    libPackage.homepage = rootPackage.homepage;
    libPackage.license = rootPackage.license;
    libPackage.peerDependencies = rootPackage.peerDependencies;
    libPackage.ngPackage = {
      lib: {
        entryFile: 'public-api.ts'
      },
      dest: '../../dist/uploadx',
      deleteDestPath: true
    };
    await fsp.writeFile('src/uploadx/package.json', JSON.stringify(libPackage, undefined, 2));
    await build({ project: 'src/uploadx/package.json' });
    await fsp.copyFile('LICENSE', 'dist/uploadx/LICENSE');
    await fsp.copyFile('README.md', 'dist/uploadx/README.md');
    await fsp.unlink('src/uploadx/package.json');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
