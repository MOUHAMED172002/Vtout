import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        try {
            let stat = fs.statSync(dirPath);
            if (stat.isDirectory()) {
                if (f !== 'node_modules' && f !== '.git' && f !== '.next' && f !== 'dist') {
                    walkDir(dirPath, callback);
                }
            } else {
                callback(dirPath);
            }
        } catch (e) {}
    });
}

const rootDir = 'c:/Users/Afiss/Documents/eshop';
walkDir(rootDir, filePath => {
    if (filePath.endsWith('.log') || filePath.endsWith('.txt')) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('UpdateProduct error') || content.includes('updateProduct error')) {
                console.log(`MATCH in ${filePath}:`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('UpdateProduct error') || line.includes('updateProduct error')) {
                        console.log(`Line ${idx + 1}: ${line}`);
                        // print next 10 lines
                        for (let i = 1; i <= 15; i++) {
                            if (lines[idx + i]) console.log(`  +${i}: ${lines[idx + i]}`);
                        }
                    }
                });
            }
        } catch (e) {}
    }
});
