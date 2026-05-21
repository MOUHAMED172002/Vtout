import fs from 'fs';
import path from 'path';

const logPath = 'c:/Users/Afiss/.gemini/antigravity/brain/315ed01f-6cb8-43fd-be7b-cfe2a2cb7ca8/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    lines.forEach((line, idx) => {
        if (!line) return;
        try {
            const step = JSON.parse(line);
            if (step.type === 'USER_INPUT') {
                const content = step.content || '';
                if (content.includes('reste a faire') || content.includes('dashboard de l\'admin')) {
                    console.log(`=== STEP ${idx} ===`);
                    console.log(content);
                    console.log('===================\n');
                }
            }
        } catch (e) {}
    });
} else {
    console.log('Log file not found');
}
