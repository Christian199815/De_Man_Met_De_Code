// Preloader functionality - ONLY runs on first visit
const playButton = document.getElementById("enterSite");
const leftCurtain = document.querySelector(".wrapper-preloader .curtain-left");
const rightCurtain = document.querySelector(".wrapper-preloader .curtain-right");
const peterPannekoek = document.querySelector(".peter-container");
const audio = document.getElementById("peterAudio");
const bottomHead = document.querySelector(".bottomhead");
const wrapperPreloader = document.querySelector(".wrapper-preloader");
let mouthInterval;

// Preloader is hidden by default in CSS, no need to force hide here

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
if (!wrapperPreloader) {
    console.warn('Preloader: Wrapper preloader not found');
}

// Button state management
let isReady = false;

// Check if this is the first visit
const isFirstVisit = !sessionStorage.getItem('hasVisited');

// CRITICAL: Check if we're navigating TO the home page from another page
// BUT: If it's a first visit, ignore navigation flags
const isNavigatingToHome = !isFirstVisit && (sessionStorage.getItem('openCurtains') === 'true' || sessionStorage.getItem('fromNavigationToHome') === 'true');

// DEBUG: Log the state
console.log('=== PRELOADER DEBUG ===');
console.log('isFirstVisit:', isFirstVisit);
console.log('isNavigatingToHome:', isNavigatingToHome);
console.log('hasVisited:', sessionStorage.getItem('hasVisited'));
console.log('openCurtains:', sessionStorage.getItem('openCurtains'));
console.log('fromNavigationToHome:', sessionStorage.getItem('fromNavigationToHome'));
console.log('wrapperPreloader found:', !!wrapperPreloader);

// If navigating to home page OR not first visit, force hide preloader immediately
if (isNavigatingToHome || !isFirstVisit) {
    console.log('Not first visit OR navigating to home - forcing preloader off');
    if (wrapperPreloader) {
        wrapperPreloader.style.display = 'none !important';
        wrapperPreloader.style.visibility = 'hidden';
        wrapperPreloader.classList.add('none');
    }
    if (playButton) {
        playButton.style.display = 'none';
        playButton.classList.add('none');
    }
    if (peterPannekoek) {
        peterPannekoek.style.display = 'none';
        peterPannekoek.classList.add('none');
    }
    if (leftCurtain && rightCurtain) {
        leftCurtain.style.display = 'none !important';
        rightCurtain.style.display = 'none !important';
        leftCurtain.style.visibility = 'hidden';
        rightCurtain.style.visibility = 'hidden';
    }
}

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

// MAIN LOGIC: Only run preloader on TRUE first visit
if (isFirstVisit) {
    console.log('TRUE first visit detected - ENABLING preloader');
    
    // Clean up any stray navigation flags from beforeunload
    sessionStorage.removeItem('openCurtains');
    sessionStorage.removeItem('fromNavigationToHome');
    
    // Mark as visited immediately
    sessionStorage.setItem('hasVisited', 'true');
    
    // ENABLE preloader wrapper ONLY for true first visit
    if (wrapperPreloader) {
        wrapperPreloader.classList.add('preloader-enabled');
        console.log('Preloader wrapper ENABLED for first visit');
    }
    
    // Show button and peter container
    if (playButton) {
        playButton.classList.remove("none");
        playButton.style.display = '';
    }
    if (peterPannekoek) {
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
    }
    
    // Reset curtains to initial state for first visit
    if (leftCurtain && rightCurtain) {
        leftCurtain.classList.remove('curtain-left-animation-open', 'curtain-left-animation-close', 'curtain-left-animation-peak');
        rightCurtain.classList.remove('curtain-right-animation-open', 'curtain-right-animation-close', 'curtain-right-animation-peak');
        leftCurtain.style.display = '';
        rightCurtain.style.display = '';
        leftCurtain.style.visibility = 'visible';
        rightCurtain.style.visibility = 'visible';
    }
    
    // Wait for all content to load
    window.addEventListener('load', () => {
        // Enable button and update text
        isReady = true;
        updateButton();
        
        // Start with curtains slightly open (peek)
        if (leftCurtain && rightCurtain) {
            leftCurtain.classList.add("curtain-left-animation-peak");
            rightCurtain.classList.add("curtain-right-animation-peak");
        }
        
        // Optional: Auto-start after delay if user doesn't click
        setTimeout(() => {
            if (playButton && !playButton.classList.contains("none") && !playButton.disabled) {
                console.log('⏰ Auto-starting preloader sequence after 8 seconds');
                startPreloaderSequence();
            }
        }, 8000);
    });
    
    // Button click functionality
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (playButton.disabled) return;
            console.log('Button clicked - starting preloader sequence');
            startPreloaderSequence();
        });
    }
    
} else {
    console.log('NOT first visit OR navigation detected - preloader stays hidden');
    
    // Preloader stays hidden (default CSS state)
    // No need to explicitly hide since CSS already does this
    
    console.log('Transition system should handle this page load');
}

// Function to run the complete preloader sequence
function startPreloaderSequence() {
    console.log('Starting preloader sequence');
    
    // Hide button immediately
    if (playButton) {
        playButton.classList.add("none");
    }
    
    // Step 1: Open curtains fully
    if (leftCurtain && rightCurtain) {
        leftCurtain.classList.remove("curtain-left-animation-peak");
        rightCurtain.classList.remove("curtain-right-animation-peak");
        leftCurtain.classList.add("curtain-left-animation-open");
        rightCurtain.classList.add("curtain-right-animation-open");
    }
    
    // Step 2: Start Peter animation and audio after curtains open
    if (peterPannekoek) {
        // Ensure Peter is visible
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
        peterPannekoek.classList.add("peter-animation");
        
        setTimeout(() => {
            if (audio) {
                console.log('Playing Peter audio');
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

                // Step 3: When audio ends, complete the sequence
                audio.addEventListener("ended", () => {
                    console.log('Audio ended - completing preloader sequence');
                    
                    // Stop mouth movement
                    if (mouthInterval) {
                        clearInterval(mouthInterval);
                    }
                    if (bottomHead) {
                        bottomHead.style.transform = "translateY(0)";
                    }
                    
                    // Hide Peter
                    peterPannekoek.classList.add("none");
                    
                    // Step 4: Hide the preloader wrapper completely and clean up curtains
                    setTimeout(() => {
                        if (wrapperPreloader) {
                            wrapperPreloader.style.display = "none";
                        }
                        
                        // Clean up preloader curtain classes completely
                        if (leftCurtain && rightCurtain && leftCurtain.closest('.wrapper-preloader')) {
                            leftCurtain.classList.remove('curtain-left-animation-open', 'curtain-left-animation-close', 'curtain-left-animation-peak');
                            rightCurtain.classList.remove('curtain-right-animation-open', 'curtain-right-animation-close', 'curtain-right-animation-peak');
                            
                            // Only hide preloader curtains, not transition curtains
                            leftCurtain.style.display = 'none !important';
                            rightCurtain.style.display = 'none !important';
                            leftCurtain.style.visibility = 'hidden';
                            rightCurtain.style.visibility = 'hidden';
                        }
                        
                        // Also hide the wrapper completely
                        if (wrapperPreloader) {
                            wrapperPreloader.style.display = 'none !important';
                            wrapperPreloader.style.visibility = 'hidden';
                            wrapperPreloader.style.opacity = '0';
                        }
                        
                        console.log('Preloader sequence complete - wrapper hidden and curtains cleaned up');
                    }, 500);
                }, { once: true });
            }
        }, 1300); // Delay for curtain opening animation
    }
}

// Mouse tracking functionality (only active during first visit)
if (isFirstVisit) {
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
}

// Test functions for console (development only)
window.resetFirstVisit = function() {
    console.log('=== RESETTING FIRST VISIT ===');
    sessionStorage.clear(); // Clear ALL session storage
    localStorage.clear(); // Also clear localStorage just in case
    console.log('All storage cleared');
    
    // Force reload without cache
    window.location.reload(true);
};

window.forceShowPreloader = function() {
    console.log('=== FORCING PRELOADER DISPLAY ===');
    
    // Clear all flags
    sessionStorage.clear();
    
    // Force enable preloader
    if (wrapperPreloader) {
        wrapperPreloader.classList.add('preloader-enabled');
        console.log('Preloader wrapper forced visible');
    }
    
    // Show preloader elements
    if (peterPannekoek) {
        peterPannekoek.style.display = '';
        peterPannekoek.classList.remove('none');
        console.log('Peter container shown');
    }
    if (playButton) {
        playButton.classList.remove('none');
        playButton.style.display = '';
        playButton.disabled = false;
        playButton.innerHTML = "site betreden";
        console.log('Button shown');
    }
    
    // Set curtains to peek state
    if (leftCurtain && rightCurtain) {
        leftCurtain.style.display = '';
        rightCurtain.style.display = '';
        leftCurtain.style.visibility = 'visible';
        rightCurtain.style.visibility = 'visible';
        leftCurtain.classList.remove('curtain-left-animation-open', 'curtain-left-animation-close');
        rightCurtain.classList.remove('curtain-right-animation-open', 'curtain-right-animation-close');
        leftCurtain.classList.add('curtain-left-animation-peak');
        rightCurtain.classList.add('curtain-right-animation-peak');
        console.log('Curtains set to peek state');
    }
    
    console.log('Preloader forced to show - you should see it now!');
};

window.debugPreloader = function() {
    console.log('=== PRELOADER DEBUG INFO ===');
    console.log('wrapperPreloader element:', wrapperPreloader);
    console.log('wrapperPreloader classes:', wrapperPreloader?.className);
    console.log('wrapperPreloader computed display:', wrapperPreloader ? getComputedStyle(wrapperPreloader).display : 'not found');
    console.log('wrapperPreloader computed visibility:', wrapperPreloader ? getComputedStyle(wrapperPreloader).visibility : 'not found');
    console.log('wrapperPreloader computed opacity:', wrapperPreloader ? getComputedStyle(wrapperPreloader).opacity : 'not found');
    console.log('playButton element:', playButton);
    console.log('peterPannekoek element:', peterPannekoek);
    console.log('leftCurtain element:', leftCurtain);
    console.log('rightCurtain element:', rightCurtain);
    
    console.log('Session storage:');
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        console.log(`- ${key}: ${sessionStorage.getItem(key)}`);
    }
    
    // Check if CSS rule exists
    const styleSheets = Array.from(document.styleSheets);
    let foundCompletedRule = false;
    styleSheets.forEach((sheet, i) => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes('preloader-completed')) {
                    console.log(`Found CSS rule in stylesheet ${i}:`, rule.cssText);
                    foundCompletedRule = true;
                }
            });
        } catch (e) {
            console.log(`Cannot access stylesheet ${i}:`, e.message);
        }
    });
    
    if (!foundCompletedRule) {
        console.log('❌ CSS rule for .preloader-completed not found!');
    }
    
    // Test adding the class manually
    if (wrapperPreloader) {
        console.log('Testing manual class addition...');
        wrapperPreloader.classList.add('preloader-completed');
        setTimeout(() => {
            console.log('After manual class - display:', getComputedStyle(wrapperPreloader).display);
            console.log('After manual class - classes:', wrapperPreloader.className);
        }, 100);
    }
};