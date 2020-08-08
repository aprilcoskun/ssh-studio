module.exports.welcomeWindowOptions = {
  title: 'SSH Studio',
  width: 700,
  height: 400,
  center: true,
  resizable: false,
  webPreferences: {
    defaultFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
      'Segoe UI Symbol'`,
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: true,
    webgl: false,
  },
}

module.exports.shellWindowOptions = {
  title: 'Shell',
  width: 880,
  height: 420,
  minWidth: 640,
  minHeight: 320,
  center: true,
  titleBarStyle: 'hiddenInset',
  webPreferences: {
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: true,
  },
}

module.exports.addNewWindowOptions = {
  title: 'Add New Connection to SSH Studio',
  backgroundColor: '#f5f5f9',
  autoHideMenuBar: true,
  width: 500,
  height: 380,
  center: true,
  resizable: false,
  webPreferences: {
    defaultFontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol'`,
    nodeIntegration: true,
    enableWebSQL: false,
    webaudio: false,
    devTools: true,
    webgl: false,
    images: false,
  },
}