//@ts-check
const { execSync } = require('child_process');
const { copySync } = require('cpx');
const { writeFileSync, copyFileSync, promises } = require('fs');

async function getProject(dirent) {
  if (dirent.isDirectory()) {
    const project = `integrations/${dirent.name}`;
    try {
      const package = JSON.parse(await promises.readFile(`${project}/package.json`, 'utf8'));
      const angularVersion = package.dependencies['@angular/core'];
      const angularCLIVersion = package.devDependencies['@angular/cli'];
      return angularVersion && angularCLIVersion && project;
    } catch {}
  }
}

async function processing() {
  let exitCode = 0;
  const dir = await promises.opendir('integrations');
  for await (const dirent of dir) {
    const project = await getProject(dirent);
    if (project) {
      console.log(`Found project: ${project}`);
      try {
        console.log('- Copy project files');
        copyFileSync('src/styles.scss', `${project}/src/styles.scss`);
        copySync('src/app/**/*', `${project}/src/app`, { clean: true });
        writeFileSync(
          `${project}/src/app/package.json`,
          JSON.stringify({ sideEffects: false, name: dirent.name, private: true }, undefined, 2)
        );
        copySync('e2e/**/*', `${project}/e2e`, { clean: true });
        copySync('src/environments/**/*', `${project}/src/environments`, { clean: true });
        console.log('- Installing dependencies');
        execSync('npm install', { cwd: project, stdio: [0, 1, 2] });
        copySync('dist/uploadx/**/*', `${project}/node_modules/ngx-uploadx`, { clean: true });
        console.log('- Executing "ng build --prod"');
        execSync('ng build --prod', { cwd: project, stdio: [0, 1, 2] });
      } catch (error) {
        console.error(error);
        exitCode = exitCode || 1;
      }
    }
  }
  process.exit(exitCode);
}

(async () => await processing())();
