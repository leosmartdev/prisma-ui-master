[![Storybook](https://github.com/storybooks/brand/blob/master/badge/badge-storybook.svg)](https://storybook.mcmurdo.io/prisma-electron/nightly)

C2 Client
=========

## Building and Running

### New Build instructions (1.7.0)

Note: Running a `yarn install` anywhere inside the `prisma` directory structure will install packages according to yarn workspace rules. There is no special location you need to run `yarn install`.

```
yarn install
yarn build
yarn start
```

This will install all node_modules packages for all the modules in `packages`, build libraries and the electron package. Start electron.

You only need to run `yarn build` once, when working only in `prisma-electron`, from the top level to build the libraries. After that, you can safely run `yarn build` inside `packages/prisma-electron` and it will be linked to the compiled libraries like `@prisma/map` and `@prisma/ui`.

The top level `prisma/client` yarn scripts are helpers only. You can use yarn safely inside the the project you are working on just as you did before in the `c2` directory.

### Development Builds

Development builds runs a local electron instance (from the binaries in ./node_modules/.bin/electron). This works for all platforms that are supported (windows, mac).

Before building, ensure you have nodejs (greater than v6) and yarn installed. You can install on mac using homebrew or scoop for windows. For building production packages you will also need mono and when building on mac, wine. You can brew install both wine and mono.

* [Scoop for Windows](https://scoop.sh)
* [Homebrew for Mac](https://brew.sh)

```
brew install nodejs
scoop install nodejs
```

#### To build locally.

To build the application for development, run the following.

```
yarn install
yarn build
cd packages/prisma-electron
yarn build --watch
```

Note: `yarn install` only needs to be run the first time or when the packaging is updated.

You can also build for production using:

```
yarn install
yarn build
cd packages/prisma-electron
yarn build:production
```

#### Run the electron instance

##### Local backend

For running against local vagrant:

```
yarn start:local
```

If you need to see console output for state changes in redux (warning can use a lot of resources):

```
yarn start:local  --trace=redux --debug
```

##### Remote backend

If you aren't running vagrant on the local machine, or you want to connect to a system
somewhere else on the network, you will need to run the instance and provide the configuration url.
Note this option overrides option 2.

Option 1:
```
yarn start --config=https://demo.mcmurdo.io:8081/api/v2/config.json
```

Option 2:
Alternatively, you can place a configuration file in <home>/.c2/development.json
```
{
  "configurationRemote": true,
  "configuration": {
    "name": "Demo Server",
    "url": "http://demo.mcmurdo.io:8081/api/v2/config.json"
  }
}
```

Option 3:
Also, you can place the JSON contents of the configuration url in the <home>/.c2/development.json


In this case we are connecting to a vagrant that is running on a mac from windows running as a VM in parallels (the 10.22.55.X is convention for reaching the local mac from parallels vms). Additionally, you will need to add self signed certs if certs are not already generated for the server you are connecting to since you are no longer connecting through localhost.

To do this for a vagrant install, on the vagrant instance go to `/home/ubuntu/go/bin` and run the following:

```
sudo -u ubuntu ./tselfsign --ip=X
```

This will configure the vagrant instance and provide the certificate to import that can be found in `/etc/trident/certificate.pem`. For windows, copy that .pem file and install in the mmc program (run program, mmc, then right click the root certificates -> All tasks->import). This will allow the client to use https to connect to the server.

#### Testing and Test Coverage

To run the tests:

```
yarn test
```

To continuously run the tests when source and test files change:

```
yarn test --watch
```

To get code coverage (only shows coverage for files imported into the tests):

```
yarn test --coverage
```

#### To build for Production

This can be done on Mac or Linux. Just ensure you have wine and mono installed. For mac, you can use homebrew.

```
brew install wine
brew install mono
```

Now, you can run the following to build for production.

```
yarn dist
```

This will create a folder and a zip in dist/package/<OS>. If you copy and unzip on a windows machine there is a c2.exe inside the zip that will run the client. You can also run on Power Shell if you need to point the client to another IP (it defaults to AWS).

```
.\PRISMA.exe -- --host=X
```

To run on macOS:

```
open PRISMA.app --args --host=X
```

## Other How Tos
### Adding a new feature type

- src/map/layers
    - create styler
    - create spec
    - register in dispatcher

- components/map/tooltip
    - create handler
    - maybe component
    - register in TooltipComponent

- formatter


## Yarn Run Commands

To see all commands use `yarn run`

```
yarn <command>
```

* package - Builds all OS packages.
  * package:build  - Builds production version of client and runs the brand script. `package`, `package:macOS`, `package:windows` runs this first.
  * package:macOS
  * package:windows
* create-installer - Builds installer only. Requires `package` to be run first
  * create-installer:macOS - Builds installer only. Requires `package:macOS` to be run first
  * create-installer:windows - Builds installer only. Requires `package:windows` to be run first
* clean - Cleans the bundle.js files
* dist:clean - Runs `clean` as well as removes `build` and `dist` directories.
* dist - Builds all packages and installers. macOS and windows. Runs `package` and `create-installer`
  * dist:macOS -  Build package and installer for macOS only
  * dist:windows -  Build package and installer for windows only
* build - Build the application for development.
  * build:watch - Build application, then wait for application changes
  * build:production - Build client for production
  * build:doc - Build autogenerated code documentation for client.
* translate-pot
* translate-json
* start - Start client with development connected to AWS.
  * start:local - Start client with development connected to localhost
  * start:local:production - Start production client connected to localhost
* test - Run tests

### Proxy
 --proxy-server=localhost:8888 --ignore-certificate-errors
