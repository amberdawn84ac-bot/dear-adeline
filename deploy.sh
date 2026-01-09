#!/bin/bash
cd "C:/home/claude/dear-adeline"

echo "Checking git status..."
git status

echo ""
echo "Adding all changes..."
git add .

echo ""
echo "Committing changes..."
git commit -m "Fix: Memory amnesia bug, add chat history sidebar, Pinterest-style messages

- Fixed startChat parameter order (tools and history were swapped)
- Added ConversationSidebar component with chat history
- Created API routes for conversation list/load/delete
- Added PinterestMessage component with handwritten styling
- Added ParentChatHistory for parent dashboard
- Updated globals.css with handwriting fonts

All 3 critical bugs are now fixed!"

echo ""
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check GitHub and Vercel for deployment."
