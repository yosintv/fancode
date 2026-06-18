import csv
import json
import os
from collections import defaultdict

INPUT_FILE = "india.csv"
OUTPUT_DIR = "india"

os.makedirs(OUTPUT_DIR, exist_ok=True)

states = defaultdict(list)

# Try cp1252 if utf-8 fails
with open(INPUT_FILE, "r", encoding="cp1252", newline="") as f:
    reader = csv.DictReader(f)

    for row in reader:
        state = row["stateName"].strip().upper()

        states[state].append({
            "officeName": row["officeName"],
            "pincode": row["pincode"],
            "officeType": row["officeType"],
            "deliveryStatus": row["deliveryStatus"],
            "divisionName": row["divisionName"],
            "regionName": row["regionName"],
            "circleName": row["circleName"],
            "taluk": row["taluk"],
            "districtName": row["districtName"],
            "stateName": state
        })

# Write state files
for state, records in states.items():
    filename = (
        state.lower()
        .replace("&", "and")
        .replace(" ", "_")
    ) + ".json"

    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

# Create index.json
index = sorted(
    state.lower().replace("&", "and").replace(" ", "_") + ".json"
    for state in states
)

with open(os.path.join(OUTPUT_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(index, f, indent=2)

print(f"Done! Generated {len(states)} state files.")
