/**
 * Category Filter Component with Radio Buttons
 * This uses actual radio inputs for guaranteed single selection
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait to ensure DOM is loaded
  setTimeout(initCategoryFilter, 300);
});

function initCategoryFilter() {
  console.log('Initializing category filter with radio buttons...');
  
  // Get DOM elements
  const dynamicGrid = document.getElementById('dynamicGrid');
  const filterButtons = document.getElementById('filterButtons');
  const radioInputs = document.querySelectorAll('.filter-radio');
  const visibleCount = document.getElementById('visibleCount');
  
  // Exit if required elements are not found
  if (!dynamicGrid || !filterButtons || radioInputs.length === 0) {
    console.error('Required DOM elements not found for category filter');
    console.log('Will retry in 500ms...');
    setTimeout(initCategoryFilter, 500);
    return;
  }
  
  console.log(`Found ${radioInputs.length} radio inputs for filtering`);
  
  // Set up global CategoryFilter object
  window.CategoryFilter = {
    filterProjects: function(category) {
      console.log('Filtering by category:', category);
      const gridItems = document.querySelectorAll('.dynamic-grid .grid-item:not(.additional-item)');
      let visibleCount = 0;
      
      gridItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
          item.style.display = '';
          item.classList.remove('filtered-out');
          visibleCount++;
        } else {
          item.style.display = 'none';
          item.classList.add('filtered-out');
        }
      });
      
      // Remove any additional items when filtering
      const additionalItems = document.querySelectorAll('.grid-item.additional-item');
      additionalItems.forEach(item => item.remove());
      
      // Update visible count display
      if (visibleCount && document.getElementById('visibleCount')) {
        document.getElementById('visibleCount').textContent = `${visibleCount} projecten zichtbaar`;
      }
      
      // Return visible count for other components to use
      return visibleCount;
    },
    currentCategory: 'all',
    categories: []
  };
  
  // Extract categories from radio button values
  window.CategoryFilter.categories = Array.from(radioInputs)
    .filter(input => input.value !== 'all')
    .map(input => input.value);
  
  console.log('Categories found:', window.CategoryFilter.categories);
  
  // Initialize with default category (all)
  window.CategoryFilter.filterProjects('all');
  
  // Set up event listeners for radio buttons
  radioInputs.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const category = this.value;
        console.log(`Radio changed to: ${category}`);
        
        // Update current category
        window.CategoryFilter.currentCategory = category;
        
        // Filter projects
        const visibleCount = window.CategoryFilter.filterProjects(category);
        
        // Trigger grid layout change animation
        dynamicGrid.classList.add('filtering');
        setTimeout(() => {
          dynamicGrid.classList.remove('filtering');
        }, 300);
        
        // If sorting is active, re-sort the visible items
        if (window.ProjectSort && typeof window.ProjectSort.performSort === 'function') {
          setTimeout(() => {
            window.ProjectSort.performSort();
          }, 150);
        }
        
        // If dynamic grid is active, update layout
        if (window.dynamicGrid && typeof window.dynamicGrid.enhanceLayout === 'function') {
          setTimeout(() => {
            window.dynamicGrid.enhanceLayout();
          }, 200);
        }
      }
    });
  });
  
  console.log('Category filter with radio buttons initialized successfully');
}