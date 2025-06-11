// Curtains Transition Component - Original Working Version
class CurtainsTransition {
    constructor() {
        this.curtainsContainer = document.getElementById('curtainsTransition');
        this.leftCurtain = this.curtainsContainer?.querySelector('.curtain-left');
        this.rightCurtain = this.curtainsContainer?.querySelector('.curtain-right');
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.curtainsContainer) return;
        
        // Handle navigation links
        this.setupNavigationHandlers();
        
        // Check if we need to open curtains on page load
        this.handlePageLoad();
    }
    
    setupNavigationHandlers() {
        // Handle all <a> elements for navigation
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's an external link, anchor link, or special protocol
                if (href.startsWith('http') || 
                    href.startsWith('#') || 
                    href.startsWith('mailto:') || 
                    href.startsWith('tel:') ||
                    href.startsWith('javascript:')) {
                    return; // Let the default behavior happen
                }
                
                e.preventDefault(); // Prevent default navigation
                this.navigateWithTransition(href);
            });
        });
    }
    
    navigateWithTransition(href) {
        if (this.isAnimating) return;
        
        console.log('Starting navigation transition to:', href);
        
        // Show curtains and close them, then navigate
        this.curtainsContainer.classList.add('curtains-active');
        
        // Small delay to ensure curtains are visible before starting animation
        setTimeout(() => {
            this.closeCurtains(() => {
                // Set flag for next page behavior
                if (href === '/' || href.endsWith('/')) {
                    // Going to home page - let preloader handle opening
                    sessionStorage.setItem('fromNavigationToHome', 'true');
                } else {
                    // Going to other pages - curtains should open
                    sessionStorage.setItem('openCurtains', 'true');
                }
                window.location.href = href;
            });
        }, 50);
    }
    
    handlePageLoad() {
        // Check if we're coming from a navigation
        const shouldOpenCurtains = sessionStorage.getItem('openCurtains');
        const fromNavigationToHome = sessionStorage.getItem('fromNavigationToHome');
        
        if (shouldOpenCurtains === 'true') {
            sessionStorage.removeItem('openCurtains'); // Clean up
            
            // Show curtains, start with them closed, then open them
            this.curtainsContainer.classList.add('curtains-active', 'curtains-closed');
            
            setTimeout(() => {
                this.openCurtains(() => {
                    // Hide curtains after opening animation completes
                    setTimeout(() => {
                        this.curtainsContainer.classList.remove('curtains-active');
                    }, 500);
                });
            }, 100);
        } else if (fromNavigationToHome === 'true') {
            // Coming to home page - don't open curtains, let preloader handle it
            sessionStorage.removeItem('fromNavigationToHome');
            // Curtains stay hidden, preloader will handle the opening
        }
        // If no flags, curtains stay hidden (display: none)
    }
    
    closeCurtains(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Closing curtains'); // Debug log
        
        // Remove any existing state classes
        this.curtainsContainer.classList.remove('curtains-open', 'curtains-opening');
        this.curtainsContainer.classList.add('curtains-closing');
        
        // Force a repaint
        this.curtainsContainer.offsetHeight;
        
        setTimeout(() => {
            this.curtainsContainer.classList.remove('curtains-closing');
            this.curtainsContainer.classList.add('curtains-closed');
            this.isAnimating = false;
            
            console.log('Curtains closed'); // Debug log
            
            if (callback) callback();
        }, 2000); // Match CSS transition duration
    }
    
    openCurtains(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Opening curtains'); // Debug log
        
        // Remove any existing state classes
        this.curtainsContainer.classList.remove('curtains-closed', 'curtains-closing');
        this.curtainsContainer.classList.add('curtains-opening');
        
        // Force a repaint
        this.curtainsContainer.offsetHeight;
        
        setTimeout(() => {
            this.curtainsContainer.classList.remove('curtains-opening');
            this.curtainsContainer.classList.add('curtains-open');
            this.isAnimating = false;
            
            console.log('Curtains opened'); // Debug log
            
            if (callback) callback();
        }, 2000); // Match CSS transition duration
    }
    
    // Public methods for manual control
    close(callback) {
        this.closeCurtains(callback);
    }
    
    open(callback) {
        this.openCurtains(callback);
    }
}

// Initialize curtains transition when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.curtainsTransition = new CurtainsTransition();
});

// Set navigation flag when leaving page
window.addEventListener('beforeunload', () => {
    if (sessionStorage.getItem('openCurtains') !== 'true') {
        sessionStorage.setItem('openCurtains', 'true');
    }
});