/**
 * Category Filter Component
 * Client-side filtering for project categories
 * Updated to work with your specific class names
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const projectsGrid = document.querySelector('.projects-grid');
    const filterButtons = document.getElementById('filterButtons');
    const visibleCount = document.getElementById('visibleCount');
    
    // If elements don't exist, exit early
    if (!projectsGrid || !filterButtons) {
      console.error('Required DOM elements not found');
      return;
    }
    
    // Get all project cards
    const projectCards = projectsGrid.querySelectorAll('.project-card');
    
    // Extract unique categories from project cards
    const categories = extractUniqueCategories(projectCards);
    
    // Create filter buttons for each category
    createCategoryButtons(categories);
    
    // Set up event listeners for filter buttons
    setupFilterListeners();
    
    /**
     * Extract unique categories from project cards
     */
    function extractUniqueCategories(projectCards) {
      const uniqueCategories = new Set();
      
      projectCards.forEach(card => {
        // Find the category element inside the card
        const categoryElement = card.querySelector('.project-category');
        if (categoryElement) {
          const category = categoryElement.textContent.trim();
          if (category !== '') {
            uniqueCategories.add(category);
          }
        }
      });
      
      return Array.from(uniqueCategories).sort();
    }
    
    /**
     * Create filter buttons for each category
     */
    function createCategoryButtons(categories) {
      categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-category', category);
        button.textContent = category;
        filterButtons.appendChild(button);
      });
    }
    
    /**
     * Set up event listeners for filter buttons
     */
    function setupFilterListeners() {
      const buttons = filterButtons.querySelectorAll('.filter-btn');
      
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          buttons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          button.classList.add('active');
          
          // Get selected category
          const selectedCategory = button.getAttribute('data-category');
          
          // Filter projects
          filterProjects(selectedCategory);
        });
      });
    }
    
    /**
     * Filter projects based on selected category
     */
    function filterProjects(category) {
      let visibleCardsCount = 0;
      
      projectCards.forEach(card => {
        const categoryElement = card.querySelector('.project-category');
        const cardCategory = categoryElement ? categoryElement.textContent.trim() : '';
        
        if (category === 'all' || cardCategory === category) {
          card.style.display = '';
          visibleCardsCount++;
        } else {
          card.style.display = 'none';
        }
      });
      
      // Animate grid layout changes
      animateGridChanges();
      
      // Update counter if it exists
      if (visibleCount) {
        visibleCount.textContent = visibleCardsCount;
      }
    }
    
    /**
     * Animate grid layout changes
     */
    function animateGridChanges() {
      projectsGrid.classList.add('filtering');
      
      setTimeout(() => {
        projectsGrid.classList.remove('filtering');
      }, 500); // Match this with the CSS transition duration
    }
    
    /**
     * Additional functionality: Filter by aspect ratio
     * Can be triggered programmatically or by adding UI buttons
     */
    function filterByAspectRatio(aspectRatio) {
      projectCards.forEach(card => {
        // Check if the card has the aspect ratio class
        const hasClass = card.classList.contains(aspectRatio);
        
        if (aspectRatio === 'all' || hasClass) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
      
      // Update active UI state if needed
      animateGridChanges();
    }
    
    // Export filter functions to global scope for external use
    window.projectFilters = {
      filterByCategory: filterProjects,
      filterByAspectRatio: filterByAspectRatio,
      resetFilters: () => filterProjects('all')
    };
  });