import { generateElement, htmlInsertAsset } from './html-insert-asset';

const html = `<!DOCTYPE html>
<html>
  <head>
  <meta charset="UTF-8">
  <title>Title</title>
  <base href="/" />
  </head>
  <body>
  <app-root>Loading Application...</app-root>
  </body>
</html>`;

test('should create a plain script tag', () => {
  const script = generateElement('script', [{ src: 'test.js' }, 'nomodule']);
  expect(script).toEqual('<script src="test.js" nomodule></script>');
});

test('should create a plain script tag', () => {
  const scripts = [
    {
      type: 'script',
      dir: '/bundles',
      fileName: 'main-es2015-43021.min.js',
      module: true,
    },
    {
      type: 'script',
      dir: '/bundles/legacy',
      fileName: 'main-es5-26890.min.js',
      module: false,
    },
    {
      type: 'style',
      dir: '/',
      fileName: 'style.css',
    },
  ];
  const script = htmlInsertAsset(html, '/', scripts as any);
  expect(script).toEqual(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
    <base href="/" />
    <link rel="stylesheet" href="style.css" />
  </head>

  <body>
    <app-root>Loading Application...</app-root>

    <script src="bundles/main-es2015-43021.min.js" type="module"></script>
    <script src="bundles/legacy/main-es5-26890.min.js" nomodule defer></script>
  </body>
</html>
`);
});
