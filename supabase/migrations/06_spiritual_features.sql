-- Spiritual Growth Journal Tables
CREATE TABLE IF NOT EXISTS spiritual_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    prompt TEXT,
    mood TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_student ON spiritual_journal_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_journal_created ON spiritual_journal_entries(created_at DESC);

-- Enable RLS
ALTER TABLE spiritual_journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only view/edit their own entries (truly private)
CREATE POLICY "Students can manage own journal entries"
    ON spiritual_journal_entries
    FOR ALL
    USING (auth.uid() = student_id);

-- Wisdom in Action Tables
CREATE TABLE IF NOT EXISTS wisdom_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    age_group TEXT NOT NULL,
    scenario_text TEXT NOT NULL,
    options JSONB NOT NULL,
    scripture_reference TEXT,
    learning_points TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wisdom_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES wisdom_scenarios(id),
    chosen_option INTEGER NOT NULL,
    reasoning TEXT,
    adeline_feedback TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wisdom_responses_student ON wisdom_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_responses_scenario ON wisdom_responses(scenario_id);

-- Enable RLS
ALTER TABLE wisdom_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view scenarios
CREATE POLICY "Anyone can view wisdom scenarios"
    ON wisdom_scenarios
    FOR SELECT
    USING (true);

-- Policy: Students can view their own responses
CREATE POLICY "Students can view own wisdom responses"
    ON wisdom_responses
    FOR SELECT
    USING (auth.uid() = student_id);

-- Policy: Students can create responses
CREATE POLICY "Students can create wisdom responses"
    ON wisdom_responses
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Seed some initial wisdom scenarios
INSERT INTO wisdom_scenarios (title, description, age_group, scenario_text, options, scripture_reference, learning_points) VALUES
(
    'The Broken Toy',
    'Learning about forgiveness and patience',
    'K-2',
    'Your little brother accidentally broke your favorite toy while you were at school. He says he''s very sorry and didn''t mean to break it. What do you do?',
    '[
        {
            "id": 1,
            "text": "Get very angry and yell at him",
            "wisdom_level": "low",
            "consequence": "Your brother feels very sad, and you both have a bad day.",
            "scripture_connection": "Proverbs 15:1"
        },
        {
            "id": 2,
            "text": "Tell him it''s okay and give him a hug",
            "wisdom_level": "high",
            "consequence": "Your brother feels forgiven, and you both feel happy. Mom is proud of your kind heart.",
            "scripture_connection": "Colossians 3:13"
        },
        {
            "id": 3,
            "text": "Stay quiet but feel upset inside",
            "wisdom_level": "medium",
            "consequence": "You avoid the problem, but the sad feelings stay with you.",
            "scripture_connection": "Ephesians 4:26"
        }
    ]'::jsonb,
    'Colossians 3:13',
    ARRAY['Forgiveness', 'Kindness', 'Family love']
),
(
    'The Lonely Classmate',
    'Learning about inclusion and compassion',
    '3-5',
    'You notice a new student sitting alone at lunch every day. Your friends don''t want to invite them to sit with you because they seem different. What do you do?',
    '[
        {
            "id": 1,
            "text": "Ignore them like your friends do",
            "wisdom_level": "low",
            "consequence": "The new student continues to feel alone and unwelcome.",
            "scripture_connection": "Matthew 25:40"
        },
        {
            "id": 2,
            "text": "Invite them to sit with you anyway",
            "wisdom_level": "high",
            "consequence": "You make a new friend, and they feel welcomed. You showed Jesus'' love.",
            "scripture_connection": "Luke 6:31"
        },
        {
            "id": 3,
            "text": "Smile at them but don''t invite them over",
            "wisdom_level": "medium",
            "consequence": "They feel a little better, but still lonely. You could have done more.",
            "scripture_connection": "James 2:15-16"
        }
    ]'::jsonb,
    'Luke 6:31',
    ARRAY['Compassion', 'Courage', 'Inclusion', 'Golden Rule']
),
(
    'The Homework Dilemma',
    'Learning about honesty and helping others properly',
    '6-8',
    'Your best friend forgot to do their homework and asks if they can copy yours before class starts. They say they''ll get in big trouble if they don''t turn something in. What do you do?',
    '[
        {
            "id": 1,
            "text": "Let them copy your homework",
            "wisdom_level": "low",
            "consequence": "You both get caught cheating. Your friend doesn''t learn the material, and you both lose trust.",
            "scripture_connection": "Proverbs 12:22"
        },
        {
            "id": 2,
            "text": "Offer to help them understand the assignment after school",
            "wisdom_level": "high",
            "consequence": "Your friend learns the material and appreciates your real help. You both grow stronger.",
            "scripture_connection": "Galatians 6:2"
        },
        {
            "id": 3,
            "text": "Tell the teacher they didn''t do it",
            "wisdom_level": "low",
            "consequence": "Your friend gets in trouble and feels betrayed by you.",
            "scripture_connection": "Matthew 18:15"
        }
    ]'::jsonb,
    'Galatians 6:2',
    ARRAY['Honesty', 'True friendship', 'Integrity', 'Helping wisely']
),
(
    'The Social Media Post',
    'Learning about wisdom in digital spaces and reputation',
    '9-12',
    'You see a classmate post something mean about another student on social media. Several of your friends are liking and sharing it. The post is getting a lot of attention. What do you do?',
    '[
        {
            "id": 1,
            "text": "Like and share it too so you fit in",
            "wisdom_level": "low",
            "consequence": "You participate in hurting someone and damage your own character.",
            "scripture_connection": "Proverbs 16:28"
        },
        {
            "id": 2,
            "text": "Privately message the person being hurt to encourage them, and don''t engage with the post",
            "wisdom_level": "high",
            "consequence": "You show Christ-like love and protect someone who is hurting. You stand for what''s right.",
            "scripture_connection": "Proverbs 31:8-9"
        },
        {
            "id": 3,
            "text": "Just scroll past and ignore it",
            "wisdom_level": "medium",
            "consequence": "You don''t make it worse, but you miss a chance to help someone in need.",
            "scripture_connection": "James 4:17"
        }
    ]'::jsonb,
    'Proverbs 31:8-9',
    ARRAY['Digital wisdom', 'Standing up for others', 'Courage', 'Kindness']
);
