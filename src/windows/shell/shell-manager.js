const { Client } = require('ssh2');
const { Terminal } = require('xterm');
const { FitAddon } = require('xterm-addon-fit');
const { WebglAddon } = require('xterm-addon-webgl');
const { WebLinksAddon } = require('xterm-addon-web-links');
const { shell: electronShell, remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();
const { Instance } = require('chalk');
const themes = require('./themes');
const chalk = new Instance({ level: 2 });
const terms = {};

function createTerminal(connection, containerElement) {
  const theme = themes[win.store.getTheme()];
  const term = new Terminal({
    cursorBlink: true,
    scrollback: 100000,
    tabStopWidth: 4,
    bellStyle: 'none',
    cursorStyle: 'bar',
    fontSize: 12,
    fontFamily:
      'Consolas, Menlo, Monaco, Lucida Console, Courier New, monospace, serif',
    theme
  });
  document.getElementById('containers').style.backgroundColor = theme.background;

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(new WebLinksAddon((event, uri) => {
    event.preventDefault();
    electronShell.openExternal(uri);
  }));
  term.open(containerElement);
  term.loadAddon(new WebglAddon());
  fitAddon.fit();

  if (connection.type === 'SSH') {
    const conn = new Client();
    conn.on('ready', () => {
      conn.shell({ term: 'xterm', cols: term.cols, rows: term.rows }, (err, stream) => {
        if (err) {
          onError(err);
          conn.end();
        }

        stream.on('close', (code, signal) => {
          if (code || signal) {
            onError(
              term,
              (code ? `Code ${code} ` : '') + (signal ? `Signal ${signal}` : '')
            );
          }
          conn.end();
        });
        stream.on('data', (data) => term.write(data));

        term.setOption('disableStdin', false);
        term.onData((data) => stream.write(data));
        term.focus();
        term.scrollToBottom();
        term.onResize(({ cols, rows }) => stream.setWindow(rows, cols));
        terms[connection.name] = { term, fitAddon };
      });
    });

    conn.on(
      'keyboard-interactive',
      (name, instructions, instructionsLang, prompts, finish) => {
        finish([connection.password]);
      }
    );

    conn.on('banner', (data) => term.write(data.replace(/\r?\n/g, '\r\n')));
    conn.on('end', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Connection end by you.');
    });

    conn.on('close', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Connection Closed.');
    });

    conn.on('error', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Unknown Connection Error');
    });

    conn.connect({
      host: connection.host,
      username: connection.username,
      password: connection.password,
      port: connection.port,
      tryKeyboard: true,
    });
  } else {
    const conn = require('net').connect(connection.port, connection.host);
    conn.on('connect', () => {
      conn.write(`${connection.username}\r`);
      conn.write(`${connection.password}\r`);
      term.onData((data) => conn.write(data));
      term.focus();
      term.scrollToBottom();
    });

    conn.on('data', (data) => term.write(data));
    conn.on('end', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Connection end by you.');
    });

    conn.on('close', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Connection Closed.');
    });

    conn.on('error', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Unknown Connection Error');
    });
  }
}

function onError(term, err) {
  term.setOption('disableStdin', true);
  if (err) {
      term.writeln(chalk.red(`Error: ${err.message}`));
      if (err.message) {
      term.writeln(chalk.red(`Error: ${err.message}`));
    } else {
      term.writeln(chalk.red(`Error: ${err}`));
    }
  } else {
    term.writeln(chalk.red('Connection Terminated for Unknown Reason'));
  }
}

window.addEventListener(
  'resize',
  () => Object.values(terms).forEach((t) => t.fitAddon.fit()),
  false
);

ipcRenderer.on('change-theme', function (event, theme) {
  Object.values(terms).forEach((term) => {
    term.term.setOption('theme', themes[theme]);
  });
  document.getElementById('containers').style.backgroundColor = themes[theme].background;
});