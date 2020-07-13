const { readFileSync, existsSync } = require('fs');
const { resolve, dirname, join, extname, relative, sep } = require('path');

/**
 * Turns a file path into a path suitable for browsers, with a / as seperator.
 * @param {string} filePath
 * @returns {string}
 */
function toBrowserPath(filePath) {
  return filePath.replace(new RegExp(sep === '\\' ? '\\\\' : sep, 'g'), '/');
}

/**
 * Generates a module Mapping from bazels moduleMappingsFile.
 * @param {string} moduleMappingFile Bazel generated moduleMappingsFile
 * @returns {Map<string,string>}
 */
function generateModuleMappings(moduleMappingFile) {
  const moduleMappings = new Map();
  const mappings = JSON.parse(readFileSync(moduleMappingFile, 'utf-8'));

  for (const [key, value] of Object.entries(mappings.modules)) {
    // As the paths are an array in the tsConfig use the first one for resolving.
    moduleMappings.set(
      key,
      value
        .find((path) => path.startsWith('bazel-out'))
        .replace(/^bazel-out.+\/bin\//, ''), //replace the bazel out as we want to resolve it in the test.sh.runfiles folder
    );
  }

  return moduleMappings;
}

/**
 * Try to resolve a folder or filename as js file or as barrel file.
 * @param {string} fileName
 * @returns {string}
 */
function resolveModuleFileName(fileName, extension = '.js') {
  const absolutePath = resolve(fileName);

  if (existsSync(`${absolutePath}${extension}`)) {
    return `${absolutePath}${extension}`;
  }

  if (existsSync(`${absolutePath}/index${extension}`)) {
    return `${absolutePath}/index${extension}`;
  }

  // TODO: lukas.holzer find a more elegant solution for getting the module_root
  if (existsSync(`${absolutePath}/src/index${extension}`)) {
    return `${absolutePath}/src/index${extension}`;
  }

  console.log(absolutePath);

  throw new Error(`Could not resolve the modules file: ${fileName}`);
}

/**
 * Try to resolve a moduleId based on the module mappings that are created by bazel
 * @param {string} moduleId The module name that should resolved
 * @param {Map<string,string>} moduleMappings The moduleMappings map the key is the moduleId and the value is the relative path
 */
function resolveModulePath(moduleId, moduleMappings, extension = '.js') {
  // if we have an exact match then try to resolve it with the matching file name
  if (moduleMappings.has(moduleId)) {
    return resolveModuleFileName(moduleMappings.get(moduleId), extension);
  }

  // if it is a deep import into the package for example `@dynatrace/barista-components/button/src/button`
  // then we have to check for the key that starts with the name
  const item = [...moduleMappings.keys()].find((item) =>
    moduleId.startsWith(item),
  );

  if (item) {
    return resolveModuleFileName(
      moduleId.replace(item, moduleMappings.get(item)),
      extension,
    );
  }

  throw new Error(`Cannot resolve the module with the id: ${moduleId}`);
}

module.exports.toBrowserPath = toBrowserPath;
module.exports.generateModuleMappings = generateModuleMappings;
module.exports.resolveModuleFileName = resolveModuleFileName;
module.exports.resolveModulePath = resolveModulePath;
