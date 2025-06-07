// Get all the lights
const lights = document.querySelectorAll(".lights");

// A function that creates a random RGBA color
function getRandomBrightColor(opacity) {
  const red = 100 + Math.floor(Math.random() * 155);   // 100–255
  const green = 100 + Math.floor(Math.random() * 155);
  const blue = 100 + Math.floor(Math.random() * 155);
    return "rgba(" + red + ", " + green + ", " + blue + ", " + opacity + ")";
}

// Loop through each light
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

    beam.classList.toggle("active");

    // Set a random gradient as background
    const topColor = getRandomBrightColor(0.3);
    const bottomColor = getRandomBrightColor(0);
    beam.style.background = "linear-gradient(to bottom, " + topColor + ", " + bottomColor + ")";
  });
}