# Google Gemini API Configuration Reference

## ✅ WORKING CONFIGURATION (Last Updated: January 2026)

### Model Name
```
gemini-2.5-flash
```

**CRITICAL:** This is the EXACT model name that works with your API key. DO NOT change it to:
- ❌ `gemini-1.5-flash-latest`
- ❌ `gemini-1.5-flash`
- ❌ `gemini-pro`
- ❌ `gemini-1.5-pro`

### API Key Location
File: `.env.local`
```
GOOGLE_API_KEY=AIzaSyDbp3Y4kBmhJ8XtelWdS5auiwO78G9Py0A
```

**IMPORTANT:** No quotes around the API key!

### SDK Version
File: `package.json`
```json
"@google/generative-ai": "^0.24.1"
```

## How to Verify Your Setup

If chat stops working, run this command to see which models your API key has access to:

```powershell
Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY" -UseBasicParsing
```

Use the FIRST model name from the response (without "models/" prefix).

## Files That Use the Model

1. `src/lib/services/chatService.ts` - Line 13
   ```typescript
   model: "gemini-2.5-flash"
   ```

## Common Issues

### Issue: 404 "model not found"
**Fix:** The model name in `chatService.ts` doesn't match what your API key has access to. Run the verification command above.

### Issue: Chat works then stops after code changes
**Cause:** Git pull or file restore changed the model name
**Fix:** Check `chatService.ts` and restore `gemini-2.5-flash`

### Issue: API key error even though key exists
**Cause:** Quotes around the API key in `.env.local`
**Fix:** Remove quotes - should be `GOOGLE_API_KEY=AIza...` not `GOOGLE_API_KEY="AIza..."`

## Last Known Working State
- Date: January 9, 2026
- Model: `gemini-2.5-flash`
- SDK: `@google/generative-ai@0.24.1`
- Status: ✅ Working perfectly
