import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const frontendSrc = 'c:/Users/Afiss/Documents/eshop/frontend/src';
const supplierSrc = 'c:/Users/Afiss/Documents/eshop/supplier-portal/src';

function checkFile(file) {
    if (!file.endsWith('.js') && !file.endsWith('.jsx')) return;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('toast') && !content.includes('import toast') && !content.includes('import { toast }')) {
        console.log(`Missing import in: ${file}`);
        // Let's print lines where toast is used
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('toast') && !line.includes('//')) {
                console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
        });
    }
}

console.log('Checking frontend...');
walkDir(frontendSrc, checkFile);
console.log('Checking supplier-portal...');
walkDir(supplierSrc, checkFile);
