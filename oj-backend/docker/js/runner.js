const { execFileSync } = require('child_process');
const fs = require('fs');

const DELIMITER = '---TC_END---';

// 1. Decode user code from base64
const code = Buffer.from(process.env.USER_CODE || '', 'base64').toString('utf8');
const wrapper = `
const __input = require('fs').readFileSync(0, 'utf8');
    global.input = __input;
    global.lines = __input.split('\n');
    global.__lineIndex = 0;
    global.readline = () => global.lines[global.__lineIndex++] || '';
`;
fs.writeFileSync('/tmp/solution.js', wrapper + '\n' + code);

// 2. Read all stdin (contains all test case inputs separated by delimiter)
const allInput = fs.readFileSync(0, 'utf8');
const blocks = allInput.split(DELIMITER + '\n').filter(b => b.length > 0);

// 3. Run user code once per test case
for (const block of blocks) {
    try {
        const out = execFileSync('node', ['/tmp/solution.js'], {
            input: block,
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 30000, // safety net — real timeout is Docker-level kill
            maxBuffer: 64 * 1024,
        });
        process.stdout.write(out);
    } catch (e) {
        // If the child process errored, forward stderr
        if (e.stderr && e.stderr.length > 0) process.stderr.write(e.stderr);
        if (e.stdout && e.stdout.length > 0) process.stdout.write(e.stdout);
    }
    process.stdout.write('\n' + DELIMITER + '\n');
}
