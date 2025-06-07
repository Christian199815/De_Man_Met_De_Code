(function() {
  let currentPopover = null;

  function showImagePopover(imgSrc, imgAlt = '') {
    // Close existing popover if any
    if (currentPopover) {
      closePopover();
    }

    // Get the template
    const template = document.getElementById('image-popover-template');
    if (!template) {
      console.error('Image popover template not found');
      return;
    }

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

    // Close handlers
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

    // Trigger show animation
    setTimeout(() => {
      if (currentPopover) {
        currentPopover.classList.add('show');
      }
    }, 10);
  }

  // Initialize image popovers
  window.initImagePopovers = function(selector = 'img') {
    const images = document.querySelectorAll(`${selector}[data-pop-image]`);
    
    images.forEach(img => {
      // Remove any existing click handler
      if (img._popoverHandler) {
        img.removeEventListener('click', img._popoverHandler);
      }

      // Add new click handler
      img._popoverHandler = function(e) {
        e.preventDefault();
        showImagePopover(this.src, this.alt);
      };
      
      img.addEventListener('click', img._popoverHandler);
    });

    console.log(`Initialized ${images.length} image popovers`);
    return images.length;
  };

  // Auto-initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('[data-auto-init-popovers]') || 
        document.querySelector('img[data-pop-image]')) {
      window.initImagePopovers();
    }
  });

  // Re-initialize when new content is added (for dynamic content)
  window.reinitImagePopovers = function() {
    return window.initImagePopovers();
  };

})();