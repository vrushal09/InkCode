# InkCode AI Setup - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

### 2. Configure Environment
Open `frontend/.env` and add your API key:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### 3. Start the Application
```powershell
cd "d:\College Work\InkCode\frontend"
npm run dev
```

### 4. Test AI Features
1. Open the code editor
2. Click the sparkles icon (✨) in the header
3. Try the AI Assistant with sample code!

## ✨ What You Can Do Now

### Code Analysis
```javascript
function buggyCode() {
    let x = null;
    return x.length; // This will throw an error!
}
```
→ **AI will detect the null reference bug and suggest a fix**

### Natural Language to Code
**Type**: "Create a function that reverses a string"
→ **AI generates working code automatically**

### Security Analysis
```javascript
const query = "SELECT * FROM users WHERE id = " + userId;
```
→ **AI detects SQL injection vulnerability**

### Chat Assistant
**Ask**: "How can I optimize this React component?"
→ **Get personalized optimization suggestions**

## 🛠️ Advanced Setup (Optional)

### Firebase Functions (Server-side AI)
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions
cd "d:\College Work\InkCode\functions"
npm install
firebase deploy --only functions
```

### Set Server-side API Key
```powershell
firebase functions:config:set gemini.api_key="your_api_key_here"
```

## 🔧 Troubleshooting

### "Failed to analyze code"
- Check if your API key is correctly set in `.env`
- Ensure you have internet connection
- Try refreshing the page

### "Too many requests"
- The free tier has rate limits
- Wait a few minutes and try again
- Consider upgrading to a paid plan

### Functions not working
- Make sure you're authenticated: `firebase login`
- Check Firebase console for errors
- Verify project ID in `firebase.json`

## 📚 What's Next?

1. **Read the full documentation**: `AI_INTEGRATION_GUIDE.md`
2. **Try all AI features**: Analysis, Bug Detection, Code Generation
3. **Explore chat functionality**: Ask questions about your code
4. **Share with your team**: Collaborate with AI assistance

---

🎉 **You're ready to code with AI assistance!**

Need help? Check the full documentation or contact support.
