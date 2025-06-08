/**
 * Search Bar Component - CSS-free Implementation
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
    // Wait for DOM to be ready
    const initAttempt = () => {
      this.searchInput = document.getElementById('projectSearch');
      
      if (!this.searchInput) {
        setTimeout(initAttempt, 500);
        return;
      }
      
      this.setupEventListeners();
      this.setupGlobalInterface();
      this.isInitialized = true;
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
    if (!searchTerm) {
      this.resetSearch();
      return;
    }

    // Add searching state using CSS classes
    this.searchInput.parentElement.classList.add('searching');
    
    // Find all project cards to filter
    const projectCards = document.querySelectorAll('.project-card');
    
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
    
    // Simulate search delay
    await this.delay(300);
    
    // Remove searching state
    this.searchInput.parentElement.classList.remove('searching');
    
    // Emit search event (this will also hide full-width cards)
    this.emitSearchEvent(searchTerm);
  }

  async resetSearch() {
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
  }

  hideCard(card) {
    // Hide the card using CSS classes
    card.classList.add('search-hidden', 'filtered-out');
    card.classList.remove('search-match', 'filtered-in');
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
        // Hide full-width cards when searching using CSS classes
        element.classList.add('search-hidden');
      } else {
        // Show full-width cards when not searching
        element.classList.remove('search-hidden');
      }
    });
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
      this.performSearch(this.currentSearchTerm);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.projectSearchManager = new ProjectSearchManager();
  }, 300);
});

