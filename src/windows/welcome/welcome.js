const editMsg = 'Edit Window is under development! If you want to change connection options, please delete and create new a connection';
const { ipcRenderer } = require('electron');
ipcRenderer.on('reload-connection', function (event, conns) {
  // connections = conns;
  const box = document.getElementById('connBox');
  let innerHTML =
    '<div style="text-align: center;margin-top:8px">Connections</div><hr>';
  for (let i = 0; i < conns.length; i++) {
    const label = conns[i];

    innerHTML += `<a class="connection">
        <div onclick="javascript:ipcRenderer.send('open-connection', '${label}')" class="label">
          ${label}
        </div>
        <div onclick="javascript:alert('${editMsg}')" class="edit"></div>
        <div onclick="javascript:ipcRenderer.send('delete-connection', '${label}')" class="close"></div>
      </a>`;
  }
  box.innerHTML = innerHTML;
});
