const container = document.querySelector(".crocodile-container");
const biteSound = document.getElementById("biteSound");
const NUM_CROCS = Math.floor(Math.random() * 6) + 10;
const CROCODILE_SRC =
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/be02a4e3-e357-4bde-b048-3a8a59e11d49/d2xqipq-6a19af1e-898b-4214-880e-ddf321d86f7a.png/v1/fill/w_1173,h_681/crocodile_png_by_absurdwordpreferred_d2xqipq-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjQwNyIsInBhdGgiOiJcL2ZcL2JlMDJhNGUzLWUzNTctNGJkZS1iMDQ4LTNhOGE1OWUxMWQ0OVwvZDJ4cWlwcS02YTE5YWYxZS04OThiLTQyMTQtODgwZS1kZGYzMjFkODZmN2EucG5nIiwid2lkdGgiOiI8PTQxNDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.7J0KJsi-zeG_BtEHujYNY047XYwTSOug40ggbE4Dnqw";

for (let i = 0; i < NUM_CROCS; i++) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("croc-wrapper");

  const croc = document.createElement("img");
  croc.src = CROCODILE_SRC;
  croc.classList.add("crocodile");

  const size = Math.random() * 0.5 + 0.5;
  croc.style.height = `${200 * size}px`;

  const speed = Math.random() * 10 + 5;
  wrapper.style.animationDuration = `${speed}s`;

  wrapper.style.top = `${Math.random() * 50}%`;

  let facingRight = false;
  wrapper.style.transform = "scaleX(-1)";

  wrapper.addEventListener("animationiteration", (e) => {
    if (e.animationName === "walk") {
      facingRight = !facingRight;
      wrapper.style.transform = facingRight ? "scaleX(1)" : "scaleX(-1)";
    }
  });

  croc.addEventListener("click", (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    wrapper.classList.add("paused");
    croc.classList.add("paused");

    biteSound.currentTime = 0;
    biteSound.play();
    document.body.classList.add("hide-cursor");

    setTimeout(() => {
      wrapper.classList.remove("paused");
      croc.classList.remove("paused");
      document.body.classList.remove("hide-cursor");
    }, 10000);
  });

  wrapper.appendChild(croc);
  container.appendChild(wrapper);
}
