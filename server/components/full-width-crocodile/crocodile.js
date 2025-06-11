document.addEventListener("DOMContentLoaded", function () {
  initializeCrocodiles();
});

// Also listen for grid re-renders
document.addEventListener("gridRerendered", function () {
  // Small delay to ensure DOM is ready
  setTimeout(initializeCrocodiles, 100);
});

function initializeCrocodiles() {
  // Check if crocodiles are already initialized to prevent duplicates
  const container = document.querySelector(".crocodile-container");
  if (!container || container.querySelector(".croc-wrapper")) {
    return; // Already initialized or container not found
  }

  const biteSound = document.getElementById("biteSound");
  if (!biteSound) {
    console.error("Bite sound element not found");
    return;
  }


  const NUM_CROCS = Math.floor(Math.random() * 5) + 4;
  const CROCODILE_SRC = "../../public/images/projects/crocodile.png";


  // Create crocodiles
  for (let i = 0; i < NUM_CROCS; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("croc-wrapper");

    const croc = document.createElement("img");
    croc.src = CROCODILE_SRC;
    croc.classList.add("crocodile");
    croc.alt = "Animated crocodile";

    // Random size and speed
    const size = Math.random() * 0.7 + 0.3;
    croc.style.height = `${200 * size}px`;

    const speed = Math.random() * 10 + 5;
    wrapper.style.animationDuration = `${speed}s`;
    wrapper.style.top = `${Math.random() * 80}%`;

    // Initial direction (start facing left)
    let facingRight = false;
    wrapper.style.transform = "rotateY(180deg)";
    
    // Animation direction change
    wrapper.addEventListener("animationiteration", (e) => {
      if (e.animationName === "walk") {
        facingRight = !facingRight;
        wrapper.style.transform = facingRight ? "rotateY(0deg)" : "rotateY(180deg)";
      }
    });

    // Click handler with improved audio handling
    croc.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();

      console.log("Crocodile clicked!"); // Debug log

      // Pause animations
      wrapper.classList.add("paused");
      croc.classList.add("paused");

      // Play sound with error handling
      try {
        biteSound.currentTime = 0;
        const playPromise = biteSound.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Audio play failed:", error);
            // Audio might be blocked by browser policy
            // You could show a visual indicator instead
          });
        }
      } catch (error) {
        console.log("Audio error:", error);
      }

      // Hide cursor
      document.body.classList.add("hide-cursor");

      // Resume after 5 seconds
      setTimeout(() => {
        wrapper.classList.remove("paused");
        croc.classList.remove("paused");
        document.body.classList.remove("hide-cursor");
      }, 5000);
    });

    wrapper.appendChild(croc);
    container.appendChild(wrapper);
  }

  console.log(`Initialized ${NUM_CROCS} crocodiles`); // Debug log
}
