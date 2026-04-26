import fs from 'fs';
import path from 'path';

const convertControllersToESM = (dir) => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        let content = fs.readFileSync(filePath, 'utf8');
        
        const importedSymbols = new Map(); // Map of modPath -> Set of symbols
        const defaultImports = new Map(); // Map of modPath -> string (default symbol)

        // Capture existing imports
        content = content.replace(/^import { (.*) } from ['"](.*)['"];\r?\n/gm, (match, p1, p2) => {
            const symbols = p1.split(',').map(s => s.trim());
            if (!importedSymbols.has(p2)) importedSymbols.set(p2, new Set());
            symbols.forEach(s => importedSymbols.get(p2).add(s));
            return '';
        });

        // Specific fix for crypto: it should be a default import usually, or we use full import
        // If 'crypto' is in importedSymbols, we'll convert it to default
        if (importedSymbols.has('crypto')) {
            const symbols = importedSymbols.get('crypto');
            if (symbols.has('crypto')) {
                 symbols.delete('crypto');
                 defaultImports.set('crypto', 'crypto');
            }
        }

        // Build deduplicated import block
        let importBlock = '';
        defaultImports.forEach((symbol, modPath) => {
            importBlock += `import ${symbol} from '${modPath}';\n`;
        });
        importedSymbols.forEach((symbols, modPath) => {
            if (symbols.size > 0) {
                const symbolList = Array.from(symbols).join(', ');
                importBlock += `import { ${symbolList} } from '${modPath}';\n`;
            }
        });

        content = importBlock + '\n\n' + content.trim();
        fs.writeFileSync(filePath, content);
    });
};

console.log('Fixing crypto and final deduplication...');
convertControllersToESM('controllers');
console.log('Done.');
