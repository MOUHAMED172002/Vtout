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

const srcDir = 'c:/Users/Afiss/Documents/eshop/frontend/src';
walkDir(srcDir, filePath => {
    if (filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('toast.') && !content.includes('import toast') && !content.includes('import { toast }')) {
            console.log(`MISSING IMPORT: ${filePath}`);
        }
    }
});
