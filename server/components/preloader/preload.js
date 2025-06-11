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
if (isFirstVisit) {
    sessionStorage.setItem('hasVisited', 'true');
} else {
    // Hide peter-container AND button if not first visit
    if (peterPannekoek) {
        peterPannekoek.style.display = 'none';
    }
    if (enterButton) {
        enterButton.classList.add("none");
    }
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
        // Auto-play peter animation on first visit
        setTimeout(() => {
            peterPannekoek.classList.add("peter-animation");
            
            // Hide button instantly when animation starts
            if (enterButton) {
                enterButton.classList.add("none");
            }
            
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
                    
                    // Open curtains automatically
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
                }, { once: true });
            }, 1300);
        }, 1000); // Small delay after page load
    } else {
        // For returning visitors, hide button and just open curtains after a delay
        if (enterButton) {
            enterButton.classList.add("none");
        }
        
        setTimeout(() => {
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
        }, 1000);
    }
});

// Mouse tracking functionality
document.addEventListener('mousemove', (event) => {
  // console.log('Mouse X:', event.clientX, 'Mouse Y:', event.clientY);
  const container = document.querySelector('.peter-container');
  const eyes = document.querySelectorAll('.eye-yellow');

  if (!container || !eyes.length) return; // Safety check

  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;

  // midduh van de div bepaluh

  eyes.forEach(eye => {
    const eyeRect = eye.parentElement.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const dx = event.clientX - eyeCenterX;
    const dy = event.clientY - eyeCenterY;
    const angle = Math.atan2(dy, dx);

    const radius = 5; // Adjust how far the pupil moves
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    eye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
});