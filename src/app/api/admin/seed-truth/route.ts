import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    try {
        const supabase = await createClient();

        // Insert 3 specific examples into daily_truths
        const truths = [
            {
                topic: 'Biblical',
                title: 'Ekklesia vs Church',
                content: 'The word "church" in English translations comes from the Greek "ekklesia" (ἐκκλησία), which means "assembly" or "gathering of called-out ones." It refers to people, not a building. Understanding this original meaning transforms how we view community and worship.',
                original_text: 'ἐκκλησία',
                translation_notes: 'Means "Assembly", not a building.',
            },
            {
                topic: 'History',
                title: 'The Flexner Report',
                content: 'The 1910 Flexner Report standardized medical education in America, leading to the closure of many homeopathic and naturopathic schools. Funded by the Carnegie Foundation and Rockefeller General Education Board, it established the allopathic model as the sole legitimate medical practice. This report fundamentally reshaped healthcare education and limited medical diversity.',
                original_text: null,
                translation_notes: null,
            },
            {
                topic: 'Science',
                title: 'Lacto-Fermentation',
                content: 'Lacto-fermentation uses beneficial bacteria (Lactobacillus) to preserve food and enhance nutrition. These bacteria convert sugars into lactic acid, creating an environment that prevents spoilage while increasing vitamins and probiotics. This ancient preservation method contrasts with modern pasteurization, which kills both harmful and beneficial microorganisms.',
                original_text: null,
                translation_notes: null,
            },
        ];

        const { error } = await supabase
            .from('daily_truths')
            .insert(truths);

        if (error) {
            console.error('Error seeding truths:', error);
            return NextResponse.json(
                { error: 'Failed to seed truths', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully seeded 3 truth examples',
            count: truths.length,
        });
    } catch (error: any) {
        console.error('Seed truth error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
