const { app, BrowserWindow, ipcMain } = require('electron');
const store = require('./helpers/store');
store.initStore();
const {
  addNewWindowOptions,
  welcomeWindowOptions,
  shellWindowOptions,
} = require('./helpers/window-options');
const createNewMenu = require('./helpers/create-menu');
const ensureRecordFolder = require('./helpers/ensure-record-folder');

let { menu, menuConnections } = createNewMenu(
  launchShell,
  launchAddNewWindow,
  changeTheme
);

/** @type {BrowserWindow} */
let welcomeWindow = null;

/** @type {BrowserWindow} */
let shellWindow = null;

/** @type {BrowserWindow} */
let addNewWindow = null;

app.once('ready', () => {
  welcomeWindow = new BrowserWindow(welcomeWindowOptions(!app.isPackaged));
  welcomeWindow.setMenu(menu);
  welcomeWindow.loadURL(`file://${__dirname}/windows/welcome/welcome.html`);
  welcomeWindow.once('ready-to-show', () => {
    welcomeWindow.show();
    welcomeWindow.focus();
  });

  welcomeWindow.webContents.once('did-finish-load', () => {
    welcomeWindow.webContents.send(
      'reload-connection',
      menuConnections.map((c) => c.label)
    );
  });

  welcomeWindow.once('close', () => (welcomeWindow = null));

  ensureRecordFolder();
});

function launchShell(conn) {
  if (shellWindow === null) {
    shellWindow = new BrowserWindow(shellWindowOptions(!app.isPackaged));
    shellWindow.store = store;

    shellWindow.setMenu(menu);
    shellWindow.webContents.once('did-finish-load', () => {
      shellWindow.webContents.send('new-tab', conn);
    });
    shellWindow.once('ready-to-show', () => {
      shellWindow.show();
      shellWindow.focus();
    });

    shellWindow.once('close', () => (shellWindow = null));
    shellWindow.loadURL(`file://${__dirname}/windows/shell/shell.html`);
  } else {
    shellWindow.webContents.send('new-tab', conn);
  }
  if (welcomeWindow !== null) {
    welcomeWindow.close();
  }
}

function launchAddNewWindow() {
  if (addNewWindow === null) {
    addNewWindow = new BrowserWindow(addNewWindowOptions(!app.isPackaged));
    addNewWindow.loadURL(`file://${__dirname}/windows/add-new/add-new.html`);
    addNewWindow.once('ready-to-show', () => {
      addNewWindow.show();
      addNewWindow.focus();
    });
    addNewWindow.once('close', () => (addNewWindow = null));
  } else {
    addNewWindow.focus();
  }
}

ipcMain.on('launch-add-new-window', (event, data) => launchAddNewWindow());

ipcMain.on('save-new-connection', (event, data) => {
  store.addToConnections(data.conn);
  const menus = createNewMenu(launchShell, launchAddNewWindow, changeTheme);
  menu = menus.menu;
  menuConnections = menus.menuConnections;
  if (welcomeWindow !== null) {
    welcomeWindow.setMenu(menu);
    welcomeWindow.webContents.send(
      'reload-connection',
      menus.menuConnections.map((c) => c.label)
    );
  }

  if (shellWindow !== null) {
    shellWindow.setMenu(menu);
  }

  addNewWindow.close();
  if (data.open) {
    launchShell(data.conn);
    if (welcomeWindow !== null) {
      welcomeWindow.close();
    }
  }
});

ipcMain.on('open-connection', (event, connectionName) => {
  launchShell(store.getConnection(connectionName));
});

ipcMain.on('delete-connection', (event, connectionName) => {
  store.deleteConnection(connectionName);
  const menus = createNewMenu(launchShell, launchAddNewWindow, changeTheme);
  menu = menus.menu;
  menuConnections = menus.menuConnections;
  if (welcomeWindow !== null) {
    welcomeWindow.setMenu(menu);
    welcomeWindow.webContents.send(
      'reload-connection',
      menus.menuConnections.map((c) => c.label)
    );
  }

  if (shellWindow !== null) {
    shellWindow.setMenu(menu);
  }
});

ipcMain.handle('get-theme', () => store.getTheme());

function changeTheme(item) {
  store.setTheme(item.toolTip);
  if (shellWindow !== null) {
    shellWindow.webContents.send('change-theme', item.toolTip);
  }
}
