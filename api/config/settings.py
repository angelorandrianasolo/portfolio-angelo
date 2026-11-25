"""
Configuration Django du portfolio — API REST.

Tout est surchargeable par variables d'environnement afin de fonctionner
identiquement en developpement local et dans Docker.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Valeur de depot : connue de tous, acceptable uniquement en developpement.
_DEV_SECRET_KEY = "dev-insecure-key-a-changer-en-production"

# La cle secrete signe les sessions et les jetons CSRF. En production, la
# valeur par defaut serait connue de tous : un attaquant pourrait forger un
# cookie de session et prendre la place de l'administrateur.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "").strip() or _DEV_SECRET_KEY

DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

if not DEBUG and SECRET_KEY == _DEV_SECRET_KEY:
    from django.core.exceptions import ImproperlyConfigured

    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY est absent ou conserve la valeur par defaut du "
        "depot. Generez la votre :\n"
        "  python -c \"from django.core.management.utils import "
        "get_random_secret_key; print(get_random_secret_key(50))\"\n"
        "puis ajoutez-la au fichier .env et relancez `docker compose up -d`."
    )

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")
    if h.strip()
]

CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]

# Application minimale : on n'utilise pas l'admin Django ni les templates.
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Par defaut : SQLite (developpement local, tests). En production, la
# variable DATABASE_URL bascule sur PostgreSQL (Neon) sans autre changement :
# memes modeles, meme logique, seul le moteur change.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.environ.get(
            "DJANGO_DB_PATH",
            str(BASE_DIR / "data" / "db.sqlite3"),
        ),
    }
}

_db_url = os.environ.get("DATABASE_URL", "").strip()
if _db_url:
    from urllib.parse import parse_qs, unquote, urlparse

    _u = urlparse(_db_url)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(_u.path.lstrip("/")),
            "USER": unquote(_u.username or ""),
            "PASSWORD": unquote(_u.password or ""),
            "HOST": _u.hostname or "",
            "PORT": str(_u.port or "5432"),
            # Connexion maintenue ouverte : Neon met la base en veille, une
            # nouvelle connexion par requete ajouterait ~1 s au premier appel.
            "CONN_MAX_AGE": 60,
            # Options de la cle d'URL (sslmode=require pour Neon).
            "OPTIONS": {k: v[0] for k, v in parse_qs(_u.query).items()},
        }
    }

# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = os.environ.get("DJANGO_TIME_ZONE", "Indian/Antananarivo")
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Fichiers statiques et medias (photo de profil, CV, visuels de projets)
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = Path(
    os.environ.get("DJANGO_MEDIA_ROOT", str(BASE_DIR / "media"))
)

# ---------------------------------------------------------------------------
# Stockage des medias : en base (production cloud) ou disque local
# ---------------------------------------------------------------------------
# MEDIA_BACKEND=db : les fichiers sont ecrits dans la table core_fileblob
# (PostgreSQL/Neon) au lieu du disque. Le disque des plans gratuits est
# ephemere : un rede ploiement effacerait /app/media. La base est
# persistante et sauvegardee : rien ne peut se perdre, sans service
# externe ni carte bancaire. URLs /media/... identiques de part et d'autre.
# Sans la variable (developpement, tests) : disque local, inchange.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

MEDIA_BACKEND = os.environ.get("MEDIA_BACKEND", "").strip().lower()
if MEDIA_BACKEND == "db":
    STORAGES["default"] = {"BACKEND": "core.storage.DatabaseStorage"}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Sessions / cookies
# ---------------------------------------------------------------------------
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14          # 14 jours
SESSION_SAVE_EVERY_REQUEST = False
CSRF_COOKIE_AGE = 60 * 60 * 24 * 14

# Cookies durcis.
#  - SESSION_COOKIE_HTTPONLY : le cookie de session n'est jamais lisible en
#    JavaScript, un script injecterait impossible de le voler.
#  - SameSite=Lax : le navigateur n'envoie plus le cookie sur les requêtes
#    transverses (anti-CSRF de premier niveau).
#  - CSRF reste lisible par JS car le back-office lit `csrftoken` pour
#    construire l'en-tête X-CSRFToken : c'est voulu et sans danger.
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# En-tetes de securite doublons cote Django (Nginx envoie aussi les siens :
# si un jour Nginx est remplace, la protection reste).
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "SAMEORIGIN"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# HSTS (Strict-Transport-Security) : sans effet en HTTP local ; passer
# SECURE_HSTS_SECONDS=31536000 une fois HTTPS installe (voir README).
SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "0") or 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0

# ---------------------------------------------------------------------------
# Anti force brute — connexion back-office
# ---------------------------------------------------------------------------
# Nombre max de tentatives echouees par IP avant blocage temporaire.
LOGIN_MAX_ATTEMPTS = int(os.environ.get("LOGIN_MAX_ATTEMPTS", "5") or 5)
LOGIN_BLOCK_MINUTES = int(os.environ.get("LOGIN_BLOCK_MINUTES", "15") or 15)

# ---------------------------------------------------------------------------
# Deconnexion automatique par inactivite
# ---------------------------------------------------------------------------
# Une session admin ouverte puis oubliee (poste public, bureau partage)
# est fermee apres ce delai sans activite.
ADMIN_IDLE_SECONDS = int(os.environ.get("ADMIN_IDLE_SECONDS", "1800") or 1800)

# ---------------------------------------------------------------------------
# Uploads
# ---------------------------------------------------------------------------
FILE_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024   # 25 Mo en memoire
DATA_UPLOAD_MAX_MEMORY_SIZE = 30 * 1024 * 1024

# Taille maximale des fichiers acceptes (octets)
MAX_UPLOAD_SIZE = int(os.environ.get("MAX_UPLOAD_SIZE", 20 * 1024 * 1024))

# ---------------------------------------------------------------------------
# Cache (utilise pour le proxy GitHub)
# ---------------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "portfolio-cache",
    }
}

# Compte GitHub dont on reflete les depots publics
GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME", "angelorandrianasolo")
GITHUB_CACHE_SECONDS = int(os.environ.get("GITHUB_CACHE_SECONDS", 900))

# ---------------------------------------------------------------------------
# Envoi d'email du formulaire de contact
# ---------------------------------------------------------------------------
# Par defaut : backend « console » — l'email est imprime dans les logs du
# conteneur au lieu d'etre envoye. Aucun compte requis pour developper.
#
# Pour recevoir les messages dans une vraie boite mail, renseigner dans .env :
#   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
#   EMAIL_HOST_USER=votre adresse gmail
#   EMAIL_HOST_PASSWORD=un mot de passe d'application Gmail (16 caracteres)
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
).strip() or "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com").strip() or "smtp.gmail.com"
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587") or 587)
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "").strip()
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "").strip()
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "1") == "1"
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "0") == "1"
EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "15") or 15)

# Une variable presente mais vide compte comme absente : on retombe sur
# l'adresse du compte SMTP, sinon l'envoi echouerait avec un expediteur vide.
DEFAULT_FROM_EMAIL = (
    os.environ.get("DEFAULT_FROM_EMAIL", "").strip()
    or EMAIL_HOST_USER
    or "portfolio@localhost"
)

# Destinataire des messages du formulaire de contact
CONTACT_RECIPIENT = (
    os.environ.get("CONTACT_RECIPIENT", "").strip()
    or "angelorandrianasolo47@gmail.com"
)

# Anti-spam : nombre maximum de messages acceptes par IP et par heure
CONTACT_MAX_PER_HOUR = int(os.environ.get("CONTACT_MAX_PER_HOUR", "5") or 5)

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"
    CSRF_COOKIE_SECURE = os.environ.get("CSRF_COOKIE_SECURE", "0") == "1"
