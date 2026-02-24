import json
import re
import requests
import os

def update_channel(channel):
    try:
        # 1. Fetch the source HTML
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(channel['source_url'], headers=headers, timeout=15)
        html_content = response.text

        # 2. Extract MPD URL
        mpd_match = re.search(r'["\'](https?://[^\s\'"]+\.mpd.*?)["\']', html_content)
        # 3. Extract keyId and key (looking for 32-character hex strings)
        key_id_match = re.search(r'["\']?keyId["\']?:\s*["\']([a-f0-9]{32})["\']', html_content)
        key_match = re.search(r'["\']?key["\']?:\s*["\']([a-f0-9]{32})["\']', html_content)

        if not (mpd_match and key_id_match and key_match):
            print(f"⚠️ Could not find all data for {channel['name']}")
            return

        mpd_url = mpd_match.group(1)
        key_id = key_id_match.group(1)
        key = key_match.group(1)

        # 4. Update your local template file
        if os.path.exists(channel['template_file']):
            with open(channel['template_file'], "r", encoding="utf-8") as f:
                page = f.read()

            # Replace logic
            page = re.sub(r'"file":\s*".*?"', f'"file": "{mpd_url}"', page)
            page = re.sub(r'"keyId":\s*".*?"', f'"keyId": "{key_id}"', page)
            page = re.sub(r'"key":\s*".*?"', f'"key": "{key}"', page)

            with open(channel['template_file'], "w", encoding="utf-8") as f:
                f.write(page)
            print(f"✅ Successfully updated {channel['name']}")

    except Exception as e:
        print(f"❌ Error processing {channel['name']}: {e}")

with open("channels.json", "r") as f:
    channels = json.load(f)
    for ch in channels:
        update_channel(ch)
