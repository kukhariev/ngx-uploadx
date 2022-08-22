import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Selector } from 'testcafe';

require('../server');

export class AppPage {
  fileInput = Selector('app-root input').nth(0);
  table = Selector('app-root .uploads-table').nth(0);
  cancelAll = Selector('button').withExactText('Cancel All').nth(0);
  baseUrl = 'http://localhost:4200/';
}

export function getTestFile(): string {
  const filename = join(tmpdir(), 'testfile.mp4');
  const filesize = 64;
  const file = createWriteStream(filename, { flags: 'w' });
  file.write(Buffer.alloc(filesize));
  file.end();

  return filename;
}
