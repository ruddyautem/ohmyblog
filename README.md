# OhMyBlog!

<div align="center">

**[Français](#français)** · **[English](#english)**

</div>

---

## Français

### 📋 Présentation

Bienvenue sur le code de **OhMyBlog!**. L'idée derrière ce projet, c'était de fabriquer un blog moderne, rapide et agréable à utiliser, sans s'encombrer des usines à gaz habituelles ou des templates tout faits. J'avais envie d'une interface soignée avec une belle typographie, d'un confort de lecture et d'écriture au poil, et d'une mécanique solide sous le capot : **Next.js 16**, **React 19**, **PostgreSQL** avec **Drizzle ORM**, et **Cloudflare R2** pour les images.

L'authentification passe par **Clerk**, avec un webhook sur-mesure qui garde la base PostgreSQL synchronisée et fait le ménage automatiquement sur le stockage.

### 📑 Les pages

| Route                   | Ce qu'on y trouve                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (Accueil)           | Le post à la une, les coups de cœur, les dernières publications et un accès direct aux catégories                                     |
| `/posts`                | Tout le catalogue d'articles, avec recherche en direct, filtrage par catégories (_Voyages, Cuisine, Animaux, Astuces_) et tris variés |
| `/[slug]`               | La lecture complète du post, compteur de vues en temps réel, sauvegarde en favoris, commentaires et actions d'édition/suppression     |
| `/write`                | Le studio de rédaction pour composer et publier (image de une, catégorie, éditeur de texte riche)                                     |
| `/sign-in` & `/sign-up` | La connexion et l'inscription sécurisées propulsées par Clerk                                                                         |

### ⚡ Les petites attentions sur la navigation

J'ai passé pas mal de temps à peaufiner l'interface pour que ce soit agréable au doigt et à l'œil :

- **La pilule noire glissante (_sliding pill_)** : sur grand écran, l'indicateur calcule dynamiquement la taille du texte et glisse naturellement d'un choix à l'autre. Au survol, une prévisualisation légère se déclenche avec un debounce de 120ms pour ne pas saturer l'historique.
- **Le menu déroulant indépendant** : sous « Tous les posts », un menu s'ouvre avec sa propre pilule verticale pour naviguer entre les posts récents, populaires et coups de cœur, sans fermer brusquement au moindre clic.
- **La barre mobile dédiée (`MobileCategoryBar`)** : sur smartphone (même sur un écran tout étroit type iPhone SE), une capsule flottante évite tout débordement horizontal et propose un menu déroulant pleine largeur bien pensé pour le pouce.

### ✍️ Rédaction & images sur Cloudflare R2

Pour la partie contenu, je voulais un workflow fluide et rapide :

- **Upload direct sur Cloudflare R2** : au lieu de faire transiter les photos lourdes par le serveur Next.js, les images de couverture et celles insérées dans les posts partent directement sur un bucket Cloudflare R2 via l'API S3.
- **Éditeur TipTap** : un éditeur riche moderne pour écrire tranquillement avec titres, texte mis en forme et images intégrées.
- **Des slugs soignés** : chaque titre génère automatiquement un slug URL propre, sans accents ni caractères bizarres.
- **Validation avec Zod** : chaque saisie est validée côté client et revérifiée côté serveur.

### 🔐 Authentification & le webhook qui fait le ménage

Je voulais que la gestion des comptes soit carrée et ne laisse rien traîner :

- **Server Actions sécurisées** : chaque action sensible vérifie les droits (seul l'auteur ou un administrateur peut modifier ou supprimer un post).
- **Le webhook Clerk (`/api/webhooks/clerk`)** : il écoute en direct ce qui se passe côté authentification avec vérification de signature Svix sur le corps brut (`req.text()`).
- **Le nettoyage automatique à 360°** : quand un utilisateur supprime son compte sur Clerk, le webhook scanne tous ses posts, efface toutes ses images stockées sur Cloudflare R2, puis supprime son profil en base de données. Grâce aux cascades PostgreSQL (`ON DELETE CASCADE`), tous ses posts, commentaires et likes disparaissent proprement dans la foulée.

### 🛠 Stack technique

| Catégorie             | Technologies                                   |
| --------------------- | ---------------------------------------------- |
| Framework             | Next.js 16 (App Router + Turbopack) + React 19 |
| Langage               | TypeScript                                     |
| Package manager       | Bun                                            |
| Styling               | Tailwind CSS v4                                |
| Base de données       | PostgreSQL (via `postgres.js`) + Drizzle ORM   |
| Authentification      | Clerk (`@clerk/nextjs`) + Webhooks Svix        |
| Stockage d'images     | Cloudflare R2 (compatible AWS S3 SDK v3)       |
| Cache & data fetching | TanStack React Query v5                        |
| Éditeur riche         | TipTap (StarterKit, Image, Underline)          |
| Formulaires           | Zod + React Hook Form                          |
| Toasts                | Sonner                                         |
| Qualité de code       | ESLint                                         |

### 📁 Structure du projet

```
ohmyblog/
├── app/
│   ├── layout.tsx                   # Layout global (Navbar, MobileCategoryBar, Footer)
│   ├── page.tsx                     # Accueil (Hero, sélection, derniers posts)
│   ├── actions.ts                   # Server Actions (CRUD posts, likes, commentaires)
│   ├── globals.css                  # Styles globaux & Tailwind v4
│   ├── [slug]/page.tsx              # Lecture d'un article
│   ├── posts/page.tsx               # Catalogue filtrable & recherche
│   ├── write/page.tsx               # Studio de rédaction
│   ├── sign-in/ & sign-up/          # Écrans d'authentification Clerk
│   └── api/webhooks/clerk/route.ts  # Webhook Svix pour la synchro & le ménage R2
├── components/                      # Composants d'interface
│   ├── Navbar.tsx                   # Barre de navigation desktop avec pilule animée
│   ├── MobileCategoryBar.tsx        # Capsule de sélection mobile & menu
│   ├── FeaturedPosts.tsx            # Bloc des articles à la une
│   ├── PostList.tsx                 # Liste des publications paginée
│   ├── PostListItem.tsx             # Carte d'aperçu d'un post
│   ├── PostMenuActions.tsx          # Actions d'un post (favoris, suppression)
│   ├── Comments.tsx                 # Fil de commentaires
│   ├── Comment.tsx                  # Carte d'un commentaire
│   ├── Search.tsx                   # Barre de recherche synchronisée à l'URL
│   ├── SideMenu.tsx                 # Filtres latéraux (tris & catégories)
│   ├── Upload.tsx                   # Composant d'upload vers Cloudflare R2
│   ├── Image.tsx                    # Affichage optimisé des images
│   └── Footer.tsx                   # Pied de page
├── lib/
│   ├── db/
│   │   ├── index.ts                 # Connexion PostgreSQL & client Drizzle
│   │   ├── schema.ts                # Schéma Drizzle (users, posts, comments, savedPosts)
│   │   └── init.ts                  # Création automatique des tables
│   └── r2.ts                        # Client S3 configuré pour Cloudflare R2
├── public/                          # Images statiques et logos
├── .env.local                       # Variables d'environnement locales
├── bun.lock                         # Lockfile Bun
├── drizzle.config.ts                # Config Drizzle Kit
├── next.config.ts                   # Config Next.js
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

Rendez-vous sur [http://localhost:3000](http://localhost:3000).

> 💡 Le projet a besoin d'un fichier `.env.local` avec vos clés **Clerk**, votre base **PostgreSQL** et votre bucket **Cloudflare R2** :
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
> ```

---

## English

### 📋 Overview

Welcome to the code behind **OhMyBlog!**. The goal here was to build a clean, fast, and enjoyable blogging platform without the clutter of heavy CMSs or cookie-cutter templates. I wanted sharp typography, a smooth reading and writing experience, and solid engineering under the hood: **Next.js 16**, **React 19**, **PostgreSQL** driven by **Drizzle ORM**, and **Cloudflare R2** for fast media delivery.

Authentication is handled via **Clerk**, paired with a custom webhook that keeps PostgreSQL in sync and cleans up orphaned media on the fly.

### 📑 Pages

| Route                   | What's there                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/` (Home)              | Hero featured story, editor highlights, latest posts, and instant category pills                                  |
| `/posts`                | The full post catalogue with live search, category filtering (_Travel, Food, Animals, Tips_), and sorting options |
| `/[slug]`               | The full post read view with real-time visit tracking, bookmarks/favorites, comments, and author actions          |
| `/write`                | The writing studio to draft and publish (cover image, category selector, rich text editor)                        |
| `/sign-in` & `/sign-up` | Secure authentication flows powered by Clerk                                                                      |

### ⚡ Thoughtful Navigation Touches

I spent quite some time fine-tuning navigation details so it feels good to use on any screen:

- **The sliding black pill**: on desktop, the indicator dynamically measures text width and slides smoothly from option to option. Hovering triggers a quick preview with a 120ms debounce so it doesn't flood your history.
- **The independent dropdown**: under "All posts", a dropdown opens with its own vertical sliding pill to toggle between latest, popular, and featured posts without abruptly closing on selection.
- **The dedicated mobile capsule (`MobileCategoryBar`)**: on smartphones (even narrow viewports like an iPhone SE), a floating bar keeps everything within reach with zero horizontal overflow, backed by a thumb-friendly full-width dropdown.

### ✍️ Writing & Cloudflare R2 Media

For content creation, I wanted a fast and frictionless flow:

- **Direct uploads to Cloudflare R2**: instead of routing heavy image uploads through the Next.js server and hogging bandwidth, cover images and in-post illustrations go straight to a Cloudflare R2 bucket via the S3 API.
- **TipTap rich text editor**: a modern editor for writing with clean headings, formatted text, and embedded media.
- **Clean slugs**: every title automatically gets a clean, accent-free, URL-safe slug.
- **Zod validation**: all inputs are validated on the client and strictly re-checked on the server.

### 🔐 Auth & the Webhook that cleans up after itself

I wanted account management to be rock-solid, leaving zero orphaned files behind:

- **Secured Server Actions**: sensitive actions strictly check permissions (only post authors or admins can edit or delete).
- **The Clerk webhook (`/api/webhooks/clerk`)**: listens live to user lifecycle events with raw-body Svix signature verification (`req.text()`).
- **360° Automated cleanup**: when an account is deleted in Clerk, the webhook scans all of that user's posts, deletes every associated image file on Cloudflare R2, and deletes the user record in PostgreSQL. With `ON DELETE CASCADE`, all posts, comments, and likes vanish cleanly along with it.

### 🛠 Tech stack

| Category           | Technologies                                   |
| ------------------ | ---------------------------------------------- |
| Framework          | Next.js 16 (App Router + Turbopack) + React 19 |
| Language           | TypeScript                                     |
| Package manager    | Bun                                            |
| Styling            | Tailwind CSS v4                                |
| Database           | PostgreSQL (via `postgres.js`) + Drizzle ORM   |
| Authentication     | Clerk (`@clerk/nextjs`) + Svix Webhooks        |
| Image storage      | Cloudflare R2 (AWS S3 SDK v3 compatible)       |
| Caching & state    | TanStack React Query v5                        |
| Rich text editor   | TipTap (StarterKit, Image, Underline)          |
| Forms & validation | Zod + React Hook Form                          |
| Toasts             | Sonner                                         |
| Code quality       | ESLint                                         |

### 📁 Project structure

```
ohmyblog/
├── app/
│   ├── layout.tsx                   # Global layout (Navbar, MobileCategoryBar, Footer)
│   ├── page.tsx                     # Homepage (Hero, highlights, latest posts)
│   ├── actions.ts                   # Server Actions (CRUD posts, likes, comments)
│   ├── globals.css                  # Global styles & Tailwind v4
│   ├── [slug]/page.tsx              # Single post view
│   ├── posts/page.tsx               # Searchable & filterable post archive
│   ├── write/page.tsx               # Writing studio
│   ├── sign-in/ & sign-up/          # Clerk authentication routes
│   └── api/webhooks/clerk/route.ts  # Svix webhook for sync & R2 cleanup
├── components/                      # UI components
│   ├── Navbar.tsx                   # Desktop navbar with sliding animated pill
│   ├── MobileCategoryBar.tsx        # Mobile category capsule & dropdown
│   ├── FeaturedPosts.tsx            # Featured stories highlight
│   ├── PostList.tsx                 # Paginated post feed
│   ├── PostListItem.tsx             # Post preview card
│   ├── PostMenuActions.tsx          # Post actions (save, delete)
│   ├── Comments.tsx                 # Comment thread
│   ├── Comment.tsx                  # Single comment card
│   ├── Search.tsx                   # Search bar synced with URL params
│   ├── SideMenu.tsx                 # Side filters (sorts & categories)
│   ├── Upload.tsx                   # Cloudflare R2 image upload handler
│   ├── Image.tsx                    # Optimized image component
│   └── Footer.tsx                   # Footer
├── lib/
│   ├── db/
│   │   ├── index.ts                 # PostgreSQL connection & Drizzle client
│   │   ├── schema.ts                # Drizzle schema (users, posts, comments, savedPosts)
│   │   └── init.ts                  # Auto table initialization
│   └── r2.ts                        # S3 client configured for Cloudflare R2
├── public/                          # Static assets and branding
├── .env.local                       # Local environment variables
├── bun.lock                         # Bun lockfile
├── drizzle.config.ts                # Drizzle Kit config
├── next.config.ts                   # Next.js config
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

Visit [http://localhost:3000](http://localhost:3000).

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
> ```
