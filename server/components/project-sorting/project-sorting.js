/**
 * Project Sorting Component - No Custom Selectors
 * Simple and reliable sorting without custom CSS selectors
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const projectsGrid = document.querySelector('.projects-grid');
    const sortDateBtn = document.getElementById('sortDateToggle');
    const sortNameBtn = document.getElementById('sortNameToggle');
    
    // Exit if elements don't exist
    if (!projectsGrid || !sortDateBtn || !sortNameBtn) {
      console.error('Required DOM elements not found for sorting');
      return;
    }
    
    // Set default active sort
    sortDateBtn.classList.add('active');
    let currentSort = {
      type: 'date',
      direction: 'desc'
    };
    
    // Date sort button click handler
    sortDateBtn.addEventListener('click', function() {
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
    
    // Name sort button click handler
    sortNameBtn.addEventListener('click', function() {
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
      
      // Get all project cards
      const cards = Array.from(projectsGrid.querySelectorAll('.project-card'));
      
      // Sort the cards
      cards.sort((cardA, cardB) => {
        if (currentSort.type === 'date') {
          return compareDates(cardA, cardB);
        } else {
          return compareNames(cardA, cardB);
        }
      });
      
      // Reorder the DOM
      cards.forEach(card => projectsGrid.appendChild(card));
    }
    
    /**
     * Compare dates for sorting
     */
    function compareDates(cardA, cardB) {
      const dateA = getDateFromCard(cardA);
      const dateB = getDateFromCard(cardB);
      
      // Sort direction
      const factor = currentSort.direction === 'asc' ? 1 : -1;
      
      // Handle undefined dates
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return (dateA - dateB) * factor;
    }
    
    /**
     * Extract date from card
     */
    function getDateFromCard(card) {
      try {
        // Find all paragraphs in project-details
        const paragraphs = card.querySelectorAll('.project-details p');
        let dateText = '';
        
        // Loop through each paragraph to find the one containing "Datum"
        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          if (p.textContent.includes('Datum')) {
            dateText = p.textContent.trim();
            break;
          }
        }
        
        if (!dateText) return null;
        
        // Remove "Datum:" prefix
        dateText = dateText.replace(/Datum:/, '').trim();
        
        // Parse Dutch date
        return parseDutchDate(dateText);
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
    function compareNames(cardA, cardB) {
      const nameA = getNameFromCard(cardA);
      const nameB = getNameFromCard(cardB);
      
      // Sort direction
      const factor = currentSort.direction === 'asc' ? 1 : -1;
      
      return nameA.localeCompare(nameB, 'nl') * factor;
    }
    
    /**
     * Extract name from card
     */
    function getNameFromCard(card) {
      const nameElement = card.querySelector('h2');
      return nameElement ? nameElement.textContent.trim() : '';
    }
    
    // Do initial sort
    performSort();
  });