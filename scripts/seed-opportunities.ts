
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing env vars!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

const OPPORTUNITIES = [
    // --- Science & Research (STEM) ---
    {
        title: "Regeneron Science Talent Search (STS)",
        description: "The nation's oldest and most prestigious science and math competition for high school seniors. Finalists compete for over $1.8 million in awards.",
        type: "contest",
        organization: "Society for Science",
        location: "National (Washington D.C. for finalists)",
        deadline: "2026-11-12", // Updated to future
        amount: "$250,000 top prize",
        source_url: "https://www.societyforscience.org/regeneron-sts/",
        disciplines: ["science", "math", "technology", "engineering"],
        category: "science",
        tags: ["research", "prestigious", "scholarship"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "3-6 months",
        learning_outcomes: ["Research Methodology", "Scientific Writing", "Data Analysis"]
    },
    {
        title: "Google Science Fair",
        description: "A global online science and technology competition open to individuals and teams from ages 13 to 18.",
        type: "contest",
        organization: "Google",
        location: "Global (Online)",
        deadline: "2026-12-15", // Updated to future
        amount: "$50,000 scholarship",
        source_url: "https://www.googlesciencefair.com/",
        disciplines: ["science", "engineering"],
        category: "science",
        tags: ["innovation", "global", "technology"],
        featured: true,
        scope: "international",
        difficulty_level: "advanced",
        estimated_time: "2-4 months",
        learning_outcomes: ["Innovation", "Problem Solving", "Presentation"]
    },
    {
        title: "International Science and Engineering Fair (ISEF)",
        description: "The world's largest international pre-college science competition.",
        type: "contest",
        organization: "Society for Science",
        location: "International",
        deadline: "2026-05-01", // Updated
        amount: "$75,000 top award",
        source_url: "https://www.societyforscience.org/isef/",
        disciplines: ["science", "research"],
        category: "science",
        tags: ["research", "international"],
        featured: true,
        scope: "international",
        difficulty_level: "advanced",
        estimated_time: "6+ months",
        learning_outcomes: ["Scientific Value", "Public Speaking", "Networking"]
    },
    {
        title: "NASA TechRise Student Challenge",
        description: "Student teams design, build, and test experiments for suborbital flight. Winners get $1,500 to build their experiment.",
        type: "contest",
        organization: "NASA",
        location: "National",
        deadline: "2026-10-20", // Updated
        amount: "$1,500 build budget",
        source_url: "https://www.futureengineers.org/nasatechrise",
        disciplines: ["engineering", "space"],
        category: "science",
        tags: ["nasa", "engineering", "hands-on"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "2-3 months",
        learning_outcomes: ["Engineering Design", "Proposal Writing", "Project Management"]
    },
    {
        title: "ExploraVision",
        description: "A science competition that encourages K-12 students to imagine and communicate a vision of future technology.",
        type: "contest",
        organization: "Toshiba / NSTA",
        location: "National",
        deadline: "2026-02-01",
        amount: "$10,000 savings bond",
        source_url: "https://www.exploravision.org/",
        disciplines: ["science", "technology"],
        category: "science",
        tags: ["future", "innovation", "teamwork"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "1-2 months",
        learning_outcomes: ["Creative Thinking", "Research", "Communication"]
    },

    // --- Arts & Writing ---
    {
        title: "Scholastic Art & Writing Awards",
        description: "The nation's longest-running, most prestigious recognition program for creative teens.",
        type: "contest",
        organization: "Scholastic",
        location: "National",
        deadline: "2026-12-01", // Updated
        amount: "$10,000 scholarships",
        source_url: "https://www.artandwriting.org/",
        disciplines: ["art", "writing"],
        category: "art",
        tags: ["creative", "prestigious", "arts"],
        featured: true,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "1-4 weeks",
        learning_outcomes: ["Creative Expression", "Portfolio Building", "Artistic Technique"]
    },
    {
        title: "YoungArts Competition",
        description: "Identifies the most accomplished young artists in the visual, literary, and performing arts.",
        type: "contest",
        organization: "National YoungArts Foundation",
        location: "National",
        deadline: "2026-10-15", // Updated
        amount: "Up to $10,000",
        source_url: "https://youngarts.org/",
        disciplines: ["art", "music", "writing", "dance"],
        category: "art",
        tags: ["arts", "performance", "scholarship"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "1-2 months",
        learning_outcomes: ["Performance", "Artistic Discipline", "Professional Development"]
    },
    {
        title: "The Adroit Journal Summer Mentorship",
        description: "An online literary mentorship program for high school students interested in poetry and prose (fiction/creative nonfiction).",
        type: "mentorship",
        organization: "The Adroit Journal",
        location: "Online",
        deadline: "2026-03-15",
        amount: "Free Mentorship",
        source_url: "https://theadroitjournal.org/mentorship/",
        disciplines: ["writing"],
        category: "writing",
        tags: ["mentorship", "writing", "publication"],
        featured: false,
        scope: "international",
        difficulty_level: "intermediate",
        estimated_time: "2 months (summer)",
        learning_outcomes: ["Creative Writing", "Revision", "Literary Analysis"]
    },
    {
        title: "Doodle for Google",
        description: "Use your imagination to create a Google Doodle based on the theme.",
        type: "contest",
        organization: "Google",
        location: "National",
        deadline: "2026-03-01",
        amount: "$30,000 scholarship",
        source_url: "https://doodles.google.com/d4g/",
        disciplines: ["art", "design"],
        category: "art",
        tags: ["drawing", "design", "scholarship"],
        featured: false,
        scope: "national",
        difficulty_level: "beginner",
        estimated_time: "1 week",
        learning_outcomes: ["Visual Communication", "Creativity", "Design Process"]
    },
    {
        title: "Bennington College Young Writers Awards",
        description: "A major competition for high school students in poetry, fiction, and nonfiction.",
        type: "contest",
        organization: "Bennington College",
        location: "National",
        deadline: "2026-11-01", // Updated
        amount: "$1,000",
        source_url: "https://www.bennington.edu/events-and-programs/young-writers-awards",
        disciplines: ["writing"],
        category: "writing",
        tags: ["poetry", "fiction", "college-prep"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "2-4 weeks",
        learning_outcomes: ["Creative Writing", "Critical Thinking", "Expressive Language"]
    },

    // --- Humanities & Civics ---
    {
        title: "John Locke Institute Essay Competition",
        description: "An essay competition inviting students to explore a wide range of challenging and interesting questions.",
        type: "contest",
        organization: "John Locke Institute",
        location: "International (Oxford, UK for winners)",
        deadline: "2026-06-30",
        amount: "$10,000 in scholarships",
        source_url: "https://www.johnlockeinstitute.com/essay-competition",
        disciplines: ["history", "philosophy", "economics", "politics"],
        category: "history",
        tags: ["essay", "academic", "philosophy"],
        featured: true,
        scope: "international",
        difficulty_level: "advanced",
        estimated_time: "1-2 months",
        learning_outcomes: ["Argumentation", "Critical Analysis", "Academic Writing"]
    },
    {
        title: "United States Senate Youth Program",
        description: "Two student leaders from each state spend a week in Washington usually experiencing the national government in action.",
        type: "program",
        organization: "US Senate",
        location: "Washington D.C.",
        deadline: "2026-10-01", // Updated
        amount: "$10,000 scholarship",
        source_url: "https://ussenateyouth.org/",
        disciplines: ["politics", "government"],
        category: "service",
        tags: ["leadership", "government", "prestigious"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "Application + 1 week",
        learning_outcomes: ["Civic Engagement", "Leadership", "Policy Understanding"]
    },
    {
        title: "Profile in Courage Essay Contest",
        description: "Write an essay on an act of political courage by a U.S. elected official who served during or after 1917.",
        type: "contest",
        organization: "JFK Library Foundation",
        location: "National",
        deadline: "2027-01-16", // Updated
        amount: "$10,000",
        source_url: "https://www.jfklibrary.org/learn/education/profile-in-courage-essay-contest",
        disciplines: ["history", "writing"],
        category: "writing",
        tags: ["essay", "history", "leadership"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "2-3 weeks",
        learning_outcomes: ["Historical Research", "Persuasive Writing", "Political Analysis"]
    },

    // --- Entrepreneurship & Business ---
    {
        title: "Diamond Challenge",
        description: "The world's top entrepreneurship competition for high school students.",
        type: "contest",
        organization: "University of Delaware",
        location: "International",
        deadline: "2027-01-08", // Updated
        amount: "$100,000 total prize pool",
        source_url: "https://diamondchallenge.org/",
        disciplines: ["business", "entrepreneurship"],
        category: "entrepreneurship",
        tags: ["startup", "business", "pitch"],
        featured: true,
        scope: "international",
        difficulty_level: "advanced",
        estimated_time: "2-4 months",
        learning_outcomes: ["Business Planning", "Financial Literacy", "Public Speaking"]
    },
    {
        title: "Blue Ocean Student Entrepreneur Competition",
        description: "A virtual pitch competition where students present their innovative business concepts.",
        type: "contest",
        organization: "Blue Ocean",
        location: "Online",
        deadline: "2026-02-18",
        amount: "Cash prizes",
        source_url: "https://blueoceancompetition.org/",
        disciplines: ["business"],
        category: "entrepreneurship",
        tags: ["pitch", "virtual", "innovation"],
        featured: false,
        scope: "international",
        difficulty_level: "intermediate",
        estimated_time: "1-2 months",
        learning_outcomes: ["Market Research", "Value Proposition Design", "Video Production"]
    },

    // --- Technology & Engineering ---
    {
        title: "First Robotics Competition",
        description: "Teams of students perform under strict rules, limited resources, and an intense six-week time limit to raise funds, design a team 'brand,' hone teamwork skills, and build and program industrial-size robots.",
        type: "contest",
        organization: "FIRST",
        location: "National",
        deadline: "2026-11-01", // Updated
        amount: "Scholarship opportunities",
        source_url: "https://www.firstinspires.org/robotics/frc",
        disciplines: ["engineering", "robotics", "coding"],
        category: "technology",
        tags: ["robotics", "team", "programming"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "3-6 months",
        learning_outcomes: ["Robotics", "Java/C++ Programming", "Team Collaboration"]
    },
    {
        title: "Congressional App Challenge",
        description: "Students in participating congressional districts code original applications for the chance to be recognized by their Member of Congress.",
        type: "contest",
        organization: "US Congress",
        location: "National",
        deadline: "2026-11-01", // Updated
        amount: "Recognition in DC",
        source_url: "https://www.congressionalappchallenge.us/",
        disciplines: ["coding", "technology"],
        category: "technology",
        tags: ["app-dev", "coding", "government"],
        featured: true,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "1-3 months",
        learning_outcomes: ["App Development", "UX/UI Design", "Problem Solving"]
    },
    {
        title: "CyberPatriot",
        description: "The National Youth Cyber Education Program created by the Air Force Association to inspire students toward careers in cybersecurity.",
        type: "contest",
        organization: "Air Force Association",
        location: "National",
        deadline: "2026-10-05", // Updated
        amount: "Scholarships",
        source_url: "https://www.uscyberpatriot.org/",
        disciplines: ["technology", "cybersecurity"],
        category: "technology",
        tags: ["cybersecurity", "defense", "team"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "3-4 months",
        learning_outcomes: ["Network Security", "System Hardening", "Digital Forensics"]
    },

    // --- Service & Leadership ---
    {
        title: "Gloria Barron Prize for Young Heroes",
        description: "Honors public-spirited young people who have made a significant positive difference to people and the planet.",
        type: "scholarship", // mapped from award
        organization: "Barron Prize",
        location: "National",
        deadline: "2026-04-15",
        amount: "$10,000",
        source_url: "https://barronprize.org/",
        disciplines: ["service", "leadership"],
        category: "service",
        tags: ["community", "impact", "environment"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "Ongoing Project",
        learning_outcomes: ["Community Impact", "Social Entrepreneurship", "Leadership"]
    },
    {
        title: "Prudential Emerging Visionaries",
        description: "Recognizes young people for their innovative solutions to financial and societal challenges.",
        type: "scholarship", // mapped from award
        organization: "Prudential",
        location: "National",
        deadline: "2026-11-04", // Updated
        amount: "Up to $15,000",
        source_url: "https://www.prudential.com/links/about/emergingvisionaries",
        disciplines: ["service", "finance"],
        category: "service",
        tags: ["social-change", "finance", "leadership"],
        featured: false,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "Ongoing Project",
        learning_outcomes: ["Financial Literacy", "Social Innovation", "Project Management"]
    },

    // --- General / Multi-disciplinary ---
    {
        title: "Rise Global Challenge",
        description: "An initiative of Schmidt Futures and the Rhodes Trust that finds brilliant people who need opportunity and supports them for life.",
        type: "residency", // mapped from program
        organization: "Schmidt Futures",
        location: "Global",
        deadline: "2027-01-25", // Updated
        amount: "Lifetime benefits",
        source_url: "https://www.risefortheworld.org/",
        disciplines: ["all"],
        category: "all",
        tags: ["global", "prestigious", "lifetime"],
        featured: true,
        scope: "international",
        difficulty_level: "advanced",
        estimated_time: "3 months",
        learning_outcomes: ["Global Citizenship", "Personal Narrative", "Project Design"]
    },
    {
        title: "United States Senate Youth Program",
        description: "Two student leaders from each state spend a week in Washington usually experiencing the national government in action.",
        type: "residency", // mapped from program
        organization: "US Senate",
        location: "Washington D.C.",
        deadline: "2026-10-01", // Updated
        amount: "$10,000 scholarship",
        source_url: "https://ussenateyouth.org/",
        disciplines: ["politics", "government"],
        category: "service",
        tags: ["leadership", "government", "prestigious"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "Application + 1 week",
        learning_outcomes: ["Civic Engagement", "Leadership", "Policy Understanding"]
    },
    {
        title: "The Adroit Journal Summer Mentorship",
        description: "An online literary mentorship program for high school students interested in poetry and prose (fiction/creative nonfiction).",
        type: "residency", // mapped from mentorship
        organization: "The Adroit Journal",
        location: "Online",
        deadline: "2026-03-15",
        amount: "Free Mentorship",
        source_url: "https://theadroitjournal.org/mentorship/",
        disciplines: ["writing"],
        category: "writing",
        tags: ["mentorship", "writing", "publication"],
        featured: false,
        scope: "international",
        difficulty_level: "intermediate",
        estimated_time: "2 months (summer)",
        learning_outcomes: ["Creative Writing", "Revision", "Literary Analysis"]
    },
    {
        title: "Davidson Fellows Scholarship",
        description: "Awards $50,000, $25,000 and $10,000 scholarships to extraordinary young people, 18 and under, who have completed a significant piece of work.",
        type: "scholarship",
        organization: "Davidson Institute",
        location: "National",
        deadline: "2026-02-12",
        amount: "Up to $50,000",
        source_url: "https://www.davidsongifted.org/fellows-scholarship/",
        disciplines: ["all"],
        category: "scholarships",
        tags: ["gifted", "scholarship", "prestigious"],
        featured: true,
        scope: "national",
        difficulty_level: "advanced",
        estimated_time: "Ongoing significant work",
        learning_outcomes: ["Portfolio Development", "advanced achievement", "Documentation"]
    },
    {
        title: "Coca-Cola Scholars Program",
        description: "An achievement-based scholarship awarded to graduating high school seniors.",
        type: "scholarship",
        organization: "Coca-Cola",
        location: "National",
        deadline: "2026-10-02", // Updated
        amount: "$20,000",
        source_url: "https://www.coca-colascholarsfoundation.org/",
        disciplines: ["all"],
        category: "scholarships",
        tags: ["leadership", "scholarship", "service"],
        featured: true,
        scope: "national",
        difficulty_level: "intermediate",
        estimated_time: "Application only",
        learning_outcomes: ["Self-Reflection", "Leadership Articulation", "Community Service"]
    }
];

async function seed() {
    console.log(`🌱 Seeding ${OPPORTUNITIES.length} opportunities...`);

    for (const opp of OPPORTUNITIES) {
        // Check for existence
        const { data: existing } = await supabase
            .from('opportunities')
            .select('id')
            .eq('title', opp.title)
            .maybeSingle();

        if (existing) {
            console.log(`♻️ Updating ${opp.title} with new dates...`);
            const { error } = await supabase
                .from('opportunities')
                .update(opp)
                .eq('id', existing.id);

            if (error) console.error(`❌ Failed update ${opp.title}:`, error.message);
        } else {
            const { error } = await supabase
                .from('opportunities')
                .insert(opp);

            if (error) {
                console.error(`❌ Failed to insert ${opp.title}:`, error.message);
            } else {
                console.log(`✅ Inserted ${opp.title}`);
            }
        }
    }

    console.log('✨ Seeding complete!');
}

seed();
