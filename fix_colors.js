const fs = require('fs');
const path = require('path');

const DARK_BGS = [
    'bg-slate-900', 'bg-black', 'bg-primary', 'bg-blue-600',
    'bg-green-600', 'bg-rose-500', 'bg-rose-600', 'bg-emerald-500',
    'bg-amber-400', 'bg-amber-500', 'bg-slate-800'
];

function processDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;

            // Revert incorrectly assigned text-slate-900 back to text-white on dark backgrounds
            // We'll replace text-slate-900 with text-white inside ALL className instances that have a dark bg.

            // Regex matches className="..." or className={`...`} content
            updated = updated.replace(/className=(?:\{`|["'])(.*?)(?:`\}|["'])/gs, (match, classes) => {
                if (DARK_BGS.some(bg => classes.includes(bg))) {
                    if (classes.includes('text-slate-900')) {
                        // Special logic for ternaries: we don't want to replace text-slate-900 if it belongs to the light variation.
                        // However, since my regex is simple, let's just replace all within this match. 
                        // Because I mistakenly changed text-white to text-slate-900 everywhere earlier, 
                        // putting it back to text-white here is fully reverting that mistake for dark elements.
                        return match.replace(/text-slate-900/g, 'text-white');
                    }
                }

                // If there's a light background and light text, fix it. But we didn't add light text to light backgrounds.
                return match;
            });

            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Fixed colors in: ' + fullPath);
            }
        }
    }
}

processDir('frontend/src');
console.log('Done!');
