import csv
import json
import os
from collections import defaultdict

# Input CSV file
INPUT_FILE = "india_pincodes.csv"

# Output folder
OUTPUT_DIR = "india"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Store records by state
states = defaultdict(list)

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        state = row["state"].strip()

        states[state].append({
            "pincode": row["pincode"],
            "office_name": row["office_name"],
            "district": row["district"],
            "state": state
        })

# Create one JSON file per state
for state, records in states.items():
    filename = state.lower().replace(" ", "_") + ".json"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"Created {filepath}")

print("Done!")
