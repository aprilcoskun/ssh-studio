const { app, Menu } = require('electron');
const contextMenu = require('electron-context-menu');

const store = require('./store');
const { join } = require('path');

contextMenu({
  menu: (defaultActions) => [
    defaultActions.cut(),
    defaultActions.copy(),
    defaultActions.paste(),
    defaultActions.separator(),
    defaultActions.searchWithGoogle(),
  ],
});

module.exports = (launchShell, launchAddNewWindow, changeTheme) => {
  const menuConnections = [];
  const terminalTheme = store.getTheme();
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
    {
      label: app.name,
      submenu: [
        { label: 'About SSH Studio', click() {
          const appDir = process.cwd();
          require('about-window').default({ 
            icon_path: join(appDir, './src/assets/icon.png'),
            package_json_dir: appDir,
            bug_report_url: 'mailto:info@nisancoskun.com',
            copyright: `Distributed under MIT license.
            <div>Icons made by <a href="https://www.flaticon.com/authors/smartline" title="Smartline">Smartline</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
            `,
            use_inner_html: true,
            adjust_window_size: true,
            product_name: 'SSH Studio',
            show_close_button: 'Close',
            description: 'SSH & Telnet Client'
          })
        } },
        { type: 'separator' },
        { role: 'quit', label: 'Quit SSH Studio' },
      ],
    },
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
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return { menu, menuConnections };
};
