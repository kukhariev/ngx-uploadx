/**
 * Create and build a demo application using the specified version/tag of the Angular CLI
 */
const { execSync } = require('child_process');
const copy = require('recursive-copy');
const semver = require('semver');
const { writeFileSync, copyFileSync, mkdirSync, readFileSync } = require('fs');
const { join, resolve } = require('path');

const tmpDir = join(require('os').tmpdir(), 'ngx-uploadx-build');
const baseDir = resolve(`${__dirname}/..`);
const integrationsPath = resolve(baseDir, 'integrations');
process.env.NG_DISABLE_VERSION_CHECK = 'true';
process.env.NG_CLI_ANALYTICS = 'false';

const cleanup = directory => new Promise(resolve => require('rimraf')(directory, resolve));

/**
 * Create and build a demo application using the specified version/tag of the Angular CLI
 * @param cliTag Angular CLI version/tag to use.
 * Default: `latest`
 * @returns { Promise<void> }
 */
async function build(cliTag = 'latest') {
  const projectName = (Number.isInteger(+cliTag[0]) ? `ng${cliTag}` : cliTag).replace(/\./, '');
  const projectPath = join(integrationsPath, projectName);
  const ngNewCmd = `npx ng new ${projectName} --strict --style=scss --skip-install --skip-git --routing --standalone=false`;
  const buildCmd = 'npx ng build --configuration production';

  console.info(`- Angular CLI tag: ${cliTag}`);
  console.info(`- Project path: ${projectPath}`);

  console.info('- Prepare...');
  mkdirSync(tmpDir, { recursive: true });
  await cleanup(`${tmpDir}/${projectName}`);
  await cleanup(projectPath);

  console.info('- Generating project...');
  execSync(`npx -p @angular/cli@${cliTag} ${ngNewCmd}`, { cwd: tmpDir });
  await copy(`${tmpDir}/${projectName}`, `${projectPath}`, { overwrite: true });

  const pack = JSON.parse(readFileSync(`${projectPath}/package.json`, 'utf8').toString());
  const angularVersion = semver.minVersion(pack.dependencies['@angular/core']);
  const angularCLIVersion = semver.minVersion(pack.devDependencies['@angular/cli']);
  console.info(`- Versions: @angular/core: ${angularVersion}, @angular/cli: ${angularCLIVersion}`);

  await copy('src/app', `${projectPath}/src/app`, { overwrite: true });
  copyFileSync('src/styles.scss', `${projectPath}/src/styles.scss`);
  writeFileSync(`${projectPath}/server.js`, `require('../../server')\n`);
  await copy('e2e', `${projectPath}/e2e`, { overwrite: true });
  await copy('src/environments', `${projectPath}/src/environments`, { overwrite: true });
  await copy('src/assets', `${projectPath}/src/assets`, { overwrite: true });

  console.info('- Installing dependencies...');
  execSync('npm install', { cwd: projectPath, stdio: [0, 1, 2] });
  await copy('dist/uploadx', `${projectPath}/node_modules/ngx-uploadx`, { overwrite: true });

  console.info('- Migrate project...');
  process.chdir(projectPath);
  const ngUpdateCmd = `npx ng update @angular/core --allow-dirty --migrate-only=true --from=14 --to=${angularVersion}`;
  execSync(ngUpdateCmd, { cwd: projectPath, stdio: [0, 1, 2] });

  console.info(`- Running "${buildCmd}" for "${projectPath}"`);
  execSync(buildCmd, { cwd: projectPath, stdio: [0, 1, 2] });
}

async function processing() {
  const args = process.argv.slice(2);
  const cmd = args[0].trim();
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
