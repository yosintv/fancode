import json
import re
import requests

def scrape_data():
    # Load your list of sources
    with open("channels.json", "r") as f:
        sources = json.load(f)

    playlist = {}
    headers = {'User-Agent': 'Mozilla/5.0'}

    for item in sources:
        try:
            print(f"Scraping {item['id']}...")
            response = requests.get(item['source_url'], headers=headers, timeout=15)
            html = response.text

            # Regex to find the MPD URL
            mpd_match = re.search(r'["\'](https?://[^\s\'"]+\.mpd.*?)["\']', html)
            # Regex to find keyId and key (32-char hex)
            key_id_match = re.search(r'["\']?keyId["\']?:\s*["\']([a-f0-9]{32})["\']', html)
            key_match = re.search(r'["\']?key["\']?:\s*["\']([a-f0-9]{32})["\']', html)

            if mpd_match and key_id_match and key_match:
                # Construct the entry in your specific format
                playlist[item['id']] = {
                    "url": mpd_match.group(1),
                    "clearKeys": {
                        key_id_match.group(1): key_match.group(1)
                    }
                }
                print(f"✅ Success: {item['id']}")
            else:
                print(f"⚠️ Failed to find data for {item['id']}")

        except Exception as e:
            print(f"❌ Error on {item['id']}: {e}")

    # Write the final JSON file
    with open("updated_playlist.json", "w", encoding="utf-8") as f:
        json.dump(playlist, f, indent=4)

if __name__ == "__main__":
    scrape_data()
