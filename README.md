<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=160&section=header&text=SuperNetworkAI&fontSize=40&fontColor=fff&animation=twinkling&fontAlignY=36&desc=AI-Powered%20Networking%20Platform%20for%20Founders&descAlignY=58&descSize=15" width="100%"/>
</div>

# SuperNetwork AI - AI-Powered Founder Networking Platform

An AI-powered networking platform that helps early-stage founders and indie builders quickly find aligned cofounders, teammates, or clients through intelligent matchmaking and natural language search.

## 🌟 Features

- **Smart Onboarding**: Lightweight Ikigai-style profile creation
- **AI-Generated Profiles**: Automatically generate compelling matchmaking profiles
- **Natural Language Search**: Search for matches using plain English queries
- **Intelligent Matching**: AI-powered ranking with detailed explanations
- **Connection Management**: Send, receive, and manage connection requests
- **Real-time Messaging**: Chat with accepted connections
- **OAuth Support**: Sign in with Google or GitHub

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4 for profile generation and matchmaking
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key
- (Optional) Google OAuth credentials
- (Optional) GitHub OAuth credentials

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/SuperNetworkAI.git
cd SuperNetworkAI
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supernetwork?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy and add to `.env` file

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## 📁 Project Structure

```
SuperNetworkAI/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── onboarding/           # Profile creation
│   │   ├── search/               # Search & matching
│   │   ├── connections/          # Connection management
│   │   └── messages/             # Messaging
│   ├── auth/                     # Auth pages (signin, signup)
│   ├── dashboard/                # Main dashboard
│   ├── onboarding/               # Onboarding flow
│   ├── messages/                 # Messaging interface
│   └── layout.tsx                # Root layout
├── components/                   # React components
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── openai.ts                 # OpenAI integration
│   └── auth.ts                   # Auth helpers
├── prisma/
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

## 🎯 Key Features Explained

### 1. Onboarding Flow

New users complete a lightweight profile including:
- Motivations and goals
- Skills and experience
- Working style preferences
- What they're looking for (cofounder, teammate, client, etc.)
- Links (portfolio, LinkedIn, GitHub)

The AI generates a compelling matchmaking profile that users can edit.

### 2. AI-Powered Search

Users can search using natural language queries like:
- "Technical cofounder passionate about AI ethics"
- "Designer for early-stage SaaS startup"
- "Marketing expert with B2B experience"

The AI analyzes profiles and returns ranked matches with explanations.

### 3. Connection System

- Send connection requests to matches
- Receive and respond to incoming requests
- View all accepted connections
- Message connected users

### 4. Messaging

Simple chat interface for connected users:
- Real-time message updates
- Message history
- Read receipts

## 🔧 Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Build for Production

```bash
npm run build
npm run start
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Hosting

Recommended PostgreSQL providers:
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - PostgreSQL with extras
- [Railway](https://railway.app/) - Easy PostgreSQL hosting

## 📊 Database Schema

Key models:
- **User**: Authentication and basic info
- **Profile**: Onboarding data and AI-generated profile
- **Connection**: Connection requests and status
- **Message**: Chat messages between users
- **MatchFeedback**: Track match acceptance for future improvements

## 🔒 Security & Privacy

- Passwords hashed with bcrypt
- JWT-based session management
- GDPR-compliant (export/delete on request)
- No collection of sensitive attributes
- User privacy controls built-in

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme.

### AI Model Configuration

Edit `lib/openai.ts` to:
- Change GPT model version
- Adjust temperature and token limits
- Customize prompts for better matching

## 📈 Metrics & KPIs (from PRD)

The platform tracks:
- **Time to First Match**: Target ≤48 hours
- **Match Acceptance Rate**: Target 25-35%
- **8-Week Active Users**: Target ≥30%

## 🐛 Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and DATABASE_URL is correct.

### OpenAI API Errors

- Check API key is valid
- Ensure you have credits/billing set up
- Check rate limits

### OAuth Issues

- Verify callback URLs match exactly
- Check client ID and secret are correct
- Ensure OAuth app is not in development mode (for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🗺️ Roadmap

- [ ] Real-time notifications
- [ ] Advanced profile analytics
- [ ] Video introductions
- [ ] Team formation features
- [ ] Integration with calendars for meetings
- [ ] Mobile app (React Native)
- [ ] AI-powered conversation starters
- [ ] Match quality feedback loop

---

Built with ❤️ by the SuperNetwork AI team
