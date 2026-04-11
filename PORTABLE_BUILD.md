# Brocante - Build Portable (Standalone)

## Architecture

L'application portable embarque tout ce qui est necessaire pour fonctionner sans aucune dependance externe :

```
Brocante.exe (installateur)
  ├── Electron App (React frontend)
  ├── resources/
  │   ├── php/          ← PHP 8.1 portable (php.exe + extensions)
  │   └── laravel-api/  ← API Laravel + vendor/ + .env.portable
  └── %APPDATA%/Brocante/data/
      ├── database/brocante.sqlite  ← Base de donnees
      └── storage/                  ← Logs, cache, sessions
```

**Au lancement :**
1. Electron demarre et lance `php artisan serve` sur un port libre
2. Les migrations sont executees automatiquement (premier lancement ou mise a jour)
3. Le frontend se connecte au serveur PHP local via IPC

## Pre-requis (machine du developpeur uniquement)

- **Node.js** >= 18
- **npm** >= 9
- **Composer** (pour installer les dependances Laravel)
- **PowerShell** 5+ (Windows)
- Connexion Internet (pour telecharger PHP portable la premiere fois)

> L'utilisateur final n'a besoin de RIEN installer.

## Build en une commande

```powershell
cd electron-vite-project
npm run build:portable
```

### Depuis n'importe quel repertoire Windows

**IMPORTANT :** `npm run` ne fonctionne que depuis le repertoire du projet. Pour lancer depuis ailleurs, utilise :

```powershell
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" run build:portable
```

Ou utilise les wrappers `.cmd` fournis :

```powershell
C:\Projects\Personal\brocante_v1.0\electron-vite-project\brocante-setup.cmd
C:\Projects\Personal\brocante_v1.0\electron-vite-project\brocante-build.cmd
```

### Option 3 : Commandes globales avec `npm link` (optionnel)

Tu peux installer les commandes globalement pour les utiliser sans taper le chemin complet.

**Une seule fois, installe le lien global :**

```powershell
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" link
```

**Ensuite, depuis n'importe quel repertoire :**

```powershell
brocante-setup   # Lance le setup portable
brocante-build   # Lance le build complet
```

**Note :** Si PowerShell affiche une erreur de securite, utilise plutot :

```powershell
brocante-setup.cmd
brocante-build.cmd
```

Cela va :
1. Telecharger PHP 8.1 portable (si pas deja fait)
2. Installer les dependances Composer (production)
3. Copier Laravel API dans le bundle
4. Compiler le frontend (Vite + TypeScript)
5. Packager le tout avec electron-builder

L'installateur `.exe` sera dans `release/<version>/`.

## Commandes detaillees

### Etape 1 : Preparer les ressources portables (setup)

**Depuis le repertoire du projet :**

```powershell
cd C:\Projects\Personal\brocante_v1.0\electron-vite-project
npm run setup:portable
```

**Depuis n'importe quel repertoire :**

```powershell
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" run setup:portable
# ou
C:\Projects\Personal\brocante_v1.0\electron-vite-project\brocante-setup.cmd
```

Telecharge PHP portable et prepare le bundle Laravel dans `resources-portable/`.

### Etape 2 : Build complet

**Depuis le repertoire du projet :**

```powershell
cd C:\Projects\Personal\brocante_v1.0\electron-vite-project
npm run build:portable
```

**Depuis n'importe quel repertoire :**

```powershell
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" run build:portable
# ou
C:\Projects\Personal\brocante_v1.0\electron-vite-project\brocante-build.cmd
```

**Important :** Le build complet necessite PowerShell en mode **Administrateur** a cause de electron-builder.

### Tester localement sans build

```powershell
# Terminal 1 : Lancer Laravel avec MySQL (mode dev)
cd laravel-api
php artisan serve

# Terminal 2 : Lancer Electron + Vite
cd electron-vite-project
npm run dev
```

## Configuration PHP portable

Le fichier `scripts/php.ini` contient la configuration PHP embarquee. Extensions activees :
- pdo_sqlite, sqlite3 (base de donnees)
- mbstring, openssl, curl (Laravel core)
- gd, intl (images, internationalisation)
- fileinfo, tokenizer, xml, ctype, dom, filter, bcmath

## Base de donnees

- **Developpement** : MySQL (via `.env` Laravel classique)
- **Production portable** : SQLite (fichier unique dans `%APPDATA%/Brocante/data/database/`)

La migration est automatique au premier lancement. Les donnees sont preservees lors des mises a jour.

## Structure des fichiers modifies

| Fichier | Role |
|---------|------|
| `electron/php-server.ts` | Gestionnaire du serveur PHP embarque |
| `electron/main.ts` | Integration lifecycle Electron + PHP |
| `electron/preload.ts` | Expose `get-api-url` via IPC |
| `src/main.tsx` | Initialise l'URL API au demarrage |
| `src/Data/Utilities/constants.ts` | URL API dynamique (IPC ou fallback) |
| `laravel-api/.env.portable` | Config Laravel pour SQLite portable |
| `scripts/php.ini` | Config PHP embarque |
| `scripts/setup-portable.ps1` | Telecharge et configure PHP portable |
| `scripts/build-portable.ps1` | Script de build complet |
| `brocante-setup.cmd` | Wrapper global pour le setup |
| `brocante-build.cmd` | Wrapper global pour le build |

## Depannage

### `npm run ...` depuis `C:\WINDOWS\system32` ne marche pas
- `npm run` cherche toujours le fichier `package.json` dans le repertoire courant.
- Donc `npm run setup:portable` ou `npm run build:portable` ne peuvent pas fonctionner directement depuis `system32` sans indiquer le projet.
- Utilise a la place :

```powershell
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" run setup:portable
npm --prefix "C:\Projects\Personal\brocante_v1.0\electron-vite-project" run build:portable
```

- Ou utilise les **commandes globales** (apres `npm link`) :

```powershell
brocante-setup
brocante-build
```

### PHP ne demarre pas
- Verifier que `resources-portable/php/php.exe` existe
- Tester manuellement : `resources-portable\php\php.exe -v`
- Verifier `scripts/php.ini` (extensions disponibles)

### La base de donnees est vide
- Supprimer `%APPDATA%/Brocante/data/database/brocante.sqlite`
- Relancer l'application (les migrations + seeds seront relancees)

### Erreur de port
- L'application choisit un port libre automatiquement
- Si probleme, verifier qu'aucun firewall ne bloque les connexions localhost

### Voir les logs PHP
- Logs dans `%APPDATA%/Brocante/data/storage/logs/`
