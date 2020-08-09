const { app, Menu } = require('electron');
const contextMenu = require('electron-context-menu');

const store = require('./store');

const isMac = process.platform === 'darwin';

contextMenu({
  menu: (defaultActions) => [
    defaultActions.cut(),
    defaultActions.copy(),
    defaultActions.paste(),
    defaultActions.separator(),
    defaultActions.searchWithGoogle(),
  ],
});

module.exports = (
  launchShell,
  launchAddNewWindow,
  changeTheme,
  changeTabTheme
) => {
  const menuConnections = [];
  const terminalTheme = store.getTheme();
  const tabTheme = store.getTabTheme();
  store.getConnections().forEach((conn) => {
    menuConnections.push({
      label: conn.name,
      click() {
        launchShell(conn);
      },
    });
  });

  /** @type {Electron.MenuItemConstructorOptions[]} */
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Connections',
      submenu: [
        { label: 'Add New Connection', click: launchAddNewWindow },
        { type: 'separator' },
        { label: 'Load Connection', submenu: menuConnections },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' }]),
        { type: 'separator' },
        {
          label: 'Themes',
          submenu: [
            {
              label: 'Tab Themes',
              submenu: [
                {
                  type: 'radio',
                  label: 'Light',
                  checked: tabTheme === 'Light',
                  click: changeTabTheme,
                },
                {
                  type: 'radio',
                  label: 'Dark',
                  checked: tabTheme === 'Dark',
                  click: changeTabTheme,
                },
              ],
            },
            {
              label: 'Terminal Themes',
              submenu: [
                {
                  type: 'radio',
                  label: 'Light',
                  toolTip: 'defaultLightTheme',
                  checked: terminalTheme === 'defaultLightTheme',
                  click: changeTheme,
                },
                {
                  type: 'radio',
                  label: 'Dark',
                  toolTip: 'defaultBlackTheme',
                  checked: terminalTheme === 'defaultBlackTheme',
                  click: changeTheme,
                },
                {
                  type: 'radio',
                  label: 'Material',
                  toolTip: 'materialTheme',
                  checked: terminalTheme === 'materialTheme',
                  click: changeTheme,
                },
                {
                  type: 'radio',
                  label: 'Solorized',
                  toolTip: 'solorizedLightTheme',
                  checked: terminalTheme === 'solorizedLightTheme',
                  click: changeTheme,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return { menu, menuConnections };
};
