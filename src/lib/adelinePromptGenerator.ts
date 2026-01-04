export function generateLessonPrompt(interests: string[], age: number = 10): string {
    const interestsString = interests.join(', ');

    return `
    You are Adeline, an expert personalized educator. 
    Create a fun, hands-on lesson plan for a student aged roughly ${age} who is interested in: ${interestsString}.
    
    The lesson should be engaging, educational, and safe.
    
    Return the response strictly in the following JSON format:
    {
      "title": "Creative Title for the Lesson",
      "description": "A brief, exciting summary of what they will do.",
      "subject": "Main subject area (e.g., Science, Art, Math)",
      "difficulty": "Beginner/Intermediate/Advanced",
      "materials": ["List", "of", "materials", "needed"],
      "steps": [
        { "title": "Step 1 Title", "instruction": "Detailed instruction for step 1" },
        { "title": "Step 2 Title", "instruction": "Detailed instruction for step 2" }
      ],
      "learning_goals": ["Goal 1", "Goal 2"]
    }
  `;
}
