/**
 * Clean Object Pool System - JavaScript Only (Simplified Version)
 * FIXED: Removed randomizer to preserve server-side date sorting
 * FIXED: titleEl scope issue in loadFromDOM method
 * REMOVED: PageLoader class and all control functionality for maximum simplicity
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

  init() {
    if (!this.container) {
      return;
    }

    this.loadFromDOM();
    this.createProperRowLayout();
    this.renderGrid();
    this.initializeCustomComponents();
    this.fixAspectRatioSpanning();
    
    // Mark page as loaded immediately
    document.body.classList.add('page-loaded');
  }

  loadFromDOM() {
    const projectCards = this.container.querySelectorAll('.project-card');
    const squares = this.container.querySelectorAll('.square, [data-type="square"]');
    const customItems = this.container.querySelectorAll('.break-glass-card, [data-type="custom"], [data-component="break-glass"]');
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');

    if (this.config.debug) {
      console.log('=== DOM Order Debug ===');
      console.log('First 10 project cards in DOM order:');
    }
    
    projectCards.forEach((element, index) => {
      // Define titleEl and dateEl within the forEach scope
      const titleEl = element.querySelector('.project-title, h3, .title');
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

  // Items maintain their DOM order which reflects the server-side date sorting
  if (this.config.debug) {
    console.log('=== Regular Items Order Before Layout ===');
    regularItems.slice(0, 10).forEach((item, index) => {
      const title = item.data.title || `Item ${index}`;
      console.log(`${index + 1}. ${title} (${item.type})`);
    });
  }

  // Preserve order and place items sequentially
  let currentRow = 0;
  let currentColumn = 0;
  let regularRowsProcessed = 0;
  let fullWidthIndex = 0;
  
  const totalColumns = this.config.columnsCount;
  const rowsBeforeFullWidth = this.config.fullWidthEveryRows;
  
  // Use ALL available full-width items instead of limiting them
  const fullWidthItemsToUse = this.pools.fullWidth.length;

  for (let i = 0; i < regularItems.length; i++) {
    const item = regularItems[i];
    const itemSpans = item.spans || 1;
    
    // Check if we need to move to next row
    if (currentColumn + itemSpans > totalColumns) {
      regularRowsProcessed++;
      currentRow++;
      currentColumn = 0;
      
      // Check if we should insert a full-width item
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
    
    // Place the current item
    this.pools.mixed.push({
      ...item,
      rowPosition: currentRow,
      columnStart: currentColumn
    });
    
    currentColumn += itemSpans;
  }
  
  // Add any remaining full-width items at the end
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
      
      rowItems.forEach((item, index) => {
        const element = item.element.cloneNode(true);
        
        element.classList.add(`grid-row-${item.rowPosition}`);
        element.classList.add(`grid-col-start-${item.columnStart}`);
        
        const globalIndex = this.pools.mixed.indexOf(item);
        element.style.animationDelay = `${globalIndex * 0.05}s`;
        
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
      this.fixAspectRatioSpanning();
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
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = form.querySelector('.newsletter-input').value;
          if (email) {
            alert(`Thank you for subscribing with: ${email}`);
            form.reset();
          }
        });
      }
    });
  }

  fixAspectRatioSpanning() {
    const projectCards = this.container.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      const isPortraitByClass = card.classList.contains('portrait-card') || card.classList.contains('portrait');
      
      const img = card.querySelector('img');
      let isPortraitByRatio = false;
      
      if (img && img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        isPortraitByRatio = aspectRatio < 0.9;
      }
      
      const isPortrait = isPortraitByClass || isPortraitByRatio;
      
      if (isPortrait) {
        card.classList.add('portrait-card');
        card.setAttribute('data-aspect-ratio', 'portrait');
      } else {
        const isLandscapeByClass = card.classList.contains('landscape-card') || card.classList.contains('landscape');
        let isLandscapeByRatio = false;
        
        if (img && img.naturalWidth && img.naturalHeight) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          isLandscapeByRatio = aspectRatio > 1.1;
        }
        
        const isLandscape = isLandscapeByClass || isLandscapeByRatio;
        
        if (isLandscape) {
          card.classList.add('landscape-card');
          card.setAttribute('data-aspect-ratio', 'landscape');
        } else {
          card.classList.add('square');
          card.setAttribute('data-aspect-ratio', 'square');
        }
      }
    });
  }
}

// Category Filter
window.CategoryFilter = {
  isInitialized: false,
  currentCategory: 'all',
  categories: ['DECOR', 'INTERIEUR', 'PROPS'],
  
  filterProjects: function(selectedCategory) {
    const dynamicGrid = document.getElementById('dynamicGrid');
    if (!dynamicGrid) return 0;
    
    const projectCards = dynamicGrid.querySelectorAll('.project-card');
    let visibleCount = 0;
    
    projectCards.forEach((card, index) => {
      const cardCategory = this.getCardCategory(card);
      const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory.toUpperCase();
      
      if (shouldShow) {
        card.style.display = '';
        card.classList.remove('filtered-out');
        card.classList.add('filtered-in');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('filtered-out');
        card.classList.remove('filtered-in');
      }
    });
    
    const nonProjectItems = dynamicGrid.querySelectorAll('.break-glass-card, .full-width-component, [data-type="custom"], [data-type="full-width"]');
    nonProjectItems.forEach(item => {
      item.style.display = '';
    });
    
    this.updateVisibleCount(visibleCount, projectCards.length, selectedCategory);
    return visibleCount;
  },
  
  getCardCategory: function(card) {
    const categoryElement = card.querySelector('.category p');
    if (categoryElement && categoryElement.textContent.trim()) {
      const categoryText = categoryElement.textContent.trim().toUpperCase();
      return categoryText;
    }
    
    const dataCategory = card.getAttribute('data-category');
    if (dataCategory) {
      return dataCategory.toUpperCase();
    }
    
    return '';
  },
  
  updateVisibleCount: function(visible, total, category) {
    const visibleCountElement = document.getElementById('visibleCount');
    if (visibleCountElement) {
      const categoryText = category === 'all' ? 'alle categorieën' : category;
      visibleCountElement.textContent = `${visible} van ${total} projecten zichtbaar (${categoryText})`;
    }
  },
  
  updateButtonStates: function(selectedCategory) {
    const labels = document.querySelectorAll('.filter-btn');
    labels.forEach(label => {
      const labelCategory = label.getAttribute('data-category');
      if (labelCategory === selectedCategory) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  },
  
  debugCategoryStructure: function() {
    const dynamicGrid = document.getElementById('dynamicGrid');
    if (!dynamicGrid) return;
    
    const projectCards = dynamicGrid.querySelectorAll('.project-card');
  },
  
  init: function() {
    setTimeout(() => {
      const radioInputs = document.querySelectorAll('.filter-radio');
      
      radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            const category = e.target.value;
            this.currentCategory = category;
            this.updateButtonStates(category);
            this.filterProjects(category);
          }
        });
      });
      
      const labels = document.querySelectorAll('.filter-btn');
      labels.forEach(label => {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          const category = label.getAttribute('data-category');
          const radio = document.querySelector(`input[value="${category}"]`);
          if (radio && !radio.checked) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
          }
        });
      });
      
      this.filterProjects('all');
      this.updateButtonStates('all');
      this.isInitialized = true;
      this.debugCategoryStructure();
      
    }, 2000);
  }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  
  const isProjectsRoute = currentPath === '/projects' || 
                         currentPath === '/projects/' || 
                         currentPath.startsWith('/projects/');
  
  if (isProjectsRoute) {
    // Initialize grid immediately - clean and simple
    window.cleanGridPool = new CleanGridPool({
      containerSelector: '#dynamicGrid',
      defaultShowCount: 50,
      fullWidthEveryRows: 5,
      columnsCount: 5,
      debug: false
    });

    window.gridPool = window.cleanGridPool;
    window.CategoryFilter.init();
  } else {
    // Immediately mark as loaded for non-projects pages
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
});