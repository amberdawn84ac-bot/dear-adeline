// Core Learning Systems Types

// ============================================
// 8 Tracks Framework
// ============================================

export type Track =
    | 'creation_science'
    | 'health_naturopathy'
    | 'food_systems'
    | 'government_economics'
    | 'justice'
    | 'discipleship'
    | 'history'
    | 'english_literature';

export type CreditArea =
    | 'english_language_arts'
    | 'mathematics'
    | 'science'
    | 'social_studies'
    | 'fine_arts'
    | 'personal_financial_literacy'
    | 'computer_technology'
    | 'physical_education_health';

// ============================================
// Academic Missions (Lesson-to-Portfolio)
// ============================================

export interface AcademicMission {
    id: string;
    student_id: string;
    title: string;
    description: string;

    // 8 Tracks Categorization
    primary_track: Track;
    secondary_tracks?: Track[];

    // Oklahoma Standards Alignment
    credit_areas: CreditArea[];
    oklahoma_standards: string[];
    estimated_credits: number;

    // Learning Structure
    learning_objectives: string[];
    action_plan: ActionStep[];
    skills_checklist: SkillChecklistItem[];

    // Evidence & Assessment
    evidence_prompts: EvidencePrompt[];
    evidence_submissions: Evidence[];

    // Progress Tracking
    status: 'proposed' | 'active' | 'completed' | 'archived';
    progress_percentage: number;
    started_at?: Date;
    completed_at?: Date;

    // Metadata
    conversation_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ActionStep {
    id?: string;
    order: number;
    title: string;
    description: string;
    estimated_time: string;
    completed: boolean;
    completed_at?: Date;
}

export interface SkillChecklistItem {
    id?: string;
    skill_name: string;
    track: Track;
    description: string;
    mastery_level: 'introduced' | 'developing' | 'proficient' | 'mastered';
    evidence_required: boolean;
}

export interface EvidencePrompt {
    id?: string;
    prompt: string;
    evidence_type: 'photo' | 'video' | 'document' | 'reflection' | 'code' | 'artwork';
    required: boolean;
}

export interface Evidence {
    id: string;
    prompt_id: string;
    file_url?: string;
    text_response?: string;
    submitted_at: Date;
}

// ============================================
// Game Lab System
// ============================================

export interface GameProject {
    id: string;
    student_id: string;
    title: string;
    description: string;

    // Game Code
    game_code: string; // Self-contained HTML5 Canvas JavaScript
    instructions: string;
    controls: string;

    // Learning
    learning_objectives: string[];
    primary_track: Track;
    concepts_taught: string[];

    // Metadata
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_play_time: string;
    is_public: boolean;
    play_count: number;

    // Timestamps
    created_at: Date;
    updated_at: Date;
}

export interface GameGenerationRequest {
    concept: string;
    track: Track;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    game_type: 'physics' | 'runner' | 'puzzle' | 'simulation' | 'educational';
}

// ============================================
// Simple Games (GameRenderer)
// ============================================

export type SimpleGameType = 'quiz' | 'matching' | 'wordsearch' | 'fillinblank' | 'truefalse';

export interface QuizGame {
    type: 'quiz';
    content: {
        questions: QuizQuestion[];
    };
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
    explanation?: string;
}

export interface TrueFalseGame {
    type: 'truefalse';
    content: {
        questions: TrueFalseQuestion[];
    };
}

export interface TrueFalseQuestion {
    statement: string;
    correct: boolean;
    explanation?: string;
}

export interface MatchingGame {
    type: 'matching';
    content: {
        pairs: MatchingPair[];
    };
}

export interface MatchingPair {
    left: string;
    right: string;
}

export interface FillInBlankGame {
    type: 'fillinblank';
    content: {
        questions: FillInBlankQuestion[];
    };
}

export interface FillInBlankQuestion {
    question: string;
    answer: string;
}

export type SimpleGame = QuizGame | TrueFalseGame | MatchingGame | FillInBlankGame;

// ============================================
// Helper Functions
// ============================================

export function formatTrack(track: Track): string {
    const trackNames: Record<Track, string> = {
        creation_science: 'Creation & Science',
        health_naturopathy: 'Health & Naturopathy',
        food_systems: 'Food Systems',
        government_economics: 'Government & Economics',
        justice: 'Justice',
        discipleship: 'Discipleship',
        history: 'History',
        english_literature: 'English & Literature',
    };
    return trackNames[track];
}

export function formatCreditArea(area: CreditArea): string {
    const areaNames: Record<CreditArea, string> = {
        english_language_arts: 'English Language Arts',
        mathematics: 'Mathematics',
        science: 'Science',
        social_studies: 'Social Studies',
        fine_arts: 'Fine Arts',
        personal_financial_literacy: 'Personal Financial Literacy',
        computer_technology: 'Computer Technology',
        physical_education_health: 'Physical Education & Health',
    };
    return areaNames[area];
}

export const TRACKS: Track[] = [
    'creation_science',
    'health_naturopathy',
    'food_systems',
    'government_economics',
    'justice',
    'discipleship',
    'history',
    'english_literature',
];

export const CREDIT_AREAS: CreditArea[] = [
    'english_language_arts',
    'mathematics',
    'science',
    'social_studies',
    'fine_arts',
    'personal_financial_literacy',
    'computer_technology',
    'physical_education_health',
];
