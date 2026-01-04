import Anthropic from '@anthropic-ai/sdk';
import { GameProject, GameGenerationRequest } from '@/types/learning';
import { sanitizeForPrompt } from '@/lib/sanitize';

export async function generateGameCode(
    request: GameGenerationRequest
): Promise<Omit<GameProject, 'id' | 'student_id' | 'is_public' | 'play_count' | 'created_at' | 'updated_at'>> {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are an expert game developer and educator. Create a self-contained HTML5 Canvas game that teaches: ${sanitizeForPrompt(request.concept)}

REQUIREMENTS:
1. Use only vanilla JavaScript and HTML5 Canvas API
2. Game must be educational and teach the concept clearly
3. Include clear win/lose conditions or learning checkpoints
4. Add score tracking or progress indicators
5. Make it fun, engaging, and age-appropriate
6. Difficulty: ${sanitizeForPrompt(request.difficulty)}
7. Track: ${sanitizeForPrompt(request.track)}
8. Game Type: ${sanitizeForPrompt(request.game_type)}

IMPORTANT CODE STRUCTURE:
The game_code must be a complete, self-contained function that:
- Takes a canvas element as parameter
- Sets up the game context
- Handles all input events
- Runs the game loop
- Cleans up properly when stopped

Example structure:
\`\`\`javascript
function runGame(canvas) {
  const ctx = canvas.getContext('2d');
  let gameRunning = true;
  let score = 0;
  
  // Game state
  const player = { x: 100, y: 100, width: 30, height: 30 };
  
  // Input handling
  const keys = {};
  const keyDownHandler = (e) => { keys[e.key] = true; };
  const keyUpHandler = (e) => { keys[e.key] = false; };
  
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  
  // Game loop
  function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game logic
    if (keys['ArrowRight']) player.x += 5;
    if (keys['ArrowLeft']) player.x -= 5;
    
    // Draw
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Display score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
  
  // Cleanup function
  return () => {
    gameRunning = false;
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
  };
}
\`\`\`

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging game title",
  "description": "What the game teaches (2-3 sentences)",
  "game_code": "Complete JavaScript function as shown above",
  "instructions": "How to play (2-3 sentences)",
  "controls": "Keyboard/mouse controls (e.g., 'Arrow keys to move, Space to jump')",
  "learning_objectives": ["Specific learning objective 1", "Specific learning objective 2"],
  "concepts_taught": ["Concept 1", "Concept 2"],
  "estimated_play_time": "5-10 minutes",
  "difficulty": "${sanitizeForPrompt(request.difficulty)}",
  "primary_track": "${sanitizeForPrompt(request.track)}"
}

Make the game educational, fun, and directly related to ${sanitizeForPrompt(request.concept)}.`;

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
        try {
            const gameData = JSON.parse(content.text);
            return {
                title: gameData.title,
                description: gameData.description,
                game_code: gameData.game_code,
                instructions: gameData.instructions,
                controls: gameData.controls,
                learning_objectives: gameData.learning_objectives,
                primary_track: request.track,
                concepts_taught: gameData.concepts_taught,
                difficulty: request.difficulty,
                estimated_play_time: gameData.estimated_play_time || '5-10 minutes',
            };
        } catch (error) {
            console.error('Failed to parse game JSON:', error);
            throw new Error('Failed to parse generated game data');
        }
    }

    throw new Error('Failed to generate game');
}
