const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let macVideoPath = null;

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
    show: false,
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  win.removeMenu();

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  // read the file and send data to the render process
  ipcMain.on('get-file-data', (event) => {
    let openFilePath = null;
    if (process.platform === 'win32' && process.argv.length >= 2) {
      openFilePath = process.argv[1];
    } else if (process.platform === 'darwin') {
      openFilePath = macVideoPath;
    }
    event.returnValue = openFilePath;
  });

  app.on('will-finish-launching', () => {
    app.on('open-file', (event, videoPath) => {
      macVideoPath = videoPath;
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
