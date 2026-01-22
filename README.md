<div align="center">

# HeyXiaoli Frontend Client

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
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
- [Configuration](#configuration)
- [Deployment Guide](#deployment-guide)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

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

- ECharts, Recharts, word cloud
- Data dashboard for admins

### Additional Features

- Internationalization (English/Chinese)
- Theme switching (light/dark)
- Responsive design
- Friend link directory, project showcase
- Notification system, message board

## Tech Stack

### Core Frameworks

- **[Next.js 16](https://nextjs.org/)** - Leading React full-stack framework with App Router architecture
- **[React 19](https://react.dev/)** - Modern UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript superset

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Motion](https://motion.dev/)** - Powerful animation library (based on Framer Motion)
- **[Lucide React](https://lucide.dev/)** - High-quality icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching solution

### Data Management

- **[SWR](https://swr.vercel.app/)** - Efficient data fetching and caching
- **[Axios](https://axios-http.com/)** - Flexible HTTP client

### Rich Text Editing

- **[TipTap](https://tiptap.dev/)** - Modern rich text editor
- **[Lowlight](https://github.com/wooorm/lowlight)** - Code highlighting support

### Internationalization

- **[next-intl](https://next-intl-docs.vercel.app/)** - Next.js internationalization solution

### Other Tools

- **[Stripe](https://stripe.com/)** - Online payment integration
- **[Mapbox GL](https://www.mapbox.com/)** - Map visualization
- **[ECharts](https://echarts.apache.org/)** - Data visualization charts
- **[QRCode](https://github.com/soldair/node-qrcode)** - QR code generation
- **[React Hot Toast](https://react-hot-toast.com/)** - Elegant notification system

## Quick Start

### Requirements

- **Node.js** >= 18.x
- **npm** >= 9.x or **pnpm** >= 8.x

### Installation & Startup

1. **Clone the repository**

```bash
git clone https://github.com/NING3739/blogfrontendclient.git
cd blogfrontendclient
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root as follows:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.heyxiaoli.com/api/v1
NEXT_PUBLIC_SITE_URL=https://heyxiaoli.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx
```

4. **Start the development server**

```bash
npm run dev
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

| Variable                        | Description       | Required | Example                            |
| ------------------------------- | ----------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | Backend API URL   | Yes      | `https://api.heyxiaoli.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL`          | Site URL          | Yes      | `https://heyxiaoli.com`            |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe public key | Optional | `pk_test_xxxxx`                    |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | Mapbox token      | Optional | `pk.xxxxx`                         |

> Variables marked as optional are only required if you use the corresponding features (e.g., payment, map, etc.)

## Configuration

### 1. Authentication System

#### Supported Login Methods

- **Email & Password Login** - Traditional account/password authentication
- **OAuth Login** - Third-party login via GitHub, Google
- **Email Verification** - Email code verification during registration
- **Password Reset** - Reset password via email

#### Security Features

```typescript
// HttpOnly Cookie for token storage
// Automatic token refresh
// Automatic 401 error handling
// Request queue management
```

### 2. Content Management

#### Blog Management (Admin)

- Rich text editor (TipTap)
- Image upload and cropping
- Tag categorization management
- Markdown support
- Auto-save drafts
- Real-time preview

#### Project Management

- Project creation and editing
- Project cover management
- External link association
- Project statistics and analytics

### 3. User Dashboard

#### Admin Features

- Data statistics dashboard
- User management
- Payment record management
- Media library management
- SEO optimization tools
- Friend link management

#### Regular User Features

- Edit personal profile
- Manage favorite articles
- View payment records
- Message notifications

### 4. HTTP Client

```typescript
import httpClient from "@/app/lib/http/client";

// GET request
const response = await httpClient.get("/api/blogs");

// POST request
const response = await httpClient.post("/api/blogs", {
  title: "Hello World",
  content: "...",
});

// File upload
const response = await httpClient.upload("/api/media", file, {
  uploadProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  },
});
```

### 5. Internationalization

#### Language Switching

```typescript
import { useTranslations } from "next-intl";

function Component() {
  const t = useTranslations("namespace");
  return <div>{t("key")}</div>;
}
```

#### Supported Languages

- Simplified Chinese (zh)
- English (en)

## Deployment Guide

### Deploy on Vercel (Recommended)

1. Push code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Configure environment variables
4. Click deploy

### Self-Hosting

```bash
# Build the project
npm run build

# Start the server
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Development Guide

### Available Commands

```bash
# Development mode (HTTPS + Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Code Style

The project uses ESLint for code linting:

```bash
npm run lint
```

### Development Recommendations

1. **Use TypeScript** - Leverage the type system
2. **Componentization** - Keep components single-responsibility
3. **Use Hooks** - Prefer function components and hooks
4. **Internationalization First** - All text should use i18n
5. **Responsive Design** - Mobile-first
6. **Performance Optimization** - Use SWR cache, lazy loading, etc.

### Workflow for New Features

1. Create a service class in `app/lib/services/`
2. Define TypeScript types in `app/types/`
3. Create components in `app/components/`
4. Create pages in `app/(pages)/`
5. Add translations in `i18n/messages/`

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a **Pull Request**

### Commit Message Convention

```
feat: new feature
fix: bug fix
docs: documentation update
style: code style adjustment
refactor: code refactor
test: test related
chore: build/tooling
```

## License

This project is licensed under the **MIT** License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Author**: NING3739
- **Repository**: [https://github.com/NING3739/blogfrontendclient](https://github.com/NING3739/blogfrontendclient)
- **Issue Feedback**: [GitHub Issues](https://github.com/NING3739/blogfrontendclient/issues/new)

## Acknowledgments

Thanks to the following open source projects:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TipTap](https://tiptap.dev/)
- [SWR](https://swr.vercel.app/)

---

<div align="center">

**If you find this project helpful, please give it a star! ⭐️**

Made with ❤️ by NING3739

</div>
