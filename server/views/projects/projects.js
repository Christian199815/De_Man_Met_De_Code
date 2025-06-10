/**
 * Clean Object Pool System - JavaScript Only (Simplified Version)
 * UPDATED: Optimized to work seamlessly with external search functionality
 * REMOVED: Any potential search conflicts
 */

class CleanGridPool {
  constructor(options = {}) {
    this.config = {
      containerSelector: options.containerSelector || '#dynamicGrid',
      defaultShowCount: options.defaultShowCount || 100,
      fullWidthEveryRows: options.fullWidthEveryRows || 5,
      columnsCount: options.columnsCount || 5,
      debug: options.debug || false
    };

    this.pools = {
      projects: [],
      squares: [],
      custom: [],
      fullWidth: [],
      mixed: []
    };

    this.state = {
      currentShowCount: this.config.defaultShowCount,
      isInitialized: false
    };

    this.container = document.querySelector(this.config.containerSelector);

    this.init();
  }

  initializeCustomComponents() {
  this.initializeFullWidthComponents();
  this.initializeCrocodileComponents(); // Add this line
  
  document.dispatchEvent(new CustomEvent('gridRerendered', {
    detail: { gridInstance: this }
  }));
}

// Add this new method to handle crocodile initialization
initializeCrocodileComponents() {
  const crocodileContainers = this.container.querySelectorAll('.crocodile-container');
  
  crocodileContainers.forEach((container) => {
    // Check if already initialized to prevent duplicates
    if (container.querySelector('.croc-wrapper')) {
      return;
    }
    
    // Trigger crocodile initialization if function exists
    if (typeof window.initializeCrocodiles === 'function') {
      window.initializeCrocodiles();
    } else {
      // If the function doesn't exist globally, dispatch an event
      document.dispatchEvent(new CustomEvent('initializeCrocodiles', {
        detail: { container: container }
      }));
    }
  });
}

  init() {
    if (!this.container) {
      return;
    }

    this.loadFromDOM();
    this.createProperRowLayout();
    this.renderGrid();
    this.initializeCustomComponents();
    
    // Mark page as loaded immediately
    document.body.classList.add('page-loaded');
    
    // Listen for search events to ensure grid updates properly
    this.setupSearchIntegration();
  }

  setupSearchIntegration() {
    // Listen for search events and refresh grid if needed
    document.addEventListener('projectSearch', (event) => {
      // Small delay to allow search to complete, then refresh custom components
      setTimeout(() => {
        this.refreshVisibleElements();
      }, 100);
    });
    
    // Listen for grid re-render requests
    document.addEventListener('gridRefreshRequested', () => {
      this.refreshVisibleElements();
    });
  }

  refreshVisibleElements() {
    // Re-initialize components for currently visible elements
    this.initializeCustomComponents();
  }

  loadFromDOM() {
    const projectCards = this.container.querySelectorAll('.project-card');
    const squares = this.container.querySelectorAll('.square, [data-type="square"]');
    const customItems = this.container.querySelectorAll('.break-glass-card, [data-type="custom"], [data-component="break-glass"]');
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');

    if (this.config.debug) {
      console.log('=== DOM Order Debug ===');
    }
    
    projectCards.forEach((element, index) => {
      const titleEl = element.querySelector('.project-title, h3, .title, .project-details h2, h2');
      const dateEl = element.querySelector('.date, .project-date');
      const title = titleEl ? titleEl.textContent.trim() : `Project ${index}`;
      const date = dateEl ? dateEl.textContent.trim() : 'No date';
      
      if (this.config.debug && index < 10) {
        console.log(`${index + 1}. ${title} - ${date}`);
      }
      
      this.pools.projects.push({
        element: element.cloneNode(true),
        type: 'project',
        spans: this.getItemSpans(element),
        data: { id: `project-${index}`, index, title }
      });
    });

    squares.forEach((element, index) => {
      this.pools.squares.push({
        element: element.cloneNode(true),
        type: 'square',
        spans: this.getItemSpans(element),
        data: { id: `square-${index}`, index }
      });
    });

    customItems.forEach((element, index) => {
      this.pools.custom.push({
        element: element.cloneNode(true),
        type: 'custom',
        spans: this.getItemSpans(element),
        data: { id: `custom-${index}`, index }
      });
    });

    fullWidthItems.forEach((element, index) => {
      this.pools.fullWidth.push({
        element: element.cloneNode(true),
        type: 'fullWidth',
        spans: this.config.columnsCount,
        data: { id: `fullwidth-${index}`, index }
      });
    });
    
    if (this.config.debug) {
      console.log(`Loaded ${this.pools.projects.length} projects, ${this.pools.squares.length} squares, ${this.pools.custom.length} custom items`);
    }
  }

  getItemSpans(element) {
    if (element.classList.contains('landscape-card') || element.classList.contains('landscape')) {
      return 2;
    }
    return 1;
  }

  createProperRowLayout() {
    this.pools.mixed = [];
    
    const regularItems = [
      ...this.pools.projects,
      ...this.pools.squares,
      ...this.pools.custom
    ];

    if (regularItems.length === 0) {
      return;
    }

    if (this.config.debug) {
      console.log('=== Regular Items Order Before Layout ===');
      regularItems.slice(0, 10).forEach((item, index) => {
        const title = item.data.title || `Item ${index}`;
        console.log(`${index + 1}. ${title} (${item.type})`);
      });
    }

    let currentRow = 0;
    let currentColumn = 0;
    let regularRowsProcessed = 0;
    let fullWidthIndex = 0;
    
    const totalColumns = this.config.columnsCount;
    const rowsBeforeFullWidth = this.config.fullWidthEveryRows;
    const fullWidthItemsToUse = this.pools.fullWidth.length;

    for (let i = 0; i < regularItems.length; i++) {
      const item = regularItems[i];
      const itemSpans = item.spans || 1;
      
      if (currentColumn + itemSpans > totalColumns) {
        regularRowsProcessed++;
        currentRow++;
        currentColumn = 0;
        
        if (regularRowsProcessed > 0 && 
            regularRowsProcessed % rowsBeforeFullWidth === 0 && 
            fullWidthIndex < fullWidthItemsToUse) {
          
          this.pools.mixed.push({
            ...this.pools.fullWidth[fullWidthIndex],
            rowPosition: currentRow,
            columnStart: 0,
            isFullWidth: true
          });
          fullWidthIndex++;
          currentRow++;
        }
      }
      
      this.pools.mixed.push({
        ...item,
        rowPosition: currentRow,
        columnStart: currentColumn
      });
      
      currentColumn += itemSpans;
    }
    
    while (fullWidthIndex < fullWidthItemsToUse) {
      currentRow++;
      this.pools.mixed.push({
        ...this.pools.fullWidth[fullWidthIndex],
        rowPosition: currentRow,
        columnStart: 0,
        isFullWidth: true
      });
      fullWidthIndex++;
    }
    
    if (this.config.debug) {
      console.log('=== Final Mixed Order ===');
      this.pools.mixed.slice(0, 15).forEach((item, index) => {
        const title = item.data.title || `Item ${index}`;
        const type = item.isFullWidth ? 'FULL-WIDTH' : item.type;
        console.log(`${index + 1}. ${title} (${type}) - Row: ${item.rowPosition}, Col: ${item.columnStart}`);
      });
    }
  }

  renderGrid() {
    if (!this.container) return;

    const itemsToShow = this.pools.mixed.slice(0, this.state.currentShowCount);
    
    this.container.innerHTML = '';

    const itemsByRow = {};
    itemsToShow.forEach(item => {
      if (!itemsByRow[item.rowPosition]) {
        itemsByRow[item.rowPosition] = [];
      }
      itemsByRow[item.rowPosition].push(item);
    });

    Object.keys(itemsByRow).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowIndex => {
      const rowItems = itemsByRow[rowIndex];
      
      rowItems.forEach((item) => {
        const element = item.element.cloneNode(true);
        
        element.classList.add(`grid-row-${item.rowPosition}`);
        element.classList.add(`grid-col-start-${item.columnStart}`);
        
        const globalIndex = this.pools.mixed.indexOf(item);
        element.style.animationDelay = `${globalIndex * 0.05}s`;
        
        // Add data attributes that search can use
        element.setAttribute('data-pool-type', item.type);
        element.setAttribute('data-row', item.rowPosition);
        element.setAttribute('data-col-start', item.columnStart);
        element.setAttribute('data-spans', item.spans);
        
        if (item.isFullWidth) {
          element.classList.add('full-width-active');
        }
        
        this.container.appendChild(element);
      });
    });
    
    setTimeout(() => {
      this.initializeCustomComponents();
    }, 100);
  }
  
  initializeCustomComponents() {
    this.initializeFullWidthComponents();
    
    document.dispatchEvent(new CustomEvent('gridRerendered', {
      detail: { gridInstance: this }
    }));
  }

  initializeFullWidthComponents() {
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');

    fullWidthItems.forEach((item) => {
      const form = item.querySelector('.newsletter-form');
      if (form) {
        // Remove existing listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = newForm.querySelector('.newsletter-input').value;
          if (email) {
            alert(`Thank you for subscribing with: ${email}`);
            newForm.reset();
          }
        });
      }
    });
  }

  // Public method to refresh the grid (useful after search operations)
  refresh() {
    this.refreshVisibleElements();
  }
}

// CategoryFilter will be loaded separately from your standalone script

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  
  const isProjectsRoute = currentPath === '/projects' || 
                         currentPath === '/projects/' || 
                         currentPath.startsWith('/projects/');
  
  if (isProjectsRoute) {
    window.cleanGridPool = new CleanGridPool({
      containerSelector: '#dynamicGrid',
      defaultShowCount: 50,
      fullWidthEveryRows: 5,
      columnsCount: 5,
      debug: false
    });

    window.gridPool = window.cleanGridPool;

  } else {
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
});

