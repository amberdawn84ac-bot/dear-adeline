import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { StandardsService, StateStandard } from './standardsService';

// ============================================
// TYPES
// ============================================

export interface LearningPath {
    id: string;
    studentId: string;
    jurisdiction: string;
    gradeLevel: string;
    interests: string[];
    learningStyle: string | null;
    pace: 'accelerated' | 'moderate' | 'relaxed';
    currentFocusArea: string | null;
    currentStandardId: string | null;
    status: 'active' | 'paused' | 'completed';
    pathData: PathStandard[];
    createdAt: string;
    updatedAt: string;
}

export interface PathStandard {
    standardId: string;
    standardCode: string;
    subject: string;
    statementText: string;
    sequenceOrder: number;
    status: 'upcoming' | 'in_progress' | 'completed' | 'skipped';
    interestConnection?: string;
    suggestedApproach?: string;
}

export interface Milestone {
    id: string;
    pathId: string;
    standardId: string;
    sequenceOrder: number;
    status: 'upcoming' | 'in_progress' | 'completed' | 'skipped';
    startedAt: string | null;
    completedAt: string | null;
    approachUsed: string | null;
    interestConnection: string | null;
    engagementScore: number | null;
}

export interface InterestMapping {
    interest: string;
    subject: string;
    approachDescription: string;
    exampleActivity: string;
}

export interface NextFocusSuggestion {
    standardId: string;
    standardCode: string;
    subject: string;
    statementText: string;
    suggestedApproach: string;
    interestConnection: string | null;
    reason: string;
}

export interface AdaptationResult {
    adapted: boolean;
    changes: string[];
    newFocusArea?: string;
    pathUpdated: boolean;
}

export type AdaptationTrigger =
    | 'interest_added'
    | 'choice_made'
    | 'new_info'
    | 'milestone_complete'
    | 'gap_detected'
    | 'explicit_request';

// ============================================
// SERVICE
// ============================================

export class LearningPathService {

    /**
     * Generate a new learning path for a student based on their grade and state
     * Called when we first learn their grade + state during onboarding or profile update
     */
    static async generatePath(
        studentId: string,
        gradeLevel: string,
        jurisdiction: string,
        interests: string[] = [],
        supabaseClient?: SupabaseClient
    ): Promise<LearningPath | null> {
        const supabase = supabaseClient || await createClient();

        try {
            // 1. Get all standards for this grade and jurisdiction
            const { data: standards, error: standardsError } = await supabase
                .from('state_standards')
                .select('*')
                .eq('jurisdiction', jurisdiction)
                .eq('grade_level', gradeLevel)
                .order('subject')
                .order('standard_code');

            if (standardsError) {
                console.error('Error fetching standards:', standardsError);
                return null;
            }

            if (!standards || standards.length === 0) {
                console.warn(`No standards found for ${jurisdiction} grade ${gradeLevel}`);
                return null;
            }

            // 2. Get student's current progress on these standards
            const standardIds = standards.map(s => s.id);
            const { data: progress } = await supabase
                .from('student_standards_progress')
                .select('standard_id, mastery_level')
                .eq('student_id', studentId)
                .in('standard_id', standardIds);

            const progressMap = new Map(
                (progress || []).map(p => [p.standard_id, p.mastery_level])
            );

            // 3. Get interest mappings for personalization
            const interestMappings = await this.getInterestMappings(interests, supabase);

            // 4. Build ordered path - prioritize standards that connect to interests
            const pathData = this.orderStandardsByInterests(
                standards,
                progressMap,
                interestMappings,
                interests
            );

            // 5. Create the learning path record
            const { data: path, error: pathError } = await supabase
                .from('student_learning_paths')
                .upsert({
                    student_id: studentId,
                    jurisdiction,
                    grade_level: gradeLevel,
                    path_data: pathData,
                    interests,
                    current_focus_area: pathData[0]?.subject || null,
                    current_standard_id: pathData[0]?.standardId || null,
                    status: 'active',
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'student_id'
                })
                .select()
                .single();

            if (pathError) {
                console.error('Error creating learning path:', pathError);
                return null;
            }

            // 6. Create milestones for each standard
            const milestones = pathData.map((item, index) => ({
                path_id: path.id,
                standard_id: item.standardId,
                sequence_order: index + 1,
                status: index === 0 ? 'in_progress' : 'upcoming',
                interest_connection: item.interestConnection || null
            }));

            await supabase
                .from('learning_path_milestones')
                .upsert(milestones, {
                    onConflict: 'path_id,standard_id'
                });

            return this.formatPath(path, pathData);
        } catch (error) {
            console.error('Exception generating learning path:', error);
            return null;
        }
    }

    /**
     * Get a student's current learning path
     */
    static async getPath(
        studentId: string,
        supabaseClient?: SupabaseClient
    ): Promise<LearningPath | null> {
        const supabase = supabaseClient || await createClient();

        const { data: path, error } = await supabase
            .from('student_learning_paths')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (error || !path) {
            return null;
        }

        return this.formatPath(path, path.path_data);
    }

    /**
     * Suggest the next focus area for a student
     * Considers current progress, interests, and recent engagement
     */
    static async suggestNextFocus(
        studentId: string,
        supabaseClient?: SupabaseClient
    ): Promise<NextFocusSuggestion | null> {
        const supabase = supabaseClient || await createClient();

        // Get the next upcoming or in-progress milestone
        const { data } = await supabase
            .rpc('get_next_milestone', { p_student_id: studentId });

        if (!data || !data[0]) {
            return null;
        }

        const milestone = data[0];

        // Get the path for interest context
        const path = await this.getPath(studentId, supabase);
        const interests = path?.interests || [];

        // Find an interest connection if possible
        const interestMappings = await this.getInterestMappings(interests, supabase);
        const subjectMappings = interestMappings.filter(
            m => m.subject.toLowerCase() === milestone.subject.toLowerCase()
        );

        const connection = subjectMappings[0];

        return {
            standardId: milestone.standard_id,
            standardCode: milestone.standard_code,
            subject: milestone.subject,
            statementText: milestone.statement_text,
            suggestedApproach: connection?.approachDescription || 'Traditional lesson approach',
            interestConnection: connection?.interest || null,
            reason: connection
                ? `This connects to your interest in ${connection.interest}!`
                : `This is the next standard in your ${milestone.subject} progress.`
        };
    }

    /**
     * Adapt the learning path based on new information
     * Called when: interests added, choices made, new student info, milestones completed
     */
    static async adaptPath(
        studentId: string,
        trigger: AdaptationTrigger,
        context?: {
            newInterests?: string[];
            choiceMade?: string;
            newInfo?: string;
            milestoneId?: string;
            engagementScore?: number;
        },
        supabaseClient?: SupabaseClient
    ): Promise<AdaptationResult> {
        const supabase = supabaseClient || await createClient();
        const changes: string[] = [];
        let pathUpdated = false;

        try {
            // Get current path
            const { data: path, error } = await supabase
                .from('student_learning_paths')
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (error || !path) {
                return { adapted: false, changes: ['No path found'], pathUpdated: false };
            }

            let updatedPathData = [...(path.path_data || [])];
            let updatedInterests = [...(path.interests || [])];
            let newFocusArea = path.current_focus_area;

            // Handle different adaptation triggers
            switch (trigger) {
                case 'interest_added':
                    if (context?.newInterests) {
                        // Add new interests
                        const addedInterests = context.newInterests.filter(
                            i => !updatedInterests.includes(i)
                        );
                        updatedInterests = [...updatedInterests, ...addedInterests];

                        if (addedInterests.length > 0) {
                            changes.push(`Added interests: ${addedInterests.join(', ')}`);

                            // Re-order path to prioritize standards that connect to new interests
                            const mappings = await this.getInterestMappings(updatedInterests, supabase);
                            updatedPathData = this.reorderPathByInterests(
                                updatedPathData,
                                mappings,
                                updatedInterests
                            );
                            changes.push('Reordered path to prioritize interest-connected standards');
                            pathUpdated = true;
                        }
                    }
                    break;

                case 'choice_made':
                    if (context?.choiceMade) {
                        // Student chose a specific topic or approach
                        changes.push(`Noted choice: ${context.choiceMade}`);
                        // Could influence engagement scoring and future recommendations
                    }
                    break;

                case 'new_info':
                    if (context?.newInfo) {
                        // New information about the student (learning style, pace, etc.)
                        changes.push(`Updated based on: ${context.newInfo}`);
                    }
                    break;

                case 'milestone_complete':
                    if (context?.milestoneId) {
                        // Update milestone status and move to next
                        await supabase.rpc('update_milestone_status', {
                            p_milestone_id: context.milestoneId,
                            p_status: 'completed',
                            p_engagement_score: context.engagementScore || null
                        });

                        // Find the next milestone
                        const nextFocus = await this.suggestNextFocus(studentId, supabase);
                        if (nextFocus) {
                            newFocusArea = nextFocus.subject;
                            changes.push(`Completed milestone, moving to: ${nextFocus.standardCode}`);
                        }
                        pathUpdated = true;
                    }
                    break;

                case 'gap_detected':
                    // A learning gap was detected - we might need to insert remedial standards
                    changes.push('Gap detected - considering remediation');
                    break;

                case 'explicit_request':
                    // Student or parent explicitly requested a change
                    changes.push('Adapting based on explicit request');
                    break;
            }

            // Save adaptations
            if (pathUpdated || updatedInterests.length !== path.interests?.length) {
                await supabase
                    .from('student_learning_paths')
                    .update({
                        path_data: updatedPathData,
                        interests: updatedInterests,
                        current_focus_area: newFocusArea,
                        last_adapted_at: new Date().toISOString(),
                        adaptation_count: (path.adaptation_count || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', path.id);

                // Log the adaptation
                await supabase
                    .from('learning_path_adaptations')
                    .insert({
                        path_id: path.id,
                        trigger_type: trigger,
                        trigger_context: context || {},
                        changes_made: { changes },
                        source: 'system'
                    });
            }

            return {
                adapted: changes.length > 0,
                changes,
                newFocusArea,
                pathUpdated
            };
        } catch (error) {
            console.error('Error adapting path:', error);
            return { adapted: false, changes: ['Error during adaptation'], pathUpdated: false };
        }
    }

    /**
     * Add interests to a student's learning path
     */
    static async addInterests(
        studentId: string,
        interests: string[],
        supabaseClient?: SupabaseClient
    ): Promise<AdaptationResult> {
        return this.adaptPath(studentId, 'interest_added', { newInterests: interests }, supabaseClient);
    }

    /**
     * Mark a milestone as complete
     */
    static async completeMilestone(
        studentId: string,
        milestoneId: string,
        engagementScore?: number,
        approachUsed?: string,
        supabaseClient?: SupabaseClient
    ): Promise<AdaptationResult> {
        const supabase = supabaseClient || await createClient();

        // Update the milestone first
        if (approachUsed) {
            await supabase
                .from('learning_path_milestones')
                .update({ approach_used: approachUsed })
                .eq('id', milestoneId);
        }

        return this.adaptPath(
            studentId,
            'milestone_complete',
            { milestoneId, engagementScore },
            supabase
        );
    }

    /**
     * Get milestones for a student's path
     */
    static async getMilestones(
        studentId: string,
        status?: 'upcoming' | 'in_progress' | 'completed' | 'skipped',
        supabaseClient?: SupabaseClient
    ): Promise<Milestone[]> {
        const supabase = supabaseClient || await createClient();

        let query = supabase
            .from('learning_path_milestones')
            .select(`
        *,
        student_learning_paths!inner(student_id)
      `)
            .eq('student_learning_paths.student_id', studentId)
            .order('sequence_order');

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching milestones:', error);
            return [];
        }

        return (data || []).map(m => ({
            id: m.id,
            pathId: m.path_id,
            standardId: m.standard_id,
            sequenceOrder: m.sequence_order,
            status: m.status,
            startedAt: m.started_at,
            completedAt: m.completed_at,
            approachUsed: m.approach_used,
            interestConnection: m.interest_connection,
            engagementScore: m.engagement_score
        }));
    }

    /**
     * Get interest-to-standard mappings
     */
    static async getInterestMappings(
        interests: string[],
        supabase: SupabaseClient
    ): Promise<InterestMapping[]> {
        if (!interests.length) return [];

        const { data } = await supabase
            .from('interest_standard_mappings')
            .select('*')
            .in('interest_keyword', interests.map(i => i.toLowerCase()));

        return (data || []).map(m => ({
            interest: m.interest_keyword,
            subject: m.subject,
            approachDescription: m.approach_description,
            exampleActivity: m.example_activity
        }));
    }

    /**
     * Get path summary for display
     */
    static async getPathSummary(
        studentId: string,
        supabaseClient?: SupabaseClient
    ): Promise<{
        totalStandards: number;
        completed: number;
        inProgress: number;
        upcoming: number;
        percentComplete: number;
        currentFocus: string | null;
        interests: string[];
    } | null> {
        const supabase = supabaseClient || await createClient();

        const path = await this.getPath(studentId, supabase);
        if (!path) return null;

        const milestones = await this.getMilestones(studentId, undefined, supabase);

        const completed = milestones.filter(m => m.status === 'completed').length;
        const inProgress = milestones.filter(m => m.status === 'in_progress').length;
        const upcoming = milestones.filter(m => m.status === 'upcoming').length;
        const total = milestones.length;

        return {
            totalStandards: total,
            completed,
            inProgress,
            upcoming,
            percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
            currentFocus: path.currentFocusArea,
            interests: path.interests
        };
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private static orderStandardsByInterests(
        standards: StateStandard[],
        progressMap: Map<string, string>,
        interestMappings: InterestMapping[],
        interests: string[]
    ): PathStandard[] {
        // Create mapping of subject -> interest connections
        const subjectToInterest = new Map<string, { interest: string; approach: string }>();
        for (const mapping of interestMappings) {
            if (!subjectToInterest.has(mapping.subject)) {
                subjectToInterest.set(mapping.subject, {
                    interest: mapping.interest,
                    approach: mapping.approachDescription
                });
            }
        }

        // Build path data with interest connections
        const pathData: PathStandard[] = standards.map((std, index) => {
            const interestInfo = subjectToInterest.get(std.subject);
            const existingProgress = progressMap.get(std.id);

            return {
                standardId: std.id,
                standardCode: std.standard_code,
                subject: std.subject,
                statementText: std.statement_text,
                sequenceOrder: index + 1,
                status: existingProgress === 'mastered' ? 'completed' : 'upcoming',
                interestConnection: interestInfo?.interest,
                suggestedApproach: interestInfo?.approach
            };
        });

        // Sort: prioritize standards with interest connections, then by subject
        return pathData.sort((a, b) => {
            // Completed items go last
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (b.status === 'completed' && a.status !== 'completed') return -1;

            // Interest-connected items come first
            const aHasInterest = a.interestConnection ? 1 : 0;
            const bHasInterest = b.interestConnection ? 1 : 0;
            if (aHasInterest !== bHasInterest) return bHasInterest - aHasInterest;

            // Otherwise maintain subject grouping
            return a.subject.localeCompare(b.subject);
        });
    }

    private static reorderPathByInterests(
        pathData: PathStandard[],
        mappings: InterestMapping[],
        interests: string[]
    ): PathStandard[] {
        // Update interest connections based on new mappings
        const subjectToInterest = new Map<string, { interest: string; approach: string }>();
        for (const mapping of mappings) {
            if (!subjectToInterest.has(mapping.subject)) {
                subjectToInterest.set(mapping.subject, {
                    interest: mapping.interest,
                    approach: mapping.approachDescription
                });
            }
        }

        // Update each item's interest connection
        const updated = pathData.map(item => {
            const interestInfo = subjectToInterest.get(item.subject);
            return {
                ...item,
                interestConnection: interestInfo?.interest || item.interestConnection,
                suggestedApproach: interestInfo?.approach || item.suggestedApproach
            };
        });

        // Re-sort to prioritize newly connected interests
        return updated.sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (b.status === 'completed' && a.status !== 'completed') return -1;

            const aHasInterest = a.interestConnection ? 1 : 0;
            const bHasInterest = b.interestConnection ? 1 : 0;
            if (aHasInterest !== bHasInterest) return bHasInterest - aHasInterest;

            return a.subject.localeCompare(b.subject);
        });
    }

    private static formatPath(dbPath: any, pathData: PathStandard[]): LearningPath {
        return {
            id: dbPath.id,
            studentId: dbPath.student_id,
            jurisdiction: dbPath.jurisdiction,
            gradeLevel: dbPath.grade_level,
            interests: dbPath.interests || [],
            learningStyle: dbPath.learning_style,
            pace: dbPath.pace,
            currentFocusArea: dbPath.current_focus_area,
            currentStandardId: dbPath.current_standard_id,
            status: dbPath.status,
            pathData,
            createdAt: dbPath.created_at,
            updatedAt: dbPath.updated_at
        };
    }
}
