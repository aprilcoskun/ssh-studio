let connections = [];
const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();
if (win.connections) {
  loadConnections(win.connections);
}

ipcRenderer.on('reload-connection', function (event, connections) {
  loadConnections(connections);
});

function loadConnections(conns) {
  connections = conns;
  const box = document.getElementById('connBox');
  let innerHTML =
    '<div style="text-align: center;margin-top:8px">Connections</div><hr>';
  for (let i = 0; i < conns.length; i++) {
    const label = conns[i].label;
    innerHTML += `<a class="connection">
        <div onclick="javascript:ipcRenderer.send('open-connection', '${label}')" class="connection-label">
          ${label}
        </div>
        <div onclick="javascript:ipcRenderer.send('delete-connection', '${label}')" class="tab-close"></div>
      </a>`;
  }
  box.innerHTML = innerHTML;
}