(function() {
  let currentPopover = null;

  // Move closePopover outside so it's always available
  function closePopover() {
    if (currentPopover) {
      currentPopover.classList.remove('show');
      setTimeout(() => {
        if (currentPopover && currentPopover.parentNode) {
          currentPopover.parentNode.removeChild(currentPopover);
        }
        currentPopover = null;
      }, 300);
    }
  }

  function showImagePopover(imgSrc, imgAlt = '') {
    console.log('🚀 showImagePopover called with:', imgSrc, imgAlt);
    
    // Close existing popover if any
    if (currentPopover) {
      console.log('🗑️ Closing existing popover');
      closePopover();
    }

    // Get the template
    const template = document.getElementById('image-popover-template');
    if (!template) {
      console.error('❌ Image popover template not found');
      return;
    }

    console.log('✅ Template found, creating popover');

    // Clone the template content
    const popoverElement = template.content.cloneNode(true);
    const overlay = popoverElement.querySelector('.image-popover-overlay');
    const img = popoverElement.querySelector('.image-popover-img');
    const closeBtn = popoverElement.querySelector('.image-popover-close');

    // Set image source and alt
    img.src = imgSrc;
    img.alt = imgAlt || 'Popup image';

    // Store reference
    currentPopover = overlay;

    // Event listeners
    closeBtn.addEventListener('click', closePopover);
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePopover();
      }
    });

    // Handle escape key
    function handleEscape(e) {
      if (e.key === 'Escape') {
        closePopover();
        document.removeEventListener('keydown', handleEscape);
      }
    }
    document.addEventListener('keydown', handleEscape);

    // Add to DOM
    document.body.appendChild(overlay);

    console.log('✅ Popover added to DOM');

    // Trigger show animation
    setTimeout(() => {
      if (currentPopover) {
        currentPopover.classList.add('show');
        console.log('✅ Show class added');
      }
    }, 10);
  }

  // Initialize image popovers for cards
  window.initImagePopovers = function(selector = '.project-card') {
    const cards = document.querySelectorAll(`${selector}[data-pop-image]`);

    console.log("initiated Popovers for cards");
    
    cards.forEach((card, index) => {
      // Remove any existing click handler
      if (card._popoverHandler) {
        card.removeEventListener('click', card._popoverHandler);
      }

      // Add new click handler
      card._popoverHandler = function(e) {
        console.log('🖱️ Card clicked!', this, 'Index:', index);
        
        // Find the image inside this card
        const img = this.querySelector('img');
        if (img && img.src) {
          e.preventDefault();
          e.stopPropagation();
          showImagePopover(img.src, img.alt);
        } else {
          console.warn('No image found in clicked card');
        }
      };
      
      // Add pointer cursor to indicate clickability
      card.style.cursor = 'pointer';
      
      card.addEventListener('click', card._popoverHandler);
      console.log('✅ Added click handler to card:', index);
    });

    console.log(`Initialized ${cards.length} card popovers`);
    return cards.length;
  };

  // Auto-initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('[data-auto-init-popovers]') || 
        document.querySelector('.project-card[data-pop-image]')) {
      window.initImagePopovers();
    }
  });

  // Re-initialize when new content is added (for dynamic content)
  window.reinitImagePopovers = function() {
    return window.initImagePopovers();
  };

})();