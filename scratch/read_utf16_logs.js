import fs from 'fs';
import path from 'path';

const logFiles = [
    'c:/Users/Afiss/Documents/eshop/server/server_node_error.log',
    'c:/Users/Afiss/Documents/eshop/server/backend_logs.txt',
    'c:/Users/Afiss/Documents/eshop/server/crash.log',
    'c:/Users/Afiss/Documents/eshop/server/current_server.log'
];

logFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File does not exist: ${file}`);
        return;
    }
    console.log(`\n=== Reading ${path.basename(file)} ===`);
    try {
        const raw = fs.readFileSync(file);
        // Try reading as UTF-16LE, then fallback to UTF-8
        let content = '';
        if (raw[0] === 0xff && raw[1] === 0xfe) {
            content = raw.toString('utf16le');
        } else if (raw[0] === 0xfe && raw[1] === 0xff) {
            content = raw.toString('utf16be');
        } else {
            // Check if it looks like UTF-16LE
            content = raw.toString('utf16le');
            if (content.includes('\u0000') || !content.includes('\n')) {
                content = raw.toString('utf8');
            }
        }
        
        // Find lines with "error" or "exception" or "UpdateProduct"
        const lines = content.split('\n');
        let matchCount = 0;
        lines.forEach((line, idx) => {
            if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.includes('UpdateProduct') || line.includes('91954dad')) {
                if (matchCount < 40) {
                    console.log(`Line ${idx + 1}: ${line.trim()}`);
                }
                matchCount++;
            }
        });
        console.log(`Total matching lines: ${matchCount}`);
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
    }
});
