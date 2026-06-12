/**
 * protect.js — Referrer protection for cr7world.pages.dev/shaka
 * Allowed embeds: cricfoot.net, s2.hls-player.net
 * Direct access → redirect to https://www.cricfoot.net/
 */

(function () {
  const REDIRECT_URL = "https://www.cricfoot.net/";

  const ALLOWED_HOSTS = [
    "www.cricfoot.net",
    "cricfoot.net",
    "s2.hls-player.net",
  ];

  function getAllowedStatus() {
    const ref = document.referrer;

    // No referrer = direct access (typed URL, bookmark, empty iframe src, etc.)
    if (!ref) return false;

    try {
      const refHost = new URL(ref).hostname.toLowerCase();

      // Check if the referrer matches any allowed host
      return ALLOWED_HOSTS.some(
        (allowed) => refHost === allowed || refHost.endsWith("." + allowed)
      );
    } catch (e) {
      // Malformed referrer — treat as direct
      return false;
    }
  }

  function isEmbeddedInFrame() {
    try {
      return window.self !== window.top;
    } catch (e) {
      // Cross-origin frame — access denied to window.top, so it IS in a frame
      return true;
    }
  }

  function protect() {
    const inFrame = isEmbeddedInFrame();
    const allowed = getAllowedStatus();

    if (!inFrame) {
      // Opened directly in a browser tab → always redirect
      window.location.replace(REDIRECT_URL);
      return;
    }

    if (!allowed) {
      // Embedded in an unauthorized domain → redirect the top frame if possible,
      // otherwise just blank out this frame
      try {
        window.top.location.replace(REDIRECT_URL);
      } catch (e) {
        // Can't navigate top frame (cross-origin restriction)
        window.location.replace(REDIRECT_URL);
      }
      return;
    }

    // All checks passed — allow the player to load normally
  }

  protect();
})();
