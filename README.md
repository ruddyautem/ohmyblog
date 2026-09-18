# OhMyBlog!

<div align="center">

**[Français](#français)** · **[English](#english)**

</div>

---

## Français

### 📋 Présentation

Bienvenue sur le dépôt de **OhMyBlog!**. L'objectif de ce projet : concevoir un blog moderne, rapide et agréable à utiliser, sans s'encombrer d'une usine à gaz ni d'un template générique. L'ambition était simple — une interface soignée, une typographie léchée, un vrai confort de lecture et d'écriture, le tout appuyé sur une mécanique solide : **Next.js 16**, **React 19**, **PostgreSQL** avec **Drizzle ORM**, et **Cloudflare R2** pour les images.

L'authentification est gérée par **Clerk**, couplée à un webhook sur-mesure qui garde la base PostgreSQL synchronisée et fait le ménage automatiquement dans le stockage.

### 📑 Les pages

| Route                   | Ce qu'on y trouve                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (Accueil)           | Le post à la une, les coups de cœur, les dernières publications et un accès direct aux catégories                        |
| `/posts`                | Le catalogue complet des articles, avec recherche en direct, filtrage par catégories (_Voyages, Cuisine, Animaux, Astuces_) et tris variés |
| `/[slug]`               | La lecture complète d'un article, compteur de vues en temps réel, sauvegarde en favoris, commentaires et actions d'édition/suppression   |
| `/write`                | Le studio de rédaction pour composer et publier (image de une, catégorie, éditeur de texte riche)                                        |
| `/sign-in` & `/sign-up` | Connexion et inscription sécurisées, propulsées par Clerk                                                                                |
| `404` (`not-found.tsx`) | Écran d'erreur 404 personnalisé, avec barre de recherche contextuelle et boutons de redirection rapide                                   |

### ⚡ Les petites attentions sur la navigation

Beaucoup de soin a été apporté à l'interface pour qu'elle reste agréable, au doigt comme à l'œil :

- **La pilule noire glissante (_sliding pill_)** : sur grand écran, l'indicateur calcule dynamiquement la largeur du texte et glisse naturellement d'un choix à l'autre. Au survol, une prévisualisation légère se déclenche avec un debounce de 120 ms, pour ne pas saturer l'historique de navigation.
- **Le menu déroulant indépendant** : sous « Tous les posts », un menu s'ouvre avec sa propre pilule verticale pour naviguer entre les posts récents, populaires et coups de cœur, sans se refermer brutalement au moindre clic.
- **La barre mobile dédiée (`MobileCategoryBar`)** : sur smartphone — y compris sur un écran très étroit comme celui de l'iPhone SE — une capsule flottante évite tout débordement horizontal, complétée par un menu déroulant pleine largeur pensé pour le pouce.
- **Mode sombre / clair persistant** : bascule de thème instantanée et sans flash lumineux (`ThemeProvider`), avec adaptation automatique aux préférences système.

### ✍️ Rédaction & images sur Cloudflare R2

Côté contenu, l'objectif était un flux de travail fluide et rapide :

- **Upload direct sur Cloudflare R2** : plutôt que de faire transiter les photos lourdes par le serveur Next.js, les images de couverture et celles insérées dans les articles partent directement vers un bucket Cloudflare R2 via l'API S3.
- **Éditeur TipTap** : un éditeur riche et moderne pour écrire sereinement, avec titres, mise en forme du texte et images intégrées.
- **Des slugs soignés** : chaque titre génère automatiquement un slug d'URL propre, sans accents ni caractères indésirables.
- **Validation avec Zod** : chaque saisie est validée côté client, puis revérifiée côté serveur.

### 🔐 Authentification & le webhook qui fait le ménage

La gestion des comptes se devait d'être rigoureuse, sans rien laisser traîner :

- **Server Actions sécurisées** : chaque action sensible vérifie les droits — seuls l'auteur d'un post ou un administrateur peuvent le modifier ou le supprimer.
- **Le webhook Clerk (`/api/webhooks/clerk`)** : il écoute en temps réel les événements liés à l'authentification, avec vérification de la signature Svix sur le corps brut de la requête (`req.text()`).
- **Le nettoyage automatique à 360°** : quand un utilisateur supprime son compte sur Clerk, le webhook parcourt tous ses posts, efface l'ensemble de ses images stockées sur Cloudflare R2, puis supprime son profil en base de données. Grâce aux cascades PostgreSQL (`ON DELETE CASCADE`), ses posts, commentaires et likes disparaissent proprement dans la foulée.

### 🛡️ Sécurité, SEO & performance (standards modernes)

Le projet a été audité et renforcé pour répondre aux exigences actuelles de production :

- **Sécurité HTTP & rate limiting**
  - En-têtes de sécurité stricts (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
  - Masquage des en-têtes techniques (`poweredByHeader: false`).
  - Limitation de débit en mémoire contre le spam sur les actions serveur (création d'articles, ajout de commentaires, signatures d'upload).
  - Validation serveur des longueurs de champs et protection contre les requêtes de pagination démesurées.
- **SEO & Schema.org de niveau entreprise**
  - Données structurées JSON-LD **Schema.org** : balise `WebSite` avec `SearchAction` sur l'accueil, et `BlogPosting` complet sur chaque article.
  - Cartes Twitter (`summary_large_image`) et balises OpenGraph sur l'ensemble des pages.
  - Directives Googlebot fines (`max-image-preview: large`) et balises canoniques absolues.
  - Génération dynamique de `sitemap.xml` (articles + catégories) avec revalidation ISR périodique, et `robots.txt` protégeant les routes privées (`/api/`, `/write`, `/sign-in`).
- **Core Web Vitals & optimisation des images**
  - Distribution aux formats modernes **AVIF** et **WebP** pour les images Cloudflare R2, Clerk et Unsplash.
  - Préchargement LCP (`priority={true}`) sur les articles en vedette.
  - Squelette de chargement global (`loading.tsx`) pour limiter le CLS et fluidifier les transitions.
- **Accessibilité (A11y)**
  - Conformité HTML stricte (aucun bouton interactif imbriqué dans un lien).
  - Attributs ARIA (`aria-label`, `aria-expanded`, `aria-haspopup`, `aria-pressed`).
  - Navigation intégrale au clavier (`Enter` et `Espace`) sur les pastilles de filtre et les tags.
- **Résilience UX**
  - Page 404 sur-mesure ([`app/not-found.tsx`](file:///c:/Users/ruddy/Documents/WebDev/ohmyblog/app/not-found.tsx)) avec barre de recherche responsive intégrée.
  - Frontière d'erreur React côté client ([`app/error.tsx`](file:///c:/Users/ruddy/Documents/WebDev/ohmyblog/app/error.tsx)) avec bouton « Réessayer » (`reset()`).

### 🛠 Stack technique

| Catégorie              | Technologies                                                |
| ----------------------- | ------------------------------------------------------------ |
| Framework               | Next.js 16 (App Router + Turbopack) + React 19               |
| Langage                 | TypeScript (mode strict)                                     |
| Gestionnaire de paquets | Bun                                                           |
| Style & thème           | Tailwind CSS v4 + mode sombre persistant                      |
| Base de données         | PostgreSQL (via `postgres.js`) + Drizzle ORM                  |
| Authentification        | Clerk (`@clerk/nextjs`) + webhooks Svix                       |
| Stockage d'images       | Cloudflare R2 (compatible AWS S3 SDK v3)                      |
| Cache & data fetching   | TanStack React Query v5                                       |
| Éditeur riche           | TipTap (StarterKit, Image, Underline)                          |
| Formulaires             | Zod + React Hook Form                                          |
| Notifications           | Sonner                                                          |
| SEO & données struct.   | MetadataRoute (Sitemap & Robots) + Schema.org JSON-LD           |
| Sécurité & performance  | En-têtes HTTP de sécurité, formats AVIF/WebP, rate limiting     |

### 📁 Structure du projet

```
ohmyblog/
├── app/
│   ├── layout.tsx                   # Layout global (Navbar, Footer, ThemeProvider, Schema.org WebSite)
│   ├── page.tsx                     # Accueil (Hero, sélection, derniers posts)
│   ├── actions.ts                   # Server Actions (CRUD, likes, commentaires, rate-limit)
│   ├── globals.css                  # Styles globaux & Tailwind v4
│   ├── error.tsx                    # Frontière d'erreur client avec réessai
│   ├── loading.tsx                  # Squelette de chargement global anti-CLS
│   ├── not-found.tsx                # Page 404 personnalisée avec recherche intégrée
│   ├── [slug]/page.tsx              # Lecture d'un article (Schema.org BlogPosting, OpenGraph)
│   ├── posts/page.tsx               # Catalogue filtrable & recherche
│   ├── write/page.tsx               # Studio de rédaction (TipTap & Cloudflare R2)
│   ├── sitemap.ts                   # Génération dynamique du sitemap XML (articles + catégories)
│   ├── robots.ts                    # Directives robots.txt pour les moteurs de recherche
│   ├── sign-in/ & sign-up/          # Écrans d'authentification Clerk
│   └── api/webhooks/clerk/route.ts  # Webhook Svix pour la synchro & le ménage R2
├── components/                      # Composants d'interface
│   ├── Navbar.tsx                   # Barre de navigation desktop avec pilule animée & A11y
│   ├── MobileCategoryBar.tsx        # Capsule de sélection mobile & menu déroulant
│   ├── MobileBottomNav.tsx          # Barre de navigation mobile inférieure
│   ├── FeaturedPosts.tsx            # Bloc des articles à la une (préchargement LCP)
│   ├── PostList.tsx                 # Liste des publications paginée
│   ├── PostListItem.tsx             # Carte d'aperçu d'un post (navigation clavier A11y)
│   ├── PostMenuActions.tsx          # Actions d'un post (favoris, suppression)
│   ├── Comments.tsx                 # Fil de commentaires avec validation
│   ├── Comment.tsx                  # Carte d'un commentaire
│   ├── Search.tsx                   # Barre de recherche responsive & modulable
│   ├── SideMenu.tsx                 # Filtres latéraux (tris & catégories avec aria-pressed)
│   ├── ThemeProvider.tsx            # Gestionnaire de thèmes sombre / clair
│   ├── AppToaster.tsx               # Notifications toast stylisées (Sonner)
│   ├── Upload.tsx                   # Composant d'upload vers Cloudflare R2
│   ├── Image.tsx                    # Affichage optimisé Next.js (AVIF/WebP)
│   └── Footer.tsx                   # Pied de page
├── lib/
│   ├── db/
│   │   ├── index.ts                 # Connexion PostgreSQL & client Drizzle
│   │   ├── schema.ts                # Schéma Drizzle (users, posts, comments, savedPosts)
│   │   └── init.ts                  # Création automatique des tables
│   ├── clerk-appearance.ts          # Thèmes et styles sur-mesure pour Clerk
│   ├── r2.ts                        # Client S3 configuré pour Cloudflare R2
│   ├── rate-limit.ts                # Limiteur de débit en mémoire anti-spam
│   ├── site-url.ts                  # Détection de l'URL canonique (production/locale)
│   └── timeago-fr.ts                # Formatage relatif des dates en français
├── public/                          # Images statiques et logos
├── .env.local                       # Variables d'environnement locales
├── bun.lock                         # Lockfile Bun
├── drizzle.config.ts                # Config Drizzle Kit
├── next.config.ts                   # Config Next.js (en-têtes de sécurité & formats d'images)
├── package.json
└── README.md
```

### 🚀 Lancer le projet en local

```bash
git clone <url-du-repo>
cd ohmyblog

bun install
bun run dev
```

Rendez-vous ensuite sur [http://localhost:3000](http://localhost:3000).

> 💡 Le projet nécessite un fichier `.env.local` renseigné avec vos clés **Clerk**, votre base **PostgreSQL** et votre bucket **Cloudflare R2** :
>
> ```env
> DATABASE_URL=postgresql://user:password@host:5432/dbname
> NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
> CLERK_SECRET_KEY=sk_test_...
> CLERK_WEBHOOK_SECRET=whsec_...
> R2_ACCOUNT_ID=...
> R2_ACCESS_KEY_ID=...
> R2_SECRET_ACCESS_KEY=...
> R2_BUCKET_NAME=...
> NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-...r2.dev
> NEXT_PUBLIC_APP_URL=http://localhost:3000
> ```

---

## English

### 📋 Overview

Welcome to the codebase behind **OhMyBlog!**. The goal here was to build a clean, fast, and genuinely enjoyable blogging platform — no bloated CMS, no cookie-cutter template. Just sharp typography, a smooth reading and writing experience, and solid engineering underneath: **Next.js 16**, **React 19**, **PostgreSQL** driven by **Drizzle ORM**, and **Cloudflare R2** for fast media delivery.

Authentication runs through **Clerk**, paired with a custom webhook that keeps PostgreSQL in sync and cleans up orphaned media automatically.

### 📑 Pages

| Route                   | What's there                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/` (Home)              | Hero featured story, editor's highlights, latest posts, and instant category pills                                   |
| `/posts`                | The full post catalogue with live search, category filtering (_Travel, Food, Animals, Tips_), and sorting options    |
| `/[slug]`               | The full post read view with real-time visit tracking, bookmarks/favorites, comments, and author actions             |
| `/write`                | The writing studio to draft and publish — cover image, category selector, rich text editor                           |
| `/sign-in` & `/sign-up` | Secure authentication flows powered by Clerk                                                                          |
| `404` (`not-found.tsx`) | Custom 404 page with a contextual search bar and quick recovery links                                                 |

### ⚡ Thoughtful navigation touches

A fair amount of care went into the navigation details, so it feels good on any screen:

- **The sliding black pill**: on desktop, the indicator dynamically measures text width and glides smoothly between options. Hovering triggers a lightweight preview with a 120ms debounce, so it doesn't flood your browser history.
- **The independent dropdown**: under "All posts", a dropdown opens with its own vertical sliding pill to toggle between latest, popular, and featured posts, without snapping shut on selection.
- **The dedicated mobile capsule (`MobileCategoryBar`)**: on smartphones — even on a narrow viewport like the iPhone SE — a floating bar keeps everything within reach with zero horizontal overflow, backed by a thumb-friendly, full-width dropdown.
- **Persistent dark / light theme**: instant theme switching with no flash of unstyled content (`ThemeProvider`), matching system preferences automatically.

### ✍️ Writing & Cloudflare R2 media

For content creation, the goal was a fast, frictionless flow:

- **Direct uploads to Cloudflare R2**: instead of routing heavy image uploads through the Next.js server, cover images and in-post illustrations go straight to a Cloudflare R2 bucket via the S3 API.
- **TipTap rich text editor**: a modern editor for writing with clean headings, formatted text, and embedded media.
- **Clean slugs**: every title automatically generates a clean, accent-free, URL-safe slug.
- **Zod validation**: every input is validated on the client and strictly re-checked on the server.

### 🔐 Auth & the webhook that cleans up after itself

Account management needed to be airtight, with zero orphaned files left behind:

- **Secured Server Actions**: sensitive actions strictly check permissions — only a post's author or an admin can edit or delete it.
- **The Clerk webhook (`/api/webhooks/clerk`)**: listens live to user lifecycle events, with Svix signature verification on the raw request body (`req.text()`).
- **360° automated cleanup**: when a user deletes their account in Clerk, the webhook scans all of that user's posts, deletes every associated image on Cloudflare R2, then removes the user record from PostgreSQL. Thanks to `ON DELETE CASCADE`, all their posts, comments, and likes vanish cleanly right along with it.

### 🛡️ Security, SEO & performance (modern standards)

The platform has been thoroughly audited and hardened to meet current production standards:

- **HTTP security & rate limiting**
  - Strict security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
  - Server header obfuscation (`poweredByHeader: false`).
  - In-memory anti-spam rate limiting on Server Actions (post creation, comment submission, presigned upload URLs).
  - Strict input-length validation and guarded pagination query boundaries.
- **Enterprise-grade SEO & Schema.org**
  - **Schema.org** JSON-LD structured data: a `WebSite` tag with `SearchAction` on the homepage, and a full `BlogPosting` on every article.
  - Twitter Cards (`summary_large_image`) and OpenGraph metadata across every route.
  - Fine-grained Googlebot directives (`max-image-preview: large`) and absolute canonical URLs.
  - Dynamic `sitemap.xml` generation (posts + categories) with periodic ISR revalidation, and a crawler-friendly `robots.txt` safeguarding private routes (`/api/`, `/write`, `/sign-in`).
- **Core Web Vitals & image optimization**
  - Next-gen image formats (**AVIF** and **WebP**) for Cloudflare R2, Clerk, and Unsplash sources.
  - LCP preloading (`priority={true}`) for hero cover images.
  - A zero-CLS global loading skeleton (`loading.tsx`) for seamless transitions.
- **Accessibility (A11y)**
  - Strict HTML compliance (no interactive buttons nested inside links).
  - ARIA attributes (`aria-label`, `aria-expanded`, `aria-haspopup`, `aria-pressed`).
  - Full keyboard navigation (`Enter` and `Space`) on filter chips and tags.
- **UX resilience**
  - Custom 404 page ([`app/not-found.tsx`](file:///c:/Users/ruddy/Documents/WebDev/ohmyblog/app/not-found.tsx)) with an integrated, responsive search bar.
  - Client-side error boundary ([`app/error.tsx`](file:///c:/Users/ruddy/Documents/WebDev/ohmyblog/app/error.tsx)) with instant retry, without losing page state.

### 🛠 Tech stack

| Category                | Technologies                                                |
| ------------------------ | ------------------------------------------------------------ |
| Framework                | Next.js 16 (App Router + Turbopack) + React 19                |
| Language                 | TypeScript (strict mode)                                       |
| Package manager          | Bun                                                             |
| Styling & theme          | Tailwind CSS v4 + persistent dark mode                          |
| Database                 | PostgreSQL (via `postgres.js`) + Drizzle ORM                    |
| Authentication           | Clerk (`@clerk/nextjs`) + Svix webhooks                          |
| Image storage            | Cloudflare R2 (AWS S3 SDK v3 compatible)                          |
| Caching & state          | TanStack React Query v5                                            |
| Rich text editor         | TipTap (StarterKit, Image, Underline)                                |
| Forms & validation       | Zod + React Hook Form                                                  |
| Toasts                   | Sonner                                                                   |
| SEO & structured data    | MetadataRoute (Sitemap & Robots) + Schema.org JSON-LD                     |
| Security & performance   | Strict HTTP headers, AVIF/WebP formats, rate limiting                       |

### 📁 Project structure

```
ohmyblog/
├── app/
│   ├── layout.tsx                   # Global layout (Navbar, Footer, ThemeProvider, Schema.org WebSite)
│   ├── page.tsx                     # Homepage (Hero, highlights, latest posts)
│   ├── actions.ts                   # Server Actions (CRUD, likes, comments, rate-limit)
│   ├── globals.css                  # Global styles & Tailwind v4
│   ├── error.tsx                    # Client error boundary with retry button
│   ├── loading.tsx                  # Zero-CLS global loading skeleton
│   ├── not-found.tsx                # Custom 404 page with integrated search
│   ├── [slug]/page.tsx              # Single post view (Schema.org BlogPosting, OpenGraph)
│   ├── posts/page.tsx               # Searchable & filterable post archive
│   ├── write/page.tsx               # Writing studio (TipTap & Cloudflare R2)
│   ├── sitemap.ts                   # Dynamic XML sitemap generation (posts + categories)
│   ├── robots.ts                    # Search engine crawler robots.txt directives
│   ├── sign-in/ & sign-up/          # Clerk authentication routes
│   └── api/webhooks/clerk/route.ts  # Svix webhook for sync & R2 cleanup
├── components/                      # UI components
│   ├── Navbar.tsx                   # Desktop navbar with sliding animated pill & A11y
│   ├── MobileCategoryBar.tsx        # Mobile category capsule & dropdown
│   ├── MobileBottomNav.tsx          # Mobile bottom navigation bar
│   ├── FeaturedPosts.tsx            # Featured stories highlight (LCP preloading)
│   ├── PostList.tsx                 # Paginated post feed
│   ├── PostListItem.tsx             # Post preview card (A11y keyboard support)
│   ├── PostMenuActions.tsx          # Post actions (save, delete)
│   ├── Comments.tsx                 # Comment thread with input validation
│   ├── Comment.tsx                  # Single comment card
│   ├── Search.tsx                   # Responsive & adaptable search input
│   ├── SideMenu.tsx                 # Side filters (sorts & categories with aria-pressed)
│   ├── ThemeProvider.tsx            # Dark / light theme provider
│   ├── AppToaster.tsx               # Styled toast notifications (Sonner)
│   ├── Upload.tsx                   # Cloudflare R2 image upload handler
│   ├── Image.tsx                    # Next.js optimized image component (AVIF/WebP)
│   └── Footer.tsx                   # Footer
├── lib/
│   ├── db/
│   │   ├── index.ts                 # PostgreSQL connection & Drizzle client
│   │   ├── schema.ts                # Drizzle schema (users, posts, comments, savedPosts)
│   │   └── init.ts                  # Automatic table initialization
│   ├── clerk-appearance.ts          # Custom Clerk theme styling
│   ├── r2.ts                        # S3 client configured for Cloudflare R2
│   ├── rate-limit.ts                # In-memory anti-spam rate limiter
│   ├── site-url.ts                  # Canonical site URL helper (production/local)
│   └── timeago-fr.ts                # Relative time formatting in French
├── public/                          # Static assets and branding
├── .env.local                       # Local environment variables
├── bun.lock                         # Bun lockfile
├── drizzle.config.ts                # Drizzle Kit config
├── next.config.ts                   # Next.js config (security headers & image formats)
├── package.json
└── README.md
```

### 🚀 Running locally

```bash
git clone <repo-url>
cd ohmyblog

bun install
bun run dev
```

Then visit [http://localhost:3000](http://localhost:3000).

> 💡 You'll need a `.env.local` file with your **Clerk**, **PostgreSQL**, and **Cloudflare R2** credentials:
>
> ```env
> DATABASE_URL=postgresql://user:password@host:5432/dbname
> NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
> CLERK_SECRET_KEY=sk_test_...
> CLERK_WEBHOOK_SECRET=whsec_...
> R2_ACCOUNT_ID=...
> R2_ACCESS_KEY_ID=...
> R2_SECRET_ACCESS_KEY=...
> R2_BUCKET_NAME=...
> NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-...r2.dev
> NEXT_PUBLIC_APP_URL=http://localhost:3000
> ```