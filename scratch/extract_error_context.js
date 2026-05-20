const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Afiss', 'Documents', 'eshop', 'frontend', 'dist', 'assets', 'index-Boy6LsNR.js');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log('Total lines:', lines.length);
    
    // Line number 8562 (1-based index)
    const lineIndex = 8562 - 1;
    if (lineIndex < lines.length) {
        const lineContent = lines[lineIndex];
        console.log('Line length:', lineContent.length);
        
        // Column number 99699 (1-based index)
        const colIndex = 99699 - 1;
        const start = Math.max(0, colIndex - 100);
        const end = Math.min(lineContent.length, colIndex + 100);
        
        console.log('Context around col 99699:');
        console.log(lineContent.slice(start, end));
        console.log('Exact position marked with ^:');
        console.log(' '.repeat(colIndex - start) + '^');
    } else {
        console.log('Line index out of bounds');
    }
} catch (err) {
    console.error('Error:', err);
}
