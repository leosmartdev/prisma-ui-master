import electron from 'electron';

// Remote objects cannot be stubbed, use indirection to allow stubbing

export const remote = {
  showSaveDialog: electron.remote.dialog.showSaveDialog,
  showOpenDialog: electron.remote.dialog.showOpenDialog,
  showMessageBox: electron.remote.dialog.showMessageBox,
};
