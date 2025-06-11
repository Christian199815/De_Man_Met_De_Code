// Preloader functionality
const playButton = document.getElementById("enterSite");
const leftCurtain = document.querySelector(".curtain-left");
const rightCurtain = document.querySelector(".curtain-right");
const peterPannekoek = document.querySelector(".peter-container");
const audio = document.getElementById("peterAudio");
const bottomHead = document.querySelector(".bottomhead");
let mouthInterval;

// Null checks for critical elements
if (!playButton) {
    console.warn('Preloader: enterSite button not found');
}
if (!leftCurtain || !rightCurtain) {
    console.warn('Preloader: Curtain elements not found');
}
if (!peterPannekoek) {
    console.warn('Preloader: Peter container not found');
}
if (!audio) {
    console.warn('Preloader: Peter audio not found');
}
if (!bottomHead) {
    console.warn('Preloader: Bottom head element not found');
}

// Button state management
let isReady = false;

// Check if this is the first visit
const isFirstVisit = !sessionStorage.getItem('hasVisited');

// Function to update button based on state
function updateButton() {
    if (!playButton) return;
    
    if (isReady) {
        playButton.innerHTML = "site betreden";
        playButton.disabled = false;
    } else {
        playButton.innerHTML = "podium wordt opgebouwd";
        playButton.disabled = true;
    }
}

// Handle first visit vs returning visit logic
if (isFirstVisit) {
    // First visit: keep button and peter container visible
    sessionStorage.setItem('hasVisited', 'true');
    if (playButton) {
        playButton.classList.remove("none");
    }
    if (peterPannekoek) {
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none'); // Make sure it's not hidden by CSS
    }
} else {
    // Subsequent visits: hide peter container and button
    if (peterPannekoek) {
        peterPannekoek.style.display = 'none';
    }
    if (playButton) {
        playButton.classList.add("none");
    }
}

// Function to start Peter sequence (for auto-start)
function startPeterSequence() {
    // Hide button when sequence starts
    if (playButton) {
        playButton.classList.add("none");
    }
    
    // Open curtains first
    if (leftCurtain && rightCurtain) {
        leftCurtain.classList.remove("curtain-left-animation-peak");
        rightCurtain.classList.remove("curtain-right-animation-peak");
        leftCurtain.classList.add("curtain-left-animation-open");
        rightCurtain.classList.add("curtain-right-animation-open");
    }
    
    if (peterPannekoek) {
        // Ensure Peter is visible
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
        peterPannekoek.classList.add("peter-animation");
        
        setTimeout(() => {
            if (audio) {
                audio.play().catch(error => {
                    console.error('Failed to play audio:', error);
                });

                // Start mouth movement
                if (bottomHead) {
                    mouthInterval = setInterval(() => {
                        const randomOffset = Math.random() * 35;
                        bottomHead.style.transform = `translateY(${randomOffset}px)`;
                    }, 100);
                }

                // When audio ends, hide Peter and continue to site
                audio.addEventListener("ended", () => {
                    if (mouthInterval) {
                        clearInterval(mouthInterval);
                    }
                    if (bottomHead) {
                        bottomHead.style.transform = "translateY(0)";
                    }
                    peterPannekoek.classList.add("none");
                    
                    // Hide the preloader wrapper after audio ends
                    setTimeout(() => {
                        const wrapperPreloader = document.querySelector(".wrapper-preloader");
                        if (wrapperPreloader) {
                            wrapperPreloader.style.display = "none";
                        }
                    }, 500);
                }, { once: true });
            }
        }, 1300);
    }
}

// Function to open curtains directly (for returning visitors)
function openCurtains() {
    if (leftCurtain && rightCurtain) {
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
        }, 500);
    }
}

// Wait for all content to load
window.addEventListener('load', () => {
    // FIXED: Use different session storage key to avoid conflict
    const fromNavigationToHome = sessionStorage.getItem('fromNavigationToHome');
    
    if (fromNavigationToHome === 'true') {
        sessionStorage.removeItem('fromNavigationToHome');
        // Hide button when coming from navigation
        if (playButton) {
            playButton.classList.add("none");
        }
        // Start with curtains closed, then open them
        if (leftCurtain && rightCurtain) {
            leftCurtain.classList.add("curtain-left-animation-close");
            rightCurtain.classList.add("curtain-right-animation-close");
            
            setTimeout(() => {
                leftCurtain.classList.remove("curtain-left-animation-close");
                rightCurtain.classList.remove("curtain-right-animation-close");
                openCurtains();
            }, 100);
        }
        return;
    }
    
    // Enable button and update text
    isReady = true;
    updateButton();
    
    // Add peek animation classes to curtains
    if (leftCurtain && rightCurtain) {
        leftCurtain.classList.add("curtain-left-animation-peak");
        rightCurtain.classList.add("curtain-right-animation-peak");
    }
    
    if (isFirstVisit && peterPannekoek) {
        // First visit: show button and wait for user interaction
        // Optional: Auto-start after delay if user doesn't click
        setTimeout(() => {
            if (playButton && !playButton.classList.contains("none") && !playButton.disabled) {
                startPeterSequence();
            }
        }, 8000); // 8 seconds auto-start
    } else {
        // Returning visitors: open curtains after delay
        setTimeout(() => {
            openCurtains();
        }, 1000);
    }
});

// Button click functionality
if (playButton) {
    playButton.addEventListener("click", () => {
        // Prevent multiple clicks
        if (playButton.disabled) return;
        
        // Hide button immediately
        playButton.classList.add("none");
        
        // Open curtains first
        if (leftCurtain && rightCurtain) {
            leftCurtain.classList.remove("curtain-left-animation-peak");
            rightCurtain.classList.remove("curtain-right-animation-peak");
            leftCurtain.classList.add("curtain-left-animation-open");
            rightCurtain.classList.add("curtain-right-animation-open");
        }
        
        if (isFirstVisit && peterPannekoek) {
            // First visit: make sure Peter is visible and animate
            peterPannekoek.style.display = ''; // Ensure it's visible
            peterPannekoek.classList.remove('none'); // Remove any hiding classes
            peterPannekoek.classList.add("peter-animation");
            
            setTimeout(() => {
                if (audio) {
                    audio.play().catch(error => {
                        console.error('Failed to play audio:', error);
                    });

                    // Start mouth movement
                    if (bottomHead) {
                        mouthInterval = setInterval(() => {
                            const randomOffset = Math.random() * 35;
                            bottomHead.style.transform = `translateY(${randomOffset}px)`;
                        }, 100);
                    }

                    // When audio ends, hide Peter and continue to site
                    audio.addEventListener("ended", () => {
                        if (mouthInterval) {
                            clearInterval(mouthInterval);
                        }
                        if (bottomHead) {
                            bottomHead.style.transform = "translateY(0)";
                        }
                        peterPannekoek.classList.add("none");
                        
                        // Hide the preloader wrapper after audio ends
                        setTimeout(() => {
                            const wrapperPreloader = document.querySelector(".wrapper-preloader");
                            if (wrapperPreloader) {
                                wrapperPreloader.style.display = "none";
                            }
                        }, 500);
                    }, { once: true });
                }
            }, 1300);
        } else {
            // Returning visit: just hide preloader after curtains open
            setTimeout(() => {
                const wrapperPreloader = document.querySelector(".wrapper-preloader");
                if (wrapperPreloader) {
                    wrapperPreloader.style.display = "none";
                }
            }, 2000);
        }
    });
}

// Mouse tracking functionality
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

// REMOVED: Projects button functionality - let curtains transition handle it
// This was the main conflict causing the issue

// Test functions for console
window.resetFirstVisit = function() {
    sessionStorage.removeItem('hasVisited');
    sessionStorage.removeItem('fromNavigationToHome'); // Updated key name
    location.reload();
};

window.simulateFirstVisit = function() {
    sessionStorage.removeItem('hasVisited');
    sessionStorage.removeItem('fromNavigationToHome'); // Updated key name
    
    if (peterPannekoek) {
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
    }
    if (playButton) {
        playButton.classList.remove('none');
        playButton.disabled = false;
        playButton.innerHTML = "site betreden";
    }
    
    if (leftCurtain && rightCurtain) {
        leftCurtain.classList.remove('curtain-left-animation-open', 'curtain-left-animation-close');
        rightCurtain.classList.remove('curtain-right-animation-open', 'curtain-right-animation-close');
        leftCurtain.classList.add('curtain-left-animation-peak');
        rightCurtain.classList.add('curtain-right-animation-peak');
    }
    
    const wrapperPreloader = document.querySelector(".wrapper-preloader");
    if (wrapperPreloader) {
        wrapperPreloader.style.display = "";
    }
    
    console.log('First visit state simulated! Button should be visible.');
};

window.testPeterSequence = function() {
    console.log('Starting Peter sequence...');
    startPeterSequence();
};