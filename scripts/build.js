//@ts-check
const { promises: fsp } = require('fs');
const packagr = require('ng-packagr');

async function buildPkg() {
  try {
    const libPackagePath = 'src/uploadx/package.json';
    const rootPackage = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    const libPackage = {};
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
    await fsp.writeFile(libPackagePath, JSON.stringify(libPackage));
    await packagr
      .ngPackagr()
      .forProject(libPackagePath)
      .withTsConfig('src/uploadx/tsconfig.lib.json')
      .build();
    await fsp.copyFile('LICENSE', 'dist/uploadx/LICENSE');
    await fsp.copyFile('README.md', 'dist/uploadx/README.md');
    await fsp.unlink(libPackagePath);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void buildPkg();
