/**
 * Clean Object Pool System - JavaScript Only (Reverted + Page Loader)
 */

class CleanGridPool {
  constructor(options = {}) {
    this.config = {
      containerSelector: options.containerSelector || '#dynamicGrid',
      controlsSelector: options.controlsSelector || '.grid-controls',
      defaultShowCount: options.defaultShowCount || 50,
      fullWidthEveryRows: options.fullWidthEveryRows || 3,
      columnsCount: options.columnsCount || 5,
      debug: options.debug || true
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
    this.controls = document.querySelector(this.config.controlsSelector);

    this.init();
  }

  init() {
  if (!this.container) {
    console.error('❌ Container not found');
    return;
  }

  this.loadFromDOM();
  this.createProperRowLayout();
  this.renderGrid();
  this.createControls(); // This now sets up hidden controls
  this.initializeCustomComponents();
  this.fixAspectRatioSpanning();
  
  console.log('✅ Clean Grid Pool initialized');
  console.log('🎛️ Debug controls hidden - Press "D" to toggle');
  }

  loadFromDOM() {
    console.log('📡 Loading items from DOM...');

    const projectCards = this.container.querySelectorAll('.project-card');
    const squares = this.container.querySelectorAll('.square, [data-type="square"]');
    const customItems = this.container.querySelectorAll('.break-glass-card, [data-type="custom"]');
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');

    // Convert to pool format
    projectCards.forEach((element, index) => {
      this.pools.projects.push({
        element: element.cloneNode(true),
        type: 'project',
        spans: this.getItemSpans(element),
        data: { id: `project-${index}`, index }
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

    console.log('📊 Loaded items:', {
      projects: this.pools.projects.length,
      squares: this.pools.squares.length,
      custom: this.pools.custom.length,
      fullWidth: this.pools.fullWidth.length
    });
  }

  getItemSpans(element) {
    if (element.classList.contains('landscape-card') || element.classList.contains('landscape')) {
      return 2;
    }
    return 1;
  }

  estimateRequiredRows(items, columnsPerRow) {
  if (items.length === 0) return 0;
  
  let estimatedRows = 0;
  let currentRowFill = 0;
  
  // Simple estimation - assume average spanning
  items.forEach(item => {
    const spans = item.spans || 1;
    
    if (currentRowFill + spans > columnsPerRow) {
      // Start new row
      estimatedRows++;
      currentRowFill = spans;
    } else {
      currentRowFill += spans;
    }
  });
  
  // Add final row if there's content
  if (currentRowFill > 0) {
    estimatedRows++;
  }
  
  return estimatedRows;
}

  createProperRowLayout() {
  console.log('🎯 Creating smart row layout...');
  
  this.pools.mixed = [];
  
  const regularItems = [
    ...this.pools.projects,
    ...this.pools.squares,
    ...this.pools.custom
  ];

  // Early exit if no regular items
  if (regularItems.length === 0) {
    console.log('❌ No regular items found - skipping full-width components');
    return;
  }

  this.shuffleArray(regularItems);

  const totalColumns = this.config.columnsCount;
  const rowsBeforeFullWidth = this.config.fullWidthEveryRows;
  
  // Calculate how many complete rows we can make from regular items
  const estimatedRegularRows = this.estimateRequiredRows(regularItems, totalColumns);
  
  // Calculate how many full-width items we should actually use
  const maxPossibleFullWidthItems = Math.floor(estimatedRegularRows / rowsBeforeFullWidth);
  const fullWidthItemsToUse = Math.min(maxPossibleFullWidthItems, this.pools.fullWidth.length);
  
  console.log(`📊 Regular items: ${regularItems.length}`);
  console.log(`📊 Estimated regular rows: ${estimatedRegularRows}`);
  console.log(`📊 Max possible full-width items: ${maxPossibleFullWidthItems}`);
  console.log(`📊 Full-width items to use: ${fullWidthItemsToUse}`);
  
  // If we don't have enough content for even one full-width item, skip them entirely
  if (fullWidthItemsToUse === 0) {
    console.log('⚠️ Not enough content for full-width items - using regular items only');
    regularItems.forEach((item, index) => {
      this.pools.mixed.push({
        ...item,
        rowPosition: Math.floor(index / totalColumns),
        columnStart: index % totalColumns
      });
    });
    return;
  }

  // Proceed with smart layout that includes full-width items
  let fullWidthIndex = 0;
  let currentRow = 0;
  let currentRowColumns = 0;
  let regularItemIndex = 0;
  let regularRowsProcessed = 0;

  while (regularItemIndex < regularItems.length) {
    
    // Fill current row with regular items
    while (currentRowColumns < totalColumns && regularItemIndex < regularItems.length) {
      const item = regularItems[regularItemIndex];
      const itemSpans = item.spans;
      
      if (currentRowColumns + itemSpans <= totalColumns) {
        this.pools.mixed.push({
          ...item,
          rowPosition: currentRow,
          columnStart: currentRowColumns
        });
        currentRowColumns += itemSpans;
        regularItemIndex++;
      } else {
        // Try to find a smaller item that fits
        let found = false;
        for (let i = regularItemIndex + 1; i < regularItems.length; i++) {
          const testItem = regularItems[i];
          if (testItem.spans <= (totalColumns - currentRowColumns)) {
            // Swap items to use the smaller one now
            regularItems.splice(i, 1);
            regularItems.splice(regularItemIndex, 0, testItem);
            
            this.pools.mixed.push({
              ...testItem,
              rowPosition: currentRow,
              columnStart: currentRowColumns
            });
            currentRowColumns += testItem.spans;
            regularItemIndex++;
            found = true;
            break;
          }
        }
        
        if (!found) {
          break; // Move to next row
        }
      }
    }

    // Complete the row
    if (currentRowColumns > 0) {
      regularRowsProcessed++;
      currentRow++;
      currentRowColumns = 0;
    }

    // Check if we should insert a full-width item
    const shouldInsertFullWidth = 
      regularRowsProcessed > 0 && 
      regularRowsProcessed % rowsBeforeFullWidth === 0 && 
      fullWidthIndex < fullWidthItemsToUse &&
      regularItemIndex < regularItems.length; // Only if we have more content coming

    if (shouldInsertFullWidth) {
      this.pools.mixed.push({
        ...this.pools.fullWidth[fullWidthIndex],
        rowPosition: currentRow,
        columnStart: 0,
        isFullWidth: true
      });
      fullWidthIndex++;
      currentRow++;
      
      console.log(`📐 Inserted full-width item ${fullWidthIndex} at row ${currentRow - 1} (after ${regularRowsProcessed} regular rows)`);
    }
  }

  console.log(`✅ Created smart layout with ${this.pools.mixed.length} items across ${currentRow} rows`);
  console.log(`📊 Used ${fullWidthIndex}/${this.pools.fullWidth.length} full-width components`);
  }

  renderGrid() {
    console.log('🎨 Rendering grid...');

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
          console.log(`📐 Rendering full-width item at row ${item.rowPosition}`);
        }
        
        this.container.appendChild(element);
      });
    });

    console.log(`🎨 Rendered ${itemsToShow.length} items across ${Object.keys(itemsByRow).length} rows`);
    
    setTimeout(() => {
      this.initializeCustomComponents();
      this.fixAspectRatioSpanning();
    }, 100);
  }

  createControls() {
  if (!this.controls) return;

  const totalItems = this.pools.mixed.length;
  const regularItemsCount = this.pools.projects.length + this.pools.squares.length + this.pools.custom.length;
  const fullWidthItemsUsed = this.pools.mixed.filter(item => item.isFullWidth).length;

  this.controls.innerHTML = `
    <div class="grid-controls-inner" style="display: none;">
      <div class="control-group">
        <label for="show-count">Show items:</label>
        <select id="show-count" class="show-count-select">
          <option value="20">20 items</option>
          <option value="30">30 items</option>
          <option value="50" selected>50 items</option>
          <option value="all">All items (${totalItems})</option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="full-width-frequency">Full-width every:</label>
        <select id="full-width-frequency" class="show-count-select">
          <option value="2">2 rows</option>
          <option value="3" selected>3 rows</option>
          <option value="4">4 rows</option>
          <option value="5">5 rows</option>
          <option value="never">Never show</option>
        </select>
      </div>
      
      <div class="control-group">
        <button id="shuffle-btn" class="control-button">Shuffle</button>
        <button id="debug-btn" class="control-button">Debug</button>
      </div>
      
      <div class="items-info">
        Showing <span class="current-count">${Math.min(this.state.currentShowCount, totalItems)}</span> 
        of <span class="total-count">${totalItems}</span>
        <br>
        <small>
          ${regularItemsCount} regular items, 
          ${fullWidthItemsUsed}/${this.pools.fullWidth.length} full-width used
        </small>
      </div>
    </div>
    
    <div class="debug-hint" style="
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      opacity: 0.5;
      z-index: 1000;
      pointer-events: none;
      transition: opacity 0.3s ease;
    ">
      Press 'D' for debug controls
    </div>
  `;

  this.attachControlEvents();
  this.setupDebugToggle();
  }

  setupDebugToggle() {
  const controlsInner = this.controls.querySelector('.grid-controls-inner');
  const debugHint = this.controls.querySelector('.debug-hint');
  let controlsVisible = false;
  let hintTimeout;

  // Show hint briefly on page load
  if (debugHint) {
    setTimeout(() => {
      debugHint.style.opacity = '0.8';
      hintTimeout = setTimeout(() => {
        debugHint.style.opacity = '0.2';
      }, 3000);
    }, 1000);
  }

  // Listen for 'D' key press
  document.addEventListener('keydown', (e) => {
    // Check if 'D' or 'd' is pressed (not in an input field)
    if ((e.key === 'D' || e.key === 'd') && !this.isTypingInInput(e.target)) {
      e.preventDefault();
      
      controlsVisible = !controlsVisible;
      
      if (controlsInner) {
        controlsInner.style.display = controlsVisible ? 'flex' : 'none';
      }
      
      if (debugHint) {
        if (controlsVisible) {
          debugHint.textContent = "Press 'D' to hide controls";
          debugHint.style.opacity = '0.8';
          clearTimeout(hintTimeout);
        } else {
          debugHint.textContent = "Press 'D' for debug controls";
          debugHint.style.opacity = '0.2';
        }
      }
      
      console.log(controlsVisible ? '🎛️ Debug controls shown' : '🙈 Debug controls hidden');
    }
  });

  // Hide hint when hovering over controls
  if (controlsInner && debugHint) {
    controlsInner.addEventListener('mouseenter', () => {
      if (controlsVisible) {
        debugHint.style.opacity = '0.1';
      }
    });
    
    controlsInner.addEventListener('mouseleave', () => {
      if (controlsVisible) {
        debugHint.style.opacity = '0.5';
      }
    });
  }
  }

  isTypingInInput(target) {
  const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
  return inputTypes.includes(target.tagName) || 
         target.contentEditable === 'true' ||
         target.isContentEditable;
  }


  attachControlEvents() {
  const showCountSelect = document.getElementById('show-count');
  if (showCountSelect) {
    showCountSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      this.state.currentShowCount = value === 'all' ? this.pools.mixed.length : parseInt(value);
      this.renderGrid();
      this.updateControlsDisplay();
    });
  }

  const fullWidthFrequency = document.getElementById('full-width-frequency');
  if (fullWidthFrequency) {
    fullWidthFrequency.addEventListener('change', (e) => {
      const value = e.target.value;
      
      if (value === 'never') {
        this.config.fullWidthEveryRows = 999; // Effectively never
        console.log('🔄 Full-width components disabled');
      } else {
        this.config.fullWidthEveryRows = parseInt(value);
        console.log(`🔄 Changed full-width frequency to every ${this.config.fullWidthEveryRows} rows`);
      }
      
      this.createProperRowLayout();
      this.renderGrid();
      this.updateControlsDisplay();
    });
  }

  const shuffleBtn = document.getElementById('shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      console.log('🎲 Shuffling items...');
      this.createProperRowLayout();
      this.renderGrid();
    });
  }

  const debugBtn = document.getElementById('debug-btn');
  if (debugBtn) {
    debugBtn.addEventListener('click', () => this.showDebugInfo());
  }
  }

  updateControlsDisplay() {
    const currentSpan = this.controls?.querySelector('.current-count');
    const totalSpan = this.controls?.querySelector('.total-count');

    if (currentSpan) currentSpan.textContent = Math.min(this.state.currentShowCount, this.pools.mixed.length);
    if (totalSpan) totalSpan.textContent = this.pools.mixed.length;
  }
  

  initializeCustomComponents() {
    console.log('🎯 Initializing custom components...');
    this.initializeBreakGlass();
    this.initializeFullWidthComponents();
  }

  initializeBreakGlass() {
    const signs = this.container.querySelectorAll('.break-glass-card .sign');
    console.log('🎯 Initializing break glass for', signs.length, 'items');

    signs.forEach((sign) => {
      const newSign = sign.cloneNode(true);
      sign.parentNode.replaceChild(newSign, sign);

      newSign.addEventListener('click', function() {
        console.log('💥 Break glass clicked!');

        const card = this.closest('.break-glass-card');
        const brokenGlass = card.querySelector('.broken-glass');
        const glassSound = card.querySelector('#glassSound');

        this.classList.add('shake');

        if (glassSound) {
          glassSound.currentTime = 0;
          glassSound.play().catch(e => console.log('Audio play failed:', e));
        }

        if (brokenGlass) {
          brokenGlass.classList.add('active');
        }

        setTimeout(() => this.classList.remove('shake'), 400);
        setTimeout(() => {
          if (brokenGlass) brokenGlass.classList.remove('active');
        }, 3000);
      });
    });
  }

  initializeFullWidthComponents() {
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');
    console.log('📐 Initializing full-width components for', fullWidthItems.length, 'items');

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
    console.log('🔧 Fixing aspect ratio spanning...');
    
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
    
    console.log('✅ Aspect ratio spanning fix complete');
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getRowDistribution() {
  const distribution = {};
  this.pools.mixed.forEach(item => {
    const row = item.rowPosition;
    if (!distribution[row]) {
      distribution[row] = { regular: 0, fullWidth: 0 };
    }
    if (item.isFullWidth) {
      distribution[row].fullWidth++;
    } else {
      distribution[row].regular++;
    }
  });
  return distribution;
  }

  showDebugInfo() {
  const fullWidthItemsUsed = this.pools.mixed.filter(item => item.isFullWidth).length;
  const regularItemsCount = this.pools.projects.length + this.pools.squares.length + this.pools.custom.length;
  const estimatedRows = this.estimateRequiredRows([...this.pools.projects, ...this.pools.squares, ...this.pools.custom], this.config.columnsCount);
  
  console.group('🐛 SMART LAYOUT DEBUG INFO');
  console.log('Pool Counts:', {
    projects: this.pools.projects.length,
    squares: this.pools.squares.length,
    custom: this.pools.custom.length,
    fullWidth: this.pools.fullWidth.length,
    mixed: this.pools.mixed.length
  });
  console.log('Layout Analysis:', {
    regularItems: regularItemsCount,
    estimatedRegularRows: estimatedRows,
    fullWidthItemsAvailable: this.pools.fullWidth.length,
    fullWidthItemsUsed: fullWidthItemsUsed,
    maxPossibleFullWidth: Math.floor(estimatedRows / this.config.fullWidthEveryRows),
    showCount: this.state.currentShowCount,
    fullWidthEveryRows: this.config.fullWidthEveryRows
  });
  console.log('Row Distribution:', this.getRowDistribution());
  console.groupEnd();
  }
}

// Page Loader System for Height Adjustment
class PageLoader {
  constructor() {
    this.isLoading = true;
    this.loadedImages = 0;
    this.totalImages = 0;
    this.loadingElement = null;
    
    // Check if we should initialize based on current route
    if (this.shouldInitialize()) {
      this.init();
    } else {
      console.log('📄 Page loader skipped - not on /projects route');
      this.isLoading = false;
    }
  }
  
  /**
   * Check if page loader should run based on current route
   */
 shouldInitialize() {
  const currentPath = window.location.pathname;
  
  // Only allow page loader on /projects routes
  const validRoutes = [
    '/projects',   // Main projects page
    '/projects/',  // With trailing slash
  ];
  
  // Check if current path matches any valid route
  const shouldRun = validRoutes.some(route => {
    return currentPath === route || currentPath.startsWith(route);
  });
  
  console.log(`📄 Current route: ${currentPath}`);
  console.log(`📄 Should run page loader: ${shouldRun}`);
  
  return shouldRun;
}
  
  init() {
    console.log('📄 Initializing page loader for projects route...');
    this.createLoader();
    this.waitForGridAndImages();
  }
  
  createLoader() {
    // Create loader overlay
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'page-loader';
    this.loadingElement.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">Loading projects...</div>
        <div class="loader-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">0%</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.loadingElement);
    console.log('📄 Page loader created for projects');
  }
  
  waitForGridAndImages() {
    // Wait for grid to be rendered
    const checkGrid = () => {
      const grid = document.getElementById('dynamicGrid');
      const images = grid ? grid.querySelectorAll('img') : [];
      
      if (!grid || images.length === 0) {
        setTimeout(checkGrid, 100);
        return;
      }
      
      console.log(`📄 Projects grid found with ${images.length} images`);
      this.totalImages = images.length;
      this.trackImageLoading(images);
    };
    
    setTimeout(checkGrid, 500); // Give grid time to render
  }
  
  trackImageLoading(images) {
    if (images.length === 0) {
      this.completeLoading();
      return;
    }
    
    this.updateProgress(0);
    
    images.forEach((img, index) => {
      if (img.complete && img.naturalHeight > 0) {
        this.onImageLoad();
      } else {
        img.addEventListener('load', () => this.onImageLoad());
        img.addEventListener('error', () => this.onImageLoad()); // Count errors as loaded
      }
    });
    
    // Timeout fallback
    setTimeout(() => {
      if (this.isLoading) {
        console.log('📄 Loader timeout - completing anyway');
        this.completeLoading();
      }
    }, 5000);
  }
  
  onImageLoad() {
    this.loadedImages++;
    const progress = Math.round((this.loadedImages / this.totalImages) * 100);
    this.updateProgress(progress);
    
    console.log(`📸 Project image loaded: ${this.loadedImages}/${this.totalImages} (${progress}%)`);
    
    if (this.loadedImages >= this.totalImages) {
      setTimeout(() => this.completeLoading(), 300); // Small delay for smooth UX
    }
  }
  
  updateProgress(percentage) {
    if (!this.loadingElement) return;
    
    const progressFill = this.loadingElement.querySelector('.progress-fill');
    const progressText = this.loadingElement.querySelector('.progress-text');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}%`;
  }
  
  completeLoading() {
    if (!this.isLoading) return;
    
    console.log('✅ Projects page loading complete - removing loader');
    this.isLoading = false;
    
    // Add loaded class to body
    document.body.classList.add('page-loaded');
    
    // Fade out loader
    if (this.loadingElement) {
      this.loadingElement.classList.add('fade-out');
      
      setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
      }, 500);
    }
    
    // Dispatch loaded event
    window.dispatchEvent(new CustomEvent('pageFullyLoaded'));
  }
  
  /**
   * Public method to manually trigger loading (if needed)
   */
  static initializeForCurrentRoute() {
    if (window.pageLoader) {
      console.log('📄 Page loader already exists');
      return window.pageLoader;
    }
    
    window.pageLoader = new PageLoader();
    return window.pageLoader;
  }
  
  /**
   * Public method to force complete loading (for debugging)
   */
  forceComplete() {
    console.log('🔧 Force completing page loader');
    this.completeLoading();
  }
}

// Clean Category Filter (No CSS)
window.CategoryFilter = {
  isInitialized: false,
  currentCategory: 'all',
  categories: ['DECOR', 'INTERIEUR', 'PROPS'],
  
  filterProjects: function(selectedCategory) {
    console.log('🔍 Filtering by category:', selectedCategory);
    
    const dynamicGrid = document.getElementById('dynamicGrid');
    if (!dynamicGrid) return 0;
    
    const projectCards = dynamicGrid.querySelectorAll('.project-card');
    let visibleCount = 0;
    
    projectCards.forEach((card) => {
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
    const categoryElement = card.querySelector('.catagorie p');
    if (categoryElement) {
      return categoryElement.textContent.trim().toUpperCase();
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
      
      console.log('✅ Category filter initialized');
    }, 2000);
  }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  
  // Only initialize projects components on /projects routes
  const isProjectsRoute = currentPath === '/projects' || 
                         currentPath === '/projects/' || 
                         currentPath.startsWith('/projects/');
  
  if (isProjectsRoute) {
    console.log('🎯 Initializing projects page components...');
    
    // Start page loader (will auto-check if it should run)
    window.pageLoader = new PageLoader();
    
    // Initialize grid pool
    window.cleanGridPool = new CleanGridPool({
      containerSelector: '#dynamicGrid',
      controlsSelector: '.grid-controls',
      defaultShowCount: 50,
      fullWidthEveryRows: 3,
      columnsCount: 5,
      debug: true
    });

    window.gridPool = window.cleanGridPool;
    window.CategoryFilter.init();
  } else {
    console.log('📄 Not on projects route - skipping projects-specific components');
    
    // Still add page-loaded class for other pages
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
});

window.debugPageLoader = function() {
  if (window.pageLoader) {
    console.log('Page Loader Status:', {
      isLoading: window.pageLoader.isLoading,
      loadedImages: window.pageLoader.loadedImages,
      totalImages: window.pageLoader.totalImages,
      currentRoute: window.location.pathname,
      shouldInitialize: window.pageLoader.shouldInitialize()
    });
  } else {
    console.log('No page loader instance found');
  }
};

console.log('🎯 Conditional Page Loader System loaded');

// Debug functions
window.debugAspectRatios = function() {
  const cards = document.querySelectorAll('#dynamicGrid .project-card');
  console.group('🐛 Aspect Ratios Debug');
  cards.forEach((card, index) => {
    const img = card.querySelector('img');
    const aspectRatio = img && img.naturalWidth && img.naturalHeight 
      ? (img.naturalWidth / img.naturalHeight).toFixed(2)
      : 'unknown';
    
    console.log(`Card ${index}:`, {
      classes: Array.from(card.classList),
      aspectRatio: aspectRatio,
      height: card.offsetHeight + 'px',
      width: card.offsetWidth + 'px'
    });
  });
  console.groupEnd();
};

window.debugCategoryFilter = function() {
  if (window.CategoryFilter) {
    console.log('Category Filter Status:', {
      initialized: window.CategoryFilter.isInitialized,
      currentCategory: window.CategoryFilter.currentCategory,
      categories: window.CategoryFilter.categories
    });
  }
};

console.log('🎯 Clean Grid Pool System loaded with Page Loader');


// Add these methods to your CleanGridPool class
class ImageHeightManager {
  constructor(gridContainer) {
    this.grid = gridContainer;
    this.observedImages = new Set();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
    this.init();
  }

  init() {
    console.log('🔧 Image Height Manager initialized');
    this.setupImageObserver();
    this.fixExistingImages();
  }

  setupImageObserver() {
    // Create intersection observer to handle images entering viewport
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleImageVisible(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Create resize observer for responsive height adjustments
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.adjustCardHeight(entry.target);
      });
    });
  }

  handleImageVisible(img) {
    if (this.observedImages.has(img)) return;
    
    this.observedImages.add(img);
    
    if (img.complete && img.naturalHeight > 0) {
      this.fixImageHeight(img);
    } else {
      img.addEventListener('load', () => this.fixImageHeight(img));
      img.addEventListener('error', () => this.handleImageError(img));
    }
  }

  fixImageHeight(img) {
    const card = img.closest('.project-card');
    if (!card) return;

    const wrapper = img.parentElement;
    const aspectRatio = card.getAttribute('data-aspect-ratio') || this.detectAspectRatio(img);
    
    // Set aspect ratio if not set
    if (!card.getAttribute('data-aspect-ratio')) {
      card.setAttribute('data-aspect-ratio', aspectRatio);
    }

    // Apply proper height based on aspect ratio
    this.applyHeightByAspectRatio(card, aspectRatio);
    
    // Ensure image fills wrapper properly
    this.ensureImageFit(img, wrapper);
    
    // Remove loading state
    card.classList.remove('loading');
    
    console.log(`✅ Fixed height for ${aspectRatio} image in card`);
  }

  detectAspectRatio(img) {
    if (!img.naturalWidth || !img.naturalHeight) return 'square';
    
    const ratio = img.naturalWidth / img.naturalHeight;
    
    if (ratio < 0.9) return 'portrait';
    if (ratio > 1.1) return 'landscape';
    return 'square';
  }

  applyHeightByAspectRatio(card, aspectRatio) {
    // Remove existing aspect ratio classes
    card.classList.remove('portrait-card', 'landscape-card', 'square');
    
    // Apply new class and styles
    switch (aspectRatio) {
      case 'portrait':
        card.classList.add('portrait-card');
        card.style.minHeight = '600px';
        card.style.height = 'auto';
        card.style.gridRow = 'span 2';
        card.style.gridColumn = 'span 1';
        break;
      case 'landscape':
        card.classList.add('landscape-card');
        card.style.height = '300px';
        card.style.minHeight = '300px';
        card.style.gridRow = 'span 1';
        card.style.gridColumn = 'span 2';
        break;
      case 'square':
      default:
        card.classList.add('square');
        card.style.height = '300px';
        card.style.minHeight = '300px';
        card.style.gridRow = 'span 1';
        card.style.gridColumn = 'span 1';
        break;
    }
  }

  ensureImageFit(img, wrapper) {
    // Critical image styling for proper height behavior
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.style.verticalAlign = 'top';
    
    // Ensure wrapper takes full card height
    if (wrapper) {
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.overflow = 'hidden';
      wrapper.style.boxSizing = 'border-box';
    }
  }

  handleImageError(img) {
    const card = img.closest('.project-card');
    const attempts = this.retryAttempts.get(img) || 0;
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(img, attempts + 1);
      
      // Try to reload the image after a delay
      setTimeout(() => {
        const newSrc = img.src;
        img.src = '';
        img.src = newSrc;
      }, 1000 * (attempts + 1));
      
      console.warn(`⚠️ Image load failed, retrying (${attempts + 1}/${this.maxRetries}):`, img.src);
    } else {
      // Give up and apply default styling
      console.error('❌ Image failed to load after retries:', img.src);
      this.applyDefaultStyling(card);
    }
  }

  applyDefaultStyling(card) {
    if (!card) return;
    
    card.classList.add('square');
    card.style.height = '300px';
    card.style.minHeight = '300px';
    card.style.backgroundColor = '#444';
    
    // Add placeholder content
    const wrapper = card.querySelector('.project-image-wrapper');
    if (wrapper && !wrapper.querySelector('.image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #999;
        font-size: 14px;
        text-align: center;
      `;
      placeholder.textContent = 'Image not available';
      wrapper.appendChild(placeholder);
    }
  }

  fixExistingImages() {
    const images = this.grid.querySelectorAll('.project-card img');
    console.log(`🔍 Checking ${images.length} existing images...`);
    
    images.forEach(img => {
      // Add loading class initially
      const card = img.closest('.project-card');
      if (card) card.classList.add('loading');
      
      // Observe the image
      this.imageObserver.observe(img);
      
      // If already loaded, fix immediately
      if (img.complete && img.naturalHeight > 0) {
        this.handleImageVisible(img);
      }
    });
  }

  adjustCardHeight(card) {
    if (!card.classList.contains('project-card')) return;
    
    const img = card.querySelector('img');
    if (!img || !img.complete) return;
    
    // Reapply height based on current viewport size
    const aspectRatio = card.getAttribute('data-aspect-ratio');
    if (aspectRatio) {
      this.applyResponsiveHeights(card, aspectRatio);
    }
  }

  applyResponsiveHeights(card, aspectRatio) {
    const width = window.innerWidth;
    
    if (width <= 480) {
      // Mobile: all cards same height
      card.style.height = '250px';
      card.style.minHeight = '250px';
    } else if (width <= 768) {
      // Tablet
      switch (aspectRatio) {
        case 'portrait':
          card.style.minHeight = '400px';
          break;
        case 'landscape':
          card.style.height = '200px';
          card.style.minHeight = '200px';
          break;
        case 'square':
          card.style.height = '200px';
          card.style.minHeight = '200px';
          break;
      }
    } else if (width <= 1200) {
      // Desktop
      switch (aspectRatio) {
        case 'portrait':
          card.style.minHeight = '560px';
          break;
        case 'landscape':
        case 'square':
          card.style.height = '280px';
          card.style.minHeight = '280px';
          break;
      }
    } else {
      // Large desktop - default heights
      switch (aspectRatio) {
        case 'portrait':
          card.style.minHeight = '600px';
          break;
        case 'landscape':
        case 'square':
          card.style.height = '300px';
          card.style.minHeight = '300px';
          break;
      }
    }
  }

  // Public method to force recheck all images
  recheckAllImages() {
    console.log('🔄 Rechecking all images...');
    this.observedImages.clear();
    this.retryAttempts.clear();
    this.fixExistingImages();
  }

  // Clean up observers
  destroy() {
    if (this.imageObserver) this.imageObserver.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.observedImages.clear();
    this.retryAttempts.clear();
    console.log('🧹 Image Height Manager destroyed');
  }
}


// Standalone function for immediate use in your existing code:
window.fixAllImageHeights = function() {
  console.log('🔧 Running immediate image height fix...');
  
  const grid = document.getElementById('dynamicGrid') || document.querySelector('.projects-grid');
  if (!grid) {
    console.error('❌ Grid container not found');
    return;
  }
  
  const cards = grid.querySelectorAll('.project-card');
  let fixedCount = 0;
  
  cards.forEach(card => {
    const img = card.querySelector('img');
    const wrapper = card.querySelector('.project-image-wrapper');
    
    if (!img || !wrapper) return;
    
    // Detect aspect ratio
    let aspectRatio = card.getAttribute('data-aspect-ratio');
    if (!aspectRatio && img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio < 0.9) aspectRatio = 'portrait';
      else if (ratio > 1.1) aspectRatio = 'landscape';
      else aspectRatio = 'square';
      
      card.setAttribute('data-aspect-ratio', aspectRatio);
    }
    
    // Apply height fixes
    switch (aspectRatio) {
      case 'portrait':
        card.classList.add('portrait-card');
        card.style.minHeight = '600px';
        card.style.height = 'auto';
        break;
      case 'landscape':
        card.classList.add('landscape-card');
        card.style.height = '300px';
        card.style.minHeight = '300px';
        break;
      case 'square':
      default:
        card.classList.add('square');
        card.style.height = '300px';
        card.style.minHeight = '300px';
        break;
    }
    
    // Fix image styling
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    
    // Fix wrapper styling
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.overflow = 'hidden';
    
    fixedCount++;
  });
  
  console.log(`✅ Fixed ${fixedCount} image heights`);
};

// Debug function to check current state
window.debugImageHeights = function() {
  const grid = document.getElementById('dynamicGrid') || document.querySelector('.projects-grid');
  if (!grid) return console.error('❌ Grid not found');
  
  const cards = grid.querySelectorAll('.project-card');
  console.group('🐛 Image Height Debug');
  
  cards.forEach((card, index) => {
    const img = card.querySelector('img');
    const wrapper = card.querySelector('.project-image-wrapper');
    const aspectRatio = card.getAttribute('data-aspect-ratio');
    
    console.log(`Card ${index}:`, {
      aspectRatio,
      cardHeight: card.offsetHeight + 'px',
      cardMinHeight: getComputedStyle(card).minHeight,
      imgLoaded: img ? img.complete && img.naturalHeight > 0 : 'No image',
      imgDimensions: img && img.naturalWidth ? `${img.naturalWidth}x${img.naturalHeight}` : 'Unknown',
      wrapperHeight: wrapper ? wrapper.offsetHeight + 'px' : 'No wrapper',
      classes: Array.from(card.classList)
    });
  });
  
  console.groupEnd();
};

console.log('🎯 Image Height Manager loaded - Use window.fixAllImageHeights() or window.debugImageHeights()');