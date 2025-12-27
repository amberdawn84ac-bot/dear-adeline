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
}

export const CAMPAIGNS: Campaign[] = [
    {
        id: 'clemency-advocacy',
        title: 'Clemency Advocacy',
        objective: 'File clemency petitions for non-violent offenders serving excessive sentences. Secure early release or sentence reduction for minimum 3 individuals annually.',
        targetAudience: 'First-time non-violent offenders with 10+ year sentences, wrongful convictions, elderly/terminally ill prisoners.',
        metrics: ['Petitions filed', 'Signature counts', 'Media mentions', 'Actual releases secured'],
        resources: ['Legal research access', 'Certified mail', 'Petition platform', 'Coalition partners'],
        timeline: 'Q1: Research, Q2: Filing, Q3: Media Push, Q4: Evaluate.',
        category: 'Justice',
        icon: 'Scale'
    },
    {
        id: 'bail-bonds',
        title: 'Bail Bonds for Non-Violent Offenders',
        objective: 'Create revolving fund to post bail for non-violent defendants unable to afford release. Reduce pretrial detention, prevent job loss.',
        targetAudience: 'Non-violent defendants held on <$5,000 bail, first-time offenders, primary caregivers.',
        metrics: ['Bonds posted', 'Court appearance rate', 'Employment retention', 'Fund sustainability'],
        resources: ['Initial fund capital', 'Legal advisor', 'Screening protocol', 'Court liaison'],
        timeline: 'Year 1: Pilot 10-15 cases, Year 2: Scale to 50+.',
        category: 'Justice',
        icon: 'Shield'
    },
    {
        id: 'diversion-programs',
        title: 'Diversion Programs',
        objective: 'Partner with prosecutors to redirect non-violent offenders from incarceration to community-based rehabilitation and skill development.',
        targetAudience: 'First-time non-violent offenders, youth offenders, substance use disorder cases.',
        metrics: ['Acceptance rate', 'Completion rate', 'Recidivism rate', 'Cost savings'],
        resources: ['Prosecutor partnerships', 'Curriculum', 'Certified facilitators', 'Tracking system'],
        timeline: 'Q1-Q2: Partnerships, Q3: Pilot, Q4: Evaluate.',
        category: 'Justice',
        icon: 'Hammer'
    },
    {
        id: 'reentry-support',
        title: 'Reentry Support',
        objective: 'Provide formerly incarcerated individuals with employment, housing assistance, and community integration support.',
        targetAudience: 'Recently released individuals demonstrating rehabilitation commitment.',
        metrics: ['Employment placement', 'Housing stability', 'Income progression', 'Retention'],
        resources: ['Job training', 'Employer partnerships', 'Housing navigation', 'Mentorship network'],
        timeline: 'Q1: Networks, Q2: Pilot, Q3-Q4: Support & Tracking.',
        category: 'Justice',
        icon: 'Home'
    },
    {
        id: 'reentry-deployment',
        title: 'Reentry from Deployment',
        objective: 'Support military veterans transitioning from deployment with mental health resources and civilian employment pathways.',
        targetAudience: 'Recently returned service members, veterans with PTSD/TBI, Guard/Reserve members.',
        metrics: ['Health connection rate', 'Civilian employment', 'VA benefits success', 'Family stability'],
        resources: ['VA partnerships', 'VSO collaboration', 'Mental health providers', 'Peer mentorship'],
        timeline: 'Q1: Partnerships, Q2: Support groups, Q3-Q4: Employment component.',
        category: 'Community',
        icon: 'Award'
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
        icon: 'Wrench'
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
        icon: 'Users'
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
        icon: 'Palette'
    },
    {
        id: 'addiction-replacement',
        title: 'Addiction Replacement',
        objective: 'Provide alternative activities and purpose-driven engagement to individuals in recovery.',
        targetAudience: 'Individuals in early recovery, those completing treatment programs.',
        metrics: ['Sobriety maintenance', 'Relapse prevention', 'Attendance', 'Skill acquisition'],
        resources: ['Recovery partnerships', 'Activity programming', 'Peer facilitators', 'Meeting spaces'],
        timeline: 'Q1: Partnerships, Q2: Activity pilot, Q3: Program expansion, Q4: Outcomes.',
        category: 'Growth',
        icon: 'Sparkles'
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
        icon: 'GraduationCap'
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
        icon: 'BookOpen'
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
        icon: 'Leaf'
    }
];
