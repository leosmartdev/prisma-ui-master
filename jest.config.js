// For running tests and getting coverage, ignore these locations.
const ignoredPatterns = [
  '/dist/',
  '/build/',
  '/node_modules/',
  '<rootDir>/node_modules/',
  'bundle.js',
  'bundle.js.map',
];

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './test/setupEnzyme.js',
    './packages/prisma-map/test/setup.js',
    './packages/prisma-electron/test/setup.js',
  ],
  testPathIgnorePatterns: ignoredPatterns,
  coveragePathIgnorePatterns: [
    ...ignoredPatterns,
    '/prisma-electron/src/components/',
    '/prisma-electron/src/resources/',
  ],
  collectCoverageFrom: [
    '<rootDir>/packages/prisma-electron/src/**/*.{js,jsx}',
    '<rootDir>/packages/prisma-map/src/**/*.{js,jsx}',
    '<rootDir>/packages/prisma-ui/src/**/*.{js,jsx}',
  ],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/test/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/test/fileMock.js',
  },
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 45,
      functions: 50,
      lines: 50,
    },
    './packages/prisma-electron/src/': {
      statements: 15,
      branches: 10,
      functions: 15,
      lines: 15,
    },
    /*
    './packages/prisma-electron/src/components': {
      statements: 3,
      branches: 3,
      functions: 1,
      lines: 3,
    },
    */
    './packages/prisma-map/src/': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    './packages/prisma-ui/src/': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
