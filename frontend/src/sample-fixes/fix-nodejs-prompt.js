// Fixed version of your code for Node.js environment
// This version uses readline to properly handle input in Node.js

// For Node.js environment - reads from standard input
const readline = require('readline');

// Create interface for reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get input with a prompt
function getInput(promptText) {
  return new Promise(resolve => {
    rl.question(promptText, answer => {
      resolve(answer);
    });
  });
}

// Main async function to handle your logic
async function main() {
  try {
    // Get number of subjects
    const subjectCount = parseInt(await getInput("Enter the number of subjects: "));
    
    // Process each subject
    let total = 0;
    for (let i = 0; i < subjectCount; i++) {
      const score = parseFloat(await getInput(`Enter score for subject ${i+1}: `));
      total += score;
    }
    
    // Calculate and show the average
    const average = total / subjectCount;
    console.log(`Average score: ${average.toFixed(2)}`);
    
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    // Always close the readline interface when done
    rl.close();
  }
}

// Execute the program
main();
