const playlist = {
    "primehindi": {
        type: "shaka",
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/bom-nitro/live/dash/enc/igjuwt107o/out/v1/489e489428ce4992b9bd784d6b948ab3/cenc.mpd",
        clearKeys: { "b07e9785466b831915621dc51ed50d3c": "af30a9d18114259f21a3cc9e34ff649d" }
    },
    "primecricket": {
        type: "shaka",
        url: "https://a47live-pv-ta-amazon.akamaized.net/syd-nitro/live/clients/dash-sd/enc/q5sh0joslk/out/v1/a3efd10a95644817a2b8dff0c33b1b61/cenc-sd.mpd",
        clearKeys: { "aaf668d9b6766cd98665bfe90f843751": "aaf668d9b6766cd98665bfe90f843751" }
    },
    "laligatv": {
        type: "shaka",
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/dub-nitro/live/clients/dash/enc/k0duzgfejg/out/v1/70a50b1bda944628b8e7e66ab4069419/cenc.mpd",
        clearKeys: { "620e51b82596475517a27aa425c52280": "2b9ba811e9c5aeafc8ae1b71cdca4d6a" }
    },
    // Removed spaces from these URLs
    "hls1": { 
        type: "shaka",
        url: "https://pull.niues.live/live/stream-400722_lhd.m3u8?auth_key=1770908855-0-0-e4f9e66cd41579f62ade48713084e796"
    },
    "hls2": { 
        type: "shaka",
        url: "https://pull.niur.live/live/stream-491873_lhd.m3u8?txSecret=502577ca7bafb34fc1c7d832cccd03b2&txTime=698e427f"
    },
    "iframe1": {
        type: "iframe",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
};

async function initPlayer() {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
        console.error("Browser not supported!");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('id') || "primehindi";
    const selected = playlist[channelId];

    if (!selected) {
        console.error("Channel not found");
        return;
    }

    const shakaWrapper = document.getElementById('shaka-wrapper');
    const iframeWrapper = document.getElementById('iframe-wrapper');
    const iframe = document.getElementById('external-frame');

    if (selected.type === "iframe") {
        if(shakaWrapper) shakaWrapper.style.display = 'none';
        if(iframeWrapper) {
            iframeWrapper.style.display = 'block';
            iframe.src = selected.url;
        }
    } else {
        const video = document.querySelector('video');
        const player = new shaka.Player(video);
        
        // Setup UI Overlay
        const container = document.querySelector('.shaka-video-container');
        const ui = new shaka.ui.Overlay(player, container, video);

        const config = {
            streaming: { lowLatencyMode: true, useNativeHlsOnSafari: true },
            drm: { clearKeys: selected.clearKeys || {} }
        };

        player.configure(config);

        try {
            await player.load(selected.url.trim()); // Trim just in case
            console.log("Playing:", channelId);
        } catch (e) {
            console.error("Load Error:", e);
        }
    }
}

// Ensure the UI library is ready
document.addEventListener('shaka-ui-loaded', initPlayer);
// Fallback
if (document.readyState === 'complete') { initPlayer(); }
