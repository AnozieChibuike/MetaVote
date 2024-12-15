const fs = require('fs');
let ik =0
// Function to filter duplicates based on a specific key
function filterDuplicatesByKey(inputFile, outputFile, uniqueKey) {
  // Read the JSON file
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      const uniqueData = [];
      const seenValues = new Set();

      jsonData.forEach(item => {
        if (item[uniqueKey]) {
          if (!seenValues.has(item[uniqueKey])) {
            uniqueData.push(item);
            seenValues.add(item[uniqueKey]);
            ik += 1
          }
        } else {
          uniqueData.push(item); // Include objects without the key
        }
      });

      // Write the filtered data to a new file
      fs.writeFile(outputFile, JSON.stringify(uniqueData, null, 2), err => {
        if (err) {
          console.error('Error writing the file:', err);
        } else {
            console.log(ik)
          console.log('Filtered data has been written to', outputFile);
        }
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
}

// Usage
let inputFile = 'whitelisted.json'; // Your input JSON file
let outputFile = 'white.json'; // Your output JSON file
let uniqueKey = 'registrationNumber'; // Key to filter duplicates
filterDuplicatesByKey(inputFile, outputFile, uniqueKey);

// inputFile = '400.json'; // Your input JSON file
// outputFile = '400-filtered.json'; // Your output JSON file
// uniqueKey = 'registrationNumber'; // Key to filter duplicates
// filterDuplicatesByKey(inputFile, outputFile, uniqueKey);

// inputFile = '500.json'; // Your input JSON file
// outputFile = '500-filtered.json'; // Your output JSON file
// uniqueKey = 'registrationNumber'; // Key to filter duplicates
// filterDuplicatesByKey(inputFile, outputFile, uniqueKey);
