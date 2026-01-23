# Conversational Onboarding Consolidation

**Date:** January 23, 2026
**Status:** Implemented

## Overview

Consolidated the entire user onboarding flow into a single conversational interface. The ConversationalLogin component now handles everything from account creation through placement assessment without any secondary modals or windows.

## Problem

Users were being asked for the same information multiple times:
1. ConversationalLogin asked for email, password, name, role, grade
2. OnboardingModal popped up asking for name, grade, city, state again
3. PlacementAssessment opened in a third window asking for grade yet again

This created a frustrating, redundant experience.

## Solution

**One conversational flow to rule them all:**

ConversationalLogin now handles:
- Email & password (authentication)
- Name
- Role (student/parent/teacher)
- Grade (students only)
- City (students only)
- State (students only)
- Placement assessment (students only, inline)
- Account creation with all data saved at once

**Flow branches based on user type:**
- **Returning users:** email → password → dashboard (2 steps)
- **New teachers/parents:** email → password → name → role → dashboard (4 steps)
- **New students:** email → password → name → role → grade → city → state → placement → dashboard (8 steps + assessment)

## Key Design Decisions

### 1. Inline Placement Assessment

The placement assessment is no longer a separate component. It continues the same conversation:

```typescript
// After state is selected, seamlessly transition to assessment
const startPlacementAssessment = async () => {
  setStep('placement');
  const response = await fetch('/api/placement/start', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'temp', // Account not created yet
      grade: userData.grade,
      state: userData.state
    })
  });

  // Assessment questions appear as normal Adeline messages
  addAdelineMessage(data.firstQuestion);
};
```

Students never know they've transitioned from "onboarding" to "assessment" - it's all just talking to Adeline.

### 2. Save Everything at Once

Previously, profile data was saved in stages. Now everything is collected conversationally, then saved in a single operation when creating the account:

```typescript
const { data: signupData, error } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      role: role === 'parent' ? 'student' : role,
      display_name: userData.name,
      grade_level: userData.grade,
      state_standards: userData.state,
      city: userData.city  // NEW
    }
  }
});
```

### 3. Direct to Dashboard

Removed the `?onboarding=true` URL parameter. After conversational login completes:
- No modal pops up
- No additional questions
- User goes straight to their dashboard
- All onboarding is done

## Implementation Changes

### Files Modified

1. **src/components/ConversationalLogin.tsx**
   - Added `city`, `state`, `placement`, `complete` steps
   - Added `handleCityStep()` function
   - Updated `handleStateSelect()` to start placement
   - Added `startPlacementAssessment()` function
   - Added `handlePlacementResponse()` function
   - Updated `createAccount()` to save city and remove onboarding redirect

2. **src/app/dashboard/DashboardClient.tsx**
   - Removed `OnboardingModal` import
   - Removed `showOnboarding` state
   - Removed URL parameter checking useEffect
   - Removed `<OnboardingModal>` render block

### Files Deleted

1. **src/components/OnboardingModal.tsx** - Functionality moved to ConversationalLogin
2. **src/components/PlacementAssessment.tsx** - Assessment now inline in ConversationalLogin

## User Experience

### Before
1. Chat with Adeline to login ✓
2. Modal pops up asking same questions ✗
3. Another window for placement assessment ✗
4. Finally get to dashboard

### After
1. Chat with Adeline for everything ✓
2. Dashboard ✓

## Technical Notes

- The placement assessment API (`/api/placement/start` and `/api/placement/continue`) remains unchanged
- Profile data structure unchanged, just added `city` field
- Assessment happens before account creation, using temporary `userId: 'temp'`
- After assessment completes, full account is created with all collected data

## Future Considerations

- May want to allow users to skip placement assessment and do it later
- Consider allowing returning users to update their profile info conversationally
- Could add voice mode to conversational login for accessibility

## Testing

Manual testing needed:
- [ ] New student signup (full flow)
- [ ] New teacher signup (shorter flow)
- [ ] New parent signup
- [ ] Returning user login
- [ ] Placement assessment completion
- [ ] Data saves correctly to profiles table
- [ ] No duplicate questions appear
- [ ] Dashboard loads without modals

---

**Result:** Clean, conversational onboarding that feels natural and never repeats questions.
