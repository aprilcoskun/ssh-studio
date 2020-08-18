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
      },
    },
  },
});

module.exports.initStore = () => {
  if (!store.get('settings')) {
    store.set('settings', { theme: 'defaultLightTheme' });
  }

  if (!store.get('connections')) {
    store.set('connections', []);
  }
};

module.exports.getConnections = () => {
  return store.get('connections');
};

module.exports.getTheme = () => {
  const settings = store.get('settings');
  return store.get('settings').theme;
};

module.exports.setTheme = (theme) => {
  const oldSettings = store.get('settings');
  const newSettings = { ...oldSettings, theme };
  store.set('settings', newSettings);
  return newSettings.theme;
};

module.exports.getConnection = (name) => {
  const connections = store.get('connections');
  return connections.find((c) => c.name === name);
};

module.exports.addToConnections = (connection) => {
  const connections = store.get('connections');
  const sameNamed = connections.find((c) => c.name === connection.name);
  if (sameNamed) {
    throw Error('same name');
  }

  connections.push(connection);
  store.set('connections', connections);
  return connections;
};

module.exports.deleteConnection = (name) => {
  const oldConnections = store.get('connections');
  const newConnections = oldConnections.filter((c) => c.name !== name);
  store.set('connections', newConnections);
  return newConnections;
};

module.exports.editConnection = (connection) => {
  const connections = store.get('connections');
  for (let index = 0; index < connections.length; index++) {
    if (connection.name === connections[index].name) {
      connections[index] = connection;
    }
  }

  store.set('connections', connections);
  return connections;
};
