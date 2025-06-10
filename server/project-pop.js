// Enhanced Popover JavaScript with project data support

(function () {
  let currentPopover = null;

  function closePopover() {
    if (currentPopover) {
      currentPopover.classList.remove("show");
      setTimeout(() => {
        if (currentPopover && currentPopover.parentNode) {
          currentPopover.parentNode.removeChild(currentPopover);
        }
        currentPopover = null;
      }, 300);
    }
  }

  // Enhanced function to show popover with multiple images
  function showProjectPopover(projectData) {
    console.log("🚀 showProjectPopover called with:", projectData);

    // Close existing popover if any
    if (currentPopover) {
      console.log("🗑️ Closing existing popover");
      closePopover();
    }

    // Get the template
    const template = document.getElementById("image-popover-template");
    if (!template) {
      console.error("❌ Image popover template not found");
      return;
    }

    console.log("✅ Template found, creating popover");

    // Clone the template content
    const popoverElement = template.content.cloneNode(true);
    const overlay = popoverElement.querySelector(".image-popover-overlay");
    const container = popoverElement.querySelector(".image-popover-container");
    const closeBtn = popoverElement.querySelector(".image-popover-close");

    // Create the content based on project data
    populatePopoverContent(container, projectData);

    // Store reference
    currentPopover = overlay;

    // Event listeners
    closeBtn.addEventListener("click", closePopover);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        closePopover();
      }
    });

    // Handle escape key
    function handleEscape(e) {
      if (e.key === "Escape") {
        closePopover();
        document.removeEventListener("keydown", handleEscape);
      }
    }
    document.addEventListener("keydown", handleEscape);

    // Add to DOM
    document.body.appendChild(overlay);

    console.log("✅ Popover added to DOM");

    // Trigger show animation
    setTimeout(() => {
      if (currentPopover) {
        currentPopover.classList.add("show");
        console.log("✅ Show class added");
      }
    }, 10);
  }

  // Helper function to format Dutch dates
  function formatDutchDate(dateString) {
    if (!dateString) return "";

    const months_dutch = [
      "Januari",
      "Februari",
      "Maart",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Augustus",
      "September",
      "Oktober",
      "November",
      "December",
    ];

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = months_dutch[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  }

  // Function to populate popover content with project data
  function populatePopoverContent(container, projectData) {
    // Populate title
    const title = container.querySelector(".project-popover-title");
    if (title) {
      title.textContent = projectData.projectname || "Project";
    }

    // Populate production name
    const production = container.querySelector(".project-popover-production");
    if (
      production &&
      projectData.productionName &&
      projectData.productionName.trim() !== ""
    ) {
      production.textContent = projectData.productionName;
      production.style.display = "block";
    }

    // Populate photographer
    const photographer = container.querySelector(
      ".project-popover-photographer"
    );
    if (photographer && projectData.photographerName) {
      photographer.textContent = projectData.photographerName;
      photographer.style.display = "block";
    }

    // Populate date
    const dateElement = container.querySelector(".project-popover-date");
    if (dateElement && projectData.projectDate) {
      const formattedDate = formatDutchDate(projectData.projectDate);
      dateElement.textContent = formattedDate;
      dateElement.style.display = "block";
    }

    // Populate images list
    const imagesList = container.querySelector(".project-popover-images-list");
    if (imagesList) {
      // Clear existing list items
      imagesList.innerHTML = "";

      // All images to display (featured + full content)
      const allImages = [];

      // Add featured image first
      if (projectData.projectFeaturedImage) {
        allImages.push({
          url: projectData.projectFeaturedImage,
          caption: "Featured Image",
          width: projectData.featuredImageWidth,
          height: projectData.featuredImageHeight,
        });
      }

      // Add full content images
      if (
        projectData.fullContentImages &&
        projectData.fullContentImages.length > 0
      ) {
        projectData.fullContentImages.forEach((img) => {
          allImages.push({
            url: img.url,
            caption: img.caption || "",
            width: img.width,
            height: img.height,
          });
        });
      }

      // Create image list items
      allImages.forEach((imgData, index) => {
        const listItem = document.createElement("li");
        listItem.className = "project-popover-image-item";

        const img = document.createElement("img");
        img.src = imgData.url;
        img.alt =
          imgData.caption || `${projectData.projectname} - Image ${index + 1}`;
        img.className = "project-popover-img";

        listItem.appendChild(img);

        if (imgData.caption && imgData.caption !== "Featured Image") {
          const caption = document.createElement("span");
          caption.className = "project-popover-caption";
          caption.textContent = imgData.caption;
          listItem.appendChild(caption);
        }

        imagesList.appendChild(listItem);
      });

      const prevBtn = container.querySelector("#prev");
      const nextBtn = container.querySelector("#next");
      const dotsContainer = container.querySelector("#dots");
      const counter = container.querySelector("#counter");

      // Hide prev/next buttons if there's only one image
      if (allImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        if (dotsContainer) dotsContainer.style.display = "none";
        if (counter) counter.style.display = "none";
      } else {
        if (prevBtn) prevBtn.style.display = "block";
        if (nextBtn) nextBtn.style.display = "block";
        if (dotsContainer) dotsContainer.style.display = "block";
        if (counter) counter.style.display = "block";
      }
    }

    // Populate category and sale info
    const category = container.querySelector(".project-popover-category");
    if (category && projectData.category) {
      category.textContent = projectData.category;
      category.style.display = "inline";
    }

    const forSale = container.querySelector(".project-popover-for-sale");
    if (forSale && projectData.forSale) {
      forSale.textContent = "Te koop";
      forSale.style.display = "inline";
    }

    // ========== Carousel Initialization ==========
    const list = container.querySelector(".project-popover-images-list");
    const counter = container.querySelector("#counter");
    const dotsContainer = container.querySelector("#dots");
    const prevBtn = container.querySelector("#prev");
    const nextBtn = container.querySelector("#next");

    if (!list || !counter || !dotsContainer || !prevBtn || !nextBtn) {
      console.warn("❌ Carousel elements not found in popover");
      return;
    }

    let index = 0;
    const items = list.querySelectorAll("li");
    const total = items.length;

    dotsContainer.innerHTML = "";
    items.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.addEventListener("click", () => {
        index = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + total) % total;
      updateCarousel();
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % total;
      updateCarousel();
    });

    function updateCarousel() {
      const offset = -index * 100;
      list.style.transform = `translateX(${offset}%)`;

      counter.textContent = `${index + 1}/${total}`;

      const dots = dotsContainer.querySelectorAll("span");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    updateCarousel();
  }

  // Initialize project popovers for cards with project data
  window.initProjectPopovers = function (selector = ".project-card") {
    const cards = document.querySelectorAll(
      `${selector}[data-pop-image][data-project-data]`
    );

    console.log("Initiated Project Popovers for cards");

    cards.forEach((card, index) => {
      // Remove any existing click handler
      if (card._popoverHandler) {
        card.removeEventListener("click", card._popoverHandler);
      }

      // Add new click handler
      card._popoverHandler = function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("🖱️ Project card clicked!", this, "Index:", index);

        // Get project data from the card's data attribute
        const projectDataString = this.getAttribute("data-project-data");
        if (projectDataString) {
          try {
            const projectData = JSON.parse(projectDataString);
            showProjectPopover(projectData);
          } catch (error) {
            console.error("Error parsing project data:", error);
          }
        } else {
          console.warn("No project data found in clicked card");
        }
      };

      // Add pointer cursor to indicate clickability
      card.classList.add("project-card-clickable");

      card.addEventListener("click", card._popoverHandler);
      console.log("✅ Added click handler to project card:", index);
    });

    console.log(`Initialized ${cards.length} project card popovers`);
    return cards.length;
  };

  // Auto-initialize on DOM load
  document.addEventListener("DOMContentLoaded", function () {
    if (
      document.querySelector("[data-auto-init-project-popovers]") ||
      document.querySelector(".project-card[data-pop-image][data-project-data]")
    ) {
      window.initProjectPopovers();
    }
  });

  // Re-initialize when new content is added (for dynamic content)
  window.reinitProjectPopovers = function () {
    return window.initProjectPopovers();
  };

  // Keep the old function for backward compatibility
  window.initImagePopovers = window.initProjectPopovers;
  window.reinitImagePopovers = window.reinitProjectPopovers;
})();
