import { SupabaseClient } from '@supabase/supabase-js';

interface GraduationRequirement {
    id: string;
    category: string;
    credits_needed: number;
}

interface StudentProgress {
    requirement_id: string;
    credits_earned: number;
}

interface DailyPlan {
    id?: string;
    subject: string;
    topic: string;
    description: string;
    activities: any[];
    learning_objectives: string[];
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    target_requirement_id: string;
    estimated_credits: number;
}

export class DailyPlanService {
    /**
     * Get today's lesson plan for a student, or generate one if it doesn't exist
     */
    static async getTodaysPlan(
        studentId: string,
        supabase: SupabaseClient
    ): Promise<DailyPlan | null> {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Check if we already have ANY plan for today (regardless of status)
            const { data: existingPlans } = await supabase
                .from('daily_plans')
                .select('*')
                .eq('student_id', studentId)
                .eq('plan_date', today)
                .order('created_at', { ascending: false })
                .limit(1);

            if (existingPlans && existingPlans.length > 0) {
                console.log(`📅 Found existing plan for ${today}:`, existingPlans[0].topic);
                return existingPlans[0];
            }

            // No plan exists for today, generate a new one
            console.log(`📅 No plan found for ${today}, generating new plan...`);
            return await this.generateDailyPlan(studentId, supabase);
        } catch (error) {
            console.error('Error getting daily plan:', error);
            return null;
        }
    }

    /**
     * Generate a new daily lesson plan based on graduation progress
     */
    static async generateDailyPlan(
        studentId: string,
        supabase: SupabaseClient
    ): Promise<DailyPlan | null> {
        try {
            // Get student profile for state standards
            const { data: profile } = await supabase
                .from('profiles')
                .select('state_standards, grade_level')
                .eq('id', studentId)
                .single();

            const stateStandards = profile?.state_standards || 'oklahoma';
            const gradeLevel = profile?.grade_level || '8th grade';

            // Get graduation requirements
            const { data: requirements } = await supabase
                .from('graduation_requirements')
                .select('*')
                .eq('state_standards', stateStandards);

            if (!requirements || requirements.length === 0) {
                console.warn('No graduation requirements found');
                return null;
            }

            // Get student's current progress
            const { data: progress } = await supabase
                .from('student_graduation_progress')
                .select('requirement_id, credits_earned')
                .eq('student_id', studentId);

            // Calculate which subject needs the most attention
            const needsWork = this.identifyPrioritySubjects(
                requirements,
                progress || []
            );

            if (needsWork.length === 0) {
                console.warn('Student has completed all requirements!');
                return null;
            }

            // Pick the highest priority subject
            const targetSubject = needsWork[0];

            // Generate plan content based on the subject
            const plan = this.generatePlanContent(
                targetSubject,
                gradeLevel
            );

            // Save to database
            const today = new Date().toISOString().split('T')[0];
            const { data: savedPlan, error } = await supabase
                .from('daily_plans')
                .insert({
                    student_id: studentId,
                    plan_date: today,
                    ...plan,
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving daily plan:', error);
                return plan;
            }

            return savedPlan;
        } catch (error) {
            console.error('Error generating daily plan:', error);
            return null;
        }
    }

    /**
     * Identify which subjects need the most work based on graduation progress
     */
    private static identifyPrioritySubjects(
        requirements: GraduationRequirement[],
        progress: StudentProgress[]
    ): Array<GraduationRequirement & { creditsNeeded: number; priority: string }> {
        const progressMap = new Map(
            progress.map(p => [p.requirement_id, p.credits_earned])
        );

        const subjectPriorities = requirements
            .map(req => {
                const earned = progressMap.get(req.id) || 0;
                const needed = req.credits_needed - earned;
                const percentComplete = (earned / req.credits_needed) * 100;

                let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
                if (percentComplete < 25) priority = 'critical';
                else if (percentComplete < 50) priority = 'high';
                else if (percentComplete < 75) priority = 'medium';
                else priority = 'low';

                return {
                    ...req,
                    creditsNeeded: needed,
                    priority,
                    percentComplete,
                };
            })
            .filter(s => s.creditsNeeded > 0)
            .sort((a, b) => {
                // Sort by priority then by credits needed
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                if (priorityOrder[a.priority as keyof typeof priorityOrder] !==
                    priorityOrder[b.priority as keyof typeof priorityOrder]) {
                    return priorityOrder[b.priority as keyof typeof priorityOrder] -
                        priorityOrder[a.priority as keyof typeof priorityOrder];
                }
                return b.creditsNeeded - a.creditsNeeded;
            });

        return subjectPriorities;
    }

    /**
     * Generate specific plan content for a subject
     */
    private static generatePlanContent(
        requirement: GraduationRequirement & { creditsNeeded: number; priority: string },
        gradeLevel: string
    ): Omit<DailyPlan, 'plan_date' | 'student_id'> {
        const subject = requirement.category;

        // Subject-specific lesson templates
        const lessonTemplates: Record<string, any> = {
            'Math': {
                topics: ['Algebra basics', 'Geometry exploration', 'Real-world math problems', 'Pattern recognition', 'Number sense activities'],
                activities: [
                    { type: 'problem_set', title: 'Practice problems', duration: 20 },
                    { type: 'real_world', title: 'Apply math to daily life', duration: 15 },
                    { type: 'discussion', title: 'Talk through solutions', duration: 10 },
                ],
                objectives: ['Understand core concepts', 'Apply problem-solving skills', 'Explain reasoning'],
            },
            "God's Creation & Science": {
                topics: ['Nature observation', 'Scientific method', 'Biology basics', 'Chemistry experiments', 'Physics concepts'],
                activities: [
                    { type: 'observation', title: 'Observe nature', duration: 20 },
                    { type: 'experiment', title: 'Hands-on experiment', duration: 25 },
                    { type: 'reflection', title: 'Reflect on God\'s design', duration: 10 },
                ],
                objectives: ['Explore scientific concepts', 'Practice observation skills', 'Connect science to faith'],
            },
            'English/Lit': {
                topics: ['Creative writing', 'Reading comprehension', 'Grammar practice', 'Poetry analysis', 'Storytelling'],
                activities: [
                    { type: 'reading', title: 'Read for 15 minutes', duration: 15 },
                    { type: 'writing', title: 'Write creatively', duration: 20 },
                    { type: 'discussion', title: 'Discuss themes', duration: 10 },
                ],
                objectives: ['Improve writing skills', 'Develop critical thinking', 'Express ideas clearly'],
            },
            'History': {
                topics: ['Ancient civilizations', 'Historical events', 'Cultural exploration', 'Timeline creation', 'Primary sources'],
                activities: [
                    { type: 'research', title: 'Research a historical period', duration: 20 },
                    { type: 'timeline', title: 'Create a timeline', duration: 15 },
                    { type: 'reflection', title: 'Connect past to present', duration: 10 },
                ],
                objectives: ['Understand historical context', 'Analyze cause and effect', 'Appreciate diverse cultures'],
            },
            'Discipleship': {
                topics: ['Bible study', 'Character development', 'Prayer and reflection', 'Service projects', 'Faith in action'],
                activities: [
                    { type: 'reading', title: 'Read Scripture', duration: 15 },
                    { type: 'reflection', title: 'Journal and pray', duration: 15 },
                    { type: 'application', title: 'Practice faith today', duration: 15 },
                ],
                objectives: ['Grow in faith', 'Develop Christ-like character', 'Serve others'],
            },
        };

        // Get template for this subject or use a generic one
        const template = lessonTemplates[subject] || {
            topics: ['Explore this subject', 'Practice skills', 'Apply knowledge'],
            activities: [
                { type: 'study', title: 'Study the topic', duration: 20 },
                { type: 'practice', title: 'Practice skills', duration: 20 },
                { type: 'apply', title: 'Apply what you learned', duration: 10 },
            ],
            objectives: ['Learn new concepts', 'Build skills', 'Apply knowledge'],
        };

        // Pick a random topic from the template
        const topic = template.topics[Math.floor(Math.random() * template.topics.length)];

        return {
            subject,
            topic: `${subject} - ${topic}`,
            description: `Today we'll explore ${topic.toLowerCase()}. This will help you earn credits toward your ${subject} graduation requirement.`,
            activities: template.activities,
            learning_objectives: template.objectives,
            reason: `You need ${requirement.creditsNeeded.toFixed(2)} more ${subject} credits to graduate. Let's work on this together!`,
            priority: requirement.priority as 'low' | 'medium' | 'high' | 'critical',
            target_requirement_id: requirement.id,
            estimated_credits: 0.005, // Default 30-minute activity = 0.005 credits (about 0.6 hours)
        };
    }

    /**
     * Format a daily plan for presentation to the student
     */
    static formatPlanForChat(plan: DailyPlan): string {
        const priorityEmoji = {
            low: '📘',
            medium: '📙',
            high: '📕',
            critical: '🔴',
        };

        const emoji = priorityEmoji[plan.priority] || '📚';

        return `${emoji} <strong>Today's Learning Plan: ${plan.subject}</strong>

<p><strong>${plan.topic}</strong></p>
<p>${plan.description}</p>

<p><strong>What We'll Do:</strong></p>
<ul>
${plan.activities.map((a: any) => `<li>${a.title} (${a.duration} min)</li>`).join('\n')}
</ul>

<p><strong>Learning Goals:</strong></p>
<ul>
${plan.learning_objectives.map((obj: string) => `<li>${obj}</li>`).join('\n')}
</ul>

<p><em>${plan.reason}</em></p>

<p>Ready to get started, or would you like to learn about something else today?</p>`;
    }

    /**
     * Mark a plan as started
     */
    static async startPlan(planId: string, supabase: SupabaseClient) {
        await supabase
            .from('daily_plans')
            .update({
                status: 'in_progress',
                started_at: new Date().toISOString(),
            })
            .eq('id', planId);
    }

    /**
     * Mark a plan as completed
     */
    static async completePlan(
        planId: string,
        creditsEarned: number,
        supabase: SupabaseClient
    ) {
        const now = new Date();

        // Get the plan to calculate time spent
        const { data: plan } = await supabase
            .from('daily_plans')
            .select('started_at')
            .eq('id', planId)
            .single();

        let timeSpent = 0;
        if (plan?.started_at) {
            const started = new Date(plan.started_at);
            timeSpent = Math.floor((now.getTime() - started.getTime()) / 60000); // minutes
        }

        await supabase
            .from('daily_plans')
            .update({
                status: 'completed',
                completed_at: now.toISOString(),
                credits_earned: creditsEarned,
                time_spent_minutes: timeSpent,
            })
            .eq('id', planId);
    }
}
