/**
 * Object Pool Manager for Grid Items
 * 
 * This system efficiently manages project items in the grid layout
 * using an object pooling pattern to improve performance and memory usage.
 * 
 * No HTML/CSS generation in JavaScript - relies on templates and CSS classes only.
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
      dataFromServer: options.dataFromServer || null,
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
    
    // Check if we have template and container
    if (!this.template) {
      this.log('Error: No template found with selector', this.config.templateSelector);
      return;
    }
    
    if (!this.container) {
      this.log('Error: No container found with selector', this.config.containerSelector);
      return;
    }
    
    // Create the initial pool
    for (let i = 0; i < this.config.initialPoolSize; i++) {
      this.pool.push(this.createItem());
    }
    
    // Check if we have pre-populated data from server
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
  
  // Create a new item for the pool (relies on HTML template)
  createItem() {
    if (!this.template) {
      this.log('Error: Cannot create item without template');
      return null;
    }
    
    // Clone the template
    const element = this.template.content.cloneNode(true).firstElementChild;
    
    // Add pooled state classes
    element.classList.add('pooled');
    element.setAttribute('data-pooled', 'true');
    
    // Hide initially
    element.style.display = 'none';
    
    // Append to container
    this.container.appendChild(element);
    
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
      availableItem.element.removeAttribute('data-pooled');
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
    if (!newItem) return null;
    
    newItem.inUse = true;
    newItem.element.classList.remove('pooled');
    newItem.element.removeAttribute('data-pooled');
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
    itemObj.element.setAttribute('data-pooled', 'true');
    itemObj.element.style.display = 'none';
    
    // Clear aspect ratio classes and data
    itemObj.element.classList.remove('portrait', 'landscape', 'square');
    itemObj.element.removeAttribute('data-aspect-ratio');
    
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
    
    // Update image
    const img = element.querySelector('img');
    if (img && projectData.projectFeaturedImage) {
      img.src = projectData.projectFeaturedImage;
      img.alt = projectData.projectname || '';
      
      // Handle image load event for aspect ratio detection
      img.onload = () => {
        this.detectAndApplyAspectRatio(element, img);
      };
      
      // Handle error case
      img.onerror = () => {
        this.log('Failed to load image:', projectData.projectFeaturedImage);
        element.classList.add('image-error');
      };
    }
    
    // Update text content using data attributes or direct assignment
    this.updateTextContent(element, '.project-title, h2, h3', projectData.projectname);
    this.updateTextContent(element, '.project-category', projectData.category);
    this.updateTextContent(element, '.project-production', projectData.productionName);
    this.updateTextContent(element, '.project-date', projectData.projectDate);
    
    // Set data attributes for filtering and identification
    element.setAttribute('data-id', projectData.id || '');
    element.setAttribute('data-category', projectData.category || '');
    element.setAttribute('data-slug', projectData.slug || '');
    
    // Handle for-sale status with CSS class
    if (projectData.forSale) {
      element.classList.add('for-sale');
    } else {
      element.classList.remove('for-sale');
    }
    
    // Apply category-specific classes
    if (projectData.category) {
      element.classList.add(`category-${projectData.category.toLowerCase()}`);
    }
  }
  
  // Helper method to update text content
  updateTextContent(element, selector, content) {
    const targetElement = element.querySelector(selector);
    if (targetElement && content) {
      targetElement.textContent = content;
    }
  }
  
  // Detect and apply aspect ratio classes
  detectAndApplyAspectRatio(element, img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    if (width === 0 || height === 0) return;
    
    const ratio = width / height;
    
    // Remove existing aspect ratio classes
    element.classList.remove('portrait', 'landscape', 'square');
    
    // Apply the appropriate class based on aspect ratio
    let aspectRatio;
    if (Math.abs(ratio - 1) < 0.05) {
      aspectRatio = 'square';
    } else if (ratio < 0.9) {
      aspectRatio = 'portrait';
    } else {
      aspectRatio = 'landscape';
    }
    
    element.classList.add(aspectRatio);
    element.setAttribute('data-aspect-ratio', aspectRatio);
    
    // Notify that layout may need to be updated
    this.refreshLayout();
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
      this.showErrorMessage(error.message);
    }
  }
  
  // Show error message (relies on CSS for styling)
  showErrorMessage(message) {
    if (!this.container) return;
    
    this.container.classList.add('error-state');
    this.container.setAttribute('data-error-message', message);
    
    // Dispatch error event for external handling
    const errorEvent = new CustomEvent('poolError', {
      detail: { message, pool: this }
    });
    this.container.dispatchEvent(errorEvent);
  }
  
  // Render project items
  renderItems(projectsData) {
    if (!Array.isArray(projectsData) || !this.container) return;
    
    this.log('Rendering', projectsData.length, 'projects');
    
    // Release all current items
    this.releaseAll();
    
    // Remove error state
    this.container.classList.remove('error-state');
    this.container.removeAttribute('data-error-message');
    
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
      return item.element.getAttribute('data-aspect-ratio') === ratio;
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
        const itemCategory = item.element.getAttribute('data-category');
        if (itemCategory === category) {
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
  
  // Search functionality
  searchItems(query) {
    if (!query || query.trim() === '') {
      // Show all items
      this.activeItems.forEach(item => {
        item.element.classList.remove('search-hidden');
      });
    } else {
      const searchTerm = query.toLowerCase().trim();
      
      this.activeItems.forEach(item => {
        const data = item.data;
        const searchableText = [
          data.projectname,
          data.category,
          data.productionName,
          data.projectDate
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (searchableText.includes(searchTerm)) {
          item.element.classList.remove('search-hidden');
        } else {
          item.element.classList.add('search-hidden');
        }
      });
    }
    
    this.refreshLayout();
  }
  
  // Refresh layout (to be connected with the dynamic grid layout)
  refreshLayout() {
    // Dispatch a custom event for the layout system to catch
    const event = new CustomEvent('itemsUpdated', {
      detail: { 
        items: this.activeItems.map(item => item.element),
        pool: this
      }
    });
    this.container.dispatchEvent(event);
    
    // If window has a layoutGrid function, call it
    if (window.layoutGrid) {
      window.layoutGrid();
    }
  }
  
  // Get statistics
  getStats() {
    return {
      totalPoolSize: this.pool.length,
      activeItems: this.activeItems.length,
      availableItems: this.pool.filter(item => !item.inUse).length,
      aspectRatios: {
        square: this.getItemsByAspectRatio('square').length,
        landscape: this.getItemsByAspectRatio('landscape').length,
        portrait: this.getItemsByAspectRatio('portrait').length
      }
    };
  }
}

/**
 * Grid Layout Optimizer - Fills empty spaces in the grid
 * Works with the existing ProjectItemPool system
 * No HTML/CSS generation - relies on CSS classes and data attributes
 */
class GridLayoutOptimizer {
  constructor(poolInstance) {
    this.pool = poolInstance;
    this.container = poolInstance.container;
    this.isOptimizing = false;
    this.resizeTimeout = null;
    
    // Bind methods
    this.optimizeLayout = this.optimizeLayout.bind(this);
    this.applySmartSizing = this.applySmartSizing.bind(this);
    this.getGridInfo = this.getGridInfo.bind(this);
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    // Listen for layout updates from the pool
    this.container.addEventListener('itemsUpdated', () => {
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
      
    } catch (error) {
      console.error('Error optimizing layout:', error);
    } finally {
      this.isOptimizing = false;
    }
  }
  
  applySmartSizing(items, columns) {
    items.forEach((item, index) => {
      const element = item.element;
      
      // Reset any previous grid modifications
      element.style.gridColumn = '';
      element.style.gridRow = '';
      
      // Remove any existing span classes
      element.classList.remove('span-2', 'span-3', 'row-span-2');
      
      // Apply smart sizing based on content and position using CSS classes
      const aspectRatio = element.getAttribute('data-aspect-ratio');
      const hasLongContent = this.hasLongContent(element);
      
      // Strategy 1: Make some landscape items wider
      if (aspectRatio === 'landscape' && columns >= 4) {
        if (index % 3 === 0) {
          element.classList.add('span-3');
        } else {
          element.classList.add('span-2');
        }
      }
      // Strategy 2: Make portrait items taller
      else if (aspectRatio === 'portrait') {
        element.classList.add('row-span-2');
      }
      // Strategy 3: Vary square items
      else if (aspectRatio === 'square') {
        if (index % 7 === 0 && columns >= 6) {
          element.classList.add('span-2');
        }
        if (index % 11 === 0) {
          element.classList.add('row-span-2');
        }
      }
      
      // Strategy 4: Items with long content get more space
      if (hasLongContent && columns >= 4) {
        element.classList.add('span-2');
      }
    });
  }
  
  hasLongContent(element) {
    const title = element.querySelector('h2, h3, .project-title');
    const category = element.querySelector('.project-category');
    
    const longTitle = title && title.textContent.length > 25;
    const longCategory = category && category.textContent.length > 15;
    
    return longTitle || longCategory;
  }
  
  // Method to be called when items are filtered
  onItemsFiltered() {
    setTimeout(this.optimizeLayout, 400);
  }
}

// Create a global instance when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if data was pre-populated via script tag
  let serverData = null;
  const dataScript = document.getElementById('projects-data');
  if (dataScript) {
    try {
      serverData = JSON.parse(dataScript.textContent);
    } catch (e) {
      console.error('Error parsing projects data from script tag:', e);
    }
  }
  
  // Create the item pool
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
  
  // Initialize the optimizer
  if (window.projectItemPool) {
    window.gridOptimizer = new GridLayoutOptimizer(window.projectItemPool);
  }
});