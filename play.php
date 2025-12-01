<?php
// Referer check has been REMOVED — now accessible from anywhere
require 'functions.php';

// Get match ID from query parameter
$matchId = $_GET['id'] ?? null;
$matches = getMatches();
$selectedMatch = null;

if ($matchId && $matches) {
    foreach ($matches as $match) {
        if ($match['match_id'] == $matchId) {
            $selectedMatch = $match;
            break;
        }
    }
}

if (!$selectedMatch) {
    echo "Match not found.";
    exit;
}

// Use proxy to fetch the video URL
$videoUrl = $selectedMatch['adfree_url'];
$proxyUrl = 'proxy.php?url=' . urlencode($videoUrl);
$eventName = $selectedMatch['title'];
?>
<!DOCTYPE html>
<html>
<head>
    <title>JW PLAYER</title>
    <meta content="noindex, nofollow, noarchive" name="robots"/>
    <meta name="referrer" content="no-referrer" />
    <link rel="stylesheet" type="text/css" href="jw.css">
    <script src='https://cdn.jwplayer.com/libraries/MAaRkUjT.js'></script>
    <script src="//content.jwplatform.com/libraries/SAHhwvZq.js"></script>
    <script disable-devtool-auto src='https://cdn.jsdelivr.net/npm/disable-devtool'></script>
    <script>jwplayer.key = "64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn";</script>
    <style>
        body { margin: 0; }
        .jwplayer { position: absolute !important; }
        .jwplayer.jw-flag-aspect-mode { min-height: 100%; max-height: 100%; }
    </style>
</head>
<body>
    <div id="myElement"></div>

    <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", function() {
            jwplayer("myElement").setup({
                width: '100%',
                height: '100%',
                autostart: true,
                fullscreen: true,
                controls: true,
                pipIcon: "enabled",
                volume: 50,
                preload: "auto",
                file: "<?php echo htmlspecialchars($proxyUrl); ?>",
                aspectratio: "16:9",
                stretching: "exactfit",
                logo: {
                    file: "#",
                    link: "#",
                    position: "top-left",
                    margin: "5",
                    hide: true
                },
                captions: {
                    color: '#ffb800',
                    fontSize: 30,
                    backgroundOpacity: 0
                },
                type: "hls",
                primary: "html5",
                hlshtml: true
            });
        });
    </script>
</body>
</html>