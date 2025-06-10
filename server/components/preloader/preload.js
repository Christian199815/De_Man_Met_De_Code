

document.addEventListener('mousemove', (event) => {
// console.log('Mouse X:', event.clientX, 'Mouse Y:', event.clientY);
  const container = document.querySelector('.peter-container');
  const eyes = document.querySelectorAll('.eye-yellow');

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

const playButton = document.getElementById("enterSite");
const leftCurtain = document.querySelector(".curtain-left");
const rightCurtain = document.querySelector(".curtain-right");
const peterPannekoek = document.querySelector(".peter-container");
const audio = document.getElementById("peterAudio");
const bottomHead = document.querySelector(".bottomhead");
let mouthInterval;

playButton.addEventListener("click", () => {
  // Start visual animations immediately
  leftCurtain.classList.add("curtain-left-animation");
  rightCurtain.classList.add("curtain-right-animation");
  peterPannekoek.classList.add("peter-animation");

  setTimeout(() => {
    audio.play();

    // Start mouth movement
    mouthInterval = setInterval(() => {
      const randomOffset = Math.random() * 100;
      bottomHead.style.transform = `translateY(${randomOffset}px)`;
    }, 100);

    // Stop mouth movement when audio ends
    audio.addEventListener("ended", () => {
      clearInterval(mouthInterval);
      bottomHead.style.transform = "translateY(0)";
    }, { once: true });
  }, 1300);

  });