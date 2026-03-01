#!/bin/sh

DELIMITER="---TC_END---"

# 1. Decode user code and compile ONCE
echo "$USER_CODE" | base64 -d > /workspace/a.cpp
g++ -O2 -o /workspace/a.out /workspace/a.cpp 2>&1

# Check if compilation failed
if [ $? -ne 0 ]; then
    exit 1
fi

# 2. Read all stdin into a file
cat > /workspace/all_input.txt

# 3. Run compiled binary once per test case
# Split input by delimiter and run each block
awk -v delim="$DELIMITER" -v RS="$DELIMITER\n" '{
    if (length($0) > 0) {
        print $0 > "/workspace/tc_input.txt"
        close("/workspace/tc_input.txt")
        system("/workspace/a.out < /workspace/tc_input.txt")
        printf "\n%s\n", delim
    }
}' /workspace/all_input.txt
