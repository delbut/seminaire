# Séminaire Olympiades

Site de gestion des olympiades pour un séminaire de 3 jours.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- Prisma 5 + PostgreSQL (Neon)
- Hébergement : Vercel

## Commandes utiles
```bash
npm run dev        # Développement local
npm run build      # Build de production
npx prisma generate        # Générer le client Prisma
npx prisma db push         # Pousser le schéma vers la BDD (sans migration)
npx prisma migrate dev     # Créer une migration
npx prisma studio          # Interface visuelle BDD
```

## Variables d'environnement
- `DATABASE_URL` : URL PostgreSQL Neon (à configurer dans `.env` et sur Vercel)

## Architecture
- `src/app/` : Pages Next.js (App Router)
- `src/app/api/` : Routes API
- `src/lib/prisma.ts` : Client Prisma singleton
- `src/lib/scoring.ts` : Logique de points
- `prisma/schema.prisma` : Schéma BDD

## Règles métier
- 11 participants, 5 équipes de 2 + 1 équipe flexible (6e)
- 6e équipe : mode mercenaire (2 fixes + 1 rotatif par tournoi) ou équipe de 3 fixe
- Scoring : 1re→6pts, 2e→5pts, 3e→4pts, 4e→3pts, 5e→2pts, 6e→1pt
- Classement général = somme des points sur tous les tournois terminés
