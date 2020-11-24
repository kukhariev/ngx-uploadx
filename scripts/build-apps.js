//@ts-check
const { execSync } = require('child_process');
const { copySync } = require('cpx');
const { writeFileSync, copyFileSync, promises } = require('fs');
const { join, resolve } = require('path');

const rootDir = resolve(`${__dirname}/..`);
const integrationsPath = resolve(rootDir, `integrations`);

const buildCmd = 'ng build --prod';

function buildProject(path = rootDir) {
  console.info(`- Building project "${path}"...`);
  execSync(buildCmd, { cwd: path, stdio: [0, 1, 2] });
  console.info(`√ Building project complete.\n`);
}

/**
 * @param {string} path
 */
function prepareProject(path) {
  console.info('- Copying project files...');
  copySync('src/app/**/*', `${path}/src/app`, { clean: true });
  copyFileSync('src/styles.scss', `${path}/src/styles.scss`);
  writeFileSync(
    `${path}/src/app/package.json`,
    JSON.stringify({ sideEffects: false, name: path, private: true }, undefined, 2)
  );
  copySync('e2e/**/*', `${path}/e2e`, { clean: true });
  copySync('src/environments/**/*', `${path}/src/environments`, { clean: true });
  console.info('√ Copying project files complete.\n');
  console.info('- Installing dependencies...');
  execSync('npm install', { cwd: path, stdio: [0, 1, 2] });
  copySync('dist/uploadx/**/*', `${path}/node_modules/ngx-uploadx`, { clean: true });
  console.info('√ Installing dependencies complete.\n');
}

async function scanProjects() {
  const projects = [];
  const dir = await promises.opendir(integrationsPath);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      const project = join(integrationsPath, dirent.name);
      try {
        const pack = JSON.parse(await promises.readFile(`${project}/package.json`, 'utf8'));
        const angularVersion = pack.dependencies['@angular/core'];
        const angularCLIVersion = pack.devDependencies['@angular/cli'];
        const isValid = angularVersion && angularCLIVersion && project;
        isValid && console.info(`Found project: ${project}`);
        isValid && projects.push(project);
      } catch {}
    }
  }
  return projects;
}

async function processing() {
  let exitCode = 0;
  try {
    buildProject();

    const projects = await scanProjects();
    for (const project of projects) {
      try {
        prepareProject(project);
        buildProject(project);
      } catch (e) {
        console.error(e);
        exitCode = exitCode || 1;
      }
    }
  } catch (e) {
    console.error(e);
    exitCode = exitCode || 1;
  }

  process.exit(exitCode);
}

(async () => await processing())();
