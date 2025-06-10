let frame = document.querySelector(".frame");
let cannon = document.querySelector(".frame .cannon-container");
let flash = document.querySelector(".flash");

let explosionSound = document.getElementById("cannon-explosion");
let yellSound = document.getElementById("cannon-yell");


if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cannon.addEventListener("click", () => {
        frame.classList.remove("shake-fx");
        flash.classList.remove("flash-fx");
        void flash.offsetWidth;
        void frame.offsetWidth;
        frame.classList.add("shake-fx");
        flash.classList.add("flash-fx");

        // Play audio
        explosionSound.currentTime = 0;
        explosionSound.play();

        setTimeout(() => {
            yellSound.currentTime = 0;
            yellSound.play();
        }, 1000);
    });
}