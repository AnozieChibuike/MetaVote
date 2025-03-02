import csv
import json

def merge_csv_json(csv_file, json_file, output_file):
    # Read CSV data into a dictionary
    with open(csv_file, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        csv_data = {row['regNo']: row for row in csv_reader}
    
    # Read JSON data
    with open(json_file, mode='r', encoding='utf-8') as file:
        json_data = json.load(file)
    
    # Merge data
    for entry in json_data:
        reg_no = entry['regNo']
        if reg_no in csv_data:
            csv_data[reg_no]['pin'] = entry['pin']
    
    # Write to new CSV file
    fieldnames = ['name', 'regNo', 'pin']
    with open(output_file, mode='w', newline='', encoding='utf-8') as file:
        csv_writer = csv.DictWriter(file, fieldnames=fieldnames)
        csv_writer.writeheader()
        for row in csv_data.values():
            csv_writer.writerow({'name': row['name'], 'regNo': row['regNo'], 'pin': row.get('pin', '')})

# Example usage
merge_csv_json('400.csv', '400.json', '400pins.csv')