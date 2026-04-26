import fs from 'fs';
import path from 'path';

// Final cleanup: ensure all imports come before the router declaration
const finalCleanup = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Collect all import lines
        const importLines = [];
        const nonImportLines = [];
        
        const lines = content.split('\n');
        let routerLineAdded = false;

        for (const line of lines) {
            const trimmed = line.trim().replace(/\r$/, '');
            if (trimmed.startsWith('import ')) {
                importLines.push(trimmed);
            } else if (trimmed === 'const router = express.Router();') {
                // Skip - we'll add it later
            } else {
                nonImportLines.push(line);
            }
        }
        
        // Deduplicate imports
        const seenImports = new Set();
        const dedupedImports = importLines.filter(line => {
            if (seenImports.has(line)) return false;
            seenImports.add(line);
            return true;
        });
        
        // Rebuild: imports first, then router, then rest
        const rebuilt = [
            ...dedupedImports,
            '',
            'const router = express.Router();',
            '',
            ...nonImportLines
        ].join('\n');
        
        // Clean up multiple blank lines
        const cleaned = rebuilt.replace(/\n{3,}/g, '\n\n');
        
        fs.writeFileSync(filePath, cleaned);
    });
};

console.log('Final route cleanup...');
finalCleanup('routes');
console.log('Done.');
