const playlist = {


    //HLS Links Only
    "test": { url: "________"},
    
    "hls1": { url: " https://pull.niues.live/live/stream-400722_lhd.m3u8?auth_key=1770908855-0-0-e4f9e66cd41579f62ade48713084e796 "},
    "hls2": { url: " https://pull.niur.live/live/stream-570313_lhd.m3u8?txSecret=c97e1b5c5946db86c7a6f7c91b58aef8&txTime=698e42f7 "},
    "arsenal": { url: "https://live.vivo200.com/live/hd-en-1-4343201.m3u8?txSecret=576bb095933a947354c43e3fb982ea1b&txTime=698E77A9"},

    
    

"prime": {
    url: "https://a109aivottepl-a.akamaihd.net/syd-nitro/live/clients/dash/enc/bynuls0umq/out/v1/8f460e2902ee422e9ee8229e6de25719/cenc.mpd",
    clearKeys: { "ed76c18710d621a87c89dedc7c13019f": "7241c82fe48525a9dc6be6d7bb86611f" }
},
    
"bein1": {
    url: "https://unifi-live2.secureswiftcontent.com/Content/DASH/Live/channel(Bein1)/master.mpd",
    clearKeys: { "d48b6088253c443eb94d27cb7828f707": "e9776141f9e949273a072b0e035070ab" }
},
    
"spotvhd": {
    url: "https://qp-pldt-live-bpk-01-prod.akamaized.net/bpk-tv/cg_spotvhd/default/index.mpd",
    clearKeys: { "ec7ee27d83764e4b845c48cca31c8eef": "9c0e4191203fccb0fde34ee29999129e" }
},

"nova2sk": {
    url: "https://dash2.antik.sk/stream/nvidia_nova_sport2/playlist_cenc.mpd",
    clearKeys: { "11223344556677889900112233445566": "4b80724d0ef86bcb2c21f7999d67739d" }
},
 
"primehindi": {
    url: "https://a166aivottlinear-a.akamaihd.net/OTTB/bom-nitro/live/dash/enc/igjuwt107o/out/v1/489e489428ce4992b9bd784d6b948ab3/cenc.mpd",
    clearKeys: { "b07e9785466b831915621dc51ed50d3c": "af30a9d18114259f21a3cc9e34ff649d" }
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
