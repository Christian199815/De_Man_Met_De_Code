var cursor = document.getElementById('cursor');

document.addEventListener('mousemove', moveCursor)

function moveCursor(e) {
  var x = e.clientX;
  var y = e.clientY;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}

//To get all the paragraph elements
var hover = Array.from(document.querySelectorAll('a, button, .lights, .project-image-wrapper'));

hover.forEach(el => {
  el.addEventListener('mousemove', function() {
    cursor.classList.add('hover-cursor');
  })
//To remove the class when it doesn't hover the text
  el.addEventListener('mouseleave', function () {
    cursor.classList.remove('hover-cursor');
  })
})

// When mouse clicked active states class gets added working
document.addEventListener('mousedown', function () {
  cursor.classList.add('active-cursor');
});

document.addEventListener('mouseup', function () {
  cursor.classList.remove('active-cursor');
});