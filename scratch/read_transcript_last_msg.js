import fs from 'fs';
import path from 'path';

const logPath = 'c:/Users/Afiss/.gemini/antigravity/brain/315ed01f-6cb8-43fd-be7b-cfe2a2cb7ca8/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    let lastUserMessage = '';
    for (let i = lines.length - 1; i >= 0; i--) {
        if (!lines[i]) continue;
        try {
            const step = JSON.parse(lines[i]);
            if (step.type === 'USER_INPUT') {
                console.log('--- USER INPUT STEP ---');
                console.log(step.content);
                break;
            }
        } catch (e) {}
    }
} else {
    console.log('Log file not found');
}
