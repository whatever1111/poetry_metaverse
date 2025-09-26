const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

// Resolve to repository root: migration -> scripts -> application -> lugarden_universal -> repo root
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

function getProjectRoot() {
  return PROJECT_ROOT;
}

function resolveFromProjectRoot(...segments) {
  return path.resolve(getProjectRoot(), ...segments);
}

async function ensureDirectoryExists(directoryPath) {
  await fsp.mkdir(directoryPath, { recursive: true });
}

function stripUtf8Bom(text) {
  if (typeof text !== 'string') return text;
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

async function readTextFile(filePath) {
  const content = await fsp.readFile(filePath, { encoding: 'utf8' });
  return stripUtf8Bom(content);
}

async function readJsonFile(filePath) {
  try {
    const text = await readTextFile(filePath);
    return JSON.parse(text);
  } catch (error) {
    const relative = path.relative(getProjectRoot(), filePath);
    const enhancedError = new Error(`Failed to read JSON at ${relative}: ${error.message}`);
    enhancedError.cause = error;
    throw enhancedError;
  }
}

async function listFilesRecursively(directoryPath) {
  const entries = await fsp.readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursively(fullPath);
      }
      return [fullPath];
    })
  );
  return files.flat();
}

async function listFilesByExtensions(directoryPath, extensions) {
  const allFiles = await listFilesRecursively(directoryPath);
  const normalized = extensions.map((ext) => ext.toLowerCase());
  return allFiles.filter((file) => normalized.some((ext) => file.toLowerCase().endsWith(ext)));
}

module.exports = {
  getProjectRoot,
  resolveFromProjectRoot,
  ensureDirectoryExists,
  readTextFile,
  readJsonFile,
  listFilesRecursively,
  listFilesByExtensions,
};



