const Draggabilly = require('draggabilly');

const TAB_CONTENT_MARGIN = 8;
const TAB_CONTENT_MIN_WIDTH = 24;
const TAB_CONTENT_MAX_WIDTH = 200;
const TAB_SIZE_SMALL = 84;
const TAB_SIZE_SMALLER = 60;
const TAB_SIZE_MINI = 48;

const noop = () => {};

const closest = (value, array) => {
  let closest = Infinity;
  let closestIndex = -1;
  const arrayLength = array.length;
  for (let i = 0; i < arrayLength; i++) {
    if (Math.abs(value - array[i]) < closest) {
      closest = Math.abs(value - array[i]);
      closestIndex = i;
    }
  }

  return closestIndex;
};

const tabTemplate = `
  <div class="chrome-tab">
    <div class="chrome-tab-dividers"></div>
    <div class="chrome-tab-content">
      <div class="chrome-tab-title"></div>
      <div class="chrome-tab-drag-handle"></div>
      <div class="chrome-tab-close"></div>
    </div>
  </div>
`;

class ChromeTabs {
  constructor(el) {
    this.draggabillies = [];
    this.el = el;

    this.setupStyleEl();
    this.setupEvents();
    this.layoutTabs();
    this.setupDraggabilly();
  }

  setupStyleEl() {
    this.styleEl = document.createElement('style');
    this.el.appendChild(this.styleEl);
  }

  setupEvents() {
    window.addEventListener('resize', (_) => {
      this.cleanUpPreviouslyDraggedTabs();
      this.layoutTabs();
      Object.values(terms).forEach((term) => {
        const displayStatus = term.term.element.parentElement.style.display;
        term.term.element.parentElement.style.display = 'block';
        term.fitAddon.fit();
        term.term.element.parentElement.style.display = displayStatus;
      });
    });

    for (let i = 0; i < this.tabEls.length; i++) {
      this.setTabCloseEventListener(this.tabEls[i]);
    }
  }

  get tabEls() {
    return Array.prototype.slice.call(this.el.querySelectorAll('.chrome-tab'));
  }

  get tabContentEl() {
    return this.el.querySelector('.chrome-tabs-content');
  }

  get tabContentWidths() {
    const numberOfTabs = this.tabEls.length;
    const tabsContentWidth = this.tabContentEl.clientWidth;
    const tabsCumulativeOverlappedWidth = numberOfTabs - 1;
    const targetWidth =
      (tabsContentWidth -
        2 * TAB_CONTENT_MARGIN +
        tabsCumulativeOverlappedWidth) /
      numberOfTabs;
    const clampedTargetWidth = Math.max(
      TAB_CONTENT_MIN_WIDTH,
      Math.min(TAB_CONTENT_MAX_WIDTH, targetWidth)
    );
    const flooredClampedTargetWidth = Math.floor(clampedTargetWidth);
    const totalTabsWidthUsingTarget =
      flooredClampedTargetWidth * numberOfTabs +
      2 * TAB_CONTENT_MARGIN -
      tabsCumulativeOverlappedWidth;
    const totalExtraWidthDueToFlooring =
      tabsContentWidth - totalTabsWidthUsingTarget;

    // TODO - Support tabs with different widths / e.g. "pinned" tabs
    const widths = [];
    let extraWidthRemaining = totalExtraWidthDueToFlooring;
    for (let i = 0; i < numberOfTabs; i += 1) {
      const extraWidth =
        flooredClampedTargetWidth < TAB_CONTENT_MAX_WIDTH &&
        extraWidthRemaining > 0
          ? 1
          : 0;
      widths.push(flooredClampedTargetWidth + extraWidth);
      if (extraWidthRemaining > 0) extraWidthRemaining -= 1;
    }

    return widths;
  }

  get tabContentPositions() {
    const positions = [];
    const tabContentWidths = this.tabContentWidths;
    const tabContentWidthsLength = tabContentWidths.length;
    let position = TAB_CONTENT_MARGIN;

    for (let i = 0; i < tabContentWidthsLength; i++) {
      const width = tabContentWidths[i];
      positions.push(position - i);
      position += width;
    }

    return positions;
  }

  get tabPositions() {
    const positions = [];
    const tabContentPositionsLength = this.tabContentPositions.length;
    for (let i = 0; i < tabContentPositionsLength; i++) {
      positions.push(this.tabContentPositions[i] - TAB_CONTENT_MARGIN);
    }

    return positions;
  }

  layoutTabs() {
    const tabContentWidths = this.tabContentWidths;
    const tabElsLength = this.tabEls.length;
    for (let i = 0; i < tabElsLength; i++) {
      const tabEl = this.tabEls[i];
      const contentWidth = tabContentWidths[i];
      const width = contentWidth + 2 * TAB_CONTENT_MARGIN;

      tabEl.style.width = `${width}px`;
      tabEl.removeAttribute('is-small');
      tabEl.removeAttribute('is-smaller');
      tabEl.removeAttribute('is-mini');

      if (contentWidth < TAB_SIZE_SMALL) tabEl.setAttribute('is-small', '');
      if (contentWidth < TAB_SIZE_SMALLER) tabEl.setAttribute('is-smaller', '');
      if (contentWidth < TAB_SIZE_MINI) tabEl.setAttribute('is-mini', '');
    }

    let styleHTML = '';
    for (let i = 0; i < this.tabPositions.length; i++) {
      styleHTML += `
        .chrome-tabs .chrome-tab:nth-child(${i + 1}) {
          transform: translate3d(${this.tabPositions[i]}px, 0, 0)
        }`;
    }
    this.styleEl.innerHTML = styleHTML;
  }

  createNewTabEl() {
    const div = document.createElement('div');
    div.innerHTML = tabTemplate;
    return div.firstElementChild;
  }

  addTab(tabProperties, { animate = true, background = false } = {}) {
    const tabEl = this.createNewTabEl();

    if (animate) {
      tabEl.classList.add('chrome-tab-was-just-added');
      tabEl.id = tabProperties.title;
      setTimeout(
        () => tabEl.classList.remove('chrome-tab-was-just-added'),
        150
      );
    }

    this.tabContentEl.appendChild(tabEl);
    this.setTabCloseEventListener(tabEl);
    this.updateTab(tabEl, tabProperties);
    if (!background) this.setCurrentTab(tabEl);
    this.cleanUpPreviouslyDraggedTabs();
    this.layoutTabs();
    this.setupDraggabilly();
  }

  setTabCloseEventListener(tabEl) {
    const closeEl = tabEl.querySelector('.chrome-tab-close');
    if (closeEl) {
      closeEl.addEventListener('click', (_) => this.removeTab(tabEl));
    }
  }

  get activeTabEl() {
    return this.el.querySelector('.chrome-tab[active]');
  }

  setCurrentTab(tabEl) {
    const activeTabEl = this.activeTabEl;
    if (activeTabEl === tabEl) return;
    if (activeTabEl) activeTabEl.removeAttribute('active');
    tabEl.setAttribute('active', '');
    const tabContentId = 'tab-content-' + tabEl.id;

    document.querySelectorAll('.tab-content').forEach((el) => {
      if (el.id === tabContentId) {
        el.style.display = 'block';
        if (terms[tabEl.id] && terms[tabEl.id].term) {
          terms[tabEl.id].term.focus();
        }
      } else {
        el.style.display = 'none';
      }
    });
  }

  removeTab(tabEl) {
    if (tabEl === this.activeTabEl) {
      if (tabEl.nextElementSibling) {
        this.setCurrentTab(tabEl.nextElementSibling);
      } else if (tabEl.previousElementSibling) {
        this.setCurrentTab(tabEl.previousElementSibling);
      }
    }
    tabEl.parentNode.removeChild(tabEl);
    const tabContainerId = 'tab-content-' + tabEl.id;
    document
      .getElementById('containers')
      .removeChild(document.getElementById(tabContainerId));
    delete terms[tabEl.id];
    this.cleanUpPreviouslyDraggedTabs();
    this.layoutTabs();
    this.setupDraggabilly();
  }

  updateTab(tabEl, tabProperties) {
    tabEl.querySelector('.chrome-tab-title').textContent = tabProperties.title;
  }

  cleanUpPreviouslyDraggedTabs() {
    for (let i = 0; i < this.tabEls.length; i++) {
      this.tabEls[i].classList.remove('chrome-tab-was-just-dragged');
    }
  }

  setupDraggabilly() {
    const tabEls = this.tabEls;
    const tabPositions = this.tabPositions;

    if (this.isDragging) {
      this.isDragging = false;
      this.el.classList.remove('chrome-tabs-is-sorting');
      this.draggabillyDragging.element.classList.remove(
        'chrome-tab-is-dragging'
      );
      this.draggabillyDragging.element.style.transform = '';
      this.draggabillyDragging.dragEnd();
      this.draggabillyDragging.isDragging = false;
      // Prevent Draggabilly from updating tabEl.style.transform in later frames
      this.draggabillyDragging.positionDrag = noop;
      this.draggabillyDragging.destroy();
      this.draggabillyDragging = null;
    }

    for (let i = 0; i < this.draggabillies.length; i++) {
      this.draggabillies[i].destroy();
    }

    for (let i = 0; i < tabEls.length; i++) {
      const tabEl = tabEls[i];
      const originalTabPositionX = tabPositions[i];
      const draggabilly = new Draggabilly(tabEl, {
        axis: 'x',
        handle: '.chrome-tab-drag-handle',
        containment: this.tabContentEl,
      });

      this.draggabillies.push(draggabilly);

      draggabilly.on('pointerDown', (_) => this.setCurrentTab(tabEl));

      draggabilly.on('dragStart', (_) => {
        this.isDragging = true;
        this.draggabillyDragging = draggabilly;
        tabEl.classList.add('chrome-tab-is-dragging');
        this.el.classList.add('chrome-tabs-is-sorting');
      });

      draggabilly.on('dragEnd', (_) => {
        this.isDragging = false;
        requestAnimationFrame(() => {
          tabEl.classList.remove('chrome-tab-is-dragging');
          this.el.classList.remove('chrome-tabs-is-sorting');
          tabEl.classList.add('chrome-tab-was-just-dragged');
          requestAnimationFrame(() => {
            this.layoutTabs();
            this.setupDraggabilly();
          });
        });
      });

      draggabilly.on('dragMove', (event, pointer, moveVector) => {
        // Current index be computed within the event since it can change during the dragMove
        const tabEls = this.tabEls;
        const currentIndex = tabEls.indexOf(tabEl);

        const currentTabPositionX = originalTabPositionX + moveVector.x;
        const destinationIndexTarget = closest(
          currentTabPositionX,
          tabPositions
        );
        const destinationIndex = Math.max(
          0,
          Math.min(tabEls.length, destinationIndexTarget)
        );

        if (currentIndex !== destinationIndex) {
          this.animateTabMove(tabEl, currentIndex, destinationIndex);
        }
      });
    }
  }

  animateTabMove(tabEl, originIndex, destinationIndex) {
    if (destinationIndex < originIndex) {
      tabEl.parentNode.insertBefore(tabEl, this.tabEls[destinationIndex]);
    } else {
      tabEl.parentNode.insertBefore(tabEl, this.tabEls[destinationIndex + 1]);
    }
    this.layoutTabs();
  }
}
