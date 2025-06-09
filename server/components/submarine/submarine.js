import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.js";
import { MotionPathPlugin } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/MotionPathPlugin.js";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const submarine = document.querySelector(".submarine");
const submarineContainer = document.querySelector(".submarine-container");
const bubbleContainer = document.querySelector(".bubble-container");
let lastScrollY = window.scrollY;
let isFlipped = true;

const triggerElement = document.querySelector("#dynamicGrid");
const triggerHeight = triggerElement.offsetHeight;

// Main animation timeline
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#dynamicGrid",
    start: "top center",
    end: `bottom center`,
    scrub: 1,
    markers: false,
    onToggle: (self) => {
      gsap.to(submarineContainer, {
        opacity: self.isActive ? 1 : 0,
        duration: 0.3,
      });
    },
  },
});

tl.to(submarineContainer, {
  motionPath: {
    path: "#wavePath",
    align: "#wavePath",
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
  ease: "none",
  duration: 1,
});

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingUp = currentScrollY < lastScrollY;

  if (scrollingUp !== isFlipped) {
    isFlipped = scrollingUp;
    gsap.set(submarine, {
      scaleX: isFlipped ? -1 : 1,
      scaleY: -1,
    });
  }

  if (
    Math.abs(currentScrollY - lastScrollY) > 5 &&
    parseFloat(getComputedStyle(submarineContainer).opacity) > 0
  ) {
    createBubbleAtTail();
  }

  lastScrollY = currentScrollY;
});

function createBubbleAtTail() {
  console.log("createBubbleAtTail called");

  if (!submarine || !bubbleContainer) {
    console.log("Missing elements:", {
      submarine: !!submarine,
      bubbleContainer: !!bubbleContainer,
    });
    return;
  }

  const rect = submarineContainer.getBoundingClientRect();
  console.log("Submarine rect:", rect);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Random bubble size
  const size = Math.random() * 25 + 15;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  // Position at the submarine's tail
  const offsetX = rect.left + rect.width * (isFlipped ? 0.15 : 0.85);
  const offsetY = rect.top + rect.height * 0.6;

  console.log("Bubble position:", { offsetX, offsetY, isFlipped });

  bubble.style.left = `${offsetX}px`;
  bubble.style.top = `${offsetY}px`;

  // Set direction of animation
  const moveDirection = isFlipped
    ? "translate(-200px, -200px)"
    : "translate(200px, -200px)";
  bubble.style.setProperty("--bubble-move", moveDirection);

  // Add some visual debugging
  bubble.style.backgroundColor = "rgba(173, 216, 230, 0.9)"; // More visible

  bubbleContainer.appendChild(bubble);
  console.log("Bubble added to container");

  // Remove bubble after animation
  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.remove();
      console.log("Bubble removed");
    }
  }, 2000);
}
