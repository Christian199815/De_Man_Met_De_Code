/**
 * Clean Object Pool System - JavaScript Only (Cleaned for Modular Components)
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
  this.createControls();
  this.initializeCustomComponents(); // This now works with modular components
  this.fixAspectRatioSpanning();
  
  console.log('✅ Clean Grid Pool initialized');
  console.log('🎛️ Debug controls hidden - Press "D" to toggle');
  }

  loadFromDOM() {
    console.log('📡 Loading items from DOM...');

    const projectCards = this.container.querySelectorAll('.project-card');
    const squares = this.container.querySelectorAll('.square, [data-type="square"]');
    
    // UPDATED: Better selector for break glass components (includes data-component attribute)
    const customItems = this.container.querySelectorAll('.break-glass-card, [data-type="custom"], [data-component="break-glass"]');
    const fullWidthItems = this.container.querySelectorAll('.full-width-component, [data-type="full-width"]');

    console.log('🔍 Found in DOM:', {
      projectCards: projectCards.length,
      squares: squares.length,
      customItems: customItems.length,
      fullWidthItems: fullWidthItems.length
    });

    // Debug: Log break glass cards specifically
    if (customItems.length > 0) {
      console.log('🎯 Break glass cards found:', Array.from(customItems).map(item => ({
        element: item,
        classes: Array.from(item.classList),
        dataType: item.getAttribute('data-type'),
        dataComponent: item.getAttribute('data-component'),
        dataId: item.getAttribute('data-id'),
        hasSign: !!item.querySelector('[data-break-glass-sign], #sign, .sign')
      })));
    } else {
      console.warn('⚠️ No break glass components found in DOM!');
      
      // Additional debug: check if break glass exists anywhere in the page
      const allBreakGlass = document.querySelectorAll('.break-glass-card, [data-component="break-glass"]');
      console.log('🔍 Break glass anywhere in document:', allBreakGlass.length);
      if (allBreakGlass.length > 0) {
        console.log('📍 Found break glass outside grid:', Array.from(allBreakGlass).map(item => ({
          element: item,
          parent: item.parentElement ? item.parentElement.tagName + '.' + Array.from(item.parentElement.classList).join('.') : 'no parent'
        })));
      }
    }

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
      console.log(`📦 Adding custom item ${index} to pool:`, {
        element: element,
        classes: Array.from(element.classList),
        type: 'custom',
        hasBreakGlassSign: !!element.querySelector('[data-break-glass-sign], #sign, .sign')
      });
      
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

    console.log('📊 Loaded items into pools:', {
      projects: this.pools.projects.length,
      squares: this.pools.squares.length,
      custom: this.pools.custom.length,
      fullWidth: this.pools.fullWidth.length
    });

    // IMPORTANT: If we still have no custom items but break glass exists elsewhere, warn about it
    if (this.pools.custom.length === 0) {
      const breakGlassOutsideGrid = document.querySelectorAll('.break-glass-card, [data-component="break-glass"]');
      if (breakGlassOutsideGrid.length > 0) {
        console.error('❌ Found break glass components outside the grid! They need to be inside #dynamicGrid to be included in the grid system.');
        console.log('💡 Break glass components found outside grid:', breakGlassOutsideGrid);
      }
    }
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
  // Create controls container if it doesn't exist
  if (!this.controls) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'grid-controls';
    controlsContainer.style.display = 'none'; // Hidden by default
    
    // Insert before the grid
    const container = document.querySelector('.container');
    const grid = document.getElementById('dynamicGrid');
    if (container && grid) {
      container.insertBefore(controlsContainer, grid);
      this.controls = controlsContainer;
    } else {
      return; // Can't create controls without proper container
    }
  }

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
        <button id="debug-break-glass-btn" class="control-button">Debug Break Glass</button>
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

  // NEW: Debug break glass button
  const debugBreakGlassBtn = document.getElementById('debug-break-glass-btn');
  if (debugBreakGlassBtn) {
    debugBreakGlassBtn.addEventListener('click', () => {
      if (window.debugBreakGlass) {
        window.debugBreakGlass();
      } else {
        console.log('❌ Break glass debug function not available');
      }
    });
  }
  }

  updateControlsDisplay() {
    const currentSpan = this.controls?.querySelector('.current-count');
    const totalSpan = this.controls?.querySelector('.total-count');

    if (currentSpan) currentSpan.textContent = Math.min(this.state.currentShowCount, this.pools.mixed.length);
    if (totalSpan) totalSpan.textContent = this.pools.mixed.length;
  }
  
  // UPDATED: Modular custom components initialization
  initializeCustomComponents() {
    console.log('🎯 Initializing custom components...');
    
    // Keep existing full-width components initialization
    this.initializeFullWidthComponents();
    
    // Dispatch event for modular components to reinitialize themselves
    document.dispatchEvent(new CustomEvent('gridRerendered', {
      detail: { gridInstance: this }
    }));
    
    // Small delay to allow modular components to initialize
    setTimeout(() => {
      console.log('✅ Custom components initialization complete');
    }, 150);
  }

  // REMOVED: Old hardcoded initializeBreakGlass method - now handled by modular break-glass.js

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

  // NEW: Optional method to manually trigger modular component reinitialization
  reinitializeModularComponents() {
    console.log('🔄 Manually reinitializing modular components...');
    document.dispatchEvent(new CustomEvent('gridRerendered', {
      detail: { gridInstance: this }
    }));
  }
}

// Page Loader System - UNCHANGED
class PageLoader {
  constructor() {
    this.isLoading = true;
    this.loadedImages = 0;
    this.totalImages = 0;
    this.loadingElement = null;
    
    if (this.shouldInitialize()) {
      this.init();
    } else {
      console.log('📄 Page loader skipped - not on /projects route');
      this.isLoading = false;
    }
  }
  
  shouldInitialize() {
  const currentPath = window.location.pathname;
  
  const validRoutes = [
    '/projects',
    '/projects/',
  ];
  
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
    
    setTimeout(checkGrid, 500);
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
        img.addEventListener('error', () => this.onImageLoad());
      }
    });
    
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
      setTimeout(() => this.completeLoading(), 300);
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
    
    document.body.classList.add('page-loaded');
    
    if (this.loadingElement) {
      this.loadingElement.classList.add('fade-out');
      
      setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
      }, 500);
    }
    
    window.dispatchEvent(new CustomEvent('pageFullyLoaded'));
  }
  
  static initializeForCurrentRoute() {
    if (window.pageLoader) {
      console.log('📄 Page loader already exists');
      return window.pageLoader;
    }
    
    window.pageLoader = new PageLoader();
    return window.pageLoader;
  }
  
  forceComplete() {
    console.log('🔧 Force completing page loader');
    this.completeLoading();
  }
}

// Category Filter - UNCHANGED
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
    
    projectCards.forEach((card, index) => {
      const cardCategory = this.getCardCategory(card);
      const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory.toUpperCase();
      
      if (index < 5) {
        console.log(`Card ${index}:`, {
          category: cardCategory,
          shouldShow: shouldShow,
          selectedCategory: selectedCategory
        });
      }
      
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
    console.group('🐛 Category Structure Debug');
    
    projectCards.forEach((card, index) => {
      if (index < 10) {
        const categoryDiv = card.querySelector('.category');
        const categoryP = card.querySelector('.category p');
        const dataCategory = card.getAttribute('data-category');
        
        console.log(`Card ${index}:`, {
          hasCategoryDiv: !!categoryDiv,
          hasCategoryP: !!categoryP,
          categoryPText: categoryP ? categoryP.textContent.trim() : 'none',
          dataCategory: dataCategory || 'none',
          foundCategory: this.getCardCategory(card)
        });
      }
    });
    
    console.groupEnd();
  },
  
  init: function() {
    console.log('🎯 Initializing Category Filter...');
    
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
      console.log('🔍 Running category structure debug...');
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
    console.log('🎯 Initializing projects page components...');
    
    window.pageLoader = new PageLoader();
    
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
    
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
});

// Debug functions
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

console.log('🎯 Clean Grid Pool System loaded - Ready for modular components');