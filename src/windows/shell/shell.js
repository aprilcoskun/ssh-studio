const ChromeTabs = require('./tabs');
const chromeTabsEl = document.querySelector('.chrome-tabs');
const chromeTabs = new ChromeTabs(chromeTabsEl);

document.querySelectorAll('.tab-content').forEach((el) => {
  el.style.display = el.id === 'tab-content-home' ? 'block' : 'none';
});

// document.querySelector('button[data-theme-toggle]').addEventListener('click', _ => {
//   if (chromeTabsEl.classList.contains('chrome-tabs-dark-theme')) {
//     document.documentElement.classList.remove('dark-theme')
//     chromeTabsEl.classList.remove('chrome-tabs-dark-theme')
//   } else {
//     document.documentElement.classList.add('dark-theme')
//     chromeTabsEl.classList.add('chrome-tabs-dark-theme')
//   }
// })

ipcRenderer.on('change-tab-theme', function (event, theme) {
  if (theme === 'Light') {
    if (chromeTabsEl.classList.contains('chrome-tabs-dark-theme')) {
      document.documentElement.classList.remove('dark-theme')
      chromeTabsEl.classList.remove('chrome-tabs-dark-theme')
    }
  } else if (theme === 'Dark') {
    if (!chromeTabsEl.classList.contains('chrome-tabs-dark-theme')) {
      document.documentElement.classList.add('dark-theme')
      chromeTabsEl.classList.add('chrome-tabs-dark-theme')
    }
  }
});


ipcRenderer.on('new-tab', function (event, conn) {
  let elemFound = false;
  for (let i = 0; i < chromeTabs.tabEls.length; i++) {
    const element = chromeTabs.tabEls[i];
    if (element.id === conn.name) {
      chromeTabs.setCurrentTab(element);
      elemFound = true;
      break;
    }
  }
  if(elemFound === false) {
    chromeTabs.addTab({ title: conn.name, favicon: false });
  }
});

chromeTabsEl.addEventListener('activeTabChange', ({detail}) => {
  const tabContentId = 'tab-content-' + detail.tabEl.id;
  document.querySelectorAll('.tab-content').forEach((el) => {
      el.style.display = el.id === tabContentId ? 'block' : 'none';
  });
});

chromeTabsEl.addEventListener('tabAdd', ({detail}) => {
  const tabContainer = document.createElement('div');
  tabContainer.id = 'tab-content-' + detail.tabEl.id;
  tabContainer.classList.add('tab-content');
  tabContainer.style.display = 'block';
  document.getElementById('containers').appendChild(tabContainer);
  createTerminal(win.store.getConnection(detail.tabEl.id), tabContainer);
});

chromeTabsEl.addEventListener('tabRemove', ({detail}) => {
  const tabContainerId = 'tab-content-' + detail.tabEl.id;
  document.getElementById('containers')
  .removeChild(document.getElementById(tabContainerId));

  // if (chromeTabs.tabEls.length === 0) {
  //   win.close();
  // }
});


if (win.initConn) {
  chromeTabs.addTab({ title: win.initConn.name, favicon: false });
}