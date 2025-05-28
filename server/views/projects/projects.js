/**
 * Object Pool Manager for Grid Items
 * 
 * This system efficiently manages project items in the grid layout
 * using an object pooling pattern to improve performance and memory usage.
 * 
 * It integrates with the dynamic grid layout system and supports proper
 * handling of square, portrait, and landscape items.
 */

class ProjectItemPool {
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      initialPoolSize: options.initialPoolSize || 20,
      maxPoolSize: options.maxPoolSize || 100,
      templateSelector: options.templateSelector || '#project-item-template',
      containerSelector: options.containerSelector || '.projects-grid',
      endpoint: options.endpoint || '/api/projects',
      useRandomOrder: options.useRandomOrder || true,
      onItemCreated: options.onItemCreated || null,
      dataFromServer: options.dataFromServer || null, // Can be pre-populated from Liquid
      debug: options.debug || false
    };

    // State
    this.pool = [];
    this.activeItems = [];
    this.isInitialized = false;
    this.dataCache = null;
    this.container = document.querySelector(this.config.containerSelector);
    this.template = document.querySelector(this.config.templateSelector);
    
    // Bind methods
    this.log = this.log.bind(this);
    this.createItem = this.createItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.releaseItem = this.releaseItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.getItemsByAspectRatio = this.getItemsByAspectRatio.bind(this);
    this.refreshLayout = this.refreshLayout.bind(this);
    
    // Initialize the pool
    this.initialize();
  }
  
  // Debug logging
  log(...args) {
    if (this.config.debug) {
      console.log('[ProjectItemPool]', ...args);
    }
  }
  
  // Initialize the object pool
  initialize() {
    if (this.isInitialized) return;
    
    this.log('Initializing object pool');
    
    // Create the initial pool
    for (let i = 0; i < this.config.initialPoolSize; i++) {
      this.pool.push(this.createItem());
    }
    
    // Check if we have template and container
    if (!this.template) {
      this.log('Warning: No template found with selector', this.config.templateSelector);
    }
    
    if (!this.container) {
      this.log('Warning: No container found with selector', this.config.containerSelector);
    }
    
    // Check if we have pre-populated data from Liquid
    if (this.config.dataFromServer && Array.isArray(this.config.dataFromServer)) {
      this.log('Using pre-populated data from server', this.config.dataFromServer.length, 'items');
      this.dataCache = this.config.dataFromServer;
      this.renderItems(this.dataCache);
    } else {
      // Load data from server
      this.loadData();
    }
    
    this.isInitialized = true;
  }
  
  // Create a new item for the pool
  createItem() {
    let element;
    
    // If we have a template, clone it
    if (this.template) {
      element = this.template.content.cloneNode(true).firstElementChild;
    } else {
      // Otherwise create a basic project card structure
      element = document.createElement('div');
      element.className = 'project-card';
      
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'project-image-wrapper';
      
      const img = document.createElement('img');
      img.alt = '';
      imageWrapper.appendChild(img);
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'project-info';
      
      const title = document.createElement('h3');
      const category = document.createElement('span');
      category.className = 'project-category';
      const production = document.createElement('div');
      production.className = 'project-production';
      const date = document.createElement('div');
      date.className = 'project-date';
      
      infoDiv.appendChild(title);
      infoDiv.appendChild(category);
      infoDiv.appendChild(production);
      infoDiv.appendChild(date);
      
      element.appendChild(imageWrapper);
      element.appendChild(infoDiv);
    }
    
    // Element is not in use yet
    element.classList.add('pooled');
    element.style.display = 'none';
    
    // If we have a container, append the element
    if (this.container) {
      this.container.appendChild(element);
    }
    
    // Call onItemCreated callback if provided
    if (typeof this.config.onItemCreated === 'function') {
      this.config.onItemCreated(element);
    }
    
    return {
      element: element,
      inUse: false,
      data: null
    };
  }
  
  // Get an item from the pool or create a new one if needed
  getItem() {
    // Find an available item in the pool
    const availableItem = this.pool.find(item => !item.inUse);
    
    if (availableItem) {
      availableItem.inUse = true;
      availableItem.element.classList.remove('pooled');
      availableItem.element.style.display = '';
      this.activeItems.push(availableItem);
      return availableItem;
    }
    
    // If we've reached max pool size, return null
    if (this.pool.length >= this.config.maxPoolSize) {
      this.log('Warning: Pool size limit reached');
      return null;
    }
    
    // Create a new item and add to pool
    const newItem = this.createItem();
    newItem.inUse = true;
    newItem.element.classList.remove('pooled');
    newItem.element.style.display = '';
    this.pool.push(newItem);
    this.activeItems.push(newItem);
    
    return newItem;
  }
  
  // Release an item back to the pool
  releaseItem(itemObj) {
    if (!itemObj || !itemObj.element) return;
    
    // Reset the item
    itemObj.inUse = false;
    itemObj.data = null;
    itemObj.element.classList.add('pooled');
    itemObj.element.style.display = 'none';
    
    // Remove from active items
    const index = this.activeItems.indexOf(itemObj);
    if (index !== -1) {
      this.activeItems.splice(index, 1);
    }
  }
  
  // Release all active items
  releaseAll() {
    this.log('Releasing all items back to pool');
    
    while (this.activeItems.length > 0) {
      this.releaseItem(this.activeItems[0]);
    }
  }
  
  // Update an item with project data
  updateItem(itemObj, projectData) {
    if (!itemObj || !itemObj.element || !projectData) return;
    
    const element = itemObj.element;
    itemObj.data = projectData;
    
    // Update element with project data
    const img = element.querySelector('img');
    if (img) {
      img.src = projectData.projectFeaturedImage || '';
      img.alt = projectData.projectname || '';
      
      // Handle image load event for aspect ratio detection
      img.onload = () => {
        // Calculate aspect ratio
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = width / height;
        
        // Remove existing aspect ratio classes
        element.classList.remove('portrait', 'landscape', 'square');
        
        // Apply the appropriate class based on aspect ratio
        if (Math.abs(ratio - 1) < 0.05) {
          element.dataset.aspectRatio = 'square';
          element.classList.add('square');
        } else if (ratio < 0.9) {
          element.dataset.aspectRatio = 'portrait';
          element.classList.add('portrait');
        } else {
          element.dataset.aspectRatio = 'landscape';
          element.classList.add('landscape');
        }
        
        // Notify that layout may need to be updated
        this.refreshLayout();
      };
    }
    
    // Update text content
    const title = element.querySelector('h3');
    if (title) {
      title.textContent = projectData.projectname || '';
    }
    
    const category = element.querySelector('.project-category');
    if (category) {
      category.textContent = projectData.category || '';
    }
    
    const production = element.querySelector('.project-production');
    if (production) {
      production.textContent = projectData.productionName || '';
    }
    
    const date = element.querySelector('.project-date');
    if (date) {
      date.textContent = projectData.projectDate || '';
    }
    
    // Set data attributes for filtering
    element.dataset.id = projectData.id || '';
    element.dataset.category = projectData.category || '';
    element.dataset.slug = projectData.slug || '';
    
    // For sale badge if applicable
    if (projectData.forSale) {
      element.classList.add('for-sale');
    } else {
      element.classList.remove('for-sale');
    }
  }
  
  // Load project data from server
  async loadData() {
    try {
      this.log('Loading project data from server');
      
      // Add random parameter if needed
      let url = this.config.endpoint;
      if (this.config.useRandomOrder) {
        url += (url.includes('?') ? '&' : '?') + 'random=true';
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      this.dataCache = data;
      
      this.log('Loaded', data.length, 'projects from server');
      this.renderItems(data);
      
    } catch (error) {
      this.log('Error loading data:', error);
      // Show error message to user
      if (this.container) {
        this.container.innerHTML = `<div class="error-message">
          <p>Error loading projects. Please try again later.</p>
          <button class="retry-button">Retry</button>
        </div>`;
        
        // Add retry button handler
        const retryButton = this.container.querySelector('.retry-button');
        if (retryButton) {
          retryButton.addEventListener('click', () => {
            this.container.innerHTML = '<div class="loading">Loading projects...</div>';
            this.loadData();
          });
        }
      }
    }
  }
  
  // Render project items
  renderItems(projectsData) {
    if (!Array.isArray(projectsData) || !this.container) return;
    
    this.log('Rendering', projectsData.length, 'projects');
    
    // Release all current items
    this.releaseAll();
    
    // Create and update items for each project
    projectsData.forEach(projectData => {
      const item = this.getItem();
      if (item) {
        this.updateItem(item, projectData);
      }
    });
    
    // Trigger layout refresh
    this.refreshLayout();
  }
  
  // Get items by aspect ratio
  getItemsByAspectRatio(ratio) {
    return this.activeItems.filter(item => {
      return item.element.dataset.aspectRatio === ratio;
    });
  }
  
  // Filter items by category
  filterByCategory(category) {
    if (!category || category === 'all') {
      // Show all items
      this.activeItems.forEach(item => {
        item.element.classList.remove('filtered-out');
        item.element.classList.add('filtered-in');
      });
    } else {
      // Show only items matching the category
      this.activeItems.forEach(item => {
        if (item.data && item.data.category === category) {
          item.element.classList.remove('filtered-out');
          item.element.classList.add('filtered-in');
        } else {
          item.element.classList.add('filtered-out');
          item.element.classList.remove('filtered-in');
        }
      });
    }
    
    // Refresh layout after filtering
    setTimeout(this.refreshLayout, 400); // Allow animation to play
  }
  
  // Refresh layout (to be connected with the dynamic grid layout)
  refreshLayout() {
    // Dispatch a custom event for the layout system to catch
    const event = new CustomEvent('itemsUpdated', {
      detail: { items: this.activeItems.map(item => item.element) }
    });
    this.container.dispatchEvent(event);
    
    // If window has a layoutGrid function (from dynamic-grid-layout.js), call it
    if (window.layoutGrid) {
      window.layoutGrid();
    }
  }
}

// Create a global instance of the pool
document.addEventListener('DOMContentLoaded', () => {
  // Check if data was pre-populated via Liquid template
  let serverData = null;
  
  // Look for the data in a script tag (common pattern for passing server data to client)
  const dataScript = document.getElementById('projects-data');
  if (dataScript) {
    try {
      serverData = JSON.parse(dataScript.textContent);
    } catch (e) {
      console.error('Error parsing projects data from script tag:', e);
    }
  }
  
  // Create the item pool with appropriate configuration
  window.projectItemPool = new ProjectItemPool({
    initialPoolSize: 20,
    maxPoolSize: 200,
    templateSelector: '#project-item-template',
    containerSelector: '.projects-grid',
    endpoint: '/api/projects',
    useRandomOrder: true,
    dataFromServer: serverData,
    debug: true // Set to false in production
  });
  
  // Connect to dynamic grid layout system
  document.querySelector('.projects-grid')?.addEventListener('itemsUpdated', (event) => {
    // If window has a layoutGrid function (from dynamic-grid-layout.js), call it
    if (window.layoutGrid) {
      window.layoutGrid();
    }
  });
});

// Add this to the end of your existing projects.js file

/**
 * Grid Layout Optimizer - Fills empty spaces in the grid
 * Works with the existing ProjectItemPool system
 */
class GridLayoutOptimizer {
  constructor(poolInstance) {
    this.pool = poolInstance;
    this.container = poolInstance.container;
    this.isOptimizing = false;
    
    // Bind methods
    this.optimizeLayout = this.optimizeLayout.bind(this);
    this.fillEmptySpaces = this.fillEmptySpaces.bind(this);
    this.getGridInfo = this.getGridInfo.bind(this);
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    // Listen for layout updates from the pool
    this.container.addEventListener('itemsUpdated', () => {
      // Delay optimization to allow for animations/transitions
      setTimeout(this.optimizeLayout, 300);
    });
    
    // Optimize on window resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(this.optimizeLayout, 500);
    });
    
    // Initial optimization
    setTimeout(this.optimizeLayout, 1000);
  }
  
  getGridInfo() {
    const computedStyle = window.getComputedStyle(this.container);
    const columns = computedStyle.gridTemplateColumns.split(' ').length;
    const gap = parseInt(computedStyle.gap) || 2;
    
    return { columns, gap };
  }
  
  optimizeLayout() {
    if (this.isOptimizing) return;
    this.isOptimizing = true;
    
    try {
      this.pool.log('Optimizing grid layout');
      
      // Get current grid info
      const { columns } = this.getGridInfo();
      
      // Get all visible items
      const visibleItems = this.pool.activeItems.filter(item => 
        !item.element.classList.contains('filtered-out') &&
        !item.element.classList.contains('search-hidden')
      );
      
      // Apply smart sizing to reduce gaps
      this.applySmartSizing(visibleItems, columns);
      
      // Fill any remaining empty spaces
      setTimeout(() => {
        this.fillEmptySpaces(columns);
      }, 100);
      
    } catch (error) {
      console.error('Error optimizing layout:', error);
    } finally {
      this.isOptimizing = false;
    }
  }
  
  applySmartSizing(items, columns) {
    items.forEach((item, index) => {
      const element = item.element;
      
      // Reset any previous modifications
      element.style.gridColumn = '';
      element.style.gridRow = '';
      
      // Apply smart sizing based on content and position
      const aspectRatio = element.dataset.aspectRatio;
      const hasLongContent = this.hasLongContent(element);
      
      // Strategy 1: Make some landscape items wider to fill gaps
      if (aspectRatio === 'landscape' && columns >= 4) {
        if (index % 3 === 0) {
          element.style.gridColumn = 'span 3';
        } else {
          element.style.gridColumn = 'span 2';
        }
      }
      
      // Strategy 2: Make portrait items taller
      else if (aspectRatio === 'portrait') {
        element.style.gridRow = 'span 2';
      }
      
      // Strategy 3: Vary square items
      else if (aspectRatio === 'square' || element.classList.contains('square')) {
        if (index % 7 === 0 && columns >= 6) {
          element.style.gridColumn = 'span 2';
        }
        if (index % 11 === 0) {
          element.style.gridRow = 'span 2';
        }
      }
      
      // Strategy 4: Items with long content get more space
      if (hasLongContent && columns >= 4) {
        element.style.gridColumn = 'span 2';
      }
    });
  }
  
  hasLongContent(element) {
    const title = element.querySelector('h3');
    const details = element.querySelectorAll('.project-details p');
    
    const longTitle = title && title.textContent.length > 25;
    const manyDetails = details.length > 2;
    
    return longTitle || manyDetails;
  }
  
  fillEmptySpaces(columns) {
    // Calculate if we need filler items
    const containerRect = this.container.getBoundingClientRect();
    const visibleItems = Array.from(this.container.querySelectorAll('.grid-item:not(.filtered-out):not(.search-hidden):not(.filler-item)'));
    
    if (visibleItems.length === 0) return;
    
    const lastItem = visibleItems[visibleItems.length - 1];
    const lastItemRect = lastItem.getBoundingClientRect();
    
    // Check for significant empty space
    const remainingSpace = containerRect.bottom - lastItemRect.bottom;
    
    if (remainingSpace > 150) {
      this.createFillerItems(Math.min(3, Math.floor(remainingSpace / 100)));
    }
  }
  
  createFillerItems(count) {
    this.pool.log(`Creating ${count} filler items`);
    
    for (let i = 0; i < count; i++) {
      const fillerElement = document.createElement('div');
      fillerElement.className = 'grid-item filler-item square';
      fillerElement.innerHTML = `
        <div class="project-image-wrapper">
          <div class="filler-pattern"></div>
        </div>
        <div class="item-content">
          <h3>Coming Soon</h3>
          <p class="project-category">Updates</p>
        </div>
      `;
      
      // Style the filler
      const hue = Math.floor(Math.random() * 360);
      fillerElement.style.background = `linear-gradient(135deg, hsl(${hue}, 20%, 95%), hsl(${hue}, 15%, 90%))`;
      fillerElement.style.border = '1px dashed rgba(0,0,0,0.1)';
      fillerElement.style.opacity = '0.7';
      
      // Add pattern to the filler
      const pattern = fillerElement.querySelector('.filler-pattern');
      pattern.style.background = `
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0,0,0,0.05) 10px,
          rgba(0,0,0,0.05) 20px
        )
      `;
      pattern.style.height = '100%';
      pattern.style.width = '100%';
      
      this.container.appendChild(fillerElement);
    }
  }
  
  // Clean up filler items (useful when filtering)
  removeFillerItems() {
    const fillers = this.container.querySelectorAll('.filler-item');
    fillers.forEach(filler => filler.remove());
  }
  
  // Method to be called when items are filtered
  onItemsFiltered() {
    this.removeFillerItems();
    setTimeout(this.optimizeLayout, 400);
  }
}

// Extend the ProjectItemPool to include the optimizer
// Add this method to the ProjectItemPool class (or modify the existing refreshLayout method)
ProjectItemPool.prototype.initializeOptimizer = function() {
  this.optimizer = new GridLayoutOptimizer(this);
};

// Enhance the existing refreshLayout method
const originalRefreshLayout = ProjectItemPool.prototype.refreshLayout;
ProjectItemPool.prototype.refreshLayout = function() {
  // Call the original method
  originalRefreshLayout.call(this);
  
  // Also trigger optimization if we have an optimizer
  if (this.optimizer) {
    this.optimizer.optimizeLayout();
  }
};

// Enhance the filterByCategory method to work with optimizer
const originalFilterByCategory = ProjectItemPool.prototype.filterByCategory;
ProjectItemPool.prototype.filterByCategory = function(category) {
  // Call the original method
  originalFilterByCategory.call(this, category);
  
  // Optimize layout after filtering
  if (this.optimizer) {
    this.optimizer.onItemsFiltered();
  }
};

// Update the DOMContentLoaded event listener in your existing code
document.addEventListener('DOMContentLoaded', () => {
  // Your existing code...
  
  // After creating the projectItemPool, initialize the optimizer
  if (window.projectItemPool) {
    window.projectItemPool.initializeOptimizer();
  }
});