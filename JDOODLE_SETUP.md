# JDoodle API Setup Guide

This guide will help you set up JDoodle API for real code execution in InkCode.

## Why JDoodle?

JDoodle provides a reliable API for executing code in multiple programming languages. Without JDoodle configuration, InkCode can only execute JavaScript locally in the browser, which has limitations for complex code execution.

## Getting Started

### Step 1: Create a JDoodle Account
1. Visit [JDoodle.com](https://www.jdoodle.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Credentials
1. Log into your JDoodle account
2. Go to the API section
3. Copy your **Client ID** and **Client Secret**

### Step 3: Configure InkCode
1. Open `frontend/src/config/jdoodle.js`
2. Replace the placeholder values:
   ```javascript
   export const CODE_EXECUTION_CONFIG = {
     endpoint: 'https://api.jdoodle.com/v1/execute',
     clientId: 'your_actual_client_id_here',     // ← Replace this
     clientSecret: 'your_actual_client_secret_here', // ← Replace this
     timeout: 15000
   };
   ```

### Step 4: Test the Configuration
1. Open InkCode
2. In the terminal, type `status` to check if JDoodle is configured
3. Try executing some code in Python, C++, or other languages

## Supported Languages

With JDoodle configured, InkCode supports:
- JavaScript (Node.js)
- Python 3
- C
- C++
- Java
- PHP
- Ruby
- Go
- Rust
- Kotlin
- Swift
- TypeScript (via Node.js)

## Free Tier Limits

JDoodle's free tier includes:
- 200 API calls per day
- Limited execution time per call
- Basic language support

For production use, consider upgrading to a paid plan.

## Troubleshooting

### Common Issues

1. **"JDoodle API not configured" message**
   - Check that you've replaced the placeholder values in `jdoodle.js`
   - Ensure your credentials are correct

2. **"HTTP error! status: 401" error**
   - Your Client ID or Client Secret is incorrect
   - Double-check your credentials from JDoodle dashboard

3. **"HTTP error! status: 429" error**
   - You've exceeded the daily API limit
   - Wait until the next day or upgrade your plan

4. **Execution timeout**
   - Your code might have an infinite loop
   - JDoodle has execution time limits

### Testing Commands

Use these terminal commands to test your setup:

```bash
status    # Check if JDoodle is configured
config    # Show detailed configuration info
run       # Execute your code
```

## Example Test Code

### Python Pattern Example
```python
rows = 5

# Upper Half
for i in range(1, rows + 1):
    # Print spaces
    print(" " * (rows - i), end="")
    
    # Print numbers with *
    for j in range(1, i + 1):
        print(j, end="")
        if j != i:
            print("*", end="")
    print()

# Lower Half
for i in range(rows - 1, 0, -1):
    # Print spaces
    print(" " * (rows - i), end="")
    
    # Print numbers with *
    for j in range(1, i + 1):
        print(j, end="")
        if j != i:
            print("*", end="")
    print()
```

This should output:
```
    1
   1*2
  1*2*3
 1*2*3*4
1*2*3*4*5
 1*2*3*4
  1*2*3
   1*2
    1
```

## Security Note

Never commit your actual JDoodle credentials to version control. Consider using environment variables for production deployments.
