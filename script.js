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
// AUTOMATIC COPYRIGHT YEAR
// ---------------------------------------------------------

const footerBottom = document.querySelector(".footer-bottom span");

if (footerBottom) {
  const currentYear = new Date().getFullYear();

  footerBottom.textContent =
    `© ${currentYear} Ike's Edge. All Rights Reserved.`;
}