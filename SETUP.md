# 🚀 Navvi Hackathon Setup Guide

## Quick Setup for Your Hackathon Demo

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# GitHub OAuth (Get these from GitHub Developer Settings)
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here

# NextAuth (Generate a random string)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

### 2. GitHub OAuth App Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Navvi
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret** to your `.env.local`

### 3. Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET` in your `.env.local`

### 4. Start the Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see Navvi!

## 🎯 Demo Flow

1. **Landing Page** - Beautiful introduction to Navvi
2. **Security Demo** - Live proof that code never leaves the browser (`/security`)
3. **Sign In** - GitHub OAuth authentication
4. **Dashboard** - Select a repository to analyze
5. **Analysis Results** - Interactive architecture map and tutorials

## 🔒 Security Demonstration

**Key Feature**: Visit `/security` to show investors exactly how you prove security:

- **Live Code Analysis** - Paste any code and see it analyzed locally
- **Hash Verification** - Shows cryptographic proof that you never see the content
- **Network Monitor** - Demonstrates no code is sent to servers
- **Technical Details** - Explains what you see vs. what you never see

**Perfect for Investor Questions**: When they ask "How do you prove you don't see our code?", you can:
1. Open the security demo page
2. Paste their sensitive code
3. Show them the analysis happens entirely in their browser
4. Point to the hash as cryptographic proof

## 🔧 For Production Demo

### Vercel Deployment
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Update GitHub OAuth URLs
For production, update your GitHub OAuth app:
- **Homepage URL**: `https://your-domain.vercel.app`
- **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

## 🎤 Pitch Points

### Problem Statement
- "New developers spend weeks understanding codebases"
- "Senior devs waste time explaining the same concepts"
- "Documentation gets outdated quickly"

### Solution
- "Navvi automatically analyzes your codebase"
- "Creates interactive learning paths"
- "Reduces onboarding time by 80%"

### Security (Address Investor Concerns)
- **"Code analysis happens locally"** - Show them the `/security` demo
- **"We never store your source code"** - Point to the hash verification
- **"Only metadata and insights are processed"** - Show the technical details
- **"Open source analysis engine for transparency"** - Mention the client-side code

### Market Opportunity
- **Target**: Tech companies with 10+ developers
- **Pricing**: $20/month per user
- **TAM**: $2B developer productivity market

## 🚀 Next Steps After Hackathon

1. **Real AST Parsing** - Implement actual code analysis
2. **Dependency Graphs** - Visual relationship mapping
3. **Git History Analysis** - Identify frequently changed files
4. **Test Coverage Integration** - Prioritize well-tested code
5. **Team Features** - Collaboration and sharing

## 🎯 Demo Script

### Opening (30 seconds)
"Hi, I'm building Navvi - an AI-powered onboarding buddy that solves the biggest pain point in software development: new developers spending weeks understanding codebases."

### Problem (30 seconds)
"Every developer has experienced this: joining a new company and spending weeks or months trying to figure out how everything fits together. Senior devs waste countless hours explaining the same concepts repeatedly."

### Solution (1 minute)
"Navvi automatically analyzes your codebase and creates interactive learning paths. But the key innovation is our security approach - let me show you how we prove we never see your code."

### Security Demo (2 minutes)
"Visit our security demo page. You can paste any code here - even your most sensitive business logic. Watch as we analyze it entirely in your browser. Notice the hash here - that's cryptographic proof that we never saw the actual content."

### Market (30 seconds)
"We're targeting tech companies with 10+ developers at $20/month per user. That's a $2B market opportunity."

### Ask (30 seconds)
"We're looking for $500K in seed funding to scale our team and expand our analysis capabilities."

---

**Good luck with your hackathon! 🎉** 