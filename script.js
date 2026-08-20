// =========================================================
// IKE'S EDGE WEBSITE
// Basic interactions
// =========================================================


// ---------------------------------------------------------
// MOBILE NAVIGATION
// ---------------------------------------------------------

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");

if (mobileMenuButton && mainNav) {
  mobileMenuButton.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    mobileMenuButton.setAttribute("aria-expanded", isOpen);

    mobileMenuButton.textContent = isOpen ? "✕" : "☰";
  });

  // Close the mobile menu after clicking a navigation link
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenuButton.textContent = "☰";
    });
  });
}


// ---------------------------------------------------------
// FAQ ACCORDION
// ---------------------------------------------------------

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");

  if (!question) {
    return;
  }

  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    // Close all FAQ items first
    faqItems.forEach((faqItem) => {
      faqItem.classList.remove("active");
    });

    // Re-open the clicked item if it wasn't already open
    if (!isActive) {
      item.classList.add("active");
    }
  });
});


// ---------------------------------------------------------
// ROTATING HERO PANELS
// ---------------------------------------------------------

const rotatingPanelGroups = document.querySelectorAll("[data-rotating-panels]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

rotatingPanelGroups.forEach((group) => {
  const panels = Array.from(group.querySelectorAll("[data-panel]"));
  const indicators = Array.from(group.querySelectorAll("[data-panel-indicator]"));
  const intervalDuration = Number(group.dataset.rotationInterval) || 6000;

  if (panels.length <= 1) {
    return;
  }

  let activeIndex = panels.findIndex((panel) => panel.classList.contains("is-active"));
  let rotationTimer = null;

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const setActivePanel = (nextIndex) => {
    activeIndex = (nextIndex + panels.length) % panels.length;

    panels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      const focusableItems = panel.querySelectorAll("a, button");

      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));

      focusableItems.forEach((item) => {
        if (isActive) {
          item.removeAttribute("tabindex");
        } else {
          item.setAttribute("tabindex", "-1");
        }
      });
    });

    indicators.forEach((indicator, index) => {
      const isActive = index === activeIndex;

      indicator.classList.toggle("is-active", isActive);
      indicator.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const getActiveDuration = () => {
    const panelDuration = Number(panels[activeIndex].dataset.duration);

    return panelDuration || intervalDuration;
  };

  const stopRotation = () => {
    if (rotationTimer) {
      window.clearTimeout(rotationTimer);
      rotationTimer = null;
    }
  };

  const startRotation = () => {
    if (prefersReducedMotion.matches) {
      return;
    }

    stopRotation();
    rotationTimer = window.setTimeout(() => {
      setActivePanel(activeIndex + 1);
      startRotation();
    }, getActiveDuration());
  };

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      setActivePanel(index);
      startRotation();
    });
  });

  group.addEventListener("mouseenter", stopRotation);
  group.addEventListener("mouseleave", startRotation);
  group.addEventListener("focusin", stopRotation);
  group.addEventListener("focusout", startRotation);

  setActivePanel(activeIndex);
  startRotation();
});


// ---------------------------------------------------------
// AUTOMATIC COPYRIGHT YEAR
// ---------------------------------------------------------

const footerBottom = document.querySelector(".footer-bottom span");

if (footerBottom) {
  const currentYear = new Date().getFullYear();

  footerBottom.textContent =
    `© ${currentYear} Ike's Edge. All Rights Reserved.`;
}
