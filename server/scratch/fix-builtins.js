import fs from 'fs';
import path from 'path';

// Fix Node.js built-in modules that must be imported as defaults
const builtins = new Set(['fs', 'path', 'crypto', 'os', 'http', 'https', 'url', 'stream', 'util', 'events', 'child_process', 'readline', 'net', 'dgram', 'dns', 'cluster']);

const fixControllers = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');

        // Find and fix named imports of builtins: import { fs } from 'fs' -> import fs from 'fs'
        content = content.replace(/import { (\w+) } from '(\w+)';/g, (match, p1, p2) => {
            if (builtins.has(p2) && p1 === p2) {
                return `import ${p1} from '${p2}';`;
            }
            return match;
        });

        // Also handle path - if it's being used but not needed, remove the import
        // Check if fs or path are actually used
        const usesFs = content.includes('fs.');
        const usesPath = content.includes('path.');
        const usesCrypto = content.includes('crypto.');

        if (!usesFs) content = content.replace(/import fs from 'fs';\n?/g, '');
        if (!usesPath) content = content.replace(/import path from 'path';\n?/g, '');

        fs.writeFileSync(filePath, content);
    });
};

console.log('Fixing built-in module imports in controllers...');
fixControllers('controllers');
console.log('Done.');
