/**
 * Final Category Filter - Replaces the old one
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
        // Show the card completely
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.style.transition = 'all 0.3s ease';
        card.classList.remove('filtered-out');
        card.classList.add('filtered-in');
        visibleCount++;
      } else {
        // Completely hide the card
        card.style.display = 'none';
        card.classList.add('filtered-out');
        card.classList.remove('filtered-in');
      }
    });
    
    // Keep non-project items always visible
    const nonProjectItems = dynamicGrid.querySelectorAll('.break-glass-card, .full-width-component, [data-type="custom"], [data-type="full-width"]');
    nonProjectItems.forEach(item => {
      item.style.display = '';
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
      item.style.filter = 'none';
      item.style.pointerEvents = 'auto';
    });
    
    // Update visible count
    this.updateVisibleCount(visibleCount, totalProjects, selectedCategory);
    
    return visibleCount;
  },
  
  updateVisibleCount: function(visible, total, category) {
    const visibleCountElement = document.getElementById('visibleCount');
    if (visibleCountElement) {
      const categoryText = category === 'all' ? 'alle categorieën' : category;
      visibleCountElement.textContent = 
        `${visible} van ${total} projecten zichtbaar (${categoryText})`;
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
          
          // Add visual feedback
          const dynamicGrid = document.getElementById('dynamicGrid');
          if (dynamicGrid) {
            dynamicGrid.style.transition = 'opacity 0.3s ease';
            dynamicGrid.style.opacity = '0.8';
            setTimeout(() => {
              dynamicGrid.style.opacity = '1';
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