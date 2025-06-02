window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".catagory");

  cards.forEach((card) => {
    const randomDeg = Math.floor(Math.random() * 30) - 10;
    card.style.transform = `rotate(${randomDeg}deg)`;
  }); 
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".catagory").forEach((cat) => {
    const category = cat.textContent.trim().toLowerCase();
    cat.classList.add(category);
  });
});
