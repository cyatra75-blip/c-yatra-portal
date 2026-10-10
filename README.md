# C-Yatra — Travel Booking Portal Software

Production-ready, responsive private travel booking portal launcher and administration management system built for **C-Yatra**.

---

## 🌟 Overview & Purpose

C-Yatra is an internal travel agency operations portal designed for rapid access to third-party travel booking platforms (flights, fixed departures, hotels, cabs, homestays, villas, buses, trains, visas, and insurance).

- **Owner Dashboard (`/dashboard`)**: A streamlined, visual booking launcher with scenic Udaipur lake palace hero imagery, dynamic travel categories, instant search, and one-click external booking site opening (`target="_blank"` with `noopener noreferrer`).
- **Admin Management Console (`/admin/portals`, `/admin/categories`)**: A secure administrative console allowing the agency owner or administrator to create, edit, reorder, and toggle travel categories and booking portals dynamically without changing source code.
- **Strict Role-Based Access Control**:
  - Owner login: `/login` (redirects to `/dashboard`)
  - Admin login: `/admin/login` (redirects to `/admin/portals`)
  - No public registration or sign-up links.
  - Edge middleware and API route guards enforce role boundaries.

---

## 🎨 Visual Identity & Reference Fidelity

- **Original Logo**: Implemented with the authentic uploaded C-Yatra brand asset at `/public/images/logo.png`.
- **Primary Brand Color**: C-Yatra red (`#E11D2A`), with supporting emerald green (`#16A34A`), dark navy (`#0F172A`), and clean slate borders.
- **Hero & Login Scenic Imagery**: Panoramic views of Lake Pichola and Taj Lake Palace in Udaipur (`/public/images/udaipur-hero.jpg` and `/public/images/udaipur-login.jpg`).
- **Responsive Layout**:
  - **Desktop**: Horizontal category cards, 2-column portal grid, search bar, spacious header.
  - **Mobile**: Compact 4-column category grid, single-column portal cards with compact "Open ↗" button, touch-friendly padding.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth with Row Level Security (RLS) & `@supabase/ssr`
- **Validation**: Zod schema validation on both client and server
- **Icons**: Lucide React

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                     # Root layout with metadata and styles
│   ├── globals.css                    # Tailwind CSS custom styling
│   ├── page.tsx                       # Root route redirection
│   ├── login/page.tsx                 # Owner login screen
│   ├── dashboard/page.tsx             # Owner dashboard (Hero, Categories, Portals)
│   ├── admin/
│   │   ├── login/page.tsx             # Admin login screen
│   │   ├── categories/page.tsx        # Dynamic category management & icon picker
│   │   └── portals/page.tsx           # Booking portal CRUD & URL management
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts         # Role-based login API
│       │   ├── logout/route.ts        # Logout session invalidation
│       │   └── me/route.ts            # Current session validation
│       ├── categories/
│       │   ├── route.ts               # GET active categories, POST new category
│       │   └── [id]/route.ts          # PUT update, DELETE with reassignment
│       └── portals/
│           ├── route.ts               # GET filtered portals, POST new portal
│           └── [id]/route.ts          # PUT update, DELETE portal
├── components/
│   ├── CatraLogo.tsx                  # Authentic C-Yatra logo component
│   ├── HeroBanner.tsx                 # Scenic Udaipur panoramic banner
│   ├── CategoryGrid.tsx               # Responsive 4-col mobile / horizontal desktop selector
│   ├── PortalCard.tsx                 # 2-col desktop / 1-col mobile portal card
│   ├── PortalSearch.tsx               # Instant search input with clear trigger
│   ├── OwnerLoginForm.tsx             # Owner login card with eye toggle
│   ├── AdminLoginForm.tsx             # Admin login card with security notice
│   ├── AdminNav.tsx                   # Admin header (Categories, Portals, Logout)
│   ├── CategoryModal.tsx              # Add/Edit category dialog
│   ├── PortalModal.tsx                # Add/Edit portal with live logo preview
│   ├── ConfirmDeleteModal.tsx         # Safe deletion dialog with reassignment
│   └── IconPicker.tsx                 # Searchable Lucide travel icon picker
├── lib/
│   ├── auth.ts                        # Signed session tokens & RBAC verification
│   ├── icons.ts                       # Lucide icon dictionary and resolution
│   ├── types.ts                       # Category, Portal, Profile TypeScript definitions
│   ├── validations/                   # Zod schemas (auth, categories, portals)
│   └── supabase/                      # SSR client, server client, and DAL service
├── middleware.ts                      # Route guards for `/dashboard` and `/admin/*`
├── public/
│   ├── images/                        # C-Yatra logo and Udaipur scenic imagery
│   └── portals/                       # Vector brand SVG logos for booking portals
└── supabase/
    ├── migrations/20261010_init.sql   # Complete PostgreSQL schema, tables, RLS policies
    └── seed.sql                       # Default 10 categories and sample portals
```

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Configure your initial credentials and secret:

```env
# Session Cookie Signing Secret (at least 32 characters)
SESSION_SECRET=c-yatra-secure-session-signing-key-32-chars-long

# Initial Default Credentials
INITIAL_OWNER_EMAIL=owner@cyatra.com
INITIAL_OWNER_PASSWORD=Owner@123
INITIAL_ADMIN_EMAIL=admin@cyatra.com
INITIAL_ADMIN_PASSWORD=Admin@123

# Optional: Remote Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Running in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Owner Login**: [http://localhost:3000/login](http://localhost:3000/login)
  - Default Email: `owner@cyatra.com`
  - Default Password: `Owner@123`
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - Default Email: `admin@cyatra.com`
  - Default Password: `Admin@123`

---

## 🗄️ Supabase Database Setup

When deploying to Supabase:

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Navigate to **SQL Editor**.
3. Run the migration script: `supabase/migrations/20261010_init.sql`.
4. Run the seed script: `supabase/seed.sql`.
5. Under **Project Settings > API**, copy your `URL`, `anon public` key, and `service_role secret` key into your `.env.local` or hosting provider environment variables.

### Row Level Security (RLS) Policies Included:
- **`profiles`**: Authenticated users can view their own profile; admins can manage profiles.
- **`categories`**: Owner can view active categories; admins can insert, update, and delete.
- **`portals`**: Owner can view active portals in active categories; admins can insert, update, and delete.
- **Anonymous**: Access to private portals is denied.

---

## 🧪 Testing Acceptance Criteria

1. **Owner Login (`/login`)**: Logs in with owner credentials and lands on `/dashboard`.
2. **Admin Login (`/admin/login`)**: Logs in with admin credentials and lands on `/admin/portals`.
3. **Route Protection**: Accessing `/dashboard` or `/admin/*` unauthenticated redirects to their respective login pages.
4. **Owner Separation**: Owner accounts cannot access `/admin/*` routes or trigger admin mutations.
5. **Dynamic Categories**: Admin can add, rename, re-icon, reorder, or toggle active status. Owner dashboard immediately updates.
6. **Dynamic Portals**: Admin can add, edit, or remove portals with live logo preview and HTTP/HTTPS URL validation.
7. **Safe Deletion**: Deleting a category with active portals prompts for safe reassignment or confirmation.
8. **Responsive UI**: Pixel-accurate desktop and mobile layouts matching provided design references.
