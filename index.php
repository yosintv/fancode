<?php
require 'functions.php';

// Fetch matches
$matches = getMatches();
$upcomingMatches = [];
$liveMatches = [];
$categories = [];

if ($matches) {
    foreach ($matches as $match) {
        if ($match['status'] === 'LIVE') {
            $liveMatches[] = $match;
        } else {
            $upcomingMatches[] = $match;
        }
        if (!in_array($match['event_category'], $categories)) {
            $categories[] = $match['event_category'];
        }
    }
} else {
    echo "Failed to retrieve matches.";
    exit;
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fancode | BuddyXTV</title>
    <link rel="stylesheet" href="style.css">
    <!-- Favicon and Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="https://buddyxiptv.com/logos/logo/appleicons/logo_57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="https://buddyxiptv.com/logos/logo/appleicons/logo_60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="https://buddyxiptv.com/logos/logo/appleicons/logo_72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="https://buddyxiptv.com/logos/logo/appleicons/logo_76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="https://buddyxiptv.com/logos/logo/appleicons/logo_114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="https://buddyxiptv.com/logos/logo/appleicons/logo_120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="https://buddyxiptv.com/logos/logo/appleicons/logo_144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="https://buddyxiptv.com/logos/logo/appleicons/logo_152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://buddyxiptv.com/logos/logo/appleicons/logo_180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="https://buddyxiptv.com/logos/logo/appleicons/logo_192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://buddyxiptv.com/logos/logo/appleicons/logo_32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="https://buddyxiptv.com/logos/logo/appleicons/logo_96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://buddyxiptv.com/logos/logo/appleicons/logo_16x16.png">
</head>
<body>
    <div class="container">
        <header>
            <img src="./assets/fancodelogo.png" alt="Fancode Logo" class="logo">
            <input type="text" id="searchBox" placeholder="Search events..." class="search-box">
            <div class="category-list" id="categoryList">
                <button data-category="all">All</button>
                <button data-category="upcoming">Upcoming</button>
                <?php foreach ($categories as $category): ?>
                    <button data-category="<?php echo htmlspecialchars($category); ?>"><?php echo htmlspecialchars($category); ?></button>
                <?php endforeach; ?>
            </div>
        </header>

        <section>
            <h2>Live Matches</h2>
            <div class="matches-grid" id="liveMatches">
                <?php foreach ($liveMatches as $match): ?>
                    <div class="match-card" data-category="<?php echo htmlspecialchars($match['event_category']); ?>" data-id="<?php echo htmlspecialchars($match['match_id']); ?>" data-status="<?php echo htmlspecialchars($match['status']); ?>" data-adfree-url="<?php echo htmlspecialchars($match['adfree_url']); ?>">
                        <img src="<?php echo htmlspecialchars($match['src']); ?>" alt="<?php echo htmlspecialchars($match['match_name']); ?>">
                        <h3><?php echo htmlspecialchars($match['match_name']); ?></h3>
                        <p><?php echo htmlspecialchars($match['team_1']); ?> vs <?php echo htmlspecialchars($match['team_2']); ?></p>
                        <p class="status-LIVE">Status: <?php echo htmlspecialchars($match['status']); ?></p>
                        <p>Category: <?php echo htmlspecialchars($match['event_category']); ?></p>
                        <p>Start Time: <?php echo htmlspecialchars($match['startTime']); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section>
            <h2>Upcoming Matches</h2>
            <div class="matches-grid" id="upcomingMatches">
                <?php foreach ($upcomingMatches as $match): ?>
                    <div class="match-card" data-category="<?php echo htmlspecialchars($match['event_category']); ?>" data-id="<?php echo htmlspecialchars($match['match_id']); ?>" data-status="<?php echo htmlspecialchars($match['status']); ?>">
                        <img src="<?php echo htmlspecialchars($match['src']); ?>" alt="<?php echo htmlspecialchars($match['match_name']); ?>">
                        <h3><?php echo htmlspecialchars($match['match_name']); ?></h3>
                        <p><?php echo htmlspecialchars($match['team_1']); ?> vs <?php echo htmlspecialchars($match['team_2']); ?></p>
                        <p class="status-UPCOMING">Status: <?php echo htmlspecialchars($match['status']); ?></p>
                        <p>Category: <?php echo htmlspecialchars($match['event_category']); ?></p>
                        <p>Start Time: <?php echo htmlspecialchars($match['startTime']); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>
    </div>

    <script>
        document.getElementById('categoryList').addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                const category = e.target.getAttribute('data-category');
                filterMatches(category);
            }
        });

        document.getElementById('searchBox').addEventListener('input', function() {
            const query = this.value.toLowerCase();
            searchMatches(query);
        });

        function filterMatches(category) {
            const allMatches = document.querySelectorAll('.match-card');
            allMatches.forEach(match => {
                if (category === 'all' || match.getAttribute('data-category') === category || (category === 'upcoming' && match.querySelector('.status-UPCOMING'))) {
                    match.style.display = 'block';
                } else {
                    match.style.display = 'none';
                }
            });
        }

        function searchMatches(query) {
            const allMatches = document.querySelectorAll('.match-card');
            allMatches.forEach(match => {
                const matchName = match.querySelector('h3').textContent.toLowerCase();
                const teams = match.querySelector('p').textContent.toLowerCase();
                if (matchName.includes(query) || teams.includes(query)) {
                    match.style.display = 'block';
                } else {
                    match.style.display = 'none';
                }
            });
        }

        document.querySelectorAll('.match-card').forEach(matchItem => {
            const status = matchItem.getAttribute('data-status');
            const adfreeUrl = matchItem.getAttribute('data-adfree-url');
            const matchId = matchItem.getAttribute('data-id');

            if (status === 'LIVE' && adfreeUrl) {
                matchItem.addEventListener('click', () => {
                    window.location.href = `play.php?id=${matchId}`;
                });
            } else if (status === 'UPCOMING') {
                matchItem.addEventListener('click', () => {
                    alert('This match is UPCOMING.');
                });
            }
        });
    </script>
</body>
</html>