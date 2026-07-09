/**
 * protect.js — Referrer + URL-origin protection for cr7world.pages.dev/shaka
 *
 * Allowed access when ANY of these are true:
 *  1. Page is embedded in a frame AND referrer is from an allowed host
 *  2. Page is embedded in a frame AND the *parent page URL* contains an allowed host
 *  3. The current page URL was loaded as a ?src= target from an allowed host
 * Direct access or unauthorized embed → redirect to https://www.yosintv.net/ after 40s
 * https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjqvffrpoSVAxUfslYBHeorFdsQFnoECBYQAQ&url=https%3A%2F%2Fwww.cricfoot.net%2F&usg=AOvVaw2zr7hYbc4BMsU6PRVQlM9z&opi=89978449
 */

(function () {
  const REDIRECT_URL = " https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiX1NPVjI2VAxUsqVYBHf3sMNMQFnoECBYQAQ&url=https%3A%2F%2Fwww.cricfoot.net%2F&usg=AOvVaw2zr7hYbc4BMsU6PRVQlM9z&opi=89978449 ";
  const REDIRECT_DELAY_MS = 22000; // 40 seconds

  const ALLOWED_HOSTS = [
    "www.cricfoot.net",
    "yonotv.online",
    "www.yonotv.online",
    "play8.hls-player.net",
    "cr7.hls-player.net",
    "redirects.pages.dev",
    "suii.pages.dev",
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
      return true;
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

  function loadedAsSrcParam() {
    try {
      const ref = document.referrer;
      if (!ref) return false;
      const refUrl = new URL(ref);
      const srcParam = refUrl.searchParams.get("src") ||
                       refUrl.searchParams.get("url") ||
                       refUrl.searchParams.get("file") ||
                       refUrl.searchParams.get("stream");
      if (!srcParam) return false;
      const srcHost = new URL(srcParam).hostname.toLowerCase();
      return srcHost === "cr7world.pages.dev";
    } catch (e) {
      return false;
    }
  }

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

  function doRedirect() {
    try {
      window.top.location.replace(REDIRECT_URL);
    } catch (e) {
      window.location.replace(REDIRECT_URL);
    }
  }

  function protect() {
    const inFrame = isEmbeddedInFrame();

    // Direct browser tab access → redirect after 40 seconds
    if (!inFrame) {
      setTimeout(() => window.location.replace(REDIRECT_URL), REDIRECT_DELAY_MS);
      return;
    }

    // Fast path: referrer check passes
    if (referrerAllowed() || loadedAsSrcParam()) {
      return; // ✅ allow
    }

    // Slow path: wait briefly for a postMessage handshake from parent
    waitForParentHandshake(function (trusted) {
      if (!trusted) {
        // Unauthorized embed → redirect after 40 seconds
        setTimeout(doRedirect, REDIRECT_DELAY_MS);
      }
      // else: ✅ allow
    });
  }

  protect();
})();
