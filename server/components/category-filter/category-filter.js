/**
 * Final Category Filter - CSS-free version
 * Integrated with your existing grid pool system
 */

// Remove the old category filter if it exists
if (window.CategoryFilter) {
  delete window.CategoryFilter;
}

// Create new CategoryFilter immediately
window.CategoryFilter = {
  isInitialized: false,
  currentCategory: 'all',
  categories: ['DECOR', 'INTERIEUR', 'PROPS'],
  
  getCardCategory: function(card) {
    if (!card) return '';
    
    // Your cards use .category p for category text
    const categoryElement = card.querySelector('.category p');
    if (categoryElement) {
      const category = categoryElement.textContent.trim().toUpperCase();
      return category;
    }
    
    // Fallback: check data attributes
    const dataCategory = card.getAttribute('data-category');
    if (dataCategory) {
      return dataCategory.toUpperCase();
    }
    
    return '';
  },
  
  filterProjects: function(selectedCategory) {
    const dynamicGrid = document.getElementById('dynamicGrid');
    if (!dynamicGrid) {
      return 0;
    }
    
    // Find all project cards (not break glass or full-width items)
    const projectCards = dynamicGrid.querySelectorAll('.project-card');
    
    if (projectCards.length === 0) {
      return 0;
    }
    
    let visibleCount = 0;
    let totalProjects = projectCards.length;
    
    projectCards.forEach((card, index) => {
      const cardCategory = this.getCardCategory(card);
      const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory.toUpperCase();
      
      if (shouldShow) {
        // Show the card using CSS classes
        card.classList.remove('filtered-out');
        card.classList.add('filtered-in');
        visibleCount++;
      } else {
        // Hide the card using CSS classes
        card.classList.add('filtered-out');
        card.classList.remove('filtered-in');
      }
    });
    
    // Keep non-project items always visible
    const nonProjectItems = dynamicGrid.querySelectorAll('.break-glass-card, .full-width-component, [data-type="custom"], [data-type="full-width"]');
    nonProjectItems.forEach(item => {
      item.classList.remove('filtered-out');
      item.classList.add('filtered-in');
    });
    
    
    return visibleCount;
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
    // Wait for the grid to be fully rendered
    const waitForGrid = () => {
      const dynamicGrid = document.getElementById('dynamicGrid');
      const projectCards = dynamicGrid ? dynamicGrid.querySelectorAll('.project-card') : [];
      
      if (!dynamicGrid || projectCards.length === 0) {
        setTimeout(waitForGrid, 500);
        return;
      }
      
      this.setupEventListeners();
    };
    
    waitForGrid();
  },
  
  setupEventListeners: function() {
    const radioInputs = document.querySelectorAll('.filter-radio');
    const filterButtons = document.getElementById('filterButtons');
    
    if (!filterButtons || radioInputs.length === 0) {
      return;
    }
    
    // Set up event listeners for radio buttons
    radioInputs.forEach(radio => {
      // Remove any existing listeners
      radio.removeEventListener('change', this.handleRadioChange);
      
      // Add new listener
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          const category = e.target.value;
          
          this.currentCategory = category;
          this.updateButtonStates(category);
          this.filterProjects(category);
          
          // Add visual feedback using CSS classes
          const dynamicGrid = document.getElementById('dynamicGrid');
          if (dynamicGrid) {
            dynamicGrid.classList.add('filtering');
            setTimeout(() => {
              dynamicGrid.classList.remove('filtering');
            }, 200);
          }
        }
      });
    });
    
    // Set up click listeners for labels
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
    
    // Initialize with 'all' selected
    this.filterProjects('all');
    this.updateButtonStates('all');
    
    this.isInitialized = true;
  }
};

// Initialize when DOM is ready and after grid pool
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit longer for your grid pool to finish
  setTimeout(() => {
    window.CategoryFilter.init();
  }, 2000); // Wait 2 seconds for grid pool to be ready
});