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
// WHOP CTA CLICK TRACKING
// ---------------------------------------------------------

const getWhopEventName = (link) => {
  const href = (link.getAttribute("href") || "").toLowerCase();
  const linkText = (link.textContent || "").trim().toLowerCase();

  if (linkText.includes("start free trial")) {
    return "click_start_free_trial";
  }

  if (href.includes("/products/ikes-trades/")) {
    return "click_join_ikes_trades";
  }

  if (href.includes("/products/stockpicks/")) {
    return "click_join_stock_picks";
  }

  if (href.includes("whop.com/ikesedge")) {
    return "click_whop_store";
  }

  if (linkText.includes("join ike's edge")) {
    return "click_join_ikes_edge";
  }

  return "click_whop_store";
};

const getWhopLocation = (link) => {
  const section = link.closest("section, header, footer, main, nav, aside, article, div[id]");

  if (!section) {
    return null;
  }

  if (section.id) {
    return section.id;
  }

  if (typeof section.className === "string") {
    const firstClassName = section.className.trim().split(/\s+/)[0];

    return firstClassName || null;
  }

  return null;
};

document.querySelectorAll('a[href*="whop.com"]').forEach((link) => {
  link.addEventListener("click", () => {
    try {
      if (!window.whop || typeof window.whop.track !== "function") {
        return;
      }

      const properties = {
        page: window.location.pathname,
        link_text: (link.textContent || "").trim(),
        href: link.href
      };
      const location = getWhopLocation(link);

      if (location) {
        properties.location = location;
      }

      window.whop.track(getWhopEventName(link), properties);
    } catch (error) {
      // Ignore tracking failures so outbound navigation is never interrupted.
    }
  });
});


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
// CELEBRATION PAGE SCROLL REVEALS
// ---------------------------------------------------------

const celebrationPage = document.querySelector(".member-celebration-page");

if (celebrationPage && !prefersReducedMotion.matches && "IntersectionObserver" in window) {
  celebrationPage.classList.add("celebration-motion-ready");

  document.querySelectorAll(".celebration-scroll-group").forEach((group) => {
    const staggerDelay = Number(group.dataset.celebrationStagger) || 0.12;

    group.querySelectorAll(".celebration-scroll-reveal").forEach((item, index) => {
      item.style.setProperty("--celebration-delay", `${index * staggerDelay}s`);
    });
  });

  const celebrationObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  document.querySelectorAll(".celebration-scroll-reveal").forEach((item) => {
    celebrationObserver.observe(item);
  });
}


// ---------------------------------------------------------
// CELEBRATION PAGE AUDIO BUTTON
// ---------------------------------------------------------

const celebrationAudioButton = document.getElementById("celebration-audio-button");
const celebrationAudio = document.getElementById("celebration-audio");

if (celebrationPage && celebrationAudioButton && celebrationAudio) {
  const defaultCelebrationLabel = "Start the Celebration";
  const activeCelebrationLabel = "Playing Celebration";

  const setCelebrationLabel = (label) => {
    celebrationAudioButton.textContent = label;
  };

  celebrationAudioButton.addEventListener("click", async () => {
    try {
      if (!celebrationAudio.paused) {
        celebrationAudio.currentTime = 0;
      }

      const playPromise = celebrationAudio.play();

      setCelebrationLabel(activeCelebrationLabel);

      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
    } catch (error) {
      setCelebrationLabel(defaultCelebrationLabel);
    }
  });

  celebrationAudio.addEventListener("ended", () => {
    setCelebrationLabel(defaultCelebrationLabel);
  });

  celebrationAudio.addEventListener("pause", () => {
    if (celebrationAudio.ended) {
      return;
    }

    setCelebrationLabel(defaultCelebrationLabel);
  });
}


// ---------------------------------------------------------
// AUTOMATIC COPYRIGHT YEAR
// ---------------------------------------------------------

const footerBottom = document.querySelector(".footer-bottom span");

if (footerBottom) {
  const currentYear = new Date().getFullYear();

  footerBottom.textContent =
    `© ${currentYear} Ike's Edge. All Rights Reserved.`;
}
