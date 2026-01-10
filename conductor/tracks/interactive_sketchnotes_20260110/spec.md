# Spec: Interactive Sketchnotes

## 1. User Stories

*   As a user, I want to be able to click on a "sticky note" in a sketchnote to see more details or related concepts, so that I can dive deeper into topics of interest.
*   As a user, I want to be able to request a new version of a sketchnote if I am not satisfied with the current one, so that I can get a visualization that better suits my needs.
*   As a user, I want to save a particularly useful or interesting sketchnote to my personal journal for later review, so that I can build a collection of my favorite visual notes.

## 2. Technical Requirements

*   The `AdelineSketchnote.tsx` component will be modified to handle click events on the individual note elements.
*   A new API endpoint will be created to handle the "get more information" request for a specific note. This may involve another call to the Google AI API.
*   A "Regenerate" button will be added to the sketchnote component. Clicking this button will re-trigger the sketchnote generation process.
*   A "Save to Journal" button will be added. This will require a new API endpoint and a new table in the Supabase database to store saved sketchnotes, linked to a user's profile.

## 3. Acceptance Criteria

*   Clicking on a note in a sketchnote opens a modal or expands the note to show more information.
*   Clicking the "Regenerate" button replaces the current sketchnote with a new one based on the same content.
*   Clicking the "Save to Journal" button saves the sketchnote to the user's journal, and a confirmation is shown.
