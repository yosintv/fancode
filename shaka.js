const playlist = {


    //HLS Links Only
    "test": { url: "________"},
    
    "hls1": { url: " https://pull.niues.live/live/stream-400722_lhd.m3u8?auth_key=1770908855-0-0-e4f9e66cd41579f62ade48713084e796 "},
    "hls2": { url: " https://pull.niur.live/live/stream-570313_lhd.m3u8?txSecret=c97e1b5c5946db86c7a6f7c91b58aef8&txTime=698e42f7 "},
    "bt1": { url: "https://daffodil.833577.xyz/tnt.m3u8"},

    
    
    "primehindi": {
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/bom-nitro/live/dash/enc/igjuwt107o/out/v1/489e489428ce4992b9bd784d6b948ab3/cenc.mpd",
        clearKeys: { "b07e9785466b831915621dc51ed50d3c": "af30a9d18114259f21a3cc9e34ff649d" }
    },

    "icctv": {
        url: "https://livem-d-01-icc-we.akamaized.net/variant/v1/dai-event-prd-pal-west/vcg-01-d-nodvr/DASH_DASH/Live/channel(vcg-01-ch-hd-02)/manifest.mpd?vcfilter=39d36e9e-3128-45f1-9868-1a5d1d43e6c4",
        clearKeys: { "ae7076b647133606b704d33e4cef5134": "ae7076b647133606b704d33e4cef5134" }
    },

    "laligatv": {
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/dub-nitro/live/clients/dash/enc/k0duzgfejg/out/v1/70a50b1bda944628b8e7e66ab4069419/cenc.mpd",
        clearKeys: { "620e51b82596475517a27aa425c52280": "2b9ba811e9c5aeafc8ae1b71cdca4d6a" }
    }
};

async function initPlayer() {
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported!');
        return;
    }

    const video = document.getElementById('video-element');
    const player = new shaka.Player(video);
    const container = document.getElementById('shaka-wrapper');
    const ui = new shaka.ui.Overlay(player, container, video);

    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('id') || "primehindi";
    const selected = playlist[channelId];

    if (selected) {
        // Optimized Configuration for Stability (Fixes Lag/Stutter)
        player.configure({
            streaming: {
                // Low latency can cause lag on unstable connections, 
                // setting to false or tuning goals helps stability.
                lowLatencyMode: false, 
                bufferingGoal: 30,           // Pre-load 30 seconds of video
                rebufferingGoal: 10,         // Wait until 10s is buffered before resuming after a stall
                bufferBehind: 30,            // Keep 30s of video in memory after playing
                jumpLargeGaps: true,         // Skip over small missing segments instead of freezing
                ignoreTextStreamFailures: true,
                useNativeHlsOnSafari: true
            },
            manifest: {
                retryParameters: {
                    maxAttempts: 5,          // Retry more times if manifest load fails
                    baseDelay: 1000,
                    backoffFactor: 2
                }
            },
            drm: { clearKeys: selected.clearKeys || {} }
        });

        try {
            await player.load(selected.url.trim());
        } catch (e) {
            console.error("Load Error:", e);
        }
    }
}

document.addEventListener('shaka-ui-loaded', initPlayer);
if (document.readyState === 'complete') { initPlayer(); }
