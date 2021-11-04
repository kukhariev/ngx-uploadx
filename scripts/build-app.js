/**
 * Create and build a demo application using the specified version/tag of the Angular CLI
 */
const { execSync } = require('child_process');
const { copySync } = require('cpx');
const { writeFileSync, copyFileSync, promises, mkdirSync } = require('fs');
const { join, resolve } = require('path');

const TEMP = join(require('os').tmpdir(), 'ngx-uploadx-build');
const baseDir = resolve(`${__dirname}/..`);
const integrationsPath = resolve(baseDir, `integrations`);
const buildCmd = 'ng build --configuration production';
const ngUpdateCmd = 'ng update @angular/core --allow-dirty --migrateOnly=true --from=12';
const ngNewCmd = projectName =>
  `ng new ${projectName} --style=scss --skipInstall=true --skipGit=true --routing=true`;

const cleanup = directory => new Promise(resolve => require('rimraf')(directory, resolve));

/**
 *  Create and build a demo application using the specified version/tag of the Angular CLI
 * @param cliTag
 * @returns {Promise<void>}
 *
 */
async function build(cliTag = 'latest') {
  const projectName = (Number.isInteger(+cliTag[0]) ? 'ng' + cliTag : cliTag).replace(/\./, '');
  const projectPath = join(integrationsPath, projectName);
  console.info(`- Angular CLI tag: ${cliTag}`);
  console.info(`- Project path: ${projectPath}`);

  console.info('- Prepare...');
  mkdirSync(TEMP, { recursive: true });
  await cleanup(`${TEMP}/${projectName}`);
  await cleanup(projectPath);

  console.info('- Generating project...');
  execSync(`npx -p @angular/cli@${cliTag} ${ngNewCmd(projectName)}`, { cwd: TEMP });
  copySync(`${TEMP}/${projectName}/**/*`, `${projectPath}`, { clean: true });

  const pack = JSON.parse(
    (await promises.readFile(`${projectPath}/package.json`, 'utf8')).toString()
  );
  const angularVersion = pack.dependencies['@angular/core'];
  const angularCLIVersion = pack.devDependencies['@angular/cli'];
  console.info(`- Versions: @angular/core: ${angularVersion}, @angular/cli: ${angularCLIVersion}`);

  copySync('src/app/**/*', `${projectPath}/src/app`, { clean: true });
  copyFileSync('src/styles.scss', `${projectPath}/src/styles.scss`);
  writeFileSync(
    `${projectPath}/src/app/package.json`,
    JSON.stringify({ sideEffects: false, projectName, private: true }, undefined, 2)
  );
  writeFileSync(`${projectPath}/server.js`, `require('../../server')\n`);
  copySync('e2e/**/*', `${projectPath}/e2e`, { clean: true });
  copySync('src/environments/**/*', `${projectPath}/src/environments`, { clean: true });

  console.info('- Installing dependencies...');
  execSync('npm install', { cwd: projectPath, stdio: [0, 1, 2] });
  copySync('dist/uploadx/**/*', `${projectPath}/node_modules/ngx-uploadx`, { clean: true });

  console.info('- Migrate project...');
  execSync(ngUpdateCmd, { cwd: projectPath, stdio: [0, 1, 2] });

  console.info(`- Running "${buildCmd}" for "${projectPath}"`);
  execSync(buildCmd, { cwd: projectPath, stdio: [0, 1, 2] });
}

async function processing() {
  const args = process.argv.slice(2);
  const cmd = args[0] && args[0].trim();
  let exitCode = 0;
  try {
    await build(cmd);
  } catch (e) {
    console.error(e);
    exitCode = 1;
  }
  process.exit(exitCode);
}

if (baseDir !== process.cwd()) process.chdir(baseDir);
(async () => await processing())();
