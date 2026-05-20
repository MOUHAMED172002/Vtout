const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === '.qodo') return;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (file.endsWith('.md')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const mdFiles = walk('C:\\Users\\Afiss\\Documents\\eshop');
console.log('Markdown files found:');
mdFiles.forEach(f => console.log(f));
