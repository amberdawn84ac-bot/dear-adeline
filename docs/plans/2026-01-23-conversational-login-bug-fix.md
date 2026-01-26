# Conversational Login Bug Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the bug where the login/onboarding flow causes multiple windows to open and repeats questions instead of maintaining a single continuous conversation.

**Architecture:** The bug occurs because:
1. `hasInitialized` ref is local to each component instance - if component remounts, state resets
2. No session-level tracking of whether onboarding has started
3. Multiple component instances can start their own greeting flows independently

**Tech Stack:** Next.js, React, Supabase Auth, sessionStorage for session tracking

---

## Tasks

### Task 1: Add session tracking to prevent duplicate login flows

**Files:**
- Modify: `src/components/ConversationalLogin.tsx:38-94`

**Step 1: Add session storage key constant at top of file**

```javascript
const LOGIN_SESSION_KEY = 'conversational-login-active';
```

**Step 2: Update the initial useEffect to use sessionStorage for tracking**

The current implementation uses a `hasInitialized` ref, but this doesn't persist across component remounts. Replace the initial useEffect with:

```javascript
useEffect(() => {
    console.log('[ConversationalLogin] Component mounted');

    // Check if already in an active login session - prevent duplicate flows
    const sessionActive = sessionStorage.getItem(LOGIN_SESSION_KEY);
    if (sessionActive) {
        console.log('[ConversationalLogin] Session already active, skipping greeting');
        // Still show greeting if there's no messages, but don't add new ones
        if (messages.length === 0) {
            addAdelineMessage("Hi there! I'm Adeline, your learning companion. I'm so excited to meet you!");
            setTimeout(() => {
                addAdelineMessage("Let's get you set up. What's your email address?");
                setStep('email');
            }, 1500);
        }
        return;
    }

    // Mark session as active
    sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
    hasInitialized.current = true;

    const timer1 = setTimeout(() => {
        console.log('[ConversationalLogin] Starting initial greeting');
        addAdelineMessage("Hi there! I'm Adeline, your learning companion. I'm so excited to meet you!");
        setTimeout(() => {
            addAdelineMessage("Let's get you set up. What's your email address?");
            setStep('email');
        }, 1500);
    }, 500);

    return () => {
        console.log('[ConversationalLogin] Cleanup called');
        clearTimeout(timer1);
        // Don't clear session here - let completion handler do it
    };
}, []);
```

**Step 3: Clear session on successful completion**

Add a cleanup function that clears the session key when the user successfully completes onboarding and navigates away. This should be added at the end of the `createAccount` function or in a useEffect that watches the `step` state:

```javascript
// Add this useEffect to clear session on completion
useEffect(() => {
    if (step === 'complete') {
        sessionStorage.removeItem(LOGIN_SESSION_KEY);
        console.log('[ConversationalLogin] Session cleared - onboarding complete');
    }
}, [step]);
```

---

### Task 2: Fix the premature dashboard message bug for new users

**Files:**
- Modify: `src/components/ConversationalLogin.tsx:197-208`

The bug: For new users going through onboarding, the message "Taking you to your dashboard..." appears in the `handlePasswordStep` function at line 197. This message should only appear for RETURNING users (after login), not for new users.

Current problematic code at lines 196-208:
```javascript
if (data.user) {
    addAdelineMessage("Perfect! Taking you to your dashboard...");  // This is wrong for new users
    // ... rest of redirect logic
}
```

Fix: Wrap this message in the `userData.isReturning` check, since it's inside the `if (userData.isReturning)` block but the message itself shouldn't appear for new users:

```javascript
if (userData.isReturning) {
    // Login existing user
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password
        });

        if (error) throw error;

        if (data.user) {
            addAdelineMessage("Perfect! Taking you to your dashboard...");
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            setTimeout(() => {
                if (profile?.role === 'admin') router.push('/dashboard/admin');
                else if (profile?.role === 'teacher') router.push('/dashboard/teacher');
                else router.push('/dashboard');
            }, 1000);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : "That password didn't work. Try again?");
        setLoading(false);
    }
}
```

For new users, continue directly to the name step without the dashboard message.

---

### Task 3: Verify the complete flow works correctly

**Testing steps:**
1. Open login page in fresh browser session
2. Complete full flow: email → password → name → role (student) → grade → city → state → placement assessment → account creation → dashboard
3. Verify:
   - No duplicate windows open during the flow
   - Questions are not repeated
   - "Taking you to your dashboard" only appears once at the very end
   - On successful navigation, sessionStorage is cleared

---

### Task 4: Commit the fix

```bash
git add src/components/ConversationalLogin.tsx
git commit -m "fix: Prevent duplicate login flows with sessionStorage tracking"
```