import json
import os
from collections import defaultdict

INPUT_FILE = "india.csv"
OUTPUT_DIR = "india"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load master JSON file
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# Group records by state
states = defaultdict(list)

for item in data:
    state = item.get("stateName", "").strip().upper()

    if state:
        states[state].append(item)

# Create one JSON file per state
for state, records in states.items():
    filename = (
        state.lower()
        .replace("&", "and")
        .replace(" ", "_")
    ) + ".json"

    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Created: {filepath}")

# Create index.json listing all states
state_files = sorted([
    state.lower().replace("&", "and").replace(" ", "_") + ".json"
    for state in states
])

with open(os.path.join(OUTPUT_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(state_files, f, indent=2)

print(f"\nDone! Generated {len(states)} state files.")
