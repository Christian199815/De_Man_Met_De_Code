const scrollers = document.querySelectorAll(".scroller");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    scroller.setAttribute("data-animated", true);
    const scrollerInner = scroller.querySelector(".scroller__inner");
    const items = Array.from(scrollerInner.children);

    let totalWidth = scrollerInner.scrollWidth;
    const containerWidth = scroller.offsetWidth;

    // Clone images until it’s wide enough for smooth looping
    while (totalWidth < containerWidth * 2) {
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        scrollerInner.appendChild(clone);
      });
      totalWidth = scrollerInner.scrollWidth;
    }
  });
}
