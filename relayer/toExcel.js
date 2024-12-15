const XLSX = require("xlsx");
const fs = require("fs");

// File path for the JSON file
const jsonFilePath = "500.json"; // Replace with your JSON file name

// Read the JSON file
fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the JSON file:", err);
        return;
    }

    try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Convert JSON to worksheet
        const worksheet = XLSX.utils.json_to_sheet(jsonData);

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Write the workbook to an Excel file
        const excelFilePath = "500Level.xlsx";
        XLSX.writeFile(workbook, excelFilePath);

        console.log(`Excel file created: ${excelFilePath}`);
    } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
    }
});
