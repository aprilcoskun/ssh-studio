const { shell: electronShell, ipcRenderer } = require('electron');
let currentTheme = 'defaultLightTheme';
ipcRenderer.invoke('get-theme').then((theme) => {
  chromeTabsEl.classList.add(theme);
  document.getElementById('containers').style.backgroundColor =
  themes[theme].background;
  document.body.style.backgroundColor = themes[theme].background;
  currentTheme = theme;
});

const { Terminal } = require('xterm');
const { FitAddon } = require('xterm-addon-fit');
const { WebglAddon } = require('xterm-addon-webgl');
const { WebLinksAddon } = require('xterm-addon-web-links');
const fontFaceObserver = require('fontfaceobserver');
const MenloFont = new fontFaceObserver('Menlo');
const { Instance } = require('chalk');
const chromeTabsEl = document.querySelector('.chrome-tabs');
const chromeTabs = new ChromeTabs(chromeTabsEl);
const chalk = new Instance({ level: 2 });
const terms = {};

async function createTerminal(connection, containerElement) {
  const theme = themes[await ipcRenderer.invoke('get-theme')];
  let useMenlo = true;
  try {
    await MenloFont.load();
  } catch (error) {
    useMenlo = false;
  }

  const term = new Terminal({
    cursorBlink: true,
    allowTransparency: false,
    scrollback: 100000,
    tabStopWidth: 4,
    bellStyle: 'none',
    cursorStyle: 'bar',
    fontSize: 12,
    fontFamily: useMenlo ? 'Menlo' : 'Courier New, Lucida Console, monospace',
    letterSpacing: 1,
    theme,
  });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(
    new WebLinksAddon((event, uri) => {
      event.preventDefault();
      electronShell.openExternal(uri);
    })
  );
  term.open(containerElement);
  term.loadAddon(new WebglAddon());
  fitAddon.fit();

  if (connection.type === 'SSH') {
    const { Client } = require('ssh2');
    const conn = new Client();
    conn.on('ready', () => {
      conn.shell(
        { term: 'xterm-256color', cols: term.cols, rows: term.rows },
        (err, stream) => {
          if (err) {
            onError(err);
            conn.end();
          }

          stream.on('close', (code, signal) => {
            if (code || signal) {
              onError(
                term,
                (code ? `Code ${code} ` : '') +
                  (signal ? `Signal ${signal}` : '')
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
        }
      );
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

    conn.on('close', () => onError(term, 'Connection Closed.'));

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

    conn.on('close', () => {
      return onError(term, 'Connection Closed.');
    });

    conn.on('error', (err) => {
      if (err) {
        return onError(term, err);
      }
      return onError(term, 'Unknown Connection Error');
    });
  }
  terms[connection.name] = { term, fitAddon };
}

function onError(term, err) {
  term.setOption('disableStdin', true);
  if (err) {
    if (err.message) {
      term.writeln(chalk.red(`Error: ${err.message}`));
    } else {
      term.writeln(chalk.red(`Error: ${err}`));
    }
  } else {
    term.writeln(chalk.red('Connection Terminated for Unknown Reason'));
  }
}

ipcRenderer.on('change-theme', (event, theme) => {
  chromeTabsEl.classList.remove(currentTheme);
  chromeTabsEl.classList.add(theme);
  document.getElementById('containers').style.backgroundColor =
  themes[theme].background;
  Object.values(terms).forEach((term) => {
    term.term.setOption('theme', themes[theme]);
  });
  currentTheme = theme;
});

ipcRenderer.on('new-tab', (event, conn) => {
  let elemFound = false;
  for (let i = 0; i < chromeTabs.tabEls.length; i++) {
    const element = chromeTabs.tabEls[i];
    if (element.id === conn.name) {
      chromeTabs.setCurrentTab(element);
      elemFound = true;
      break;
    }
  }
  if (elemFound === false) {
    chromeTabs.addTab({ title: conn.name, favicon: false });
    const tabContainer = document.createElement('div');
    tabContainer.id = 'tab-content-' + conn.name;
    tabContainer.classList.add('tab-content');
    tabContainer.style.display = 'block';
    document.getElementById('containers').appendChild(tabContainer);
    createTerminal(conn, tabContainer);
  }
});
