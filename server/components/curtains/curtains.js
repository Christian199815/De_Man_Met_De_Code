// Curtains Transition Component
class CurtainsTransition {
    constructor() {
        this.curtainsContainer = null;
        this.leftCurtain = null;
        this.rightCurtain = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCurtains());
        } else {
            this.setupCurtains();
        }
    }
    
    setupCurtains() {
        // Find curtains container with multiple possible IDs
        this.curtainsContainer = document.getElementById('curtainsTransition') || 
                                document.getElementById('curtains-transition') ||
                                document.querySelector('.curtains-transition');
        
        if (!this.curtainsContainer) {
            console.warn('Curtains: Container not found. Creating default structure...');
            this.createCurtainsStructure();
        }
        
        // Get curtain elements
        this.leftCurtain = this.curtainsContainer?.querySelector('.curtain-left');
        this.rightCurtain = this.curtainsContainer?.querySelector('.curtain-right');
        
        if (!this.leftCurtain || !this.rightCurtain) {
            console.error('Curtains: Left or right curtain elements not found!');
            return;
        }
        
        console.log('Curtains: Initialized successfully');
        
        // IMMEDIATELY check for page load flags before setting up navigation
        this.handlePageLoad();
        
        // Handle navigation links
        this.setupNavigationHandlers();
    }
    
    createCurtainsStructure() {
        // Create the curtains HTML structure if it doesn't exist
        const curtainsHTML = `
            <div id="curtainsTransition" class="curtains-transition">
                <div class="curtain-left"></div>
                <div class="curtain-right"></div>
                <div class="curtain-light"></div>
            </div>
        `;
        
        // Insert at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', curtainsHTML);
        this.curtainsContainer = document.getElementById('curtainsTransition');
        
        console.log('Curtains: Structure created automatically');
    }
    
    setupNavigationHandlers() {
        // Handle all <a> elements for navigation
        const links = document.querySelectorAll('a[href]');
        
        console.log(`Curtains: Setting up handlers for ${links.length} links`);
        
        links.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                console.log(`Curtains: Link ${index} clicked with href: ${href}`);
                
                // Skip if it's an external link, anchor link, or special protocol
                if (href.startsWith('http') || 
                    href.startsWith('#') || 
                    href.startsWith('mailto:') || 
                    href.startsWith('tel:') ||
                    href.startsWith('javascript:')) {
                    console.log('Curtains: Skipping external/special link');
                    return; // Let the default behavior happen
                }
                
                e.preventDefault(); // Prevent default navigation
                this.navigateWithTransition(href);
            });
        });
    }
    
    navigateWithTransition(href) {
        if (this.isAnimating) {
            console.log('Curtains: Already animating, ignoring navigation');
            return;
        }
        
        if (!this.curtainsContainer) {
            console.error('Curtains: Container missing, falling back to normal navigation');
            window.location.href = href;
            return;
        }
        
        console.log('Starting navigation transition to:', href);
        
        // Show curtains immediately and start closing animation
        this.curtainsContainer.classList.add('curtains-active');
        
        // Start with curtains open (off-screen) and close them
        this.curtainsContainer.classList.add('curtains-open');
        
        // Force a repaint to ensure the open state is applied
        this.curtainsContainer.offsetHeight;
        
        // Start closing animation immediately
        this.closeCurtains(() => {
            // ALWAYS set openCurtains flag for destination page (except for home page)
            if (href === '/' || href.endsWith('/index.html') || href === './') {
                // Going to home page - let preloader handle opening
                sessionStorage.setItem('fromNavigation', 'true');
                sessionStorage.removeItem('openCurtains'); // Make sure this is cleared
                console.log('Curtains: Going to home page - preloader will handle');
            } else {
                // Going to ANY other page - curtains should open
                sessionStorage.setItem('openCurtains', 'true');
                sessionStorage.removeItem('fromNavigation'); // Make sure this is cleared
                console.log('Curtains: Going to other page - curtains will open');
            }
            
            // Navigate after curtains are fully closed
            window.location.href = href;
        });
    }
    
    handlePageLoad() {
        // Check if we're coming from a navigation
        const shouldOpenCurtains = sessionStorage.getItem('openCurtains');
        const fromNavigation = sessionStorage.getItem('fromNavigation');
        
        if (shouldOpenCurtains === 'true') {
            sessionStorage.removeItem('openCurtains'); // Clean up
            
            // Show curtains, start with them closed, then open them
            this.curtainsContainer.classList.add('curtains-active', 'curtains-closed');
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                this.openCurtains(() => {
                    // Hide curtains after opening animation completes
                    setTimeout(() => {
                        this.curtainsContainer.classList.remove('curtains-active');
                    }, 300);
                });
            }, 100);
        } else if (fromNavigation === 'true') {
            // Coming to home page - don't open curtains, let preloader handle it
            sessionStorage.removeItem('fromNavigation');
            // Curtains stay hidden, preloader will handle the opening
        }
        // If no flags, curtains stay hidden (display: none)
    }
    
    closeCurtains(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Closing curtains');
        
        // Remove any existing state classes
        this.curtainsContainer.classList.remove('curtains-open', 'curtains-opening');
        
        // Add closing class to trigger animation
        this.curtainsContainer.classList.add('curtains-closing');
        
        // Wait for animation to complete
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
        
        // Add opening class to trigger animation
        this.curtainsContainer.classList.add('curtains-opening');
        
        // Wait for animation to complete
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
        this.curtainsContainer.classList.add('curtains-active', 'curtains-open');
        this.curtainsContainer.offsetHeight; // Force repaint
        this.closeCurtains(callback);
    }
    
    open(callback) {
        this.curtainsContainer.classList.add('curtains-active', 'curtains-closed');
        this.curtainsContainer.offsetHeight; // Force repaint
        this.openCurtains(callback);
    }
    
    // Open curtains only when everything is fully loaded
    openWhenReady(callback) {
        this.curtainsContainer.classList.add('curtains-active', 'curtains-closed');
        this.curtainsContainer.offsetHeight; // Force repaint
        
        this.waitForFullLoad(() => {
            this.openCurtains(callback);
        });
    }
    
    // Debug method to check current state
    debugState() {
        console.log('Curtains Debug State:', {
            containerExists: !!this.curtainsContainer,
            isAnimating: this.isAnimating,
            containerClasses: this.curtainsContainer?.className,
            sessionStorage: {
                openCurtains: sessionStorage.getItem('openCurtains'),
                fromNavigation: sessionStorage.getItem('fromNavigation')
            },
            currentPath: window.location.pathname
        });
    }
    
    // Force curtains to open (for testing)
    forceOpen() {
        console.log('Curtains: Force opening...');
        
        if (!this.curtainsContainer) {
            console.error('Curtains: Cannot force open - container missing');
            return;
        }
        
        // Show curtains closed first
        this.showCurtainsClosed();
        
        // Wait a moment then open
        setTimeout(() => {
            this.openCurtains(() => {
                console.log('Curtains: Force open complete');
                setTimeout(() => {
                    this.curtainsContainer.classList.remove('curtains-active');
                }, 300);
            });
        }, 100);
    }
    
    // Test method to see if curtains work at all
    testCurtains() {
        console.log('Curtains: Testing curtains functionality...');
        this.showCurtainsClosed();
        
        setTimeout(() => {
            console.log('Curtains: Should see closed curtains now');
            setTimeout(() => {
                this.openCurtains(() => {
                    console.log('Curtains: Test complete - curtains should have opened');
                });
            }, 2000);
        }, 1000);
    }
}

// Initialize curtains transition when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Curtains: DOM loaded, initializing...');
    window.curtainsTransition = new CurtainsTransition();
});

// Fallback initialization for pages that might miss DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Curtains: DOM already ready, initializing immediately...');
    window.curtainsTransition = new CurtainsTransition();
}

// CRITICAL: Additional check on window load to catch any missed initializations
window.addEventListener('load', () => {
    if (!window.curtainsTransition) {
        console.log('Curtains: Window loaded but no curtains found, force initializing...');
        window.curtainsTransition = new CurtainsTransition();
    } else {
        // Double-check session storage in case we missed something
        const shouldOpen = sessionStorage.getItem('openCurtains');
        if (shouldOpen === 'true') {
            console.log('Curtains: Window load - found missed openCurtains flag!');
            window.curtainsTransition.forceOpen();
        }
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    // Don't clear session storage here as we need it for the next page
    console.log('Curtains: Page unloading...');
});