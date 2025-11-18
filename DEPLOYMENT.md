# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- PostgreSQL database (Neon, Supabase, or Railway)
- OpenAI API key

### Step 1: Prepare Your Database

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string
4. Add to Vercel environment variables

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (pooling mode)
5. Add to Vercel environment variables

### Step 2: Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:

```env
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_random_secret_here
OPENAI_API_KEY=sk-your-openai-key
```

6. Click "Deploy"

### Step 3: Set Up Database Schema

After deployment, run:

```bash
npx prisma db push
```

Or use Vercel CLI:

```bash
vercel env pull
npm run db:push
```

### Step 4: Configure OAuth (Optional)

#### Google OAuth
1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
3. Add credentials to Vercel environment variables

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Update callback URL:
   - `https://your-app.vercel.app/api/auth/callback/github`
3. Add credentials to Vercel environment variables

### Step 5: Verify Deployment

1. Visit your deployed app
2. Test sign up flow
3. Complete onboarding
4. Test search and messaging

## Environment Variables Reference

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret (use: `openssl rand -base64 32`)
- `OPENAI_API_KEY` - OpenAI API key

### Optional (for OAuth)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Troubleshooting

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Try connection pooling mode for Supabase

### Build Errors
- Check all environment variables are set
- Ensure Node.js version is 18+
- Review build logs in Vercel dashboard

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client IDs and secrets
- Ensure NEXTAUTH_URL is correct

## Monitoring & Analytics

### Vercel Analytics
Enable in Vercel dashboard for:
- Page views
- Performance metrics
- User engagement

### Database Monitoring
- Neon: Built-in dashboard
- Supabase: Database tab
- Railway: Metrics tab

## Scaling Considerations

### Database
- Use connection pooling
- Consider read replicas for high traffic
- Monitor query performance

### API Rate Limits
- OpenAI: Monitor token usage
- Implement caching for common queries
- Consider batch processing

### Cost Optimization
- Use serverless database (Neon)
- Optimize OpenAI prompts
- Cache AI responses when appropriate

## Security Checklist

- [x] NEXTAUTH_SECRET is unique and secure
- [x] Database credentials are environment variables
- [x] OAuth redirect URIs are exact matches
- [x] HTTPS enabled (automatic with Vercel)
- [x] CORS configured properly
- [x] Rate limiting considered

## Custom Domain

1. Go to Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL to your custom domain
5. Update OAuth callback URLs

## Rollback

If issues occur:
1. Go to Vercel dashboard
2. Select the previous deployment
3. Click "Promote to Production"

## Continuous Deployment

Vercel automatically deploys on:
- Push to main branch (production)
- Pull requests (preview deployments)

Configure in `vercel.json` if needed.
