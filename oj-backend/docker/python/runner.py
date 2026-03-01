import sys, os, base64, subprocess

DELIMITER = '---TC_END---'

# 1. Decode user code
code = base64.b64decode(os.environ.get('USER_CODE', '')).decode('utf-8')
with open('/tmp/solution.py', 'w') as f:
    f.write(code)

# 2. Read all stdin
all_input = sys.stdin.read()
blocks = [b for b in all_input.split(DELIMITER + '\n') if b.strip()]

# 3. Run user code once per test case
for block in blocks:
    try:
        result = subprocess.run(
            ['python3', '/tmp/solution.py'],
            input=block,
            capture_output=True,
            text=True,
            timeout=30  # safety net
        )
        sys.stdout.write(result.stdout)
        if result.stderr:
            sys.stderr.write(result.stderr)
    except subprocess.TimeoutExpired:
        sys.stderr.write('Time limit exceeded\n')
    except Exception as e:
        sys.stderr.write(str(e) + '\n')
    sys.stdout.write('\n' + DELIMITER + '\n')
    sys.stdout.flush()
