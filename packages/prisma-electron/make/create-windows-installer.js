var electronInstaller = require('electron-winstaller');

if(process.argv.length !== 7) {
    console.error("Must provide app location, exe name, output directory, appName, companyName. \nUsage: node create-windows-installer.js path/to/app exeName path/to/output appName companyName");
    process.exit(-1);
}

var appDir = process.argv[2];
var exe = process.argv[3];
var outDir = process.argv[4];
var appName = process.argv[5];
var company = process.argv[6];

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: appDir,
    outputDirectory: outDir,
    noMsi: true,
    authors: company,
    exe: exe,
    title: appName,
    name: appName,
    loadingGif: "./brands/generic/C2-Windows-Install-Splash.gif"
  });

resultPromise.then(() => console.log("Installer built in "+outDir), (e) => console.log(`Error building Windows Installer: ${e.message}`));
