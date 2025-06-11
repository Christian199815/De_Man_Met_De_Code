document.addEventListener('DOMContentLoaded', function() {
  initializeCrocodiles();
});

// Also listen for grid re-renders
document.addEventListener('gridRerendered', function() {
  // Small delay to ensure DOM is ready
  setTimeout(initializeCrocodiles, 100);
});

function initializeCrocodiles() {
  // Check if crocodiles are already initialized to prevent duplicates
  const container = document.querySelector(".crocodile-container");
  if (!container || container.querySelector('.croc-wrapper')) {
    return; // Already initialized or container not found
  }

  const biteSound = document.getElementById("biteSound");
  if (!biteSound) {
    console.error("Bite sound element not found");
    return;
  }

  const NUM_CROCS = Math.floor(Math.random() * 6) + 4;
  const CROCODILE_SRC = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/be02a4e3-e357-4bde-b048-3a8a59e11d49/d2xqipq-6a19af1e-898b-4214-880e-ddf321d86f7a.png/v1/fill/w_1173,h_681/crocodile_png_by_absurdwordpreferred_d2xqipq-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjQwNyIsInBhdGgiOiJcL2ZcL2JlMDJhNGUzLWUzNTctNGJkZS1iMDQ4LTNhOGE1OWUxMWQ0OVwvZDJ4cWlwcS02YTE5YWYxZS04OThiLTQyMTQtODgwZS1kZGYzMjFkODZmN2EucG5nIiwid2lkdGgiOiI8PTQxNDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.7J0KJsi-zeG_BtEHujYNY047XYwTSOug40ggbE4Dnqw";

  // Create crocodiles
  for (let i = 0; i < NUM_CROCS; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("croc-wrapper");
    
    const croc = document.createElement("img");
    croc.src = CROCODILE_SRC;
    croc.classList.add("crocodile");
    croc.alt = "Animated crocodile";
    
    // Random size and speed
    const size = Math.random() * 0.5 + 0.5;
    croc.style.height = `${200 * size}px`;
    
    const speed = Math.random() * 10 + 5;
    wrapper.style.animationDuration = `${speed}s`;
    wrapper.style.top = `${Math.random() * 50}%`;
    
    // Initial direction (start facing left)
    let facingRight = false;
    wrapper.style.transform = "scaleX(-1)";
    
    // Animation direction change
    wrapper.addEventListener("animationiteration", (e) => {
      if (e.animationName === "walk") {
        facingRight = !facingRight;
        wrapper.style.transform = facingRight ? "scaleX(1)" : "scaleX(-1)";
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
          playPromise.catch(error => {
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