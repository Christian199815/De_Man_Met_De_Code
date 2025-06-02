document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.pathname === "/iets" &&
    !window.location.hash &&
    !window.location.search
  ) {
    const sign = document.getElementById("sign");
    const brokenGlass = document.getElementById("brokenGlass");
    const glassSound = document.getElementById("glassSound");

    let isBroken = false;

    sign.addEventListener("click", () => {
      sign.classList.add("shake");

      setTimeout(() => {
        sign.classList.remove("shake");

        if (!isBroken) {
          brokenGlass.classList.add("active");
          glassSound.currentTime = 0;
          glassSound.play();
          sign.textContent = "Why did you do that?";
        } else {
          brokenGlass.classList.remove("active");
          sign.textContent = "Don't Break";
        }

        isBroken = !isBroken;
      }, 400);
    });
  }
});
