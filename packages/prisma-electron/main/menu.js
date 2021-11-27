const { Menu } = require('electron');
const electron = require('electron');
const configuration = require('./lib/configuration');


function createApplicationMenu() {
  const template = [];

  if (process.platform === 'darwin') {
    const name = electron.app.getName();
    template.unshift({
      label: name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => {
            configuration.showPreferencesWindow();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  createApplicationMenu,
};

