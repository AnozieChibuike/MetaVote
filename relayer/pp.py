import csv
import json

# File paths
csv_file = "300.csv"  # Update with your actual file path
json_file = "main300.json"  # Update with your actual file path
output_file = "missing_regNos.txt"

# Read CSV file and extract regNo values
csv_regNos = set()
with open(csv_file, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        csv_regNos.add(row["regNo"].strip())

# Read JSON file and extract regNo values
with open(json_file, encoding='utf-8') as jsonfile:
    json_data = json.load(jsonfile)
    json_regNos = {str(entry["regNo"]).strip() for entry in json_data}

import pprint
# Find missing regNos
print(len(csv_regNos), "_________\n",len(json_regNos))
missing_regNos = csv_regNos - json_regNos

# Write missing regNos to a text file
with open(output_file, "w", encoding="utf-8") as outfile:
    for reg in missing_regNos:
        outfile.write(f"{reg}\n")

print(f"Missing regNos saved in {output_file}")
