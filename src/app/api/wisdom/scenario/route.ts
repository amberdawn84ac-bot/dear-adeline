import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const ageGroup = searchParams.get('ageGroup');

        // Get user's grade level to determine age group if not provided
        let targetAgeGroup = ageGroup;
        if (!targetAgeGroup) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('grade_level')
                .eq('id', user.id)
                .single();

            // Map grade level to age group
            const grade = profile?.grade_level?.toLowerCase() || '';
            if (grade.includes('k') || grade.includes('1') || grade.includes('2')) {
                targetAgeGroup = 'K-2';
            } else if (grade.includes('3') || grade.includes('4') || grade.includes('5')) {
                targetAgeGroup = '3-5';
            } else if (grade.includes('6') || grade.includes('7') || grade.includes('8')) {
                targetAgeGroup = '6-8';
            } else {
                targetAgeGroup = '9-12';
            }
        }

        // Get completed scenario IDs
        const { data: completedResponses } = await supabase
            .from('wisdom_responses')
            .select('scenario_id')
            .eq('student_id', user.id);

        const completedIds = completedResponses?.map(r => r.scenario_id) || [];

        // Get a random scenario for this age group that hasn't been completed
        let query = supabase
            .from('wisdom_scenarios')
            .select('*')
            .eq('age_group', targetAgeGroup);

        if (completedIds.length > 0) {
            query = query.not('id', 'in', `(${completedIds.join(',')})`);
        }

        const { data: scenarios, error } = await query;

        if (error) {
            console.error('Error fetching scenario:', error);
            return NextResponse.json({ error: 'Failed to fetch scenario' }, { status: 500 });
        }

        if (!scenarios || scenarios.length === 0) {
            // All scenarios completed, return a random one
            const { data: allScenarios } = await supabase
                .from('wisdom_scenarios')
                .select('*')
                .eq('age_group', targetAgeGroup);

            if (!allScenarios || allScenarios.length === 0) {
                return NextResponse.json({ scenario: null, message: 'No scenarios available' });
            }

            const randomScenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];
            return NextResponse.json({ scenario: randomScenario, allCompleted: true });
        }

        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        return NextResponse.json({ scenario: randomScenario });

    } catch (error: unknown) {
        console.error('Wisdom scenario error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to fetch wisdom scenario' },
            { status: 500 }
        );
    }
}
