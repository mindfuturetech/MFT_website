
/* =========================================
   GLOBAL FAQ - ONE OPEN ANSWER AT A TIME
   Works across all website pages
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  document.addEventListener("toggle", function (event) {

    const currentFaq = event.target;

    // Check if the toggled element is an open FAQ
    if (
      currentFaq.tagName === "DETAILS" &&
      currentFaq.open &&
      currentFaq.closest("section")
    ) {

      const faqSection = currentFaq.closest("section");

      // Close other open FAQ items in the same section
      faqSection.querySelectorAll("details[open]").forEach(function (item) {

        if (item !== currentFaq) {
          item.open = false;
        }

      });
    }

  }, true);

});
