window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".catagorie");

  cards.forEach((card) => {
    const randomDeg = Math.floor(Math.random() * 30) - 10;
    card.style.transform = `rotate(${randomDeg}deg)`;
  });
});
