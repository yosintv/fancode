const playlist = {


    "primehindi": {
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/bom-nitro/live/dash/enc/igjuwt107o/out/v1/489e489428ce4992b9bd784d6b948ab3/cenc.mpd",
        clearKeys: { "b07e9785466b831915621dc51ed50d3c": "af30a9d18114259f21a3cc9e34ff649d" }
    },

    "primecricket": {
        url: "https://a47live-pv-ta-amazon.akamaized.net/syd-nitro/live/clients/dash-sd/enc/q5sh0joslk/out/v1/a3efd10a95644817a2b8dff0c33b1b61/cenc-sd.mpd",
        clearKeys: { "aaf668d9b6766cd98665bfe90f843751": "aaf668d9b6766cd98665bfe90f843751" }
    },
    
    "laligatv": {
        url: "https://a166aivottlinear-a.akamaihd.net/OTTB/dub-nitro/live/clients/dash/enc/k0duzgfejg/out/v1/70a50b1bda944628b8e7e66ab4069419/cenc.mpd",
        clearKeys: { "620e51b82596475517a27aa425c52280": "2b9ba811e9c5aeafc8ae1b71cdca4d6a" }
    },


    "hls1": { url:" https://pull.niues.live/live/stream-400722_lhd.m3u8?auth_key=1770908855-0-0-e4f9e66cd41579f62ade48713084e796 "},
    "hls2": { url:" https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8 "}
};

async function initPlayer() {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
        console.error("Browser not supported!");
        return;
    }

    const video = document.querySelector('video');
    const player = new shaka.Player();
    await player.attach(video);
    
    const container = document.querySelector('.shaka-video-container');
    const ui = new shaka.ui.Overlay(player, container, video);

    // Get "id" from URL (?id=name)
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('id') || "primehindi";
    const selectedChannel = playlist[channelId];

    if (selectedChannel) {
        const config = {
            streaming: {
                lowLatencyMode: true,
                useNativeHlsOnSafari: true
            },
            drm: { clearKeys: {} }
        };

        if (selectedChannel.clearKeys) {
            config.drm.clearKeys = selectedChannel.clearKeys;
        }

        player.configure(config);

        try {
            await player.load(selectedChannel.url);
            console.log("Now Playing:", channelId);
        } catch (e) {
            console.error("Error loading stream:", e);
        }
    } else {
        console.error("Channel not found in playlist.");
    }
}

// Start player when DOM is ready
document.addEventListener('shaka-ui-loaded-failed', () => console.error("UI failed to load"));
document.addEventListener('DOMContentLoaded', initPlayer);
