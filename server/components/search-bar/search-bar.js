/**
 * Search Bar Component for Projects
 * Searches project titles and highlights matches
 * Updated for input change events
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const searchInput = document.getElementById('projectSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const projectsGrid = document.querySelector('.projects-grid');
    
    // Exit if required elements don't exist
    if (!searchInput || !clearSearchBtn || !projectsGrid) {
      console.error('Required elements for search not found');
      return;
    }
    
    // Project cards
    const projectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));
    const totalProjects = projectCards.length;
    
    // Minimum characters to start searching
    const minSearchLength = 3;
    
    // Cache project data for faster searching
    const projectsData = projectCards.map(card => {
      const titleElement = card.querySelector('h2');
      return {
        element: card,
        title: titleElement ? titleElement.textContent.trim() : '',
        originalTitle: titleElement ? titleElement.innerHTML : ''
      };
    });
    
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
      searchInput.value = '';
      searchResultsInfo.textContent = '';
      resetSearch();
      toggleClearButton('');
      searchInput.focus();
    });
    
    // Toggle clear button visibility
    function toggleClearButton(term) {
      if (term && term.length > 0) {
        clearSearchBtn.style.opacity = '1';
        clearSearchBtn.style.visibility = 'visible';
      } else {
        clearSearchBtn.style.opacity = '0';
        clearSearchBtn.style.visibility = 'hidden';
      }
    }
    
    // Perform search and update UI
    function performSearch(searchTerm) {
      // If empty search term, reset everything
      if (!searchTerm) {
        resetSearch();
        searchResultsInfo.textContent = '';
        return;
      }
      
      let matchCount = 0;
      
      // Search each project title
      projectsData.forEach(project => {
        const titleLower = project.title.toLowerCase();
        const isMatch = titleLower.includes(searchTerm);
        
        // Update card visibility
        if (isMatch) {
          project.element.classList.remove('search-hidden');
          project.element.classList.add('search-match');
          matchCount++;
          
          // Highlight matching text
          const titleEl = project.element.querySelector('h2');
          if (titleEl) {
            titleEl.innerHTML = highlightMatches(project.title, searchTerm);
          }
        } else {
          project.element.classList.add('search-hidden');
          project.element.classList.remove('search-match');
        }
      });
      
      // Update results info
      updateResultsInfo(matchCount, totalProjects);
      
      // Check if we need to add a "no results" message
      updateNoResultsMessage(matchCount);
    }
    
    // Reset search to original state
    function resetSearch() {
      // Reset card classes
      projectsData.forEach(project => {
        project.element.classList.remove('search-hidden', 'search-match');
        
        // Reset title to original state
        const titleEl = project.element.querySelector('h2');
        if (titleEl) {
          titleEl.innerHTML = project.originalTitle;
        }
      });
      
      // Remove any "no results" message
      removeNoResultsMessage();
    }
    
    // Highlight matching text
    function highlightMatches(text, searchTerm) {
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      return text.replace(regex, '<span class="highlight-match">$1</span>');
    }
    
    // Update results information
    function updateResultsInfo(matchCount, totalCount) {
      if (matchCount === 0) {
        searchResultsInfo.textContent = `Geen projecten gevonden`;
      } else if (matchCount === totalCount) {
        searchResultsInfo.textContent = `Alle ${totalCount} projecten worden getoond`;
      } else {
        searchResultsInfo.textContent = `${matchCount} van ${totalCount} projecten gevonden`;
      }
    }
    
    // Add a "no results" message when needed
    function updateNoResultsMessage(matchCount) {
      removeNoResultsMessage();
      
      if (matchCount === 0) {
        const noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results-message';
        noResultsEl.id = 'noResultsMessage';
        noResultsEl.textContent = 'Geen projecten gevonden voor deze zoekopdracht';
        projectsGrid.appendChild(noResultsEl);
      }
    }
    
    // Remove the "no results" message
    function removeNoResultsMessage() {
      const existingMessage = document.getElementById('noResultsMessage');
      if (existingMessage) {
        existingMessage.remove();
      }
    }
    
    // Debounce helper function
    function debounce(func, delay) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
      };
    }
    
    // Helper to escape special RegExp characters
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Initialize clear button state
    toggleClearButton('');
    
    // Expose search functions globally
    window.projectSearch = {
      performSearch,
      resetSearch,
      searchFor: (term) => {
        searchInput.value = term;
        if (term.length >= minSearchLength) {
          performSearch(term.toLowerCase());
          toggleClearButton(term);
        }
      }
    };
  });