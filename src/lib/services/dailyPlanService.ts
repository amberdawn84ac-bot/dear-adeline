import { SupabaseClient } from '@supabase/supabase-js';
import { StandardsService } from './standardsService';

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
    target_standards?: Array<{ code: string; text: string }>;
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

            // Get unmet standards for this subject and grade
            const subjectMapping: Record<string, string> = {
                'Math': 'Mathematics',
                "God's Creation & Science": 'Science',
                'English/Lit': 'English Language Arts',
                'History': 'History'
            };
            const standardsSubject = subjectMapping[targetSubject.category] || targetSubject.category;

            let targetStandards: Array<{ code: string; text: string }> = [];
            try {
                const unmetStandards = await StandardsService.getUnmetStandards(
                    studentId,
                    stateStandards,
                    gradeLevel.replace(/th|st|nd|rd/, '').trim(), // "8th grade" -> "8"
                    standardsSubject,
                    supabase
                );

                // Pick 2-3 relevant standards
                targetStandards = unmetStandards.slice(0, 3).map(s => ({
                    code: s.standard_code,
                    text: s.statement_text
                }));
            } catch (e) {
                console.warn('Could not fetch standards for daily plan:', e);
            }

            // Initialize plan variable
            let plan: Partial<DailyPlan> & { difficulty?: string } = {};
            let activeProjectFound = false;

            // Check for active projects in Journal (last 7 days)
            try {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const { data: projects } = await supabase
                    .from('spiritual_journal_entries')
                    .select('*')
                    .eq('student_id', studentId)
                    .contains('tags', ['project', 'active']) // Look for active projects
                    .gte('created_at', oneWeekAgo.toISOString())
                    .limit(1);

                if (projects && projects.length > 0) {
                    const activeProject = projects[0];
                    console.log(`🚧 Found active project: ${activeProject.title}`);

                    // Override the plan to focus on the project
                    activeProjectFound = true;
                    plan = {
                        priority: 'high',
                        topic: `${activeProject.title}`,
                        description: `Continue working on your project! Check your Journal for the plan details.`,
                        activities: [{
                            type: 'project_work',
                            title: `Work on ${activeProject.title}`,
                            duration: 45,
                            description: 'Follow the steps in your project plan (see Journal).'
                        }]
                    };
                }
            } catch (e) {
                console.warn('Could not check for active projects:', e);
            }

            // Generate plan content based on the subject (fallback/supplementary)
            const generatedContent = this.generatePlanContent(
                targetSubject,
                gradeLevel,
                targetStandards
            );

            // Merge project focus with generated content if no project was found
            if (!activeProjectFound) {
                plan = { ...generatedContent };
            } else {
                // If we found a project, we still want some structure from the generated content
                // but we keep the project as the main focus
                plan.subject = generatedContent.subject; // Keep the subject needed for graduation
                plan.learning_objectives = [
                    ...generatedContent.learning_objectives,
                    'Apply skills in a real-world project',
                    'Practice self-organized learning'
                ];
                plan.reason = `This project counts toward your ${generatedContent.subject} credits!`;
                plan.target_requirement_id = generatedContent.target_requirement_id;
                plan.estimated_credits = 0.02; // Project work is worth more credits
                plan.target_standards = generatedContent.target_standards; // Keep standards if possible
            }

            // Check for due flashcards (SRS)
            try {
                const { SpacedRepetitionService } = await import('./spacedRepetitionService');
                const srsStats = await SpacedRepetitionService.getStats(studentId, supabase);

                if (srsStats.dueToday > 0) {
                    console.log(`🧠 SRS: ${srsStats.dueToday} cards due. Adding review activity.`);

                    // Add review activity to the beginning of the plan
                    if (!plan.activities) plan.activities = [];
                    plan.activities.unshift({
                        type: 'review',
                        title: `Daily Memory Review (${srsStats.dueToday} cards)`,
                        duration: Math.min(15, Math.ceil(srsStats.dueToday * 1.5)), // ~1.5 mins per card, max 15 mins
                        description: 'Review your flashcards to strengthen your memory.'
                    });

                    if (plan.description) plan.description += ` Plus, you have ${srsStats.dueToday} flashcards to review!`;
                }
            } catch (e) {
                console.warn('Could not fetch SRS stats for daily plan:', e);
            }

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
                return plan as DailyPlan;
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
        gradeLevel: string,
        targetStandards: Array<{ code: string; text: string }> = []
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
            target_standards: targetStandards.length > 0 ? targetStandards : undefined,
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

        let standardsSection = '';
        if (plan.target_standards && plan.target_standards.length > 0) {
            standardsSection = `
<p><strong>📋 Oklahoma Standards:</strong></p>
<ul>
${plan.target_standards.map((std: any) => `<li><code>${std.code}</code>: ${std.text}</li>`).join('\n')}
</ul>
`;
        }

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
${standardsSection}
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
