const fs = require('fs');

const logFile = 'C:\\Users\\Afiss\\.gemini\\antigravity\\brain\\c18f407e-1a48-43a9-81a7-a8ef109d7922\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logFile)) {
    console.error('Log file does not exist');
    process.exit(1);
}

const content = fs.readFileSync(logFile, 'utf8');
const lines = content.split('\n');

lines.forEach((line) => {
    if (!line.trim()) return;
    try {
        const obj = JSON.parse(line);
        if (obj.source === 'MODEL' && obj.type === 'PLANNER_RESPONSE' && obj.content) {
            const body = obj.content;
            if (body.includes('1.') && body.includes('2.') && body.includes('3.')) {
                console.log(`\n=================== STEP ${obj.step_index} ===================`);
                console.log(body);
                console.log("=========================================================\n");
            }
        }
    } catch (e) {}
});
