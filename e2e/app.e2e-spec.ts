import { AppPage, getTestFile } from './app.po';
const page = new AppPage();

const file = getTestFile();

fixture`app`.page(`${page.baseUrl}`).afterEach(async t => {
  await t.click(page.cancelAll);
});

test('should upload /directive-way', async t => {
  await t
    .navigateTo('/directive-way')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /service-way', async t => {
  await t
    .navigateTo('/service-way')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /service-code-way', async t => {
  await t
    .navigateTo('/service-code-way')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /on-push', async t => {
  await t
    .navigateTo('/on-push')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /multi', async t => {
  await t
    .navigateTo('/multi')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /multi2', async t => {
  await t
    .navigateTo('/multi2')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});

test('should upload /tus', async t => {
  await t
    .navigateTo('/tus')
    .setFilesToUpload(page.fileInput, file)
    .expect(page.table.innerText)
    .contains('complete');
});
