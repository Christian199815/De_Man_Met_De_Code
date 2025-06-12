// Curtains Transition - Using your exact HTML structure
class CurtainsTransition {
    constructor() {
        this.curtainsContainer = document.getElementById('curtainsTransition');
        this.leftCurtain = this.curtainsContainer?.querySelector('.curtain-left');
        this.rightCurtain = this.curtainsContainer?.querySelector('.curtain-right');
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.curtainsContainer) {
            console.warn('Curtains container #curtainsTransition not found');
            // If no curtains, show content anyway
            document.body.classList.add('content-ready');
            return;
        }
        
        if (!this.leftCurtain || !this.rightCurtain) {
            console.warn('Curtain elements not found. Expected .curtain-left and .curtain-right');
            // If no curtains, show content anyway
            document.body.classList.add('content-ready');
            return;
        }
        
        console.log('Curtains transition initialized');
        
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
        
        // Show curtains container
        this.curtainsContainer.classList.add('curtains-active');
        
        // Start closing animation
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
    }
    
    handlePageLoad() {
        // Check if we're coming from a navigation
        const shouldOpenCurtains = sessionStorage.getItem('openCurtains');
        const fromNavigationToHome = sessionStorage.getItem('fromNavigationToHome');
        
        if (shouldOpenCurtains === 'true') {
            sessionStorage.removeItem('openCurtains'); // Clean up
            
            console.log('Opening curtains on page load');
            
            // Show curtains container immediately in closed position
            this.curtainsContainer.classList.add('curtains-active', 'curtains-closed');
            
            // Force multiple repaints to ensure curtains are rendered
            this.curtainsContainer.offsetHeight;
            this.leftCurtain.offsetHeight;
            this.rightCurtain.offsetHeight;
            
            // Now show content behind closed curtains
            document.body.classList.add('content-ready');
            
            // Start opening animation after content is ready
            setTimeout(() => {
                this.openCurtains(() => {
                    // Hide curtains after opening animation completes
                    setTimeout(() => {
                        this.curtainsContainer.classList.remove('curtains-active');
                    }, 500);
                });
            }, 100); // Longer delay to ensure content is rendered
        } else if (fromNavigationToHome === 'true') {
            // Coming to home page - don't open curtains, let preloader handle it
            sessionStorage.removeItem('fromNavigationToHome');
            // Show content immediately since preloader will handle it
            document.body.classList.add('content-ready');
        } else {
            // Normal page load - show content immediately
            document.body.classList.add('content-ready');
        }
    }
    
    closeCurtains(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Closing curtains');
        
        // Remove any existing state classes
        this.curtainsContainer.classList.remove('curtains-open', 'curtains-opening');
        this.curtainsContainer.classList.add('curtains-closing');
        
        // Force a repaint
        this.curtainsContainer.offsetHeight;
        
        setTimeout(() => {
            this.curtainsContainer.classList.remove('curtains-closing');
            this.curtainsContainer.classList.add('curtains-closed');
            this.isAnimating = false;
            
            console.log('Curtains closed');
            
            if (callback) callback();
        }, 2000); // Match CSS transition duration
    }
    
    openCurtains(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Opening curtains');
        
        // Remove any existing state classes
        this.curtainsContainer.classList.remove('curtains-closed', 'curtains-closing');
        this.curtainsContainer.classList.add('curtains-opening');
        
        // Force a repaint
        this.curtainsContainer.offsetHeight;
        
        setTimeout(() => {
            this.curtainsContainer.classList.remove('curtains-opening');
            this.curtainsContainer.classList.add('curtains-open');
            this.isAnimating = false;
            
            console.log('Curtains opened');
            
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
    // Don't set navigation flags if this is still a first visit
    const isFirstVisit = !sessionStorage.getItem('hasVisited');
    
    if (!isFirstVisit && sessionStorage.getItem('openCurtains') !== 'true') {
        sessionStorage.setItem('openCurtains', 'true');
        console.log('Set openCurtains flag on beforeunload');
    } else if (isFirstVisit) {
        console.log('Skipped setting navigation flag - still first visit');
    }
});