(function () {
  "use strict";

  const STORAGE_KEY = "ikesedge_consent_v1";
  const config = window.IKES_EDGE_ANALYTICS_CONFIG || {};
  const hasGpc = navigator.globalPrivacyControl === true;
  let state = readConsent();
  let optionalTrackingWasActive = Boolean(state && (state.analytics || state.advertising));

  // Prevent legacy inline Whop snippets from loading analytics before consent.js runs.
  if (!window.whop) {
    window.whop = {
      __ikesEdgeConsentStub: true,
      track: function () {},
      setScope: function () {}
    };
  }

  injectConsentStyles();
  if (document.body) {
    initializeConsentUi();
  } else {
    document.addEventListener("DOMContentLoaded", initializeConsentUi, { once: true });
  }

  window.ikesEdgeConsent = {
    getState: function () { return Object.assign({}, state || deniedState()); },
    canTrack: function (category) { return Boolean(state && state[category] === true); },
    openPreferences: openPreferences,
    apply: applyChoice
  };

  function deniedState() {
    return { analytics: false, advertising: false, gpc: hasGpc, version: 1 };
  }

  function readConsent() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || saved.version !== 1) return null;
      return normalizeState(saved);
    } catch (error) {
      return null;
    }
  }

  function normalizeState(next) {
    const normalized = {
      analytics: next.analytics === true,
      advertising: next.advertising === true,
      gpc: hasGpc,
      version: 1
    };

    if (hasGpc) normalized.advertising = false;
    return normalized;
  }

  function saveState(next) {
    state = normalizeState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function applyChoice(next, shouldReload) {
    const previous = state || deniedState();
    const nextState = saveState(next);
    const trackingWasReduced = (previous.analytics && !nextState.analytics) ||
      (previous.advertising && !nextState.advertising);

    optionalTrackingWasActive = Boolean(previous.analytics || previous.advertising);
    hideBanner();
    hidePreferences();
    renderState();

    if (trackingWasReduced && optionalTrackingWasActive && shouldReload !== false) {
      // Reloading removes already-loaded third-party scripts and starts cleanly with the new choice.
      window.setTimeout(function () { window.location.reload(); }, 60);
      return;
    }

    applyConsent(nextState);
  }

  function applyConsent(next) {
    state = next;
    updateGoogleConsent();
    if (state.analytics) {
      loadGa4();
      loadWhopAnalytics();
    }
    if (state.advertising) loadMetaPixel();
  }

  function loadGa4() {
    const id = String(config.ga4MeasurementId || "").trim();
    if (!id || window.__ikesEdgeGa4Loaded) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
    updateGoogleConsent();
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
    window.__ikesEdgeGa4Loaded = true;
  }

  function updateGoogleConsent() {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: state && state.analytics ? "granted" : "denied",
      ad_storage: state && state.advertising ? "granted" : "denied",
      ad_user_data: state && state.advertising ? "granted" : "denied",
      ad_personalization: state && state.advertising ? "granted" : "denied"
    });
  }

  function loadMetaPixel() {
    const id = String(config.metaDatasetId || "").trim();
    if (!id || window.__ikesEdgeMetaLoaded || window.__ikesEdgeMetaLoading) return;

    // Set the guard before creating the script or queuing commands. This makes
    // repeated consent application idempotent, including rapid preference
    // changes while fbevents.js is still loading.
    window.__ikesEdgeMetaLoading = true;

    window.fbq = window.fbq || function () {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
    };
    if (!window.fbq.queue) window.fbq.queue = [];
    if (!window.fbq.loaded) {
      window.fbq.loaded = true;
      window.fbq.version = "2.0";
      window.fbq.push = window.fbq;
      let script = document.querySelector('script[data-ikes-edge-meta="true"]');
      if (!script) {
        script = document.createElement("script");
        script.async = true;
        script.dataset.ikesEdgeMeta = "true";
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }
    }
    window.fbq("init", id);
    window.fbq("track", "PageView");
    window.__ikesEdgeMetaLoaded = true;
    window.__ikesEdgeMetaLoading = false;
  }

  function loadWhopAnalytics() {
    if (!window.whop || !window.whop.__ikesEdgeConsentStub || window.__ikesEdgeWhopLoaded || window.__ikesEdgeWhopLoading) {
      if (window.whop && !window.whop.__ikesEdgeConsentStub && typeof window.whop.track === "function") {
        window.whop.track("page");
      }
      return;
    }

    const businessId = String(config.whopBusinessId || "").trim();
    if (!businessId) return;

    delete window.whop;
    window.__ikesEdgeWhopLoading = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://t.whop.tw/s.js";
    script.onload = function () {
      if (window.whop && typeof window.whop.setScope === "function") {
        window.whop.setScope(businessId);
        window.whop.track("page");
        window.__ikesEdgeWhopLoading = false;
        window.__ikesEdgeWhopLoaded = true;
      }
    };
    document.head.appendChild(script);
  }

  function trackFacebookGroupClick(details) {
    const eventData = {
      source: details.source === "facebook_badge" ? "facebook_badge" : "primary_cta",
      utm_source: details.utm_source || "",
      utm_medium: details.utm_medium || "",
      utm_campaign: details.utm_campaign || "",
      utm_content: details.utm_content || ""
    };

    if (state && state.analytics && typeof window.gtag === "function") {
      window.gtag("event", "facebook_group_click", eventData);
    }
    if (state && state.advertising && typeof window.fbq === "function") {
      window.fbq("trackCustom", "FacebookGroupClick", eventData);
    }
    window.dispatchEvent(new CustomEvent("ikesedge:facebook-group-click", { detail: eventData }));
  }

  window.addEventListener("ikesedge:track-facebook-group-click", function (event) {
    trackFacebookGroupClick(event.detail || {});
  });

  function initializeConsentUi() {
    injectConsentUi();
    renderState();
    if (state) applyConsent(state);
    else showBanner();
  }

  function injectConsentUi() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = '<div class="ikesedge-consent-banner" role="dialog" aria-live="polite" aria-label="Privacy choices">' +
      '<div class="ikesedge-consent-copy"><strong>Privacy choices</strong><p>We use optional analytics and advertising tools only when you allow them. You can change your choices at any time.</p></div>' +
      '<div class="ikesedge-consent-actions"><button type="button" class="ikesedge-consent-button ikesedge-consent-reject">Reject optional</button><button type="button" class="ikesedge-consent-button ikesedge-consent-accept">Accept all</button><button type="button" class="ikesedge-consent-manage">Manage preferences</button></div>' +
      '</div><div class="ikesedge-consent-modal" role="dialog" aria-modal="true" aria-labelledby="ikesedge-consent-title" hidden>' +
      '<div class="ikesedge-consent-panel"><div class="ikesedge-consent-panel-head"><h2 id="ikesedge-consent-title">Privacy preferences</h2><button type="button" class="ikesedge-consent-close" aria-label="Close privacy preferences">×</button></div>' +
      '<p>Choose which optional tools may run. Essential website functions remain available.</p>' +
      '<label class="ikesedge-consent-option"><span><strong>Analytics</strong><small>Helps us understand visits and campaign performance.</small></span><input type="checkbox" data-consent-category="analytics"></label>' +
      '<label class="ikesedge-consent-option"><span><strong>Advertising</strong><small>Helps measure Facebook advertising and group-link clicks.</small></span><input type="checkbox" data-consent-category="advertising"></label>' +
      '<p class="ikesedge-gpc-note" hidden>Global Privacy Control is active; advertising tracking remains off.</p>' +
      '<div class="ikesedge-consent-panel-actions"><button type="button" class="ikesedge-consent-button ikesedge-consent-reject">Reject optional</button><button type="button" class="ikesedge-consent-button ikesedge-consent-accept">Accept all</button><button type="button" class="ikesedge-consent-save">Save choices</button></div></div></div>';
    document.body.appendChild(wrapper);

    const banner = wrapper.querySelector(".ikesedge-consent-banner");
    const modal = wrapper.querySelector(".ikesedge-consent-modal");
    wrapper.querySelectorAll(".ikesedge-consent-accept").forEach(function (button) {
      button.addEventListener("click", function () { applyChoice({ analytics: true, advertising: true }); });
    });
    wrapper.querySelectorAll(".ikesedge-consent-reject").forEach(function (button) {
      button.addEventListener("click", function () { applyChoice({ analytics: false, advertising: false }); });
    });
    wrapper.querySelectorAll(".ikesedge-consent-manage").forEach(function (button) {
      button.addEventListener("click", openPreferences);
    });
    wrapper.querySelector(".ikesedge-consent-close").addEventListener("click", hidePreferences);
    wrapper.querySelector(".ikesedge-consent-save").addEventListener("click", function () {
      applyChoice({
        analytics: wrapper.querySelector('[data-consent-category="analytics"]').checked,
        advertising: wrapper.querySelector('[data-consent-category="advertising"]').checked
      });
    });

    window.ikesEdgeConsentUi = { banner: banner, modal: modal, wrapper: wrapper };
    const footer = document.querySelector(".site-footer, .facebook-footer");
    if (footer) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ikesedge-privacy-choices-link";
      button.textContent = "Privacy Choices";
      button.addEventListener("click", openPreferences);
      footer.appendChild(button);
    }
  }

  function renderState() {
    if (!window.ikesEdgeConsentUi) return;
    const ui = window.ikesEdgeConsentUi;
    const analytics = ui.modal.querySelector('[data-consent-category="analytics"]');
    const advertising = ui.modal.querySelector('[data-consent-category="advertising"]');
    analytics.checked = Boolean(state && state.analytics);
    advertising.checked = Boolean(state && state.advertising);
    ui.modal.querySelector(".ikesedge-gpc-note").hidden = !hasGpc;
  }

  function hideBanner() { window.ikesEdgeConsentUi.banner.hidden = true; }
  function openPreferences() {
    hideBanner();
    renderState();
    window.ikesEdgeConsentUi.modal.hidden = false;
  }
  function hidePreferences() {
    window.ikesEdgeConsentUi.modal.hidden = true;
    if (!state) showBanner();
  }
  function showBanner() { window.ikesEdgeConsentUi.banner.hidden = false; }

  function injectConsentStyles() {
    const style = document.createElement("style");
    style.textContent = '.ikesedge-consent-banner,.ikesedge-consent-modal{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.ikesedge-consent-banner[hidden],.ikesedge-consent-modal[hidden]{display:none!important}.ikesedge-consent-banner{position:fixed;z-index:10000;right:12px;bottom:6px;left:12px;display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1100px;margin:auto;padding:12px 18px;border:1px solid #d9e2eb;border-radius:12px;background:#fff;color:#111827;box-shadow:0 12px 32px rgba(7,17,31,.2)}.ikesedge-consent-copy{max-width:650px}.ikesedge-consent-copy strong{font-size:1rem}.ikesedge-consent-copy p{margin:3px 0 0;color:#5d6876;font-size:.82rem;line-height:1.4}.ikesedge-consent-actions,.ikesedge-consent-panel-actions{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px}.ikesedge-consent-button,.ikesedge-consent-manage,.ikesedge-consent-save,.ikesedge-consent-close,.ikesedge-privacy-choices-link{font:inherit;cursor:pointer}.ikesedge-consent-button,.ikesedge-consent-save{min-height:38px;padding:0 15px;border:1px solid #07111f;border-radius:6px;background:#07111f;color:#fff;font-size:.78rem;font-weight:800}.ikesedge-consent-reject{background:#fff;color:#07111f}.ikesedge-consent-manage,.ikesedge-privacy-choices-link{padding:5px;border:0;background:transparent;color:#0d55c7;font-size:.76rem;font-weight:700;text-decoration:underline}.ikesedge-consent-button:focus-visible,.ikesedge-consent-manage:focus-visible,.ikesedge-consent-save:focus-visible,.ikesedge-consent-close:focus-visible,.ikesedge-privacy-choices-link:focus-visible{outline:3px solid #e8a128;outline-offset:3px}.ikesedge-consent-modal{position:fixed;z-index:10001;inset:0;display:grid;place-items:center;padding:20px;background:rgba(7,17,31,.68)}.ikesedge-consent-panel{width:min(100%,520px);padding:24px;border-radius:12px;background:#fff;color:#111827;box-shadow:0 20px 70px rgba(0,0,0,.35)}.ikesedge-consent-panel-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.ikesedge-consent-panel h2{margin:0;font-size:1.45rem}.ikesedge-consent-panel>p{color:#5d6876;font-size:.9rem;line-height:1.55}.ikesedge-consent-close{width:34px;height:34px;border:0;border-radius:50%;background:#edf2f6;color:#07111f;font-size:1.4rem}.ikesedge-consent-option{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 0;border-top:1px solid #e5ebf0}.ikesedge-consent-option span{display:grid;gap:3px}.ikesedge-consent-option small{color:#5d6876;line-height:1.4}.ikesedge-consent-option input{width:20px;height:20px;accent-color:#e8a128}.ikesedge-gpc-note{padding:10px 12px;border-radius:6px;background:#fff7e8;color:#76500e!important;font-size:.78rem!important}.ikesedge-privacy-choices-link{display:block;margin:20px auto 0;color:#bcc9d6}.ikesedge-privacy-choices-link:hover{color:#f8c35c}@media(max-width:700px){.ikesedge-consent-banner{right:6px;bottom:4px;left:6px;display:grid;gap:9px;padding:11px 12px}.ikesedge-consent-copy p{font-size:.78rem}.ikesedge-consent-actions{justify-content:stretch;gap:7px}.ikesedge-consent-button{flex:1;min-height:36px;padding:0 10px}.ikesedge-consent-manage{width:100%}.ikesedge-consent-panel{padding:20px}.ikesedge-consent-panel-actions{justify-content:stretch}.ikesedge-consent-panel-actions .ikesedge-consent-button,.ikesedge-consent-panel-actions .ikesedge-consent-save{flex:1}}';
    document.head.appendChild(style);
  }
})();
