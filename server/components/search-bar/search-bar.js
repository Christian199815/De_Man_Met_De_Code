/**
 * Search Bar Component for Projects
 * Handles searching through project grid items
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure DOM is fully loaded
  setTimeout(initSearch, 300);
});

function initSearch() {
  console.log('Initializing search component...');
  
  // DOM elements
  const searchInput = document.getElementById('projectSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  const dynamicGrid = document.getElementById('dynamicGrid');
  
  // Exit if required elements are not found
  if (!searchInput || !clearSearchBtn || !searchResultsInfo || !dynamicGrid) {
    console.error('Required elements for search not found');
    console.log('Will retry in 500ms...');
    setTimeout(initSearch, 500);
    return;
  }
  
  // Constants
  const minSearchLength = 3;
  
  // Grid items
  const gridItems = Array.from(dynamicGrid.querySelectorAll('.grid-item'));
  const totalItems = gridItems.length;
  
  // Cache project data for faster searching
  const itemsData = gridItems.map(item => {
    const titleElement = item.querySelector('h3');
    const categoryElement = item.querySelector('.project-category');
    const detailsElement = item.querySelector('.project-details');
    
    return {
      element: item,
      title: titleElement ? titleElement.textContent.trim() : '',
      originalTitle: titleElement ? titleElement.innerHTML : '',
      category: categoryElement ? categoryElement.textContent.trim() : item.getAttribute('data-category') || '',
      details: detailsElement ? detailsElement.textContent.trim() : ''
    };
  });
  
  // Set up global ProjectSearch object
  window.ProjectSearch = {
    performSearch: performSearch,
    resetSearch: resetSearch,
    searchFor: (term) => {
      searchInput.value = term;
      if (term.length >= minSearchLength) {
        performSearch(term.toLowerCase());
        toggleClearButton(term);
      }
    }
  };
  
  // Listen for input events on search input
  searchInput.addEventListener('input', debounce(() => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Only search if term is at least minSearchLength characters or empty
    if (searchTerm.length >= minSearchLength || searchTerm === '') {
      performSearch(searchTerm);
    } else if (searchTerm.length > 0) {
      searchResultsInfo.textContent = `Typ minimaal ${minSearchLength} tekens om te zoeken`;
      resetSearch();
    } else {
      searchResultsInfo.textContent = '';
      resetSearch();
    }
    
    // Show/hide clear button
    toggleClearButton(searchTerm);
  }, 300));
  
  // Also handle the keydown event for Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm.length >= minSearchLength) {
        performSearch(searchTerm);
      }
    }
  });
  
  // Clear button click handler
  clearSearchBtn.addEventListener('click', () => {
    console.log('Clear search button clicked');
    searchInput.value = '';
    searchResultsInfo.textContent = '';
    resetSearch();
    toggleClearButton('');
    searchInput.focus();
  });
  
  // Initialize clear button state
  toggleClearButton('');
  
  console.log('Search component initialized successfully');
  
  /**
   * Toggle clear button visibility
   */
  function toggleClearButton(term) {
    if (term && term.length > 0) {
      clearSearchBtn.style.opacity = '1';
      clearSearchBtn.style.visibility = 'visible';
    } else {
      clearSearchBtn.style.opacity = '0';
      clearSearchBtn.style.visibility = 'hidden';
    }
  }
  
  /**
   * Perform search and update UI
   */
  function performSearch(searchTerm) {
    console.log(`Performing search for: "${searchTerm}"`);
    
    // If empty search term, reset everything
    if (!searchTerm) {
      resetSearch();
      searchResultsInfo.textContent = '';
      return;
    }
    
    let matchCount = 0;
    let visibleCount = 0;
    
    // Current active category filter
    const currentCategory = window.CategoryFilter ? window.CategoryFilter.currentCategory : 'all';
    
    // Search each item
    itemsData.forEach(item => {
      const titleLower = item.title.toLowerCase();
      const categoryLower = item.category.toLowerCase();
      const detailsLower = item.details.toLowerCase();
      
      // Check if the item passes the category filter
      const passesFilter = (currentCategory === 'all' || item.element.getAttribute('data-category') === currentCategory);
      
      // Check if it matches the search term
      const isMatch = titleLower.includes(searchTerm) || 
                      categoryLower.includes(searchTerm) || 
                      detailsLower.includes(searchTerm);
      
      // Update visibility based on filter and search
      if (passesFilter) {
        visibleCount++;
        
        if (isMatch) {
          item.element.classList.remove('search-hidden');
          item.element.classList.add('search-match');
          // Make sure the element is visible
          item.element.style.display = '';
          matchCount++;
          
          // Highlight matching text in title
          const titleEl = item.element.querySelector('h3');
          if (titleEl) {
            titleEl.innerHTML = highlightMatches(item.title, searchTerm);
          }
        } else {
          // Make sure to hide non-matching items
          item.element.classList.add('search-hidden');
          item.element.classList.remove('search-match');
          // Use direct style to ensure hiding
          item.element.style.display = 'none';
        }
      }
    });
    
    // Update results info
    updateResultsInfo(matchCount, visibleCount);
    
    // Re-apply sorting if needed
    if (window.ProjectSort && typeof window.ProjectSort.performSort === 'function') {
      setTimeout(() => {
        window.ProjectSort.performSort();
      }, 150);
    }
  }
  
  /**
   * Reset search to original state
   */
  function resetSearch() {
    console.log('Resetting search');
    
    // Reset card classes
    itemsData.forEach(item => {
      item.element.classList.remove('search-hidden', 'search-match');
      // Make sure to reset display style
      item.element.style.display = '';
      
      // Reset title to original state
      const titleEl = item.element.querySelector('h3');
      if (titleEl) {
        titleEl.innerHTML = item.originalTitle;
      }
    });
    
    // Re-apply sorting
    if (window.ProjectSort && typeof window.ProjectSort.performSort === 'function') {
      setTimeout(() => {
        window.ProjectSort.performSort();
      }, 150);
    }
  }
  
  /**
   * Highlight matching text
   */
  function highlightMatches(text, searchTerm) {
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight-match">$1</span>');
  }
  
  /**
   * Update results information
   */
  function updateResultsInfo(matchCount, totalVisible) {
    if (matchCount === 0) {
      searchResultsInfo.textContent = `Geen projecten gevonden`;
    } else if (matchCount === totalVisible && matchCount === totalItems) {
      searchResultsInfo.textContent = `Alle ${totalItems} projecten worden getoond`;
    } else {
      searchResultsInfo.textContent = `${matchCount} van ${totalVisible} zichtbare projecten gevonden`;
    }
  }
  
  /**
   * Helper to escape special RegExp characters
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Debounce helper function
 */
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}