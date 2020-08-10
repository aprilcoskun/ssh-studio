const { app, BrowserWindow, ipcMain } = require('electron');
// const { mkdir, exists } = require('fs');
const store = require('./helpers/store');
store.initStore();

const {
  addNewWindowOptions,
  welcomeWindowOptions,
  shellWindowOptions,
} = require('./helpers/default-window-options');
const createNewMenu = require('./helpers/create-menu');
// Create records folder if not exists
// const recordsFolderPath = app.getPath('userData') + '/session-records';
// exists(recordsFolderPath, function (exists) {
//   if (!exists) {
//     console.log('Creating records folder...');
//     mkdir(recordsFolderPath, function (error) {
//       if (error) {
//         console.error(error);
//         throw error;
//       }
//     });
//   }
// });

let { menu, menuConnections } = createNewMenu(
  launchShell,
  launchAddNewWindow,
  changeTheme,
  changeTabTheme
);

/** @type {BrowserWindow} */
let welcomeWindow = null;

/** @type {BrowserWindow} */
let shellWindow = null;

/** @type {BrowserWindow} */
let addNewWindow = null;

app.once('ready', () => {
  welcomeWindow = new BrowserWindow(welcomeWindowOptions(!app.isPackaged));
  welcomeWindow.connections = menuConnections;

  welcomeWindow.setMenu(menu);
  welcomeWindow.launchAddNewWindow = launchAddNewWindow;
  welcomeWindow.loadURL(`file://${__dirname}/windows/welcome/welcome.html`);
  welcomeWindow.once('ready-to-show', () => {
    welcomeWindow.store = store;
    welcomeWindow.show();
    welcomeWindow.focus();
  });
  welcomeWindow.once('close', () => (welcomeWindow = null));
});

function launchShell(conn) {
  if (shellWindow === null) {
    shellWindow = new BrowserWindow(shellWindowOptions(!app.isPackaged));
    shellWindow.initConn = conn;
    shellWindow.store = store;

    shellWindow.setMenu(menu);
    shellWindow.loadURL(`file://${__dirname}/windows/shell/shell.html`);
    shellWindow.once('ready-to-show', () => {
      shellWindow.show();
      shellWindow.focus();
    });
    shellWindow.once('close', () => (shellWindow = null));
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

ipcMain.on('save-new-connection', (event, data) => {
  saveNewConnection(data.conn, data.open);
})

ipcMain.on('open-connection', (event, connectionName) => {
  launchShell(store.getConnection(connectionName));
});

ipcMain.on('delete-connection', (event, connectionName) => {
  store.deleteConnection(connectionName);
  const menus = createNewMenu(
    launchShell,
    launchAddNewWindow,
    changeTheme,
    changeTabTheme
  );
  menu = menus.menu;
  menuConnections = menus.menuConnections;
  if (welcomeWindow !== null) {
    menus.menuConnections.forEach((m) => delete m.click);
    welcomeWindow.setMenu(menu);
    welcomeWindow.webContents.send('reload-connection', menus.menuConnections);
  }

  if (shellWindow !== null) {
    shellWindow.setMenu(menu);
  }
});

function saveNewConnection(conn, open) {
  store.addToConnections(conn);
  const menus = createNewMenu(
    launchShell,
    launchAddNewWindow,
    changeTheme,
    changeTabTheme
  );
  menu = menus.menu;
  menuConnections = menus.menuConnections;
  if (welcomeWindow !== null) {
    menus.menuConnections.forEach((m) => delete m.click);
    welcomeWindow.setMenu(menu);
    welcomeWindow.webContents.send('reload-connection', menus.menuConnections);
  }

  if (shellWindow !== null) {
    shellWindow.setMenu(menu);
  }

  addNewWindow.close();
  if (open) {
    launchShell(conn);
    if (welcomeWindow !== null) {
      welcomeWindow.close();
    }
  }
}

function changeTheme(item) {
  store.setTheme(item.toolTip);
  if (shellWindow !== null) {
    shellWindow.webContents.send('change-theme', item.toolTip);
  }
}

function changeTabTheme(item) {
  store.setTabTheme(item.label);
  if (shellWindow !== null) {
    shellWindow.webContents.send('change-tab-theme', item.label);
  }
}
