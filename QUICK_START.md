# Quick Start Guide - New Features

## 🚀 Ready to Use New Features

### 1. Spaced Repetition System (SRS)

#### Create Flashcards from Chat
When Adeline explains something important, suggest creating a flashcard:

```tsx
// In your chat interface component:
const handleCreateFlashcard = async (concept: string, explanation: string) => {
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      front: concept,
      back: explanation,
      type: 'concept',
      source: 'Chat conversation'
    })
  });
};
```

#### Add Review Page
Create a new page: `src/app/review/page.tsx`

```tsx
import SpacedRepetitionReview from '@/components/SpacedRepetitionReview';

export default function ReviewPage() {
  const userId = 'current-user-id'; // Get from auth

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center py-8">
        Daily Review Session
      </h1>
      <SpacedRepetitionReview userId={userId} />
    </div>
  );
}
```

#### Auto-Generate from Lessons
Add this to your lesson generation API:

```typescript
// After lesson is generated
if (lesson.keyPoints) {
  for (const point of lesson.keyPoints) {
    await SpacedRepetitionService.createCard({
      user_id: userId,
      front: point.question,
      back: point.answer,
      type: 'concept',
      subject: lesson.subject,
      source: `${lesson.title} - ${lesson.date}`
    }, supabase);
  }
}
```

---

### 2. Voice-First Learning

#### Add Voice Button to Chat
```tsx
import VoiceChat from '@/components/VoiceChat';

// In your conversation UI:
const [voiceMode, setVoiceMode] = useState(false);

{voiceMode ? (
  <VoiceChat
    userId={userId}
    onMessage={(transcript) => {
      // Send transcript to AI
      handleSendMessage(transcript);
    }}
    autoSpeak={true} // AI responses will be spoken aloud
  />
) : (
  <textarea /* normal text input */ />
)}

<button onClick={() => setVoiceMode(!voiceMode)}>
  {voiceMode ? '⌨️ Switch to Text' : '🎤 Switch to Voice'}
</button>
```

#### Voice Journal Page
Create: `src/app/journal/voice/page.tsx`

```tsx
import { VoiceJournal } from '@/components/VoiceChat';

export default function VoiceJournalPage() {
  return <VoiceJournal userId={currentUserId} />;
}
```

---

### 3. Adaptive Difficulty

#### Integrate into Chat API
In `src/app/api/chat/route.ts`, add after line 46:

```typescript
// Get current difficulty for this subject
const { data: profile } = await supabase
  .from('student_difficulty_profiles')
  .select('current_difficulty')
  .eq('user_id', userId)
  .eq('subject', studentInfo.currentSubject)
  .single();

const difficulty = profile?.current_difficulty || 5;
const difficultyLevel = AdaptiveDifficultyService.getDifficultyLevel(difficulty);

// Add difficulty instruction to system prompt
systemInstruction += '\n\n## DIFFICULTY LEVEL: ' + difficultyLevel.label;
systemInstruction += '\n' + AdaptiveDifficultyService.getDifficultyInstructions(difficultyLevel);
```

#### Track Performance After Response
After AI responds, analyze performance:

```typescript
// Track response time
const responseTime = Date.now() - messageStartTime;

// Calculate engagement
const engagement = AdaptiveDifficultyService.calculateEngagement(
  userPrompt.length,
  messagesPerHour,
  userPrompt.includes('?')
);

// Track difficulty
await AdaptiveDifficultyService.trackDifficulty(
  userId,
  subject,
  difficulty,
  {
    responseTime,
    accuracy: 0.8, // Estimate from conversation quality
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    engagementScore: engagement
  },
  supabase
);
```

---

## 🗄️ Database Setup

### Run Migrations in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each file:
   - `supabase/migrations/20260111_spaced_repetition_system.sql`
   - `supabase/migrations/20260111_adaptive_difficulty_engine.sql`
3. Click "Run"

### Verify Tables Created
```sql
-- Check SRS tables
SELECT * FROM flashcards LIMIT 1;
SELECT * FROM card_reviews LIMIT 1;

-- Check adaptive tables
SELECT * FROM difficulty_history LIMIT 1;
SELECT * FROM student_difficulty_profiles LIMIT 1;
```

---

## 🧪 Testing the Features

### Test SRS Flow
```bash
# 1. Create a card
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "front": "What is the capital of France?",
    "back": "Paris",
    "type": "fact",
    "subject": "Geography"
  }'

# 2. Get due cards
curl "http://localhost:3000/api/flashcards?userId=test-user-id&action=due"

# 3. Review a card (rating: 1=Again, 2=Hard, 3=Good, 4=Easy)
curl -X PATCH http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": "card-id-from-step-2",
    "userId": "test-user-id",
    "rating": 3
  }'

# 4. Check stats
curl "http://localhost:3000/api/flashcards?userId=test-user-id&action=stats"
```

### Test Voice (Browser Only)
1. Open app in Chrome or Edge
2. Navigate to voice page
3. Click microphone button
4. Grant microphone permission
5. Speak: "What is photosynthesis?"
6. Verify transcript appears
7. Verify AI response is spoken aloud

### Test Adaptive Difficulty
```typescript
// In browser console:
const metrics = {
  responseTime: 3000,
  accuracy: 0.95,
  consecutiveCorrect: 5,
  consecutiveIncorrect: 0,
  engagementScore: 0.9
};

// This should recommend difficulty increase
const rec = AdaptiveDifficultyService.analyzePerformance(metrics, 5);
console.log(rec); // { action: 'increase', newDifficulty: { level: 6, ... } }
```

---

## 💡 User-Facing Features to Add

### 1. "Add to Flashcards" Button
After AI explains a concept:
```tsx
<button onClick={() => createFlashcard(concept, explanation)}>
  📚 Save as Flashcard
</button>
```

### 2. Daily Review Reminder
In dashboard:
```tsx
const { data } = await fetch(`/api/flashcards?userId=${userId}&action=stats`);
if (data.stats.dueToday > 0) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      ⏰ You have {data.stats.dueToday} flashcards to review today!
      <button>Start Review</button>
    </div>
  );
}
```

### 3. Voice Mode Toggle
In chat header:
```tsx
<button onClick={() => setVoiceMode(!voiceMode)}>
  {voiceMode ? '⌨️ Text Mode' : '🎤 Voice Mode'}
</button>
```

### 4. Difficulty Indicator
Show current difficulty:
```tsx
<div className="text-sm text-gray-600">
  Current Level: {difficultyLevel.label} ({difficultyLevel.level}/10)
</div>
```

---

## 🎯 Next Steps

1. ✅ Run database migrations
2. ✅ Test SRS API endpoints
3. ✅ Add "Review" link to navigation
4. ✅ Add voice toggle to chat
5. ✅ Enable adaptive difficulty in chat flow
6. ✅ Create daily review reminders
7. ✅ Add flashcard creation buttons throughout app

---

## 📚 Documentation

- Full analysis: `ANALYSIS_AND_IMPROVEMENTS.md`
- Implementation summary: `IMPLEMENTATION_COMPLETE.md`
- Code comments: All services have inline documentation

---

## 🆘 Troubleshooting

### "Voice not supported"
- Use Chrome, Edge, or Safari (not Firefox)
- Ensure HTTPS (or localhost)
- Grant microphone permissions

### "Flashcards not appearing"
- Check database: `SELECT * FROM flashcards WHERE user_id = 'xxx'`
- Verify migrations ran successfully
- Check browser console for errors

### "Difficulty not changing"
- Check: `SELECT * FROM difficulty_history WHERE user_id = 'xxx'`
- Ensure tracking is called after each interaction
- Verify trigger is working: `SELECT * FROM student_difficulty_profiles`

---

**You're all set!** 🎉

Start with the SRS feature - it's the biggest learning impact and easiest to integrate.
