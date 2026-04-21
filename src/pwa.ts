// ============================================================
// PWA service-worker registration.
// IMPORTANT: We DO NOT register inside an iframe, because service workers
// there can cache stale builds and break the live experience.
// Real users on the published URL will get full offline support.
// ============================================================

export function registerSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  if (inIframe) {
    // Clean up any SW that may have been registered earlier in this context.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
    return;
  }

  window.addEventListener("load", () => {
    // VitePWA generates 'sw.js' by default
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("SW registered:", registration);
    }).catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
}
