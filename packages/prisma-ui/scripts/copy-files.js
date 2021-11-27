/* eslint-disable no-console */

import pkg from 'fs-extra';
const { copy, readFile, writeFile } = pkg;
import * as path from 'path'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFile(filename, destinationFilename = null) {
  const dist = path.resolve(__dirname, '../dist/', destinationFilename || path.basename(filename));
  await copy(filename, dist);
  console.log(`Copied ${filename} to ${dist}`);
}

async function copyPackageJson() {
  const packageJson = await readFile(path.resolve(__dirname, '../package.json'), 'utf8');
  const {
    scripts,
    devDependencies,
    files,
    ...packageDataOther
  } = JSON.parse(packageJson);

  const newPackageJson = {
    ...packageDataOther,
    main: './index.js',
    module: './index.es.js',
  };

  const output = path.resolve(__dirname, '../dist/package.json');

  await writeFile(output, JSON.stringify(newPackageJson, null, 2), 'utf8');
  console.log(`Created ${output}`);
}

async function run() {
  try {
    await copyFile('./LICENSE');
    await copyFile('./CHANGELOG.md');
    await copyFile('./README.md');
    await copyFile('./src/index.js', 'index.es.js');
    await copyPackageJson();
  } catch (error) {
    console.error('Copy failed', error);
  }
}

run();