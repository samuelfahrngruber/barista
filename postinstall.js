// This script will be executed on npm postinstall and is a
// migration script for the phase where we support building with bazel
// and without.
const { exec } = require('child_process');
const { resolve } = require('path');
const { sync } = require('glob');
const { writeFileSync, readFileSync } = require('fs');

const NGCC_BINARY = resolve('./node_modules/.bin/ngcc');
const NGC_BINARY = resolve('./node_modules/.bin/ngc');

async function main() {
  // Applying all the patches to the packages
  await execCommand(`node ${require.resolve('patch-package')}`);
  // when running with bazel we need to perform a ngcc to compile
  // all dependencies for ivy. If we are not run by bazel just build
  // the workspace library. With bazel this is already in the build cache.

  // Generate Angular ngfactory.js, ngsummary.js files for the dependencies,
  // that are needed for ViewEngine
  await execCommand(`${NGC_BINARY} -p view-engine-tsconfig.json`);
  // Generate Ivy entry points
  await execCommand(NGCC_BINARY);

  if (!process.env.BAZEL_NPM_INSTALL) {
    await execCommand(`npm run ng build workspace`);
  }
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      const output = stdout ? stdout : stderr;
      console.log(output);
      resolve(output);
    });
  });
}


main()
  .then(() => {
    console.log('✅ Successfully run postinstall script!');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
