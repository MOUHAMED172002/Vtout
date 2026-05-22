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
    
    // Find all occurrences of the word "toast"
    const toastMatches = [...content.matchAll(/\btoast\b/g)];
    if (toastMatches.length === 0) return;

    // Check if it is imported
    const hasImport = content.includes("from 'react-hot-toast'") || content.includes('from "react-hot-toast"');
    // Check if it is defined locally
    const hasLocalDef = content.includes('const [toast') || content.includes('let toast') || content.includes('const toast');

    if (!hasImport && !hasLocalDef) {
        console.log(`Potential missing import in: ${file}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.match(/\btoast\b/) && !line.includes('import')) {
                console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
        });
    }
}

console.log('Checking frontend for actual missing toast...');
walkDir(frontendSrc, checkFile);
console.log('Checking supplier-portal for actual missing toast...');
walkDir(supplierSrc, checkFile);
