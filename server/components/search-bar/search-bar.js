/**
 * Search Bar Component - Basic Implementation
 * Simplified for standalone search input
 */

class ProjectSearchManager {
  constructor() {
    this.searchInput = null;
    this.minSearchLength = 2;
    this.currentSearchTerm = '';
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    console.log('🔍 Initializing Project Search Manager...');
    
    // Wait for DOM to be ready
    const initAttempt = () => {
      this.searchInput = document.getElementById('projectSearch');
      
      if (!this.searchInput) {
        console.log('⏳ Search input not ready, retrying...');
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
    } else {
      this.resetSearch();
    }
  }

  async performSearch(searchTerm) {
    console.log(`🔍 Starting search for: "${searchTerm}"`);
    
    if (!searchTerm) {
      console.log('🔄 Empty search term, resetting');
      this.resetSearch();
      return;
    }

    // Add searching state to search container
    this.searchInput.parentElement.classList.add('searching');
    
    // Find all project cards to filter
    const projectCards = document.querySelectorAll('.project-card');
    console.log('📋 Found project cards:', projectCards.length);
    
    let matchCount = 0;
    
    // Filter each project card
    projectCards.forEach((card, index) => {
      const cardData = this.extractCardData(card);
      const passesSearch = this.matchesSearchTerm(cardData, searchTerm);
      
      if (passesSearch) {
        this.showCard(card);
        matchCount++;
      } else {
        this.hideCard(card);
      }
    });

    console.log(`🎯 Search results: ${matchCount}/${projectCards.length} cards match`);
    
    // Simulate search delay
    await this.delay(300);
    
    // Remove searching state
    this.searchInput.parentElement.classList.remove('searching');
    
    // Emit search event (this will also hide full-width cards)
    this.emitSearchEvent(searchTerm);
  }

  async resetSearch() {
    console.log('🔄 Resetting search');
    
    this.currentSearchTerm = '';
    
    // Remove searching state
    this.searchInput.parentElement.classList.remove('searching');
    
    // Show all project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      this.showCard(card);
    });
    
    // Emit reset event (this will also show full-width cards)
    this.emitSearchEvent('');
  }

  clearSearch() {
    console.log('🧹 Clearing search');
    this.searchInput.value = '';
    this.resetSearch();
    this.searchInput.focus();
  }

  extractCardData(card) {
    // Extract searchable data from project card
    const titleElement = card.querySelector('.project-details h2') || 
                        card.querySelector('h3') || 
                        card.querySelector('h2') ||
                        card.querySelector('.project-title') ||
                        card.querySelector('.title');
    
    const categoryElement = card.querySelector('.category p') ||
                           card.querySelector('.category') ||
                           card.querySelector('[data-category]');
    
    const productionElement = card.querySelector('.project-production') || 
                             card.querySelector('.production-name') ||
                             card.querySelector('.production');
    
    const photographerElement = card.querySelector('.photographer-name') ||
                               card.querySelector('.photographer');
    
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
      if (card.classList.contains('search-hidden')) {
        card.style.display = 'none';
      }
    }, 300);
  }

  emitSearchEvent(searchTerm) {
    // Hide/show full-width cards based on search state
    this.toggleFullWidthCards(searchTerm.length > 0);
    
    // Emit custom event that other parts of your application can listen to
    const searchEvent = new CustomEvent('projectSearch', {
      detail: {
        searchTerm: searchTerm,
        isActive: searchTerm.length > 0
      }
    });
    
    document.dispatchEvent(searchEvent);
  }

  toggleFullWidthCards(isSearching) {
    // Find all full-width elements in the page
    const fullWidthElements = document.querySelectorAll(
      '.full-width-component, [data-type="full-width"], .break-glass-card, [data-type="custom"]'
    );
    
    fullWidthElements.forEach(element => {
      if (isSearching) {
        // Hide full-width cards when searching
        element.style.display = 'none';
        element.classList.add('search-hidden');
      } else {
        // Show full-width cards when not searching
        element.style.display = '';
        element.classList.remove('search-hidden');
      }
    });
    
    console.log(`${isSearching ? 'Hidden' : 'Shown'} ${fullWidthElements.length} full-width elements`);
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

  // Public method to refresh search
  refreshSearch() {
    if (this.currentSearchTerm) {
      console.log('🔄 Refreshing search');
      this.performSearch(this.currentSearchTerm);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🔍 Attempting to initialize search manager...');
    window.projectSearchManager = new ProjectSearchManager();
  }, 300);
});

// Debug function for testing
window.debugSearch = function() {
  console.log('🔍 Debug Search Status:');
  console.log('- Search input found:', !!document.getElementById('projectSearch'));
  
  // Try to force initialize if not already done
  if (!window.projectSearchManager) {
    console.log('🔧 Force initializing search manager...');
    window.projectSearchManager = new ProjectSearchManager();
  }
};

// Example of how to listen for search events in other parts of your application
document.addEventListener('projectSearch', (event) => {
  const { searchTerm, isActive } = event.detail;
  console.log(`📡 Search event received: "${searchTerm}", active: ${isActive}`);
  
  // Here you would implement your search logic for filtering content
  // For example, if you have a grid or list of items to filter
});

console.log('🔍 Basic Project Search System loaded');
console.log('Available commands:');
console.log('- window.ProjectSearch.searchFor("term")');
console.log('- window.ProjectSearch.resetSearch()');
console.log('- window.ProjectSearch.clearSearch()');
console.log('- Listen for "projectSearch" events on document');