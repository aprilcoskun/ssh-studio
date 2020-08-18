module.exports.welcomeWindowOptions = (isDev) => ({
  title: 'SSH Studio',
  width: 704,
  height: 396,
  center: true,
  resizable: false,
    webPreferences: {
    enableRemoteModule: false,
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: isDev,
    webgl: false,
  },
})

module.exports.shellWindowOptions = (isDev) => ({
  title: 'Shell',
  width: 880,
  height: 420,
  minWidth: 640,
  minHeight: 320,
  center: true,
  titleBarStyle: 'hiddenInset',
    webPreferences: {
    enableRemoteModule: false,
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: isDev,
  },
})

module.exports.addNewWindowOptions = (isDev) => ({
  title: 'Add New Connection to SSH Studio',
  backgroundColor: '#f5f5f9',
  autoHideMenuBar: true,
  width: 486,
  height: 366,
  center: true,
  resizable: false,
  webPreferences: {
    enableRemoteModule: false,
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: isDev,
    webgl: false,
    images: false,
  },
})