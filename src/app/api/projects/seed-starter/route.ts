import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Starter projects to auto-seed for new students
const STARTER_PROJECTS = [
    {
        title: "The Fibonacci Trail",
        description: "Search for the hidden mathematical signatures of creation in your own backyard.",
        category: "God's Creation & Science",
        instructions: "1. Head outside and find five different plants or flowers.\n2. Count the petals on each flower.\n3. Look for spiral patterns in pinecones or sunflowers.\n4. Record your findings and see if they match the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13).\n5. Sketch the most perfect spiral you find.",
        materials: ["Notebook", "Pencil", "Magnifying glass"],
        credit_value: 0.5,
        difficulty: "beginner",
        grade_levels: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        approved: true,
        approval_status: 'approved'
    },
    {
        title: "Heritage Seed Saving",
        description: "Preserve the inheritance of the land by saving seeds from your food.",
        category: "Food Systems",
        instructions: "1. Select a heirloom fruit or vegetable (like a tomato or pepper).\n2. Carefully extract the seeds.\n3. Clean and dry them thoroughly on a paper towel.\n4. Research the history of this specific variety.\n5. Design a seed packet with planting instructions and historical notes to share with a neighbor.",
        materials: ["Heirloom produce", "Paper towels", "Small envelopes", "Colored pencils"],
        credit_value: 0.75,
        difficulty: "beginner",
        grade_levels: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        approved: true,
        approval_status: 'approved'
    },
    {
        title: "The Living Archive",
        description: "Connect your own family journey to the broader story of humanity.",
        category: "History",
        instructions: "1. Interview the oldest living member of your family or community.\n2. Record three stories of 'Restored Hope' from their life.\n3. Draw a family tree that stretches back at least 4 generations.\n4. Identify one historical event that impacted your ancestors.\n5. Create a 'Legacy Portfolio' of their advice for your generation.",
        materials: ["Voice recorder (phone)", "Large paper", "Photos (optional)"],
        credit_value: 1.25,
        difficulty: "beginner",
        grade_levels: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        approved: true,
        approval_status: 'approved'
    }
];

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Check if projects already exist in library
        const { data: existing } = await supabase
            .from('library_projects')
            .select('id')
            .limit(1);

        // Only seed library if it's empty
        if (!existing || existing.length === 0) {
            const { error: seedError } = await supabase
                .from('library_projects')
                .insert(STARTER_PROJECTS);

            if (seedError) {
                console.error('Error seeding library:', seedError);
                // Don't fail the whole request if library seeding fails
            }
        } else {
            // If projects exist but aren't approved, approve the starter projects
            await supabase
                .from('library_projects')
                .update({ approved: true, approval_status: 'approved' })
                .in('title', STARTER_PROJECTS.map(p => p.title));
        }

        return NextResponse.json({ success: true, count: STARTER_PROJECTS.length });
    } catch (error) {
        console.error('Seed starter error:', error);
        return NextResponse.json({ error: 'Failed to seed starter projects' }, { status: 500 });
    }
}
