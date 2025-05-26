/**
 * Project Sorting Component
 * Handles sorting of grid items by date or name
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure DOM is fully loaded
  setTimeout(initSorting, 200);
});

function initSorting() {
  console.log('Initializing sorting component...');
  
  // Get DOM elements
  const dynamicGrid = document.getElementById('dynamicGrid');
  const sortDateBtn = document.getElementById('sortDateToggle');
  const sortNameBtn = document.getElementById('sortNameToggle');
  
  // Exit if required elements are not found
  if (!dynamicGrid || !sortDateBtn || !sortNameBtn) {
    console.error('Required DOM elements not found for sorting');
    console.log('Will retry in 500ms...');
    setTimeout(initSorting, 500);
    return;
  }
  
  // Set default active sort
  sortDateBtn.classList.add('active');
  let currentSort = {
    type: 'date',
    direction: 'desc'
  };
  
  // Set up global ProjectSort object
  window.ProjectSort = {
    performSort: performSort,
    currentSort: currentSort
  };
  
  // Add click event listeners
  sortDateBtn.addEventListener('click', function() {
    console.log('Date sort button clicked');
    
    if (currentSort.type === 'date') {
      // Toggle direction
      currentSort.direction = currentSort.direction === 'desc' ? 'asc' : 'desc';
    } else {
      // Switch to date sort
      currentSort.type = 'date';
      currentSort.direction = 'desc';
      sortDateBtn.classList.add('active');
      sortNameBtn.classList.remove('active');
    }
    
    // Update UI
    updateSortIcon(sortDateBtn, currentSort.direction);
    
    // Perform sort
    performSort();
  });
  
  sortNameBtn.addEventListener('click', function() {
    console.log('Name sort button clicked');
    
    if (currentSort.type === 'name') {
      // Toggle direction
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Switch to name sort
      currentSort.type = 'name';
      currentSort.direction = 'asc';
      sortNameBtn.classList.add('active');
      sortDateBtn.classList.remove('active');
    }
    
    // Update UI
    updateSortIcon(sortNameBtn, currentSort.direction);
    
    // Perform sort
    performSort();
  });
  
  // Do initial sort
  setTimeout(performSort, 300);
  
  console.log('Sorting component initialized successfully');
  
  /**
   * Update sort icon based on direction
   */
  function updateSortIcon(button, direction) {
    const icon = button.querySelector('.sort-icon path');
    if (icon) {
      icon.setAttribute('d', direction === 'asc' 
        ? 'M7 14l5-5 5 5H7z'  // Up arrow
        : 'M7 10l5 5 5-5H7z'  // Down arrow
      );
    }
  }
  
  /**
   * Perform the sort operation
   */
  function performSort() {
    console.log(`Sorting by ${currentSort.type} in ${currentSort.direction} order`);
    
    // Get all grid items that are not filtered out or hidden by search
    const items = Array.from(dynamicGrid.querySelectorAll('.grid-item:not(.filtered-out):not(.search-hidden)'));
    
    // Sort the items
    items.sort((itemA, itemB) => {
      if (currentSort.type === 'date') {
        return compareDates(itemA, itemB);
      } else {
        return compareNames(itemA, itemB);
      }
    });
    
    // Add animation class to grid
    dynamicGrid.classList.add('sorting');
    
    // Reorder the DOM
    items.forEach(item => dynamicGrid.appendChild(item));
    
    // After items are sorted, remove animation class
    setTimeout(() => {
      dynamicGrid.classList.remove('sorting');
    }, 300);
  }
  
  /**
   * Compare dates for sorting
   */
  function compareDates(itemA, itemB) {
    const dateA = getDateFromItem(itemA);
    const dateB = getDateFromItem(itemB);
    
    // Sort direction
    const factor = currentSort.direction === 'asc' ? 1 : -1;
    
    // Handle undefined dates
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return (dateA - dateB) * factor;
  }
  
  /**
   * Extract date from grid item
   */
  function getDateFromItem(item) {
    try {
      // First check if there's a data-date attribute
      const dateAttr = item.getAttribute('data-date');
      if (dateAttr) {
        // Try parsing ISO format date
        const date = new Date(dateAttr);
        if (!isNaN(date.getTime())) {
          return date.getTime();
        }
      }
      
      // Find date element in project details
      const dateElement = item.querySelector('.project-details p strong');
      if (dateElement && dateElement.textContent.includes('Datum:')) {
        const dateText = dateElement.parentElement.textContent.trim();
        // Remove "Datum:" prefix
        const cleanDateText = dateText.replace(/Datum:|\s+/g, ' ').trim();
        return parseDutchDate(cleanDateText);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting date:', error);
      return null;
    }
  }
  
  /**
   * Parse Dutch format date
   */
  function parseDutchDate(dateString) {
    const dutchMonths = {
      'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
      'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };
    
    try {
      const parts = dateString.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthName = parts[1].toLowerCase();
        const month = dutchMonths[monthName];
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day).getTime();
        }
      }
    } catch (e) {
      console.warn('Failed to parse date:', dateString);
    }
    
    return 0;
  }
  
  /**
   * Compare names for sorting
   */
  function compareNames(itemA, itemB) {
    const nameA = getNameFromItem(itemA);
    const nameB = getNameFromItem(itemB);
    
    // Sort direction
    const factor = currentSort.direction === 'asc' ? 1 : -1;
    
    return nameA.localeCompare(nameB, 'nl') * factor;
  }
  
  /**
   * Extract name from grid item
   */
  function getNameFromItem(item) {
    const nameElement = item.querySelector('h3');
    return nameElement ? nameElement.textContent.trim() : '';
  }
}