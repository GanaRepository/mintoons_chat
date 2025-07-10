# MINTOONS - AI-Powered Story Writing Platform for Children

MINTOONS is a collaborative AI-powered story writing platform where children (ages 2-18) work WITH AI to create stories. The AI acts as a teacher/mentor providing prompts and guidance, encouraging creativity through guided collaboration.

## 🌟 Features

- **Collaborative Writing**: Children write with AI guidance, not AI generation
- **Age-Appropriate Content**: Different AI responses based on child's age (2-18)
- **Story Assessment**: AI evaluates grammar, creativity, and overall story quality
- **Mentor System**: Google Docs-style commenting from assigned mentors
- **Achievement System**: Badges, streaks, and progress tracking
- **Multi-AI Support**: OpenAI, Claude, and Gemini integration
- **Subscription Tiers**: Flexible pricing with easy configuration
- **Export Options**: PDF and Word document generation
- **Real-time Features**: Socket.io for live commenting and notifications

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Payment**: Stripe integration
- **AI**: OpenAI, Anthropic Claude, Google Gemini
- **Email**: Nodemailer
- **Real-time**: Socket.io (no external dependencies)
- **Animations**: Framer Motion, GSAP

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Stripe account
- AI API keys (OpenAI, Anthropic, Google)

## ⚡ Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/mintoons.git
   cd mintoons
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your API keys and database URLs in the `.env.local` file.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
