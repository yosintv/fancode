import os
import json
from datetime import datetime, timedelta
from curl_cffi import requests

def get_dates():
    # Returns yesterday, today, and tomorrow in YYYYMMDD format
    now = datetime.now()
    dates = [
        (now - timedelta(days=1)).strftime("%Y%m%d"),
        now.strftime("%Y%m%d"),
        (now + timedelta(days=1)).strftime("%Y%m%d")
    ]
    return dates

def fetch_fotmob(date_str):
    # Using the exact URL and params you provided
    url = f"https://www.fotmob.com/api/data/matches?date={date_str}&timezone=Asia%2FTokyo&ccode3=JPN"
    
    try:
        # impersonate="chrome120" handles the TLS fingerprinting
        r = requests.get(url, impersonate="chrome120", timeout=30)
        if r.status_code == 200:
            return r.json()
        print(f"[-] Failed with status {r.status_code} for date {date_str}")
        return None
    except Exception as e:
        print(f"[-] Request error for {date_str}: {e}")
        return None

def run():
    folder = "data"
    if not os.path.exists(folder):
        os.makedirs(folder)

    dates = get_dates()
    
    for d in dates:
        print(f"🚀 Fetching FotMob data for: {d}")
        data = fetch_fotmob(d)
        
        if data:
            file_path = os.path.join(folder, f"{d}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            print(f"✅ Saved: {file_path}")
        else:
            print(f"❌ Failed to get data for {d}")

if __name__ == "__main__":
    run()
