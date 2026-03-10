const fs = require('fs');
const path = require('path');

const DARK_BGS = [
    'bg-slate-900', 'bg-black', 'bg-primary', 'bg-blue-600',
    'bg-green-600', 'bg-rose-500', 'bg-rose-600', 'bg-emerald-500',
    'bg-amber-400', 'bg-amber-500', 'bg-slate-800',
    'bg-emerald-600'
];

const HOVER_DARK_BGS = DARK_BGS.map(bg => 'hover:' + bg);

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;

            // 1. Any string (single, double, or backtick) that contains a dark BG and text-slate-900, turn text-slate-900 to text-white
            updated = updated.replace(/(["'`])([^"'`]*?)\1/g, (match, quote, innerString) => {
                let newInner = innerString;

                // If the string has a dark bg
                if (DARK_BGS.some(bg => innerString.includes(bg))) {
                    newInner = newInner.replace(/\btext-slate-900\b/g, 'text-white');
                }

                // If it has a hover state issue (hover:text-slate-900)
                if (newInner.match(/\bhover:text-slate-900\b/)) {
                    // if it has a dark bg or hover dark bg
                    if (DARK_BGS.some(bg => innerString.includes(bg)) || HOVER_DARK_BGS.some(bg => innerString.includes(bg))) {
                        newInner = newInner.replace(/\bhover:text-slate-900\b/g, 'hover:text-white');
                    } else if (innerString.includes('bg-slate-900')) {
                        newInner = newInner.replace(/\bhover:text-slate-900\b/g, 'hover:text-white');
                    }
                }

                // Also fix generic hover:text-slate-900 in context of hover:bg-primary etc.
                if (HOVER_DARK_BGS.some(bg => innerString.includes(bg))) {
                    newInner = newInner.replace(/\bhover:text-slate-900\b/g, 'hover:text-white');
                }

                if (newInner !== innerString) {
                    return quote + newInner + quote;
                }
                return match;
            });

            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Restored whites in: ' + fullPath);
            }
        }
    }
}

processDir('frontend/src');
console.log('Restoration complete!');
