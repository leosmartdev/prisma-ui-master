#!/usr/local/bin/node

/*
 * Ok, so this file is a hack for a few reasons.
 * 1. yarn link isn't working currently with @ scoped packages
 *      https://github.com/yarnpkg/yarn/issues/1297
 * 2. Electron and web are still built at the same time.
 * 3. Electron won't build right in a yarn workspace
 *
 * So basically, I'm creating a new package.json that has the prisma-electron package.json
 * and added to it are the devDependencies from the root workspace package.json and then I
 * modify the paths to the scoped @prisma packages to reference the dist directory
 * for those packages.  eg packages/prisma-map/dist
 *
 * This is also assuming we are building in the build/app directory right now.
 *
 * TODO: This is all probably going to go away when we finally split electron and web.
 */

const fs = require('fs');
const path = require('path');

const prismaUiPackage = require('../../../package.json');
const prismaElectronPackage = require('../package.json');

let newPackage = prismaElectronPackage;
newPackage.devDependencies = {
  ...newPackage.devDependencies,
  ...prismaUiPackage.devDependencies,
};

const prismaMapPath = path.normalize(__dirname + '/../../prisma-map/dist');
const prismaUiPath = path.normalize(__dirname + '/../../prisma-ui/dist');
const packageJsonPath = path.normalize(__dirname + '/../build/app/package.json');

newPackage.dependencies['@prisma/map'] = 'file://' + prismaMapPath;
newPackage.dependencies['@prisma/ui'] = 'file://' + prismaUiPath;

fs.writeFile(packageJsonPath, JSON.stringify(newPackage), function(error) {
  if (error) {
    console.error('ERROR: Failed to write package.json....', error);
  } else {
    console.info('Wrote build/app/package.json');
  }
});
