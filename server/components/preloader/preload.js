// Preloader functionality
const playButton = document.getElementById("enterSite");
const leftCurtain = document.querySelector(".curtain-left");
const rightCurtain = document.querySelector(".curtain-right");
const peterPannekoek = document.querySelector(".peter-container");
const audio = document.getElementById("peterAudio");
const bottomHead = document.querySelector(".bottomhead");
let mouthInterval;

// Disable button initially
let isReady = false;

// Function to update button based on state
function updateButton() {
    if (isReady) {
        playButton.innerHTML = "site betreden";
        playButton.disabled = false;
    } else {
        playButton.innerHTML = "podium wordt opgebouwd";
        playButton.disabled = true;
    }
}

// Initialize
updateButton();

// Wait for all content to load
window.addEventListener('load', () => {
    isReady = true;
    updateButton();
    
    // Add peek animation classes to curtains
    leftCurtain.classList.add("curtain-left-animation-peak");
    rightCurtain.classList.add("curtain-right-animation-peak");
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

// Button click functionality
playButton.addEventListener("click", () => {
  // Prevent multiple clicks
  if (playButton.disabled) return;
  
  // Start visual animations immediately
  leftCurtain.classList.remove("curtain-left-animation-peak"); // Remove peek
  rightCurtain.classList.remove("curtain-right-animation-peak"); // Remove peek
  leftCurtain.classList.add("curtain-left-animation-open");
  rightCurtain.classList.add("curtain-right-animation-open");
  peterPannekoek.classList.add("peter-animation");
  playButton.classList.add("none");
  
  setTimeout(() => {
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
    });

    // Start mouth movement
    mouthInterval = setInterval(() => {
      const randomOffset = Math.random() * 100;
      bottomHead.style.transform = `translateY(${randomOffset}px)`;
    }, 100);

    // Stop mouth movement when audio ends
    audio.addEventListener("ended", () => {
      clearInterval(mouthInterval);
      bottomHead.style.transform = "translateY(0)";
      peterPannekoek.classList.add("none");
    }, { once: true });
  }, 1300);
});



const projectsButton = document.getElementById("projects"); // Or use a more specific selector

// Handle button click
projectsButton.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default action if it's a link
    
    // Remove open animation classes if they exist
    leftCurtain.classList.remove('curtain-left-animation-open');
    rightCurtain.classList.remove('curtain-right-animation-open');
    
    // Add close animation classes
    leftCurtain.classList.add('curtain-left-animation-close');
    rightCurtain.classList.add('curtain-right-animation-close');
    
    // Wait for animations to complete, then transition to next page
    setTimeout(() => {
        // Replace 'next-page.html' with your actual next page URL
        window.location.href = 'next-page.html';
        // Or if you're using a single-page app:
        // showNextPage();
    }, 2000); // 2000ms = 2s animation duration
});

// Alternative: Listen for animation end events (more precise)
function handleAnimationEnd() {
    let animationsCompleted = 0;
    
    function onAnimationEnd() {
        animationsCompleted++;
        if (animationsCompleted === 2) { // Both curtains finished
            window.location.href = 'next-page.html';
        }
    }
    
    leftCurtain.addEventListener('animationend', onAnimationEnd, { once: true });
    rightCurtain.addEventListener('animationend', onAnimationEnd, { once: true });
}
