#!/bin/bash

# Create data directory if it doesn't exist
mkdir -p data

# Define dates (YYYYMMDD)
YESTERDAY=$(date -d "yesterday" +%Y%m%d)
TODAY=$(date +%Y%m%d)
TOMORROW=$(date -d "tomorrow" +%Y%m%d)

DATES=($YESTERDAY $TODAY $TOMORROW)

for DATE in "${DATES[@]}"
do
  echo "Fetching data for $DATE..."
  URL="https://www.fotmob.com/api/data/matches?date=$DATE&timezone=Asia%2FTokyo&ccode3=JPN"
  
  # Fetch and save to data/ folder
  curl -s "$URL" > "data/$DATE.json"
done

echo "Done!"
