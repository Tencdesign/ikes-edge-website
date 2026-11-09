(function () {
  const ctas = document.querySelectorAll("[data-facebook-group-cta]");

  if (!ctas.length) return;

  ctas.forEach(function (cta) {
    cta.addEventListener("click", function () {
      const params = new URLSearchParams(window.location.search);
      const eventData = {
        source: cta.dataset.facebookGroupSource || "primary_cta",
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || ""
      };

      window.dispatchEvent(new CustomEvent("ikesedge:track-facebook-group-click", { detail: eventData }));
    });
  });
})();
