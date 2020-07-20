// import { htmlInsertAsset } from './utils/html-insert-asset'
// import { options } from 'yargs';

import { build } from './build';

// const { e } = options({
//   entry: { type: 'string', alias: 'e', demandOption: true },
//   index: { type: 'string', alias: 'i', demandOption: true },
// }).argv;

console.log(`

${process.argv.slice(2).join('\n')}

`);

export async function main(): Promise<void> {
  await build('apps/components-e2e/src/main.prod.mjs');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
