/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  clipboard,
  screen,
  nativeImage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('clipboard-read-text', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard-write-text', (event, text) => {
  clipboard.writeText(text);
});

ipcMain.handle('clipboard-read-image', () => {
  return clipboard.readImage();
});

ipcMain.handle('clipboard-write-image', (event, imagePath) => {
  clipboard.writeImage(nativeImage.createFromDataURL(imagePath));
});

ipcMain.handle('clear-clipboard', () => {
  clipboard.clear();
});

ipcMain.handle('pin-event', (event, pin) => {
  mainWindow?.setAlwaysOnTop(pin);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 350,
    height: 400,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    autoHideMenuBar: true,
    frame: false,
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  let interval: any;
  const SNAP_THRESHOLD = 30; // pixels
  mainWindow.on('move', () => {
    if (interval) {
      clearInterval(interval);
    }

    interval = setInterval(() => {
      if (mainWindow) {
        const bounds = mainWindow.getBounds(); // current window bounds
        const display = screen.getDisplayMatching(bounds); // gets the display that intersects most with window

        const { workArea } = display; // workArea excludes the taskbar/dock
        const { x, y, width, height } = bounds;

        let snappedX = x;
        let snappedY = y;

        // Snap left
        if (Math.abs(x - workArea.x) <= SNAP_THRESHOLD) {
          snappedX = workArea.x;
        }

        // Snap right
        if (
          Math.abs(x + width - (workArea.x + workArea.width)) <= SNAP_THRESHOLD
        ) {
          snappedX = workArea.x + workArea.width - width;
        }

        // Snap top
        if (Math.abs(y - workArea.y) <= SNAP_THRESHOLD) {
          snappedY = workArea.y;
        }

        // Snap bottom
        if (
          Math.abs(y + height - (workArea.y + workArea.height)) <=
          SNAP_THRESHOLD
        ) {
          snappedY = workArea.y + workArea.height - height;
        }

        if (snappedX !== x || snappedY !== y) {
          mainWindow.setBounds({ x: snappedX, y: snappedY, width, height });
        }
      }
    }, 100);
  });

  ipcMain.handle('close-app', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
