# Portfolio Angelo Randrianasolo

Portfolio **professionnel** d'Angelo Randrianasolo — développeur Full Stack,
actuellement étudiant en L3. Site statique servi par Nginx, adossé à une
**API REST Django** et à un **back-office** privé.

## Stack

| Rôle | Technologie |
| --- | --- |
| Site public | HTML5, CSS3, JavaScript vanilla (sans dépendance) |
| API REST | **Django** (vues JSON, architecture **MVC** : modèles, contrôleurs, vues) |
| Persistance | SQLite (migré via `manage.py migrate`), médias sur disque |
| Service | **Gunicorn** (WSGI, 2 workers × 2 threads) |
| Reverse proxy | **Nginx** — un seul port, `/api/` et `/media/` routés vers Django |
| Images | Pillow (validation et redimensionnement des téléversements) |
| Conteneurs | Docker Compose (`api` + `web`) |

Le frontend et l'API partagent la **même origine** : Nginx rejoue `/api/` vers
Django, ce qui supprime tout besoin de CORS.

## Design

- Typographie **Syne** (titres) + **Manrope** (texte), via Google Fonts
- Identité violette conservée (`--brand-fill: #5a4df0`), halos d'ambiance et grain fin
- Sections numérotées (01 → 07) à l'esthétique éditoriale
- Bandeau défilant (`.marquee`), carte « Featured » en dégradé `#4438d8 → #5a4df0`
- Pied de page inversé (fond sombre dans les deux thèmes)
- Entête translucide avec effet de flou (`backdrop-filter`)

## Fonctionnalités

**Site public**

- Mode clair et sombre (mémorisé, adapté au système, sans flash au chargement)
- Français et anglais : textes, libellés d'accessibilité **et** contenus de l'API (`?lang=`)
- Responsive avec menu burger déclenché ≤ 1040 px, fermé au clic ou à `Échap`
- Apparitions au scroll (respectant `prefers-reduced-motion`) et scroll-spy qui
  ignore les sections sans entrée de menu (`services`, `architecture`)
- Sections : accueil, services, à propos, architecture, compétences, projets, GitHub, contact
- **Projets** rendus depuis l'API (CRUD du back-office, sans toucher au code)
- **GitHub** : dépôts récupérés depuis l'API (cache 15 min, forks exclus)
- Compteurs en direct : projets, dépôt GitHub, visites
- Suivi des visites dédupliqué par session, filtre des robots
- Téléchargement de CV **tracé** (compteur visible dans le back-office)
- **Formulaire de contact** : validation, piège à robots, plafond anti-spam,
  envoi par SMTP + copie conservée dans le back-office
- Bouton retour en haut, lien d'évitement, `aria-label`, `aria-expanded`, focus visible

**Back-office** (`/admin.html`, interface uniquement — aucun code à toucher)

- Connexion par session + jeton CSRF (`/api/auth/`)
- **Vue d'ensemble** : KPI du jour / 7 j / 30 j, histogramme 30 jours, pages les plus visitées
- **Visiteurs** : journal date, page, IP, pays, origine, navigateur
- **CV** : téléversement, remplacement, suppression, journal des téléchargements
- **Messages** : boîte de réception, lu/non-lu (pastille sur l'onglet), réponse
  en un clic, suppression, état de l'envoi d'email
- **Photo de profil** : téléversement, aperçu, suppression
- **Projets** : création, modification, publication, ordre, liens, visuels, maquette,
  traductions FR/EN — avec modale de confirmation à la suppression
- Accessible sans compte : `noindex, nofollow` et en-tête `X-Robots-Tag`

## Lancer le projet

### Avec Docker (recommandé)

```bash
cp .env.example .env
# Générer la clé secrète de Django (obligatoire) :
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key(50))"
# → coller la valeur dans DJANGO_SECRET_KEY du .env, puis renseigner ADMIN_PASSWORD
docker compose up --build
```

> **`DJANGO_SECRET_KEY` est obligatoire** dès que `DJANGO_DEBUG=0`. Elle signe
> les sessions et les jetons CSRF : sans elle (ou avec la valeur par défaut du
> dépôt), Django **refuse de démarrer** et affiche la commande de génération.

- Site : <http://localhost:8080>
- Back-office : <http://localhost:8080/admin.html>
- Healthcheck : <http://localhost:8080/health>

Au premier démarrage, le conteneur `api` exécute `migrate`, `ensure_admin` et
`seed_projects` (idempotent) avant de lancer Gunicorn.

### En développement local

```bash
# 1. API Django (port 8000)
cd api
python -m venv .venv && .venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py ensure_admin          # lit ADMIN_USERNAME / ADMIN_PASSWORD
python manage.py seed_projects
python manage.py runserver 8000 --noreload

# 2. Serveur de dev : statique + proxy /api, /media (port 8090)
python tools/devserver.py
```

Puis ouvrir <http://localhost:8090>.

> Sans Docker, `python manage.py runserver` sert aussi les fichiers de
> `MEDIA_URL` en mode `DEBUG` ; en production c'est Nginx qui les sert depuis le
> volume partagé.

## API REST

Toutes les réponses sont en JSON. Les routes mutantes exigent un jeton CSRF
obtenu via `GET /api/auth/csrf/`, renvoyé ensuite dans l'en-tête `X-CSRFToken`.

| Méthode | Route | Accès | Rôle |
| --- | --- | --- | --- |
| `GET` | `/api/public/` | public | photo, CV, GitHub, compteurs |
| `GET` | `/api/projects/?lang=` | public | liste des projets publiés |
| `GET` | `/api/github/repos/` | public | dépôts GitHub (cache) |
| `POST` | `/api/visits/` | public | enregistrer une visite |
| `POST` | `/api/cv/download/` | public | tracer un téléchargement de CV |
| `POST` | `/api/contact/` | public | recevoir un message du formulaire |
| `GET/POST` | `/api/auth/{csrf,login,logout,me}/` | — | session administrateur |
| `GET` | `/api/admin/overview/` | admin | KPI, séries 30 j, pages, non-lus |
| `GET` | `/api/admin/visits/` | admin | journal des visites |
| `GET` | `/api/admin/cv/` | admin | journal des téléchargements |
| `GET` | `/api/admin/messages/` | admin | boîte de réception |
| `PATCH/DELETE` | `/api/admin/messages/<id>/` | admin | lu/non-lu / suppression |
| `GET/POST` | `/api/admin/projects/` | admin | liste / création |
| `GET/POST/PUT/PATCH/DELETE` | `/api/admin/projects/<id>/` | admin | détail / mise à jour / suppression |
| `GET/POST` | `/api/admin/profile/` | admin | photo et état du CV |
| `POST/DELETE` | `/api/admin/profile/{photo,cv}/` | admin | téléversement / suppression |
| `GET` | `/health` | public | healthcheck sans dépendance BDD |

> `PUT`/`PATCH` acceptent du JSON ; `POST` accepte aussi le multipart, ce qui
> permet de modifier un projet **avec** de nouveaux fichiers.

## Formulaire de contact

Le formulaire du pied de la section **Contact** envoie le message à l'API, qui :

1. le **valide** (nom, email, message ≥ 10 caractères) ;
2. le **protège** : champ piége à robots invisible + plafond de 5 messages
   par IP et par heure (variable `CONTACT_MAX_PER_HOUR`) ;
3. le **stocke toujours** — même si l'envoi d'email échoue, il reste lisible
   dans le back-office (onglet **Messages**) ;
4. **l'envoie** par SMTP vers `CONTACT_RECIPIENT`.

Le back-office affiche l'état de l'envoi (« Email envoyé » / « Email non
envoyé ») sur chaque message, et signale en haut de l'onglet si SMTP est
configuré.

### Configuration (Gmail)

Par défaut le backend est **console** : rien n'est envoyé, l'email est écrit
dans les logs. Pour recevoir les messages dans votre boîte mail :

```bash
# 1. Activer la vérification en 2 étapes sur le compte Google
# 2. Générer un « mot de passe d'application » :
#    https://myaccount.google.com/apppasswords
# 3. Renseigner dans .env :
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=angelorandrianasolo47@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx   # 16 caractères, sans espaces
CONTACT_RECIPIENT=angelorandrianasolo47@gmail.com

# 4. Redémarrer
docker compose up -d
```

Vérifier l'état : `docker compose logs api | grep -i smtp`.

### Anti-spam

| Filet | Réglage |
| --- | --- |
| Champ piége à robots (invisible, `tabindex="-1"`) | — |
| Validation stricte côté serveur | — |
| Plafond par IP et par heure | `CONTACT_MAX_PER_HOUR` (5 par défaut) |
| Journalisation de l'IP et du User-Agent | back-office |

## Tests

Tous les scripts sont dans `tests/` et se lancent depuis la racine du projet :

| Script | Cible | Couvre |
| --- | --- | --- |
| `test_api.py` | serveur local :8000 | auth et CSRF, 401/403, CRUD projets, validation des URL et titres, i18n FR/EN, dédup des visites, 404 du CV absent |
| `test_uploads.py` | serveur local :8000 | photo, CV, visuels de projet : extensions refusées, fichiers corrompus, suppression sans orphelin |
| `test_contact.py` | **aucune** (base jetable) | 35 scénarios du formulaire : envoi et contenu de l'email, rejets de validation, champ piége, CSRF absent, JSON sans `Content-Type`, lu/non-lu, suppression |
| `test_contact_live.py` | serveur local :8000 | le même parcours mais **via HTTP réel**, comme le ferait le navigateur |
| `test_csrf.py` | Docker :8080 | contrôle d'origine à travers Nginx (Origine fausse → 403) |
| `test_nginx.py` | Docker :8080 | proxy complet : login, téléversement, média servi par Nginx, 401 sans session |

```bash
# 1. base vierge (migrate PUIS ensure_admin — sans seed_projects)
DJANGO_DB_PATH=/tmp/t.sqlite3 python api/manage.py migrate --noinput
DJANGO_DB_PATH=/tmp/t.sqlite3 python api/manage.py ensure_admin
DJANGO_DB_PATH=/tmp/t.sqlite3 python api/manage.py runserver 8000 &

# 2. contre le serveur local
python tests/test_api.py
python tests/test_uploads.py
python tests/test_contact_live.py
python tests/test_contact.py          # indépendant du serveur

# 3. contre Docker (docker compose up -d)
python tests/test_csrf.py
python tests/test_nginx.py
# cibles modifiables : API_BASE=... / SITE_BASE=...
```

> **Aucun mot de passe n'est versionné.** `tests/_creds.py` lit
> `ADMIN_USERNAME` / `ADMIN_PASSWORD` depuis l'environnement ou `.env` ;
> sans `.env` rempli, les tests qui ciblent un serveur s'arrêtent sur un
> message explicite plutôt que de produire une cascade de 401.

## Structure

```
.
├── Dockerfile              # site public (Nginx)
├── docker-compose.yml      # services api + web, volumes data/media
├── nginx.conf              # reverse proxy /api/, /media/
├── requirements.txt        # Django, Pillow, gunicorn
├── .env.example            # variables (copier vers .env)
├── api/
│   ├── Dockerfile          # Python 3.13 + Gunicorn
│   ├── manage.py
│   ├── config/             # settings, urls, wsgi   (MVC : configuration)
│   └── core/
│       ├── models.py       # Visit, CvDownload, Project, Profile, ContactMessage
│       ├── views.py        # contrôleurs JSON
│       ├── urls.py
│       ├── admin.py
│       └── management/commands/   # ensure_admin, seed_projects
├── src/
│   ├── index.html          # site public
│   ├── admin.html          # back-office
│   ├── robots.txt
│   ├── css/{style.css,admin.css}
│   └── js/{script.js,admin.js}
├── tests/                  # suites de vérification (voir « Tests »)
│   ├── _creds.py           # identifiants lus dans .env — jamais versionnés
│   ├── test_api.py         ├── test_uploads.py
│   ├── test_contact.py     ├── test_contact_live.py
│   └── test_csrf.py        └── test_nginx.py
└── tools/
    └── devserver.py        # statique + proxy /api, /media (port 8090)
```

## Personnalisation

- **Couleurs** : variables `--brand-*` dans `:root` et `html.dark-theme` (`src/css/style.css`)
- **Traductions** : objet `translations` dans `src/js/script.js`
- **Contenus** : uniquement via le back-office (projets, photo, CV)
- **Identifiants** : variables `ADMIN_USERNAME` / `ADMIN_PASSWORD` — jamais versionnées
- **Dépôt GitHub** : variable `GITHUB_USERNAME`
- **Formulaire de contact** : `CONTACT_RECIPIENT`, `CONTACT_MAX_PER_HOUR`
  et les variables `EMAIL_*` (voir « Formulaire de contact »)

## Sécurité

- `.env`, `api/data/`, `api/media/`, `api/staticfiles/` ignorés par git
- Aucun mot de passe dans le dépôt ; le compte est créé par `ensure_admin`
- **`DJANGO_SECRET_KEY` obligatoire en production** : Django s'arrête avec un
  message explicite si la clé est absente ou encore celle du dépôt, empêchant
  un déploiement bâclé qui laisserait des sessions forgables
- Téléversements validés (extension **et** signature de fichier), taille ≤ 20 Mo
- Échappement HTML de toute donnée injectée, URLs assainies côté client
- Formulaire de contact : champ piége à robots, validation stricte serveur,
  plafond par IP et par heure, CSRF obligatoire — et le mot de passe SMTP
  ne quitte jamais `.env`
- En-têtes : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Assets non hachés servis en `Cache-Control: no-cache` : le navigateur
  revalide via ETag/304, donc une mise à jour du code est prise en compte
  immédiatement (au lieu d'un ancien `admin.js` conservé 30 jours)
- Passer `SESSION_COOKIE_SECURE` et `CSRF_COOKIE_SECURE` à `1` derrière HTTPS
