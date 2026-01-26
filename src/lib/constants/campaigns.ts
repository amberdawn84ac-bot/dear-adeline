export interface Campaign {
    id: string;
    title: string;
    objective: string;
    targetAudience: string;
    metrics: string[];
    resources: string[];
    timeline: string;
    category: 'Justice' | 'Community' | 'Growth' | 'Provision';
    icon: string;
    learningGoals: string[];
    skills: string[];
}

export const CAMPAIGNS: Campaign[] = [
    {
        id: 'reentry-deployment',
        title: 'Reentry from Deployment',
        objective: 'Support military veterans transitioning from deployment with mental health resources and civilian employment pathways.',
        targetAudience: 'Recently returned service members, veterans with PTSD/TBI, Guard/Reserve members.',
        metrics: ['Health connection rate', 'Civilian employment', 'VA benefits success', 'Family stability'],
        resources: ['VA partnerships', 'VSO collaboration', 'Mental health providers', 'Peer mentorship'],
        timeline: 'Q1: Partnerships, Q2: Support groups, Q3-Q4: Employment component.',
        category: 'Community',
        icon: 'Award',
        learningGoals: ['Understand veteran support systems', 'Analyze community reintegration strategies'],
        skills: ['Empathy', 'Case Management', 'Strategic Planning']
    },
    {
        id: 'women-power-tools',
        title: 'Women & Power Tools',
        objective: 'Provide women with hands-on power tool training, home repair skills, and construction trade pathways.',
        targetAudience: 'Women seeking trade careers, single mothers, women in economic transition.',
        metrics: ['Number trained', 'Certification completion', 'Apprenticeship placement', 'Wage growth'],
        resources: ['Power tools', 'Workshop space', 'Certified instructors', 'Safety equipment'],
        timeline: 'Q1: Tools & Space, Q2: Pilot, Q3: Advanced modules, Q4: Apprenticeships.',
        category: 'Growth',
        icon: 'Wrench',
        learningGoals: ['Master manual tool operation', 'Develop vocational training curriculum'],
        skills: ['Construction Basics', 'Instructional Design', 'Safety Management']
    },
    {
        id: 'worker-cooperative',
        title: 'Worker Cooperative',
        objective: 'Establish worker-owned cooperative providing living wages and democratic workplace governance.',
        targetAudience: 'Underemployed workers, formerly incarcerated, workers exploited by gig economy.',
        metrics: ['Number of worker-owners', 'Average wage', 'Growth', 'Worker satisfaction'],
        resources: ['Initial capital', 'Legal incorporation', 'Business model', 'Governance training'],
        timeline: 'Year 1: Form & incorporate, Year 2: Launch, Year 3: Profitability.',
        category: 'Provision',
        icon: 'Users',
        learningGoals: ['Understand cooperative business models', 'Learn democratic governance structures'],
        skills: ['Business Administration', 'Conflict Resolution', 'Financial Literacy']
    },
    {
        id: 'community-art',
        title: 'Community Art Education',
        objective: 'Provide free/low-cost art education as a tool for expression, healing, and community building.',
        targetAudience: 'Low-income children, at-risk youth, seniors, trauma survivors.',
        metrics: ['Participants served', 'Skill progression', 'Exhibitions held', 'Mental health indicators'],
        resources: ['Art supplies', 'Teaching artists', 'Workshop space', 'Exhibition venues'],
        timeline: 'Q1: Artists & Space, Q2: Weekly workshops, Q3: Exhibition, Q4: Evaluate.',
        category: 'Community',
        icon: 'Palette',
        learningGoals: ['Explore art therapy principles', 'Organize community events'],
        skills: ['Creative Arts', 'Event Planning', 'Community Engagement']
    },
    {
        id: 'finish-high-school',
        title: 'Finish High School',
        objective: 'Provide flexible high school completion pathway for adults who left school.',
        targetAudience: 'Adults without diploma, parents, formerly incarcerated.',
        metrics: ['Enrollment', 'Completion rate', 'Post-completion outcomes', 'Time to completion'],
        resources: ['Certified teachers', 'Learning platform', 'Tutoring', 'Childcare coordination'],
        timeline: 'Q1-Q2: Accreditation & Platform, Q3: Enroll cohort, Year 2: Scale.',
        category: 'Growth',
        icon: 'GraduationCap',
        learningGoals: ['Analyze adult education methodologies', 'Support non-traditional learners'],
        skills: ['Tutoring', 'Educational Psychology', 'Program Management']
    },
    {
        id: 'what-they-didnt-teach',
        title: "Life Skills: 'What They Didn't Teach'",
        objective: 'Deliver practical life skills education: financial literacy, conflict resolution, emotional intelligence.',
        targetAudience: 'High school students, young adults, homeschool families.',
        metrics: ['Attendance', 'Behavior changes', 'Civic participation', 'Confidence scores'],
        resources: ['Curriculum development', 'Subject matter experts', 'Workbooks', 'Online platform'],
        timeline: 'Q1: Curriculum, Q2: Pilot, Q3: Online conversion, Q4: Monthly workshops.',
        category: 'Growth',
        icon: 'BookOpen',
        learningGoals: ['Develop practical life skills curriculum', 'Facilitate youth workshops'],
        skills: ['Curriculum Development', 'Public Speaking', 'Financial Planning']
    },
    {
        id: 'real-food',
        title: 'Real Food',
        objective: 'Increase access to nutrient-dense, minimally processed food in underserved areas.',
        targetAudience: 'Food desert residents, low-income families, SNAP recipients.',
        metrics: ['Households reached', 'Fresh food access', 'Cooking skill improvements', 'Health indicators'],
        resources: ['Farmer partnerships', 'Distribution system', 'Nutrition curriculum', 'Refrigeration'],
        timeline: 'Q1: Sourcing, Q2: Pilot, Q3: Cooking classes, Q4: Health outcomes.',
        category: 'Provision',
        icon: 'Leaf',
        learningGoals: ['Understand food systems and supply chains', 'Promote nutritional health'],
        skills: ['Logistics', 'Nutrition Education', 'Partnership Development']
    }
];
