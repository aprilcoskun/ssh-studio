const { ipcRenderer } = require('electron');
ipcRenderer.on('reload-connection', function (event, conns) {
  let innerHTML =
    '<div style="text-align: center;margin-top:8px">Connections</div><hr>';
  for (let i = 0; i < conns.length; i++) {
    innerHTML += `<a class="connection">
        <div onclick="javascript:ipcRenderer.send('open-connection', '${conns[i]}')" class="label">
          ${conns[i]}
        </div><div class="space"></div>
        <div onclick="javascript:ipcRenderer.send('delete-connection', '${conns[i]}')" class="close"></div>
      </a>`;
  }
  document.getElementById('connBox').innerHTML = innerHTML;
});
