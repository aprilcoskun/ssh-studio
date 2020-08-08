const Store = require('electron-store');

const store = new Store({
  accessPropertiesByDotNotation: false,
  fileExtension: 'ttf',
  name: 'Roboto',
  encryptionKey: new Uint8Array([
    110,
    105,
    115,
    97,
    110,
    32,
    226,
    157,
    164,
    239,
    184,
    143,
  ]),
  schema: {
    connections: {
      default: [],
      additionalItems: true,
      items: {
        anyOf: [
          {
            default: {},
            required: ['name', 'host', 'username', 'password', 'port', 'type'],
            additionalProperties: true,
            properties: {
              privateKey: { type: 'string', default: '' },
              username: { type: 'string', default: '' },
              password: { type: 'string', default: '' },
              type: { type: 'string', default: 'SSH' },
              port: { type: 'integer', default: 22 },
              host: { type: 'string', default: '' },
              name: { type: 'string', default: '' },
            },
          },
        ],
      },
    },
    settings: {
      type: 'object',
      properties: {
        theme: { type: 'string', default: 'defaultLightTheme' },
        tabTheme: { type: 'string', default: 'light' },
      },
    },
  },
});

module.exports.getConnections = function getConnections() {
  return store.get('connections');
};

module.exports.getTheme = function getTheme() {
  return store.get('settings').theme;
};

module.exports.setTheme = function setTheme(theme) {
  const oldSettings = store.get('settings');
  const newSettings = { ...oldSettings, theme };
  store.set('settings', newSettings);
  return newSettings.theme;
};

module.exports.getTabTheme = function getTheme() {
  return store.get('settings').tabTheme;
};

module.exports.setTabTheme = function setTheme(tabTheme) {
  const oldSettings = store.get('settings');
  const newSettings = { ...oldSettings, tabTheme };
  store.set('settings', newSettings);
  return newSettings.tabTheme;
};

module.exports.getConnection = function getConnection(name) {
  const connections = store.get('connections');
  return connections.find((c) => c.name === name);
};

module.exports.addToConnections = function addToConnections(connection) {
  const connections = store.get('connections');
  const sameNamed = connections.find((c) => c.name === connection.name);
  if (sameNamed) {
    throw Error('same name');
  }

  connections.push(connection);
  store.set('connections', connections);
  return connections;
};

module.exports.deleteConnection = function deleteConnection(name) {
  const oldConnections = store.get('connections');
  const newConnections = oldConnections.filter((c) => c.name !== name);
  store.set('connections', newConnections);
  return newConnections;
};

module.exports.editConnection = function editConnection(connection) {
  const connections = store.get('connections');
  for (let index = 0; index < connections.length; index++) {
    if (connection.name === connections[index].name) {
      connections[index] = connection;
    }
  }

  store.set('connections', connections);
  return connections;
};

// store.addToConnections({
//   username: 'root',
//   type: 'SSH',
//   port: 22,
//   host: 'nisancoskun.com',
//   password: '12a23a34A',
//   name: 'Ubuntu Server'
// });

// store.addToConnections({
//   username: 'root',
//   type: 'SSH',
//   port: 22,
//   host: '192.168.0.42',
//   password: 'Asd*12345',
//   name: 'Centos Server'
// });

// store.addToConnections({
//   username: 'admin',
//   type: 'SSH',
//   port: 22,
//   host: '192.168.1.1',
//   password: '1234',
//   name: 'Zyxel Home Router'
// });
