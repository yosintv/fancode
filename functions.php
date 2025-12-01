<?php
function getMatches() {
    $api_url = 'https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json';
    

    $json = @file_get_contents($api_url);
    if (!$json) {
        return false;
    }
    

    $data = json_decode($json, true);
    if (!$data || !isset($data['matches'])) {
        return false;
    }
    
    return $data['matches'];
}

function getCategoryList($matches) {
    $categories = [];
    foreach ($matches as $match) {
        if (!in_array($match['event_category'], $categories)) {
            $categories[] = $match['event_category'];
        }
    }
    sort($categories);
    return $categories;
}
