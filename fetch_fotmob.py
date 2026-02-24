import os
import json
from datetime import datetime, timedelta
from curl_cffi import requests

def get_date_range():
    """
    Calculates the 7-day sliding window:
    Yesterday (-1) through 5 days in the future (+5).
    """
    now = datetime.now()
    active_dates = []
    # Loop from -1 (Yesterday) to +5 (Future)
    for i in range(-1, 6):
        date_obj = now + timedelta(days=i)
        active_dates.append(date_obj.strftime("%Y%m%d"))
    return active_dates

def cleanup_old_files(folder, active_dates):
    """
    Scans the data folder and deletes any JSON file 
    that falls outside the current 7-day active window.
    """
    if not os.path.exists(folder):
        return

    print("🧹 Starting cleanup of old data...")
    files_in_dir = [f for f in os.listdir(folder) if f.endswith(".json")]
    
    for filename in files_in_dir:
        # Extract the YYYYMMDD part from "YYYYMMDD.json"
        date_part = filename.split(".")[0]
        
        if date_part not in active_dates:
            try:
                os.remove(os.path.join(folder, filename))
                print(f"   [-] Deleted: {filename} (Out of date range)")
            except Exception as e:
                print(f"   [!] Error deleting {filename}: {e}")
    print("✨ Cleanup complete.\n")

def fetch_fotmob(date_str):
    """
    Fetches match data from FotMob API for a specific date.
    Impersonates Chrome to avoid bot detection.
    """
    url = f"https://www.fotmob.com/api/data/matches?date={date_str}&timezone=Asia%2FTokyo&ccode3=JPN"
    try:
        # Using curl_cffi to mimic a real browser session
        r = requests.get(url, impersonate="chrome120", timeout=30)
        if r.status_code == 200:
            return r.json()
        
        print(f"   [!] Failed: HTTP {r.status_code} for {date_str}")
        return None
    except Exception as e:
        print(f"   [!] Request error for {date_str}: {e}")
        return None

def run():
    folder = "data"
    
    # Ensure the directory exists
    if not os.path.exists(folder):
        os.makedirs(folder)

    # 1. Determine our current "Valid" window
    active_dates = get_date_range()
    print(f"📅 Active Window: {active_dates[0]} to {active_dates[-1]}")
    print("-" * 40)

    # 2. Run Housekeeping (Delete 20260219, 20260220, 20260221, etc.)
    cleanup_old_files(folder, active_dates)

    # 3. Fetch and Save Data
    for d in active_dates:
        file_path = os.path.join(folder, f"{d}.json")
        
        # Optional: Skip fetching if we already have today's file to save bandwidth
        # If you want fresh data every run, keep it as is.
        print(f"🚀 Processing: {d}")
        data = fetch_fotmob(d)
        
        if data:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            print(f"   [✅] Saved to {file_path}")

if __name__ == "__main__":
    run()
