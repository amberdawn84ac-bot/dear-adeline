# Dear Adeline 🎓

A personalized, AI-powered learning platform where education meets each student exactly where they are.

![Dear Adeline](https://dearadeline.co)

## ✨ Features

### For Students
- **AI Learning Companion** - Tell Adeline what you're interested in, and she creates personalized lessons
- **Student-Led Learning** - Your curiosity becomes your curriculum
- **Skills & Credits Tracking** - Everything you learn earns skills toward graduation
- **Graduation Tracker** - Visual progress toward Oklahoma (or state of choice) graduation requirements
- **Portfolio Builder** - Automatic portfolio entries from lessons and projects
- **Learning Games** - "Let's play a spelling game!" and other interactive activities

### For Teachers
- **Student Management** - Add and monitor assigned students
- **Progress Monitoring** - View skills, credits, and portfolio for each student
- **Project Assignment** - Assign library projects directly to students
- **Privacy-First** - Only see your own students' information

### For Admins
- **AI-Powered Editing** - Make platform changes using natural language (no code needed!)
- **User Management** - Manage roles for all students, teachers, and admins
- **Project Library** - Add/edit Art, Farm, and Science projects
- **Skills Configuration** - Create and manage skills and credit values
- **Graduation Requirements** - Configure requirements for different states

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Anthropic API key

### 1. Clone and Install

```bash
cd dear-adeline
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)
3. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page!

### 5. Create Your Admin Account

1. Click "Explore Curriculum" → Sign Up
2. Create an account with your email
3. Check email for confirmation link
4. In Supabase, go to **Table Editor > profiles**
5. Find your user and change `role` from `student` to `admin`
6. You now have full admin access!

## 📁 Project Structure

```
dear-adeline/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Authentication
│   │   ├── dashboard/            # Student dashboard + AI chat
│   │   │   ├── admin/            # Admin panel
│   │   │   └── teacher/          # Teacher dashboard
│   │   ├── portfolio/            # Student portfolio
│   │   ├── library/              # Project library (Art/Farm/Science)
│   │   ├── tracker/              # Graduation tracker
│   │   └── api/
│   │       ├── chat/             # AI chat endpoint
│   │       ├── admin/ai/         # Admin AI assistant
│   │       └── teacher/invite/   # Add student to teacher
│   ├── lib/
│   │   └── supabase/             # Supabase client configuration
│   └── middleware.ts             # Route protection & role checks
├── supabase/
│   └── schema.sql                # Database schema + seed data
└── public/                       # Static assets
```

## 🗄️ Database Schema

The platform uses these main tables:

- `profiles` - User accounts with roles (student/teacher/admin)
- `teacher_students` - Teacher-student relationships
- `skills` - Learnable skills with credit values
- `student_skills` - Skills earned by students
- `graduation_requirements` - Oklahoma state requirements
- `student_graduation_progress` - Credits earned per requirement
- `portfolio_items` - Student portfolio entries
- `library_projects` - Art, Farm, Science projects
- `student_projects` - Project completion tracking
- `conversations` - AI chat history
- `learning_gaps` - Detected learning gaps

## 🎨 Customization

### Theme Colors
Edit `src/app/globals.css` to customize the color palette:

```css
:root {
  --sage: #87A878;          /* Primary green */
  --terracotta: #C4826E;    /* Accent orange */
  --dusty-rose: #D4A5A5;    /* Secondary pink */
  --cream: #FAF8F5;         /* Background */
}
```

### State Standards
The database seeds with Oklahoma graduation requirements. To add other states:

1. Go to Supabase Table Editor
2. Add entries to `graduation_requirements` with different `state_standards` values
3. Students can select their state in settings

## 🔒 Security

- Row Level Security (RLS) enforced on all tables
- Teachers can only see their assigned students
- Students can only see their own data
- Admin role required for platform management
- API keys should never be exposed client-side

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Custom Domain

1. In Vercel, go to **Settings > Domains**
2. Add `dearadeline.co`
3. Update DNS records as instructed

## 🤝 Contributing

This is a private homeschool platform, but suggestions are welcome!

## 📄 License

Private - All rights reserved.

---

Made with 💚 in Oklahoma for homeschool families everywhere.
