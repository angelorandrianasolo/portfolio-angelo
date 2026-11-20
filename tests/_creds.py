"""Identifiants administrateur lus dans l'environnement ou `.env`.

Aucun mot de passe n'est ecrit dans les fichiers de test : le depot ne doit
jamais contenir d'identifiants (voir README, section « Securite »). Le fichier
`.env` est ignore par git, `.env.example` donne le gabarit.

    ADMIN_PASSWORD=... python tests/test_api.py
    # ou simplement, depuis la racine du projet, avec un .env rempli
"""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_env_file() -> None:
    """Complete l'environnement depuis `.env` sans ecraser ce qui est deja la."""
    path = ROOT / ".env"
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip()


_load_env_file()

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "angelo")
# Vide tant que `.env` n'est pas rempli : on echoue proprement plutot que
# de produire une cascade de 401 incomprehensibles.
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

# Base de test isolee (test_contact.py cree son propre compte dans une base
# jetable) : aucun besoin du vrai mot de passe, il ne verifie que lui-meme.
ISOLATED_PASSWORD = ADMIN_PASSWORD or "test-local-password"

# Adresse de contact attendue par les tests du formulaire.
CONTACT_RECIPIENT = os.environ.get(
    "CONTACT_RECIPIENT", "angelorandrianasolo47@gmail.com"
)


def login_payload() -> dict:
    """Corps de `/api/auth/login/` contre un serveur reel."""
    if not ADMIN_PASSWORD:
        raise SystemExit(
            "ADMIN_PASSWORD absent.\n"
            "Renseignez-le dans .env (copie de .env.example) avant de lancer "
            "les tests contre un serveur : aucun mot de passe n'est versionne."
        )
    return {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
