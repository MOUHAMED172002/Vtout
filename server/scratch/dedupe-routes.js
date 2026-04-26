import fs from 'fs';
import path from 'path';

// Remove duplicate import lines from route files
const dedupeRoutes = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');

        // Split into lines and deduplicate import statements
        const lines = content.split('\n');
        const seenImports = new Set();
        const dedupedLines = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('import ')) {
                // Normalize the line (remove CRLF) for deduplication key
                const key = trimmed.replace(/\r/g, '');
                if (!seenImports.has(key)) {
                    seenImports.add(key);
                    dedupedLines.push(line);
                }
                // Skip duplicates
            } else {
                dedupedLines.push(line);
            }
        }

        // Also make sure const router = express.Router() only appears once after the imports
        let result = dedupedLines.join('\n');
        // Remove all "const router = express.Router();" occurrences 
        result = result.replace(/const router = express\.Router\(\);\r?\n/g, '');
        // Add it back once after all imports
        result = result.replace(/(\nimport[^\n]+\n(?!\nimport))/, (match) => {
            return match + '\nconst router = express.Router();\n';
        });

        fs.writeFileSync(filePath, result);
    });
};

console.log('Deduplicating route files...');
dedupeRoutes('routes');
console.log('Done.');
