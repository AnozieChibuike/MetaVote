from playwright.sync_api import sync_playwright
import csv
from bs4 import BeautifulSoup

# URL of the webpage
URL = "https://resources.futo.edu.ng/news/futo-2024-2025-supplementary-batch-b-admission-list/"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Set headless=False for debugging
    page = browser.new_page()
    page.goto(URL)
    
    # Search for "electronic"
    page.get_by_role("searchbox", name="Search:").fill("electron")
    page.wait_for_timeout(2000)  # Allow filtering to apply
    
    # Select 100 entries
    page.get_by_label("Show 102550100 entries").select_option("100")
    page.wait_for_timeout(2000)  # Allow table to update
    
    # Get the updated HTML
    html_content = page.content()
    browser.close()

# Parse the HTML with BeautifulSoup
soup = BeautifulSoup(html_content, "html.parser")
tbody = soup.find("tbody", class_="row-hover")

# Open CSV file for writing
with open("output.csv", "w", newline="", encoding="utf-8") as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(["Name", "RegNo"])  # Write header
    
    # Loop through table rows
    for row in tbody.find_all("tr"):  # Each row
        columns = row.find_all("td")
        if len(columns) >= 4:  # Ensure we have enough columns
            name = columns[2].text.strip()
            reg_no = columns[3].text.strip()
            csv_writer.writerow([name, reg_no])  # Write to CSV

print("CSV file 'output.csv' created successfully!")
