import fs from 'fs';

async function test() {
    try {
        await import('./models/index.js');
        fs.writeFileSync('dynamic_log.txt', 'Loaded models OK\n');
    } catch (e) {
        fs.writeFileSync('dynamic_log.txt', 'ERROR:\n' + e.stack + '\n');
    }
}

test();
