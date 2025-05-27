

document.addEventListener('mousemove', (e) => {
  const container = document.querySelector('.peter-container');
  const eyes = document.querySelectorAll('.eye-yellow');

  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;

  eyes.forEach(eye => {
    const eyeRect = eye.parentElement.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const dx = e.clientX - eyeCenterX;
    const dy = e.clientY - eyeCenterY;
    const angle = Math.atan2(dy, dx);

    const radius = 5; // Adjust how far the pupil moves
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    eye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
});


const playButton = document.getElementById("playSoundButton");
const audio = document.getElementById("myAudio");
const bottomHead = document.querySelector(".bottomhead");
let mouthInterval;

playButton.addEventListener("click", function() {
  audio.play();

  // Start mouth movement
  mouthInterval = setInterval(() => {
    const randomOffset = Math.random() * 100; // Random movement
    bottomHead.style.transform = `translateY(${randomOffset}px)`;
  }, 100);

  // Stop mouth movement when audio ends
  audio.addEventListener("ended", () => {
    clearInterval(mouthInterval);
    bottomHead.style.transform = "translateY(0)";
  });
});