// Get DOM elements with null checks
let frame = document.querySelector(".frame");
let cannon = document.querySelector(".frame .cannon-container");
let flash = document.querySelector(".flash");

let explosionSound = document.getElementById("cannon-explosion");
let yellSound = document.getElementById("cannon-yell");

// Log warnings for missing elements
if (!frame) {
    console.warn('Frame element (.frame) not found');
}
if (!cannon) {
    console.warn('Cannon element (.frame .cannon-container) not found');
}
if (!flash) {
    console.warn('Flash element (.flash) not found');
}
if (!explosionSound) {
    console.warn('Explosion sound element (#cannon-explosion) not found');
}
if (!yellSound) {
    console.warn('Yell sound element (#cannon-yell) not found');
}

// Only add event listener if motion is not reduced and cannon element exists
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && cannon) {
    cannon.addEventListener("click", () => {
        // Remove classes with null checks
        if (frame) {
            frame.classList.remove("shake-fx");
        }
        if (flash) {
            flash.classList.remove("flash-fx");
        }
        
        // Force reflow with null checks
        if (flash) {
            void flash.offsetWidth;
        }
        if (frame) {
            void frame.offsetWidth;
        }
        
        // Add classes with null checks
        if (frame) {
            frame.classList.add("shake-fx");
        }
        if (flash) {
            flash.classList.add("flash-fx");
        }

        // Play explosion audio with null check
        if (explosionSound) {
            explosionSound.currentTime = 0;
            explosionSound.play().catch(error => {
                console.error('Failed to play explosion sound:', error);
            });
        }

        // Play yell audio after delay with null check
        setTimeout(() => {
            if (yellSound) {
                yellSound.currentTime = 0;
                yellSound.play().catch(error => {
                    console.error('Failed to play yell sound:', error);
                });
            }
        }, 1000);
    });
} else {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        console.info('Cannon animation disabled due to reduced motion preference');
    }
    if (!cannon) {
        console.warn('Cannon click functionality disabled - cannon element not found');
    }
}