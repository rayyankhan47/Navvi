# Navvi - AI-Powered Codebase Onboarding

> Stop spending weeks understanding new codebases. Navvi analyzes your repository and creates interactive learning paths for new developers.

## 🚀 About Navvi

Navvi is an AI-powered onboarding buddy that transforms how new developers understand codebases. Instead of spending weeks or months trying to figure out how everything fits together, Navvi provides:

- **System Architecture Maps** - Visualize how all components connect
- **Critical Code Paths** - Identify the 20% of code that matters most
- **Interactive Tutorials** - Step-by-step walkthroughs of key workflows
- **Dependency Graphs** - See exactly how classes and functions rely on each other

## 🛡️ Security-First Approach

Navvi is built with security in mind:
- **Local Processing** - Code analysis happens locally, never stored
- **Zero-Knowledge Architecture** - Only metadata and insights are processed
- **GitHub OAuth** - Secure authentication with minimal permissions
- **Open Source Core** - Analysis engine is transparent and auditable

## 🏗️ Architecture

### Core Components
- **AST Parser** - Converts code into abstract syntax trees for analysis
- **Dependency Analyzer** - Maps relationships between components
- **AI Insights Engine** - Generates explanations and tutorials
- **Interactive UI** - Beautiful, responsive web interface

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth
- **Analysis**: Abstract Syntax Tree parsing (planned)
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- GitHub account
- GitHub OAuth App credentials

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd navvi
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# GitHub OAuth
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret to your `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see Navvi in action!

## 📁 Project Structure

```
navvi/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts    # NextAuth configuration
│   │   │   ├── repositories/route.ts          # GitHub repos API
│   │   │   └── analyze/route.ts               # Analysis API
│   │   ├── auth/
│   │   │   └── signin/page.tsx                # Sign-in page
│   │   ├── dashboard/
│   │   │   └── page.tsx                       # Main dashboard
│   │   ├── analysis/[repo]/
│   │   │   └── page.tsx                       # Analysis results
│   │   ├── layout.tsx                         # Root layout
│   │   ├── page.tsx                           # Landing page
│   │   └── globals.css                        # Global styles
│   └── types/
│       └── next-auth.d.ts                     # TypeScript types
├── public/                                    # Static assets
└── package.json
```

## 🎯 Features

### ✅ Implemented (MVP)
- [x] Beautiful landing page with value proposition
- [x] GitHub OAuth authentication
- [x] Repository selection dashboard
- [x] Mock analysis results with interactive UI
- [x] Responsive design with Tailwind CSS
- [x] TypeScript support

### 🚧 Planned Features
- [ ] Real AST parsing and analysis
- [ ] Dependency graph visualization
- [ ] Interactive code walkthroughs
- [ ] Git history analysis
- [ ] Test coverage integration
- [ ] Export functionality
- [ ] Team collaboration features

## 🎨 Design System

Navvi uses a modern, professional design with:
- **Colors**: Blue/Indigo gradient theme
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Rounded corners, subtle shadows, smooth transitions
- **Layout**: Responsive grid system with Tailwind CSS

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features
1. Create new pages in `src/app/`
2. Add API routes in `src/app/api/`
3. Update types in `src/types/`
4. Test with `npm run dev`

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production
```env
GITHUB_ID=your_production_github_client_id
GITHUB_SECRET=your_production_github_client_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
```

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Hackathon Pitch

### Problem
- New developers spend weeks/months understanding codebases
- Senior devs waste time explaining the same concepts repeatedly
- Documentation gets outdated quickly
- Onboarding is inconsistent and inefficient

### Solution
Navvi automatically analyzes codebases and creates personalized onboarding experiences, reducing time-to-productivity by 80%.

### Competitive Advantage
- **Security-first**: Local processing, zero code storage
- **AI-powered**: Intelligent insights and personalized tutorials
- **Interactive**: Visual, engaging learning experience
- **Comprehensive**: Architecture maps, critical paths, tutorials

---

Built with ❤️ for better developer onboarding
