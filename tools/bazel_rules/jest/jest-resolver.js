const { sync } = require('resolve');
const { readFileSync, existsSync } = require('fs');
const { dirname, resolve, parse } = require('path');
const { generateModuleMappings, resolveModulePath } = require('../utils');

// Get the module mappings out of the module mappings file from bazel
if (!process.env.BAZEL_TEST_MODULE_MAPPING) {
  throw new Error('No bazel test directory provided!');
}

const moduleMappings = generateModuleMappings(
  process.env.BAZEL_TEST_MODULE_MAPPING,
);

/**
 * The jest default resolver function.
 *
 * @callback defaultResolver
 * @param {*} request
 * @param {*} options
 */
/**
 * A Custom resolver for modules and files that is used for bazel jest
 * @param {string} moduleId The moduleId or filepath that should be resolved
 * @param {Object} options
 * @param {string} options.basedir
 * @param {defaultResolver} options.defaultResolver
 * @param {string} options.extensions
 * @param {string} options.moduleDirectory
 * @param {string} options.paths
 * @param {string} options.rootDir
 */
function main(moduleId, options) {
  const { basedir, extensions, moduleDirectory, paths } = options;

  const resolveOpts = {
    basedir,
    extensions,
    moduleDirectory,
    paths,
    preserveSymlinks: true,
  };

  // resolve workspace imports with the bazel module mappings
  if (moduleId.includes('@dynatrace')) {
    const resolved = resolveModulePath(moduleId, moduleMappings);
    // if undefined it might be a published @dynatrace import that has to be resolved
    // via the node_modules with the `sync` operation later on
    if (resolved) {
      return resolved;
    }
  }

  try {
    return sync(moduleId, resolveOpts);
  } catch (e) {
    const parsed = parse(moduleId);
    const directoryNamedId = moduleId + path.sep + parsed.name;
    return resolve.sync(directoryNamedId, resolveOpts);
  }
}

module.exports = main;
