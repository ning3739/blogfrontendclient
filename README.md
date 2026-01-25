<div align="center">

# HeyXiaoli Frontend Client

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-1.3-FBF0DF?style=flat-square&logo=bun&logoColor=black" alt="Bun" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
</p>

Production-ready frontend for modern blogs, built with Next.js. Features rich content creation, project showcase, social interaction, payment integration, and advanced media management.

[Live Demo](https://heyxiaoli.com) · [Report Issues](https://github.com/NING3739/blogfrontendclient/issues) · [Feature Suggestions](https://github.com/NING3739/blogfrontendclient/issues)

</div>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment-guide)
- [Contributing](#contributing)
- [License](#license)

## Features

### Authentication & Security

- Email/password login, OAuth (GitHub, Google)
- HttpOnly cookie token storage, automatic refresh
- Email verification, password reset
- Role-based access control

### Content Management

- Rich text editor (TipTap), Markdown, code highlighting
- Draft/publish workflow, tag & category management
- SEO metadata, cover image management

### Media Management

- Image/audio/video upload & cropping
- Media library, progress tracking

### Payment Integration

- Stripe payment gateway
- Order management, payment history

### Analytics & Visualization

- Google Analytics integration
- Vercel Speed Insights
- ECharts, Recharts, word cloud
- Data dashboard for admins

### Additional Features

- Internationalization (English/Chinese)
- Theme switching (light/dark)
- Responsive design
- Friend link directory, project showcase
- Notification system, message board

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Motion, Lucide React |
| **Data** | SWR, Axios |
| **Editor** | TipTap, Lowlight |
| **i18n** | next-intl |
| **Tools** | Bun, Biome, Turbopack |
| **Services** | Stripe, Mapbox, Google Analytics, Vercel Speed Insights |
| **Charts** | ECharts, Recharts |

## Quick Start

### Requirements

- **Bun** >= 1.x (recommended) or **Node.js** >= 18.x

### Installation & Startup

1. **Clone the repository**

```bash
git clone https://github.com/NING3739/blogfrontendclient.git
cd blogfrontendclient
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root as follows:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.heyxiaoli.com/api/v1
NEXT_PUBLIC_SITE_URL=https://heyxiaoli.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. **Start the development server**

```bash
bun run dev
```

Visit [https://127.0.0.1:3000](https://127.0.0.1:3000) to view the application.

> HTTPS and Turbopack are enabled by default for an improved development experience.

## Project Structure

```
frontend-client/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # Page route groups
│   │   ├── (auth)/              # Authentication pages (login/register/reset-password)
│   │   ├── (site)/              # Public site pages (blog/project/copyright/privacy)
│   │   │   ├── [...slug]/       # Dynamic routes (blog/project details)
│   │   │   ├── copyright/       # Copyright page
│   │   │   └── privacy-policy/  # Privacy policy page
│   │   ├── dashboard/           # Dashboard pages (admin/user)
│   │   ├── payment/             # Payment pages
│   │   └── user/                # User profile pages
│   ├── components/               # React components
│   │   ├── (feature)/           # Feature components
│   │   │   ├── archive/         # Archive page
│   │   │   ├── blog/            # Blog components (details, list, audio, etc.)
│   │   │   ├── comment/         # Comment system
│   │   │   ├── content/         # Content display (TOC, TextContent, ImagePreview)
│   │   │   ├── dashboard/       # Dashboard components (admin/user)
│   │   │   ├── editor/          # Rich text editor components
│   │   │   ├── forum/           # Forum page
│   │   │   ├── friend/          # Friend links
│   │   │   ├── home/            # Home page components
│   │   │   ├── payment/         # Payment components
│   │   │   ├── project/         # Project components
│   │   │   ├── tag/             # Tag components
│   │   │   └── user/            # User page
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx       # Site header
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   ├── SideBar.tsx      # Dashboard sidebar
│   │   │   ├── ThemeSwitcher.tsx    # Theme toggle
│   │   │   └── LanguageSwitcher.tsx # Language toggle
│   │   └── ui/                  # Reusable UI components
│   │       ├── avatar/          # User avatar
│   │       ├── background/      # Background components
│   │       ├── badge/           # Status badges
│   │       ├── button/          # Button, ActionButton
│   │       ├── card/            # BaseCard, BlogCard, ContentCard
│   │       ├── copyright/       # Copyright notice component
│   │       ├── dropdown/        # Dropdown components
│   │       ├── error/           # Error display, EmptyState
│   │       ├── icon/            # Icon components
│   │       ├── input/           # Input fields
│   │       ├── loading/         # Loading spinners
│   │       ├── logo/            # Site logo
│   │       ├── modal/           # BaseModal, DeleteConfirmModal
│   │       ├── pagination/      # Pagination
│   │       ├── share/           # Share component
│   │       └── stats/           # Stats card
│   ├── contexts/                 # React Context
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utility libraries
│   │   ├── extensions/          # TipTap extensions
│   │   ├── http/                # HTTP client
│   │   ├── services/            # API service layer
│   │   └── utils/               # Utility functions
│   ├── providers/                # Context providers
│   ├── types/                    # TypeScript type definitions
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── i18n/                         # Internationalization config
│   ├── messages/                # Translation files
│   │   ├── en.json              # English translations
│   │   └── zh.json              # Chinese translations
│   └── request.ts               # i18n config
├── public/                       # Static assets
├── certificates/                 # SSL certificates (for development)
├── next.config.ts               # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json                 # Project dependencies
```

### Component Naming Conventions

| Directory | Purpose | Naming |
|-----------|---------|--------|
| `ui/` | Reusable base components | `BaseCard.tsx`, `BaseModal.tsx`, `Button.tsx` |
| `layout/` | Layout & global components | `Header.tsx`, `Footer.tsx`, `ThemeSwitcher.tsx` |
| `(feature)/` | Feature-specific components | `BlogDetails.tsx`, `CommentList.tsx` |
| `(pages)/` | Page components | `page.tsx` (Next.js convention) |

## Environment Variables

Create a `.env.local` file and configure the following variables:

| Variable                        | Description            | Required | Example                            |
| ------------------------------- | ---------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | Backend API URL        | Yes      | `https://api.heyxiaoli.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL`          | Site URL               | Yes      | `https://heyxiaoli.com`            |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe public key      | Optional | `pk_test_xxxxx`                    |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | Mapbox token           | Optional | `pk.xxxxx`                         |
| `NEXT_PUBLIC_GA_ID`             | Google Analytics ID    | Optional | `G-XXXXXXXXXX`                     |

> Variables marked as optional are only required if you use the corresponding features.

## Deployment Guide

### Vercel (Recommended)

1. Push code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

Vercel auto-detects `bun.lock` and uses Bun for builds.

### Self-Hosting

```bash
bun run build
bun run start
```

### Docker

```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## Development

```bash
bun run dev      # Development (HTTPS + Turbopack)
bun run build    # Production build
bun run start    # Start server
bun run lint     # Lint code
```

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request

## License

[MIT](LICENSE)

---

<div align="center">

**If you find this project helpful, please give it a star! ⭐️**

Made with ❤️ by [NING3739](https://github.com/NING3739)

</div>
