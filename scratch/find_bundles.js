import fs from 'fs';
import path from 'path';

function findFile(dir, pattern) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        if (f === 'node_modules' || f === '.git' || f === 'tmp') return;
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            findFile(dirPath, pattern);
        } else if (f.includes(pattern)) {
            console.log(`Found: ${dirPath}`);
        }
    });
}

findFile('c:/Users/Afiss/Documents/eshop', 'Ddn5WnE8');
findFile('c:/Users/Afiss/Documents/eshop', 'BjTDR8nJ');
console.log("Done checking.");
