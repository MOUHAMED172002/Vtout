import fs from 'fs';
import path from 'path';

// Pattern: import XController from '...' becomes import { fn1, fn2 } from '...'
// We need to detect default imports from controllers and switch them to named imports based on usage

const fixRoutes = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix default controller imports 
        // e.g. import productController from '...' used as productController.fn() 
        // -> direct usage as individual imported names
        content = content.replace(
            /import (\w+Controller) from '(\.\.\/controllers\/\w+\.js)';/g, 
            (match, controllerAlias, controllerPath) => {
                // Extract the controller name without 'Controller' suffix for actual module usage
                // We'll replace the default import with a wildcard import
                return `import * as ${controllerAlias} from '${controllerPath}';`;
            }
        );

        // Fix duplicate requireAdmin or other middleware imports
        const importedSymbols = new Map();
        content = content.replace(/^import { (.*) } from '(\.\.\/middleware\/.+\.js)';/gm, (match, p1, p2) => {
            const symbols = p1.split(',').map(s => s.trim());
            if (!importedSymbols.has(p2)) importedSymbols.set(p2, new Set());
            symbols.forEach(s => importedSymbols.get(p2).add(s));
            return '';
        });

        // Rebuild middleware imports
        let middlewareImports = '';
        importedSymbols.forEach((symbols, modPath) => {
            middlewareImports += `import { ${Array.from(symbols).join(', ')} } from '${modPath}';\n`;
        });

        // Move the express and router lines to the top
        content = content.replace(/^import express from 'express';\r?\n/gm, '');
        content = content.replace(/^const router = express\.Router\(\);\r?\n/gm, '');

        // Rebuild the clean file
        content = `import express from 'express';\n` + middlewareImports + content.trim();
        content = `import express from 'express';\n${middlewareImports}\nconst router = express.Router();\n\n` + 
                  content.replace(/^import express from 'express';\r?\n/, '').replace(/^const router = express\.Router\(\);\r?\n/, '').trim();

        fs.writeFileSync(filePath, content);
    });
};

console.log('Fixing route files...');
fixRoutes('routes');
console.log('Done.');
