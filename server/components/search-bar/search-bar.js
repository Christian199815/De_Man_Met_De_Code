/**
 * Search Bar Component with Filtering Transitions
 * Integrates with CleanGridPool system
 */

class ProjectSearchManager {
  constructor() {
    this.searchInput = null;
    this.clearSearchBtn = null;
    this.searchResultsInfo = null;
    this.dynamicGrid = null;
    this.minSearchLength = 2;
    this.currentSearchTerm = '';
    this.isInitialized = false;
    this.isFiltering = false;
    
    this.init();
  }

  init() {
    console.log('🔍 Initializing Project Search Manager...');
    
    // Wait for DOM and grid to be ready
    const initAttempt = () => {
      this.searchInput = document.getElementById('projectSearch');
      this.clearSearchBtn = document.getElementById('clearSearch');
      this.searchResultsInfo = document.getElementById('searchResultsInfo');
      this.dynamicGrid = document.getElementById('dynamicGrid');
      
      if (!this.searchInput || !this.clearSearchBtn || !this.searchResultsInfo || !this.dynamicGrid) {
        console.log('⏳ Search elements not ready, retrying...');
        setTimeout(initAttempt, 500);
        return;
      }
      
      this.setupEventListeners();
      this.setupGlobalInterface();
      this.isInitialized = true;
      
      console.log('✅ Project Search Manager initialized successfully');
    };
    
    // Start initialization after a short delay
    setTimeout(initAttempt, 300);
  }

  setupEventListeners() {
    // Search input with debounce
    this.searchInput.addEventListener('input', this.debounce(() => {
      const searchTerm = this.searchInput.value.trim().toLowerCase();
      this.handleSearchInput(searchTerm);
    }, 300));

    // Enter key handling
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        if (searchTerm.length >= this.minSearchLength) {
          this.performSearch(searchTerm);
        }
      }
    });

    // Clear button
    this.clearSearchBtn.addEventListener('click', () => {
      this.clearSearch();
    });
  }

  setupGlobalInterface() {
    // Create global interface for external access
    window.ProjectSearch = {
      performSearch: (term) => this.performSearch(term),
      resetSearch: () => this.resetSearch(),
      clearSearch: () => this.clearSearch(),
      searchFor: (term) => {
        this.searchInput.value = term;
        this.handleSearchInput(term.toLowerCase());
      },
      isSearchActive: () => this.currentSearchTerm.length > 0
    };
  }

  handleSearchInput(searchTerm) {
    this.currentSearchTerm = searchTerm;
    
    if (searchTerm.length >= this.minSearchLength || searchTerm === '') {
      this.performSearch(searchTerm);
    } else if (searchTerm.length > 0) {
      this.searchResultsInfo.textContent = `Typ minimaal ${this.minSearchLength} tekens om te zoeken`;
    } else {
      this.searchResultsInfo.textContent = '';
      this.resetSearch();
    }
    
    this.toggleClearButton(searchTerm);
  }

  async performSearch(searchTerm) {
    console.log(`🔍 Performing search for: "${searchTerm}"`);
    
    if (!searchTerm) {
      this.resetSearch();
      this.searchResultsInfo.textContent = '';
      return;
    }

    // Start filtering transition
    this.startFilteringTransition();

    // Get all current project cards from the grid
    const projectCards = this.dynamicGrid.querySelectorAll('.project-card');
    let matchCount = 0;
    let totalCards = projectCards.length;
    
    // Get current category filter state
    const currentCategory = window.CategoryFilter ? window.CategoryFilter.currentCategory : 'all';
    
    // Phase 1: Fade out all cards
    projectCards.forEach(card => {
      card.classList.add('filtering-fade-out');
    });

    // Wait for fade out to complete
    await this.delay(200);

    // Phase 2: Process each card
    projectCards.forEach(card => {
      const cardData = this.extractCardData(card);
      const passesSearch = this.matchesSearchTerm(cardData, searchTerm);
      const passesFilter = this.passesCategoryFilter(card, currentCategory);
      
      // Show card only if it passes both search and filter
      const shouldShow = passesSearch && passesFilter;
      
      if (shouldShow) {
        this.showCard(card);
        matchCount++;
      } else {
        this.hideCard(card);
      }
    });

    // Phase 3: Fade in visible cards with staggered animation
    const visibleCards = Array.from(projectCards).filter(card => !card.classList.contains('search-hidden'));
    visibleCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('filtering-fade-in');
        card.classList.remove('filtering-fade-out');
      }, index * 50); // Stagger by 50ms
    });

    // Keep non-project items visible
    this.keepNonProjectItemsVisible();
    
    // Update results info
    this.updateResultsInfo(matchCount, totalCards, searchTerm);
    
    // End filtering transition
    setTimeout(() => {
      this.endFilteringTransition();
    }, 400 + (visibleCards.length * 50));
    
    // Preserve styles after search
    setTimeout(() => {
      if (window.cleanGridPool) {
        window.cleanGridPool.fixAllCardStyles();
      }
    }, 500);
  }

  startFilteringTransition() {
    this.isFiltering = true;
    
    // Add filtering classes to components
    this.dynamicGrid.classList.add('filtering-active');
    this.searchInput.parentElement.classList.add('searching');
    
    // Show loading indicator in search
    this.searchInput.classList.add('loading');
    
    // Dim the grid slightly
    this.dynamicGrid.style.opacity = '0.8';
    this.dynamicGrid.style.transform = 'scale(0.98)';
  }

  endFilteringTransition() {
    this.isFiltering = false;
    
    // Remove filtering classes
    this.dynamicGrid.classList.remove('filtering-active');
    this.searchInput.parentElement.classList.remove('searching');
    this.searchInput.classList.remove('loading');
    
    // Restore grid appearance
    this.dynamicGrid.style.opacity = '1';
    this.dynamicGrid.style.transform = 'scale(1)';
    
    // Clean up transition classes
    const allCards = this.dynamicGrid.querySelectorAll('.project-card');
    allCards.forEach(card => {
      card.classList.remove('filtering-fade-out', 'filtering-fade-in');
    });
  }

  extractCardData(card) {
    // Extract searchable data from project card
    const titleElement = card.querySelector('.project-details h2') || card.querySelector('h3') || card.querySelector('h2');
    const categoryElement = card.querySelector('.catagorie p');
    const productionElement = card.querySelector('.project-production') || card.querySelector('.production-name');
    const photographerElement = card.querySelector('.photographer-name');
    
    return {
      title: titleElement ? titleElement.textContent.trim() : '',
      category: categoryElement ? categoryElement.textContent.trim() : '',
      production: productionElement ? productionElement.textContent.trim() : '',
      photographer: photographerElement ? photographerElement.textContent.trim() : '',
      // Get any data attributes that might contain searchable content
      dataTitle: card.getAttribute('data-title') || '',
      dataProduction: card.getAttribute('data-production') || '',
      dataCategory: card.getAttribute('data-category') || ''
    };
  }

  matchesSearchTerm(cardData, searchTerm) {
    const searchFields = [
      cardData.title.toLowerCase(),
      cardData.category.toLowerCase(),
      cardData.production.toLowerCase(),
      cardData.photographer.toLowerCase(),
      cardData.dataTitle.toLowerCase(),
      cardData.dataProduction.toLowerCase(),
      cardData.dataCategory.toLowerCase()
    ];
    
    return searchFields.some(field => field.includes(searchTerm));
  }

  passesCategoryFilter(card, currentCategory) {
    if (currentCategory === 'all') return true;
    
    const categoryElement = card.querySelector('.catagorie p');
    const cardCategory = categoryElement ? 
      categoryElement.textContent.trim().toUpperCase() : 
      (card.getAttribute('data-category') || '').toUpperCase();
    
    return cardCategory === currentCategory.toUpperCase();
  }

  showCard(card) {
    // Remove search-related hiding classes
    card.classList.remove('search-hidden', 'filtered-out');
    card.classList.add('search-match', 'filtered-in');
    
    // Ensure card is visible
    card.style.display = '';
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.filter = 'none';
    card.style.pointerEvents = 'auto';
  }

  hideCard(card) {
    // Hide the card with transition
    card.classList.add('search-hidden', 'filtered-out');
    card.classList.remove('search-match', 'filtered-in');
    
    // Use transition to hide
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    card.style.filter = 'blur(2px)';
    
    // Actually hide after transition
    setTimeout(() => {
      card.style.display = 'none';
    }, 300);
  }

  keepNonProjectItemsVisible() {
    // Always keep break glass cards and full-width components visible
    const nonProjectItems = this.dynamicGrid.querySelectorAll('.break-glass-card, .full-width-component, [data-type="custom"], [data-type="full-width"]');
    nonProjectItems.forEach(item => {
      item.style.display = '';
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
      item.style.filter = 'none';
      item.style.pointerEvents = 'auto';
      item.classList.remove('search-hidden', 'filtered-out');
    });
  }

  async resetSearch() {
    console.log('🔄 Resetting search');
    
    this.currentSearchTerm = '';
    
    // Start reset transition
    this.startFilteringTransition();
    
    // Reset all project cards with transition
    const projectCards = this.dynamicGrid.querySelectorAll('.project-card');
    
    // Phase 1: Fade out hidden cards
    const hiddenCards = Array.from(projectCards).filter(card => card.classList.contains('search-hidden'));
    hiddenCards.forEach(card => {
      card.classList.remove('search-hidden', 'search-match', 'filtered-out');
      card.classList.add('filtered-in');
      card.style.display = '';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      card.style.filter = 'blur(2px)';
    });
    
    await this.delay(100);
    
    // Phase 2: Fade in all cards with stagger
    projectCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.classList.add('filtering-fade-in');
      }, index * 30);
    });

    // Re-apply category filter if active
    if (window.CategoryFilter && window.CategoryFilter.currentCategory !== 'all') {
      setTimeout(() => {
        window.CategoryFilter.filterProjects(window.CategoryFilter.currentCategory);
      }, 50);
    }
    
    // End transition
    setTimeout(() => {
      this.endFilteringTransition();
      
      // Preserve styles after reset
      if (window.cleanGridPool) {
        window.cleanGridPool.fixAllCardStyles();
      }
    }, 400 + (projectCards.length * 30));
  }

  clearSearch() {
    console.log('🧹 Clearing search');
    this.searchInput.value = '';
    this.searchResultsInfo.textContent = '';
    this.resetSearch();
    this.toggleClearButton('');
    this.searchInput.focus();
  }

  updateResultsInfo(matchCount, totalCards, searchTerm) {
    // Add a subtle pulse animation to the results info
    this.searchResultsInfo.classList.add('updating');
    
    setTimeout(() => {
      if (matchCount === 0) {
        this.searchResultsInfo.textContent = `Geen projecten gevonden voor "${searchTerm}"`;
        this.searchResultsInfo.classList.add('no-results');
      } else if (matchCount === totalCards) {
        this.searchResultsInfo.textContent = `Alle ${totalCards} projecten komen overeen`;
        this.searchResultsInfo.classList.remove('no-results');
      } else {
        this.searchResultsInfo.textContent = `${matchCount} van ${totalCards} projecten gevonden`;
        this.searchResultsInfo.classList.remove('no-results');
      }
      
      this.searchResultsInfo.classList.remove('updating');
    }, 200);
  }

  toggleClearButton(term) {
    if (term && term.length > 0) {
      this.clearSearchBtn.style.opacity = '1';
      this.clearSearchBtn.style.visibility = 'visible';
      this.clearSearchBtn.style.transform = 'scale(1)';
    } else {
      this.clearSearchBtn.style.opacity = '0';
      this.clearSearchBtn.style.visibility = 'hidden';
      this.clearSearchBtn.style.transform = 'scale(0.8)';
    }
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to refresh search when grid changes
  refreshSearch() {
    if (this.currentSearchTerm) {
      console.log('🔄 Refreshing search after grid change');
      this.performSearch(this.currentSearchTerm);
    }
  }
}

// Enhanced Category Filter Integration
if (window.CategoryFilter) {
  const originalFilterProjects = window.CategoryFilter.filterProjects;
  
  window.CategoryFilter.filterProjects = function(selectedCategory) {
    console.log('🔍 Enhanced filter with search integration:', selectedCategory);
    
    // If search is active, perform combined search and filter
    if (window.ProjectSearch && window.ProjectSearch.isSearchActive()) {
      const currentSearchTerm = window.projectSearchManager ? window.projectSearchManager.currentSearchTerm : '';
      
      // Update category first
      this.currentCategory = selectedCategory;
      this.updateButtonStates(selectedCategory);
      
      // Then perform search with new category
      if (currentSearchTerm) {
        window.ProjectSearch.performSearch(currentSearchTerm);
      } else {
        // Just apply category filter
        originalFilterProjects.call(this, selectedCategory);
      }
    } else {
      // No active search, use original filter
      originalFilterProjects.call(this, selectedCategory);
    }
    
    return this.getVisibleCount();
  };
  
  // Add helper method to get visible count
  window.CategoryFilter.getVisibleCount = function() {
    const dynamicGrid = document.getElementById('dynamicGrid');
    if (!dynamicGrid) return 0;
    
    const visibleCards = dynamicGrid.querySelectorAll('.project-card:not(.search-hidden):not(.filtered-out)');
    return visibleCards.length;
  };
}

// Enhanced Grid Pool Integration
if (window.cleanGridPool) {
  const originalRenderGrid = window.cleanGridPool.renderGrid;
  
  window.cleanGridPool.renderGrid = function() {
    console.log('🎨 Enhanced render with search integration...');
    
    // Store current search state
    const wasSearchActive = window.ProjectSearch && window.ProjectSearch.isSearchActive();
    const currentSearchTerm = window.projectSearchManager ? window.projectSearchManager.currentSearchTerm : '';
    
    // Call original render
    originalRenderGrid.call(this);
    
    // Restore search after rendering
    setTimeout(() => {
      if (wasSearchActive && currentSearchTerm && window.ProjectSearch) {
        console.log('🔄 Restoring search after grid render');
        window.ProjectSearch.performSearch(currentSearchTerm);
      } else if (window.projectSearchManager) {
        window.projectSearchManager.refreshSearch();
      }
    }, 150);
  };
}

// Initialize search manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other systems to initialize first
  setTimeout(() => {
    window.projectSearchManager = new ProjectSearchManager();
  }, 1000);
});

console.log('🔍 Enhanced Project Search System with Transitions loaded');
console.log('Available commands:');
console.log('- window.ProjectSearch.searchFor("term")');
console.log('- window.ProjectSearch.resetSearch()');
console.log('- window.ProjectSearch.clearSearch()');