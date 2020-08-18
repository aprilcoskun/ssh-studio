module.exports = function ensureRecordFolderExists(params) {
  const { mkdir, exists } = require('fs');
  const { app } = require('electron');

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
};
