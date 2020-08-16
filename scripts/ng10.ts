import * as cpx from 'cpx';
import { promises as fsp } from 'fs';

(async () => {
  try {
    await fsp.copyFile('src/styles.scss', 'integrations/ng10/src/styles.scss');
    cpx.copySync('src/app/**/*', 'integrations/ng10/src/app', { clean: true });
    cpx.copySync('e2e/**/*', 'integrations/ng10/e2e', { clean: true });
    cpx.copySync('src/environments/**/*', 'integrations/ng10/src/environments', { clean: true });
    await fsp.writeFile(
      'integrations/ng10/src/app/package.json',
      JSON.stringify({ sideEffects: false, name: 'ng10', private: true }, undefined, 2)
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
