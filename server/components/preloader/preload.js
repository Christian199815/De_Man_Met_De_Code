// Preloader functionality
const leftCurtain = document.querySelector(".curtain-left");
const rightCurtain = document.querySelector(".curtain-right");
const peterPannekoek = document.querySelector(".peter-container");
const audio = document.getElementById("peterAudio");
const bottomHead = document.querySelector(".bottomhead");
const enterButton = document.getElementById("enterSite");
let mouthInterval;

// Check if this is the first visit
const isFirstVisit = !sessionStorage.getItem('hasVisited');

// Handle button visibility based on visit status
if (isFirstVisit) {
    // First visit: keep button visible initially
    sessionStorage.setItem('hasVisited', 'true');
    if (enterButton) {
        enterButton.classList.remove("none"); // Ensure button is visible
    }
} else {
    // Subsequent visits: hide button and peter container immediately
    if (peterPannekoek) {
        peterPannekoek.style.display = 'none';
    }
    if (enterButton) {
        enterButton.classList.add("none");
    }
}

// Function to hide button and start peter animation
function startPeterSequence() {
    // Hide button when sequence starts
    if (enterButton) {
        enterButton.classList.add("none");
    }
    
    if (peterPannekoek) {
        peterPannekoek.classList.add("peter-animation");
        
        setTimeout(() => {
            audio.play().catch(error => {
                console.error('Failed to play audio:', error);
            });

            // Start mouth movement
            mouthInterval = setInterval(() => {
                const randomOffset = Math.random() * 35;
                bottomHead.style.transform = `translateY(${randomOffset}px)`;
            }, 100);

            // When audio ends, open curtains and hide preloader
            audio.addEventListener("ended", () => {
                clearInterval(mouthInterval);
                bottomHead.style.transform = "translateY(0)";
                peterPannekoek.classList.add("none");
                openCurtains();
            }, { once: true });
        }, 1300);
    }
}

// Function to open curtains and hide preloader
function openCurtains() {
    leftCurtain.classList.remove("curtain-left-animation-peak");
    rightCurtain.classList.remove("curtain-right-animation-peak");
    leftCurtain.classList.add("curtain-left-animation-open");
    rightCurtain.classList.add("curtain-right-animation-open");
    
    // Hide the preloader wrapper after curtains open
    setTimeout(() => {
        const wrapperPreloader = document.querySelector(".wrapper-preloader");
        if (wrapperPreloader) {
            wrapperPreloader.style.display = "none";
        }
    }, 2000);
}

// Button click handler
if (enterButton) {
    enterButton.addEventListener('click', () => {
        if (isFirstVisit) {
            startPeterSequence();
        } else {
            openCurtains();
        }
    });
}

// Wait for all content to load
window.addEventListener('load', () => {
    // Check if coming from navigation to home page
    const fromNavigation = sessionStorage.getItem('fromNavigation');
    
    if (fromNavigation === 'true') {
        sessionStorage.removeItem('fromNavigation');
        // Hide button when coming from navigation
        if (enterButton) {
            enterButton.classList.add("none");
        }
        // Start with curtains closed, then open them with preloader curtains
        leftCurtain.classList.add("curtain-left-animation-close");
        rightCurtain.classList.add("curtain-right-animation-close");
        
        setTimeout(() => {
            leftCurtain.classList.remove("curtain-left-animation-close");
            rightCurtain.classList.remove("curtain-right-animation-close");
            leftCurtain.classList.add("curtain-left-animation-open");
            rightCurtain.classList.add("curtain-right-animation-open");
            
            // Hide the preloader wrapper after curtains open
            setTimeout(() => {
                const wrapperPreloader = document.querySelector(".wrapper-preloader");
                if (wrapperPreloader) {
                    wrapperPreloader.style.display = "none";
                }
            }, 2000);
        }, 100);
        return; // Skip the normal first visit logic
    }
    
    // Normal logic for direct visits to home page
    // Add peek animation classes to curtains
    leftCurtain.classList.add("curtain-left-animation-peak");
    rightCurtain.classList.add("curtain-right-animation-peak");
    
    if (isFirstVisit && peterPannekoek) {
        // On first visit, show button and wait for user interaction
        // OR auto-start after a longer delay (optional)
        
        // Optional: Auto-start after 5 seconds if user doesn't click
        setTimeout(() => {
            // Only auto-start if button is still visible (user hasn't clicked)
            if (enterButton && !enterButton.classList.contains("none")) {
                startPeterSequence();
            }
        }, 5000);
        
    } else {
        // For returning visitors, just open curtains after a delay
        setTimeout(() => {
            openCurtains();
        }, 1000);
    }
});

// Test function for console - call resetFirstVisit() to test first visit behavior
window.resetFirstVisit = function() {
    // Clear the session storage
    sessionStorage.removeItem('hasVisited');
    sessionStorage.removeItem('fromNavigation');
    
    // Reload the page to simulate first visit
    location.reload();
};

// Alternative function to just reset without reload (for more control)
window.simulateFirstVisit = function() {
    // Clear session storage
    sessionStorage.removeItem('hasVisited');
    sessionStorage.removeItem('fromNavigation');
    
    // Show peter container and button
    if (peterPannekoek) {
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
    }
    if (enterButton) {
        enterButton.classList.remove('none');
    }
    
    // Reset curtains to peek state
    leftCurtain.classList.remove('curtain-left-animation-open', 'curtain-left-animation-close');
    rightCurtain.classList.remove('curtain-right-animation-open', 'curtain-right-animation-close');
    leftCurtain.classList.add('curtain-left-animation-peak');
    rightCurtain.classList.add('curtain-right-animation-peak');
    
    // Show preloader wrapper
    const wrapperPreloader = document.querySelector(".wrapper-preloader");
    if (wrapperPreloader) {
        wrapperPreloader.style.display = "";
    }
    
    console.log('First visit state simulated! Button should be visible.');
};

// Function to test the Peter sequence manually
window.testPeterSequence = function() {
    console.log('Starting Peter sequence...');
    startPeterSequence();
};

// Mouse tracking functionality (unchanged)
document.addEventListener('mousemove', (event) => {
    const container = document.querySelector('.peter-container');
    const eyes = document.querySelectorAll('.eye-yellow');

    if (!container || !eyes.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    eyes.forEach(eye => {
        const eyeRect = eye.parentElement.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const dx = event.clientX - eyeCenterX;
        const dy = event.clientY - eyeCenterY;
        const angle = Math.atan2(dy, dx);

        const radius = 5;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        eye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
});