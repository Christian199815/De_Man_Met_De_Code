import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.js";
import { MotionPathPlugin } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/MotionPathPlugin.js";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const submarine = document.querySelector(".submarine");
const bubbleContainer = document.querySelector(".bubble-container");

let lastScrollY = window.scrollY;
let isFlipped = true;

// GSAP timeline for motion path animation
gsap.to(".submarine", {
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  motionPath: {
    path: "#wavePath",
    align: "#wavePath",
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
  ease: "none",
});

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingUp = currentScrollY < lastScrollY;

  if (scrollingUp !== isFlipped) {
    isFlipped = scrollingUp;

    gsap.set(submarine, {
      scaleX: isFlipped ? 1 : -1,
      scaleY: isFlipped ? -1 : -1,
    });
  }

  if (Math.abs(currentScrollY - lastScrollY) > 5) {
    createBubbleAtTail();
    lastScrollY = currentScrollY;
  }
});

// Bubble creation function
function createBubbleAtTail() {
  if (!submarine || !bubbleContainer) return;

  const rect = submarine.getBoundingClientRect();

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Random bubble size
  const size = 50 * Math.random() + 25;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  // Position at the submarine's tail
  const offsetX = rect.left + rect.width * 0.85;
  const offsetY = rect.top + rect.height * 0.5;
  bubble.style.left = `${offsetX}px`;
  bubble.style.top = `${offsetY}px`;

  // Set direction of animation via CSS variable
  bubble.style.setProperty(
    "--bubble-move",
    isFlipped ? "translate(200px, -200px)" : "translate(-200px, -200px)"
  );

  bubbleContainer.appendChild(bubble);

  // Remove bubble after animation
  setTimeout(() => bubble.remove(), 2000);
}
