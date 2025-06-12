// Get cursor element with null check
var cursor = document.getElementById('cursor');

// Early warning if cursor element is missing
if (!cursor) {
    console.warn('Cursor element (#cursor) not found - custom cursor functionality disabled');
}

// Mouse move function with null check
function moveCursor(e) {
    if (!cursor || !e) return; // Safety checks

    var x = e.clientX;
    var y = e.clientY;

    // Additional safety check for event properties
    if (typeof x === 'number' && typeof y === 'number') {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
    }
}

// Only add mousemove listener if cursor element exists
if (cursor) {
    document.addEventListener('mousemove', moveCursor);
} else {
    console.warn('Mousemove listener not added - cursor element missing');
}

// Get all hoverable elements with null check
var hoverElements = document.querySelectorAll('a, button, .lights, .project-image-wrapper, .cannon-container,  .hamburger-menu, .filter-btn, .search-input');
var hover = Array.from(hoverElements);

// Log if no hoverable elements found
if (!hover || hover.length === 0) {
    console.warn('No hoverable elements found for cursor effects');
} else {
    console.info(`Found ${hover.length} hoverable elements for cursor effects`);
}

// Add hover effects only if cursor and elements exist
if (cursor && hover && hover.length > 0) {
    hover.forEach(el => {
        // Additional null check for each element
        if (!el) {
            console.warn('Null element found in hover array');
            return;
        }

        el.addEventListener('mouseenter', function () {
            if (cursor) {
                cursor.classList.add('hover-cursor');
            }
        });


        // To remove the class when it doesn't hover the element
        el.addEventListener('mouseleave', function () {
            if (cursor) { // Additional safety check
                cursor.classList.remove('hover-cursor');
            }
        });
    });
} else {
    console.warn('Hover effects not initialized - missing cursor element or hoverable elements');
}

// Mouse click active states - only if cursor exists
if (cursor) {
    document.addEventListener('mousedown', function () {
        if (cursor) { // Additional safety check
            cursor.classList.add('active-cursor');
        }
    });

    document.addEventListener('mouseup', function () {
        if (cursor) { // Additional safety check
            cursor.classList.remove('active-cursor');
        }
    });
} else {
    console.warn('Mouse click effects not initialized - cursor element missing');
}