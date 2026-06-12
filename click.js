/**
 * protect.js — Referrer + URL-origin protection for cr7world.pages.dev/shaka
 *
 * Allowed access when ANY of these are true:
 *  1. Page is embedded in a frame AND referrer is from an allowed host
 *  2. Page is embedded in a frame AND the *parent page URL* contains an allowed host
 *     (detected via document.referrer or window.location being linked from allowed src)
 *  3. The current page URL was loaded as a ?src= target from an allowed host
 *     e.g. https://s2.hls-player.net/ft?src=https://cr7world.pages.dev/shaka?id=pc1
 *
 * Direct access (no frame, no allowed referrer) → redirect to https://www.cricfoot.net/
 */

(function () {
  const REDIRECT_URL = "https://www.cricfoot.net/";

  const ALLOWED_HOSTS = [
    "www.cricfoot.net",
    "cricfoot.net",
    "s2.hls-player.net",
    "redirects.pages.dev",
  ];

  function hostIsAllowed(hostname) {
    if (!hostname) return false;
    const h = hostname.toLowerCase();
    return ALLOWED_HOSTS.some((a) => h === a || h.endsWith("." + a));
  }

  function isEmbeddedInFrame() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // cross-origin frame = definitely embedded
    }
  }

  function referrerAllowed() {
    try {
      const ref = document.referrer;
      if (!ref) return false;
      return hostIsAllowed(new URL(ref).hostname);
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if this page's own URL appears as a ?src= (or similar) value
   * inside a parent URL from an allowed host.
   *
   * When s2.hls-player.net embeds us via:
   *   https://s2.hls-player.net/ft?src=https://cr7world.pages.dev/shaka?id=pc1
   * …the referrer will be https://s2.hls-player.net/ft?src=...
   * So referrerAllowed() already covers it IF referrer is sent.
   * This function is the fallback for when referrer is suppressed.
   *
   * Strategy: check if window.location.href is the "src" of a known
   * allowed-host wrapper by inspecting URL params of the referrer.
   */
  function loadedAsSrcParam() {
    try {
      const ref = document.referrer;
      if (!ref) return false;
      const refUrl = new URL(ref);
      // Already handled by referrerAllowed(); this adds src-param check
      const srcParam = refUrl.searchParams.get("src") ||
                       refUrl.searchParams.get("url") ||
                       refUrl.searchParams.get("file") ||
                       refUrl.searchParams.get("stream");
      if (!srcParam) return false;
      // The src param should point to our own domain
      const srcHost = new URL(srcParam).hostname.toLowerCase();
      return srcHost === "cr7world.pages.dev";
    } catch (e) {
      return false;
    }
  }

  /**
   * Last resort: check postMessage origin from parent.
   * Some players send a handshake. We wait 800ms for it.
   */
  function waitForParentHandshake(callback) {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        callback(false);
      }
    }, 800);

    window.addEventListener("message", function handler(e) {
      if (resolved) return;
      try {
        const origin = e.origin ? new URL(e.origin).hostname : "";
        if (hostIsAllowed(origin)) {
          resolved = true;
          clearTimeout(timer);
          window.removeEventListener("message", handler);
          callback(true);
        }
      } catch (_) {}
    });
  }

  function protect() {
    const inFrame = isEmbeddedInFrame();

    // Direct browser tab access → always redirect
    if (!inFrame) {
      window.location.replace(REDIRECT_URL);
      return;
    }

    // Fast path: referrer check passes
    if (referrerAllowed() || loadedAsSrcParam()) {
      return; // ✅ allow
    }

    // Slow path: wait briefly for a postMessage handshake from parent
    waitForParentHandshake(function (trusted) {
      if (!trusted) {
        // No valid signal — redirect
        try {
          window.top.location.replace(REDIRECT_URL);
        } catch (e) {
          window.location.replace(REDIRECT_URL);
        }
      }
      // else: ✅ allow
    });
  }

  protect();
})();
