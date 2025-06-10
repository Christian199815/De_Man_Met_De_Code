// Get all the lights
const lights = document.querySelectorAll(".lights");

// A function that creates a random RGBA color
function getRandomBrightColor(opacity) {
  const red = 100 + Math.floor(Math.random() * 155);   // 100–255
  const green = 100 + Math.floor(Math.random() * 155);
  const blue = 100 + Math.floor(Math.random() * 155);
  return "rgba(" + red + ", " + green + ", " + blue + ", " + opacity + ")";
}

// Usage examples:
initLights(3); // Turn on 3 random lights
startRandomRotation(); // Start random rotation system

// Initialize lights - turn on a specified number of lights with random colors
function initLights(numberOfLights) {
  // Make sure we don't try to turn on more lights than we have
  const lightsToTurnOn = Math.min(numberOfLights, lights.length);
  
  // Create array of available light indices
  const availableLights = Array.from({length: lights.length}, (_, i) => i);
  
  // Shuffle and select random lights
  for (let i = 0; i < lightsToTurnOn; i++) {
    const randomIndex = Math.floor(Math.random() * availableLights.length);
    const lightIndex = availableLights.splice(randomIndex, 1)[0];
    const light = lights[lightIndex];
    const beam = light.querySelector(".beam");
    const image = light.querySelector("img");
    
    // Turn on the light with random colors
    beam.classList.add("active");
    const topColor = getRandomBrightColor(0.3);
    const bottomColor = getRandomBrightColor(0);
    beam.style.background = "linear-gradient(to bottom, " + topColor + ", " + bottomColor + ")";
    
    // Change image src when light turns on
    image.src = "/public/images/spotlights/licht.png";
    
    // Reset flicker state and start flickering with random delay
    beam.hasFlickered = false;
    beam.isFlickering = false;
    
    // Random delay between 0-3 seconds for chaos
    const randomDelay = Math.random() * 3000;
    
    setTimeout(() => {
      if (!beam.hasFlickered && !beam.isFlickering && beam.classList.contains("active")) {
        beam.isFlickering = true;
        
        // Random number of flickers between 2-5
        const maxFlickers = 2 + Math.floor(Math.random() * 4);
        let flickerCount = 0;
        
        function createFlicker() {
          // Stop if light was turned off or already completed
          if (!beam.classList.contains("active") || beam.hasFlickered) {
            beam.isFlickering = false;
            return;
          }
          
          if (flickerCount >= maxFlickers) {
            // Mark as completed and set final state
            beam.isFlickering = false;
            beam.hasFlickered = true;
            beam.style.opacity = "0.7";
            beam.style.transition = "opacity 300ms ease-in";
            return;
          }
          
          flickerCount++;
          const flickerIntensity = 0.2 + Math.random() * 0.4;
          const flickerDuration = 100 + Math.random() * 150;
          const pauseDuration = 200 + Math.random() * 400;
          
          beam.style.opacity = flickerIntensity;
          beam.style.transition = "opacity " + flickerDuration + "ms ease-out";
          
          setTimeout(() => {
            if (!beam.hasFlickered && beam.isFlickering) {
              beam.style.opacity = 0.6 + Math.random() * 0.2;
              beam.style.transition = "opacity " + (flickerDuration * 0.5) + "ms ease-in";
              
              setTimeout(() => {
                if (!beam.hasFlickered && beam.isFlickering) {
                  createFlicker();
                }
              }, pauseDuration);
            }
          }, flickerDuration);
        }
        
        // Start flickering with small additional delay
        setTimeout(createFlicker, Math.random() * 500);
      }
    }, randomDelay);
  }
}

// Rotate a random active light
function rotateRandomLight() {
  // Get only active lights (lights with active beams)
  const activeLights = [];
  for (let i = 0; i < lights.length; i++) {
    const beam = lights[i].querySelector(".beam");
    if (beam && beam.classList.contains("active")) {
      activeLights.push(lights[i]);
    }
  }
  
  if (activeLights.length === 0) return;
  
  const randomLight = activeLights[Math.floor(Math.random() * activeLights.length)];
  const currentRotation = randomLight.style.transform || "rotate(0deg)";
  const currentDegrees = parseInt(currentRotation.match(/rotate\((-?\d+)deg\)/) ? 
                                 currentRotation.match(/rotate\((-?\d+)deg\)/)[1] : 0);
  
  // Add a random rotation between -30 and 30 degrees
  const additionalRotation = (Math.random() - 0.5) * 60;
  const newRotation = currentDegrees + additionalRotation;
  
  randomLight.style.transition = "transform 1s ease-in-out";
  randomLight.style.transform = "rotate(" + newRotation + "deg)";
}

// Start random rotation intervals
function startRandomRotation() {
  function scheduleNextRotation() {
    const randomDelay = 1000 + Math.random() * 500; // 1-1.5 seconds
    setTimeout(() => {
      rotateRandomLight();
      scheduleNextRotation(); // Schedule the next rotation
    }, randomDelay);
  }
  
  scheduleNextRotation();
}

// Stop flickering when light is turned off
function stopLightFlicker(beam) {
  beam.hasFlickered = false;
  beam.isFlickering = false;
  beam.style.opacity = "";
  beam.style.transition = "";
}

// Start flickering system - only for newly activated lights
function startFlickerSystem() {
  // No automatic interval needed since we handle new lights in the click handler
  // Just call once for any lights that are already active
  flickerLights();
}

// Enhanced click event handler (updated from original)
for (let i = 0; i < lights.length; i++) {
  const light = lights[i];
  const image = light.querySelector("img");
  const beam = light.querySelector(".beam");

  image.addEventListener("click", function () {
    // Randomly malfunction (1 in 6 chance)
    const Malfunction = Math.random() < 1 / 6;

    if (Malfunction) {
      light.classList.add("malfunction");
      return;
    }

    const wasActive = beam.classList.contains("active");
    beam.classList.toggle("active");

    if (beam.classList.contains("active")) {
      // Light is being turned on
      const topColor = getRandomBrightColor(0.3);
      const bottomColor = getRandomBrightColor(0);
      beam.style.background = "linear-gradient(to bottom, " + topColor + ", " + bottomColor + ")";
      
      // Change image src when light turns on
      image.src = "/public/images/spotlights/licht.png";
      
      // Reset flicker state and start flickering for this specific light
      beam.hasFlickered = false;
      beam.isFlickering = false;
      
      // Start flickering for this specific light with random delay (0-2 seconds)
      const randomStartDelay = Math.random() * 2000;
      
      setTimeout(() => {
        if (!beam.hasFlickered && !beam.isFlickering) {
          beam.isFlickering = true;
          
          // Random number of flickers between 2-5
          const maxFlickers = 2 + Math.floor(Math.random() * 4);
          let flickerCount = 0;
          
          function createFlicker() {
            // Stop if light was turned off or already completed
            if (!beam.classList.contains("active") || beam.hasFlickered) {
              beam.isFlickering = false;
              return;
            }
            
            if (flickerCount >= maxFlickers) {
              // Mark as completed and set final state
              beam.isFlickering = false;
              beam.hasFlickered = true;
              beam.style.opacity = "0.7";
              beam.style.transition = "opacity 300ms ease-in";
              return;
            }
            
            flickerCount++;
            const flickerIntensity = 0.2 + Math.random() * 0.4;
            const flickerDuration = 100 + Math.random() * 150;
            const pauseDuration = 200 + Math.random() * 400;
            
            beam.style.opacity = flickerIntensity;
            beam.style.transition = "opacity " + flickerDuration + "ms ease-out";
            
            setTimeout(() => {
              if (!beam.hasFlickered && beam.isFlickering) {
                beam.style.opacity = 0.6 + Math.random() * 0.2;
                beam.style.transition = "opacity " + (flickerDuration * 0.5) + "ms ease-in";
                
                setTimeout(() => {
                  if (!beam.hasFlickered && beam.isFlickering) {
                    createFlicker();
                  }
                }, pauseDuration);
              }
            }, flickerDuration);
          }
          
          setTimeout(createFlicker, Math.random() * 500);
        }
      }, randomStartDelay);
    } else {
      // Light is being turned off - reset flicker state
      beam.hasFlickered = false;
      beam.isFlickering = false;
      beam.style.opacity = "";
      beam.style.transition = "";
    }
  });
}

// Usage examples:
// initLights(5); // Turn on 5 random lights
// startRandomRotation(); // Start random rotation system
// startFlickerSystem(); // Initialize flickering system (call once)