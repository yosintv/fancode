import os
import json
from datetime import datetime, timedelta
from curl_cffi import requests

def get_date_range():
    now = datetime.now()
    active_dates = []
    # -1 (Yesterday) to +5 (Future)
    for i in range(-1, 6):
        date_obj = now + timedelta(days=i)
        active_dates.append(date_obj.strftime("%Y%m%d"))
    return active_dates

def cleanup_old_files(folder, active_dates):
    if not os.path.exists(folder):
        return
    
    files = [f for f in os.listdir(folder) if f.endswith(".json")]
    for filename in files:
        date_part = filename.split(".")[0]
        if date_part not in active_dates:
            file_path = os.path.join(folder, filename)
            try:
                os.remove(file_path)
                print(f"🗑️ Local delete: {filename}")
            except Exception as e:
                print(f"❌ Error: {e}")

def fetch_fotmob(date_str):
    url = f"https://www.fotmob.com/api/data/matches?date={date_str}&timezone=Asia%2FTokyo&ccode3=JPN"
    try:
        r = requests.get(url, impersonate="chrome120", timeout=30)
        return r.json() if r.status_code == 200 else None
    except:
        return None

def run():
    folder = "data"
    if not os.path.exists(folder):
        os.makedirs(folder)

    active_dates = get_date_range()
    
    # 1. Delete old files from the local runner environment
    cleanup_old_files(folder, active_dates)

    # 2. Fetch new data
    for d in active_dates:
        data = fetch_fotmob(d)
        if data:
            with open(os.path.join(folder, f"{d}.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            print(f"✅ Saved: {d}.json")

if __name__ == "__main__":
    run()
