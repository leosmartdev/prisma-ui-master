[![codecov](https://codecov.io/gh/orolia/prisma-ui/branch/develop/graph/badge.svg?token=1zTr4LZjo5)](https://codecov.io/gh/orolia/prisma-ui)
[![codebuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiR0dyU1hoaW5XNUxzNm94UVZyQlF6S0F1bk13S2dGUDlQZHp0bytTSjhRbDBkbWlCNzQzTkszRUlWRk5aRUNWZDBZcmh5Rkp2aVNlc29kSTJTWXNBWWVNPSIsIml2UGFyYW1ldGVyU3BlYyI6IlF6VXNrQnN6M2xoZVVmS2IiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop)](https://console.aws.amazon.com/codesuite/codebuild/projects/prisma-ui/history)

# Videos(Working History)
### [video1](https://drive.google.com/file/d/1MMjTgn6YH-ZZTniI_yNu1ZsO8hJYEGlo/view?usp=sharing)
### [video2](https://drive.google.com/file/d/1yksdicc1_cJWhWMZRyYIURxUgm4M5nBj/view?usp=sharing)
### [video3](https://drive.google.com/file/d/1ffQfo4xjf4RFul63KJFHxmytg4hhVmy8/view?usp=sharing)
### [video4](https://drive.google.com/file/d/1p48B5qHpO85jQsRCyDyEN0PZX0O2oZgN/view?usp=sharing)

# PRISMA Clients and Libraries

This repo is a `yarn workspace` repository that contains all the packages and libraries for the PRISMA clients.

The main client is the electron application and can be found in `./packages/prisma-electron`. To build and run the application you can do so in this directory by running `yarn build && yarn start` which will compile all the dependencies, the electron application, then run the electron application. All the original `yarn` scripts can still be run as before after running `yarn build` in this directory then `cd packages/prisma-electron`.

## Packages

The prisma-ui is made up of the following packages. You can get more information about each package, their APIs, storybooks, and other information in the REAMDE for each specific package.

* [prisma-electron](./packages/prisma-electron/README.md): The main electron application and web app.
* [prisma-map](./packages/prisma-map/README.md): The PRISMA map framework build on mapboxgl.
* [prisma-ui](./packages/prisma-ui/README.md): The PRISMA UI framework for common React components and other resuable elements.

## Build

```
yarn install
yarn build
yarn test
yarn start
```

This will install all node_modules packages for all the modules in `packages`, build the libraries and the electron package, run tests, and then start electron.

!!! note
    Running a `yarn install` anywhere inside the repo install packages according to yarn workspace rules. There is no special location you need to run `yarn install`.

yarn build
yarn start:local --ignore-certificate-errors
