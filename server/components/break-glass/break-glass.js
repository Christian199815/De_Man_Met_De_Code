/**
 * Break Glass Component - Simple Function-Based Version
 * Works with both old IDs and new data attributes
 */

// Simple state tracking
let breakGlassState = {
  isBroken: false,
  isAnimating: false,
  autoRestoreTimeout: null
};

// Messages for the sign
const messages = {
  intact: 'Don\'t Break',
  broken: 'Why did you do that?',
  restored: 'Don\'t Break'
};

// Main function to handle break glass click
function handleBreakGlass(sign) {
  if (breakGlassState.isAnimating) return;
  
  breakGlassState.isAnimating = true;
  
  // Add shake animation
  sign.classList.add('shake');
  
  setTimeout(() => {
    sign.classList.remove('shake');
    
    if (!breakGlassState.isBroken) {
      breakTheGlass(sign);
    } else {
      restoreTheGlass(sign);
    }
    
    breakGlassState.isAnimating = false;
  }, 400);
}

// Function to break the glass
function breakTheGlass(sign) {
  console.log('💥 Breaking glass with fullscreen effect!');
  
  breakGlassState.isBroken = true;
  
  // Find the card and overlay - support both old and new structure
  const card = sign.closest('.break-glass-card');
  let brokenGlass = null;
  
  if (card) {
    const cardId = card.getAttribute('data-id');
    // Try new structure first
    brokenGlass = document.querySelector(`[data-break-glass-overlay][data-break-glass-id="${cardId}"]`) ||
                  document.querySelector('[data-break-glass-overlay]');
    
    // Fallback to old structure
    if (!brokenGlass) {
      brokenGlass = card.querySelector('.broken-glass') || document.getElementById('brokenGlass');
    }
  } else {
    // Fallback for old structure
    brokenGlass = document.getElementById('brokenGlass') || document.querySelector('.broken-glass');
  }
  
  // Add broken state to card
  if (card) {
    card.classList.add('broken');
  }
  
  // Show broken glass overlay
  if (brokenGlass) {
    brokenGlass.classList.add('active');
    brokenGlass.style.zIndex = '9999';
    brokenGlass.style.display = 'block'; // For old structure
  }
  
  // Prevent body scrolling
  document.body.classList.add('glass-broken');
  document.body.style.overflow = 'hidden';
  
  // Play sound effect
  playGlassSound(card || sign.closest('*'));
  
  // Update sign text
  sign.textContent = messages.broken;
  sign.setAttribute('aria-label', 'Glass broken - click to restore');
  
  // Auto-restore after 5 seconds
  clearTimeout(breakGlassState.autoRestoreTimeout);
  breakGlassState.autoRestoreTimeout = setTimeout(() => {
    if (breakGlassState.isBroken && brokenGlass) {
      brokenGlass.classList.remove('active');
      brokenGlass.style.display = 'none'; // For old structure
      document.body.classList.remove('glass-broken');
      document.body.style.overflow = '';
    }
  }, 5000);
  
  // Dispatch custom event
  document.dispatchEvent(new CustomEvent('breakglass:broken', {
    detail: { sign, card, fullscreen: true }
  }));
}

// Function to restore the glass
function restoreTheGlass(sign) {
  console.log('🔧 Restoring glass from fullscreen');
  
  breakGlassState.isBroken = false;
  
  // Find the card and overlay - support both old and new structure
  const card = sign.closest('.break-glass-card');
  let brokenGlass = null;
  
  if (card) {
    const cardId = card.getAttribute('data-id');
    // Try new structure first
    brokenGlass = document.querySelector(`[data-break-glass-overlay][data-break-glass-id="${cardId}"]`) ||
                  document.querySelector('[data-break-glass-overlay]');
    
    // Fallback to old structure
    if (!brokenGlass) {
      brokenGlass = card.querySelector('.broken-glass') || document.getElementById('brokenGlass');
    }
  } else {
    // Fallback for old structure
    brokenGlass = document.getElementById('brokenGlass') || document.querySelector('.broken-glass');
  }
  
  // Remove broken state from card
  if (card) {
    card.classList.remove('broken');
  }
  
  // Hide broken glass overlay
  if (brokenGlass) {
    brokenGlass.classList.remove('active');
    brokenGlass.style.display = 'none'; // For old structure
  }
  
  // Restore body scrolling
  document.body.classList.remove('glass-broken');
  document.body.style.overflow = '';
  
  // Restore sign text
  sign.textContent = messages.restored;
  sign.setAttribute('aria-label', 'Break glass emergency button');
  
  // Clear any pending timeouts
  clearTimeout(breakGlassState.autoRestoreTimeout);
  
  // Dispatch custom event
  document.dispatchEvent(new CustomEvent('breakglass:restored', {
    detail: { sign, card, fullscreen: true }
  }));
}

// Function to play sound effect
function playGlassSound(container) {
  if (!container) return;
  
  // Try new data attribute first, then old ID
  let audio = container.querySelector('[data-break-glass-audio]') || 
              container.querySelector('#glassSound') ||
              document.getElementById('glassSound');
  
  if (!audio) return;
  
  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('🔇 Audio playback failed (user interaction required):', error);
      });
    }
  } catch (error) {
    console.warn('🔇 Audio not available:', error);
  }
}

// Function to setup accessibility
function setupSignAccessibility(sign) {
  sign.setAttribute('role', 'button');
  sign.setAttribute('tabindex', '0');
  sign.setAttribute('aria-label', 'Break glass emergency button');
}

// Function to initialize break glass components
function initializeBreakGlass() {
  // Find signs using both new data attributes and old IDs
  const newSigns = document.querySelectorAll('[data-break-glass-sign]');
  const oldSigns = document.querySelectorAll('#sign, .sign');
  
  // Combine both sets, avoiding duplicates
  const allSigns = new Set([...newSigns, ...oldSigns]);
  
  console.log(`🎯 Found ${allSigns.size} break glass signs to initialize...`);
  
  allSigns.forEach(sign => {
    // Skip if already initialized
    if (sign.hasAttribute('data-break-glass-initialized')) {
      return;
    }
    
    sign.setAttribute('data-break-glass-initialized', 'true');
    
    // Setup accessibility
    setupSignAccessibility(sign);
    
    // Add click handler
    sign.addEventListener('click', (e) => {
      e.preventDefault();
      handleBreakGlass(sign);
    });
    
    // Add keyboard handler
    sign.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBreakGlass(sign);
      }
    });
    
    console.log('✅ Break glass sign initialized:', sign);
  });
}

// Auto-initialize when DOM is ready
function autoInitializeBreakGlass() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBreakGlass);
  } else {
    initializeBreakGlass();
  }
}

// Listen for grid changes and reinitialize
document.addEventListener('gridRerendered', () => {
  console.log('🔄 Grid rerendered - reinitializing break glass components');
  setTimeout(initializeBreakGlass, 100);
});

// Observe grid changes
function observeGridChanges() {
  const grid = document.getElementById('dynamicGrid');
  if (!grid) {
    setTimeout(observeGridChanges, 1000);
    return;
  }
  
  const observer = new MutationObserver((mutations) => {
    let shouldReinit = false;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches('[data-component="break-glass"]') || 
              node.querySelector('[data-component="break-glass"]') ||
              node.matches('.break-glass-card') ||
              node.querySelector('.break-glass-card') ||
              node.id === 'sign' ||
              node.querySelector('#sign')) {
            shouldReinit = true;
          }
        }
      });
    });
    
    if (shouldReinit) {
      setTimeout(initializeBreakGlass, 100);
    }
  });
  
  observer.observe(grid, {
    childList: true,
    subtree: true
  });
  
  console.log('👀 Watching for break glass component changes in grid');
}

// Initialize everything
autoInitializeBreakGlass();
setTimeout(observeGridChanges, 1000);

// Global utility functions for debugging
window.breakAllGlass = function() {
  const signs = document.querySelectorAll('[data-break-glass-sign], #sign, .sign');
  signs.forEach(sign => {
    if (!breakGlassState.isBroken) {
      sign.click();
    }
  });
  console.log(`💥 Broke ${signs.length} glass components`);
};

window.restoreAllGlass = function() {
  const signs = document.querySelectorAll('[data-break-glass-sign], #sign, .sign');
  signs.forEach(sign => {
    if (breakGlassState.isBroken) {
      sign.click();
    }
  });
  console.log(`🔧 Restored glass components`);
};

window.debugBreakGlass = function() {
  const newSigns = document.querySelectorAll('[data-break-glass-sign]');
  const oldSigns = document.querySelectorAll('#sign, .sign');
  const brokenGlassElements = document.querySelectorAll('[data-break-glass-overlay], #brokenGlass, .broken-glass');
  const audioElements = document.querySelectorAll('[data-break-glass-audio], #glassSound');
  
  console.group('🐛 Break Glass Debug');
  console.log('Current state:', breakGlassState);
  console.log(`New signs found: ${newSigns.length}`);
  console.log(`Old signs found: ${oldSigns.length}`);
  console.log(`Broken glass elements: ${brokenGlassElements.length}`);
  console.log(`Audio elements: ${audioElements.length}`);
  
  [...newSigns, ...oldSigns].forEach((sign, index) => {
    console.log(`Sign ${index + 1}:`, {
      element: sign,
      id: sign.id,
      classes: Array.from(sign.classList),
      text: sign.textContent,
      isInitialized: sign.hasAttribute('data-break-glass-initialized')
    });
  });
  
  console.groupEnd();
};

console.log('🎯 Break Glass Simple System loaded (supports both old and new structure)');
console.log('🔧 Use window.debugBreakGlass() to inspect components');
console.log('💥 Use window.breakAllGlass() or window.restoreAllGlass() for testing');