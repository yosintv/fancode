import os
import json
from datetime import datetime, timedelta
from curl_cffi import requests

def get_date_range():
    # Returns a list of dates from Yesterday to 5 days in the future (7 days total)
    now = datetime.now()
    dates = []
    # Start from -1 (Yesterday) to +5 (5 days from now)
    for i in range(-1, 6):
        date_obj = now + timedelta(days=i)
        dates.append(date_obj.strftime("%Y%m%d"))
    return dates

def cleanup_old_files(folder, active_dates):
    # Deletes files that are not in our current 1-week window
    # Specifically targets files older than "Yesterday"
    if not os.path.exists(folder):
        return

    for filename in os.listdir(folder):
        if filename.endswith(".json"):
            date_part = filename.split(".")[0]
            # If the file's date is not in our 7-day window, delete it
            if date_part not in active_dates:
                try:
                    os.remove(os.path.join(folder, filename))
                    print(f"🧹 Deleted old data: {filename}")
                except Exception as e:
                    print(f"[-] Error deleting {filename}: {e}")

def fetch_fotmob(date_str):
    url = f"https://www.fotmob.com/api/data/matches?date={date_str}&timezone=Asia%2FTokyo&ccode3=JPN"
    try:
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

    active_dates = get_date_range()
    
    # 1. Clean up old files (day before yesterday and older)
    cleanup_old_files(folder, active_dates)

    # 2. Fetch new data for the week
    for d in active_dates:
        print(f"🚀 Fetching FotMob data for: {d}")
        data = fetch_fotmob(d)
        
        if data:
            file_path = os.path.join(folder, f"{d}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            print(f"✅ Saved: {file_path}")

if __name__ == "__main__":
    run()
