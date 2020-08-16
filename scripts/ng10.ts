import * as cpx from 'cpx';
import { promises as fsp } from 'fs';

(async () => {
  try {
    await fsp.copyFile('src/styles.scss', 'integrations/ng10/src/styles.scss');
    cpx.copySync('src/app/**/*', 'integrations/ng10/src/app', { preserve: true, clean: true });
    cpx.copySync('e2e/**/*', 'integrations/ng10/e2e', { preserve: true, clean: true });
    await fsp.writeFile(
      'integrations/ng10/src/app/package.json',
      JSON.stringify({ sideEffect: false }, undefined, 2)
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
