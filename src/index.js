const { app, BrowserWindow, ipcMain } = require('electron');
const { mkdir, exists } = require('fs');
const store = require('./helpers/store');
const { addNewWindowOptions, welcomeWindowOptions, shellWindowOptions } = require('./helpers/default-window-options');
const createNewMenu = require('./helpers/create-menu');
    
// Create records folder if not exists
const recordsFolderPath = app.getPath('userData') + '/session-records';
exists(recordsFolderPath, function (exists) {
  if (!exists) {
    console.log('Creating records folder...');
    mkdir(recordsFolderPath, function (error) {
      if (error) {
        console.error(error);
        throw error;
      }
    });
  }
});

let { menu, menuConnections } = createNewMenu(launchShell, launchAddNewWindow, changeTheme, changeTabTheme);

/** @type {BrowserWindow} */
let welcomeWindow = null;

/** @type {BrowserWindow} */
let shellWindow = null;

/** @type {BrowserWindow} */
let addNewWindow = null;

app.on('ready', function () {
  welcomeWindow = new BrowserWindow(welcomeWindowOptions);
  welcomeWindow.connections = menuConnections;

  welcomeWindow.setMenu(menu);
  welcomeWindow.launchAddNewWindow = launchAddNewWindow;
  welcomeWindow.loadURL(`file://${__dirname}/windows/welcome/welcome.html`);
  welcomeWindow.on('ready-to-show', function () {
    welcomeWindow.store = store;
    welcomeWindow.show();
    welcomeWindow.focus();
  });
  welcomeWindow.on('close', function () {
    welcomeWindow = null;
  });
});

function launchShell(conn) {
  if (shellWindow === null) {
    shellWindow = new BrowserWindow(shellWindowOptions);
    shellWindow.initConn = conn;
    shellWindow.store = store;

    shellWindow.setMenu(menu);
    shellWindow.loadURL(`file://${__dirname}/windows/shell/shell.html`);
    shellWindow.on('ready-to-show', function () {
      shellWindow.show();
      shellWindow.focus();
    });
    shellWindow.on('close', function () {
      shellWindow = null;
    });
  } else {
    shellWindow.webContents.send('new-tab', conn);
  }
  if (welcomeWindow !== null) {
    welcomeWindow.close();
  }
}

function launchAddNewWindow() {
  if (addNewWindow === null) {
    addNewWindow = new BrowserWindow(addNewWindowOptions);
    addNewWindow.saveNewConnection = saveNewConnection;
    addNewWindow.saveNewConnectionAndOpen = saveNewConnectionAndOpen;
    addNewWindow.loadURL(`file://${__dirname}/windows/add-new/add-new.html`);
    addNewWindow.on('ready-to-show', function () {
      addNewWindow.show();
      addNewWindow.focus();
    });
    addNewWindow.on('close', function () {
      addNewWindow = null;
    });
  } else {
    addNewWindow.focus();
  }
}

ipcMain.on('open-connection', (event, connectionName) => {
  launchShell(store.getConnection(connectionName));
});

ipcMain.on('delete-connection', (event, connectionName) => {
  store.deleteConnection(connectionName);
  const menus = createNewMenu(launchShell, launchAddNewWindow, changeTheme, changeTabTheme);
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

function saveNewConnection(conn) {
  store.addToConnections(conn);
  const menus = createNewMenu(launchShell, launchAddNewWindow, changeTheme, changeTabTheme);
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
}

function saveNewConnectionAndOpen(conn) {
  store.addToConnections(conn);
  const menus = createNewMenu(launchShell, launchAddNewWindow, changeTheme, changeTabTheme);
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
  launchShell(conn);
  welcomeWindow.close();
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