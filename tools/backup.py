"""Sauvegarde du portfolio — base SQLite + médias.

Usage
-----
    python tools/backup.py               # sauvegarde datée dans backups/
    python tools/backup.py --keep 10     # conserver 10 sauvegardes
    python tools/backup.py --list        # lister les sauvegardes existantes

Pourquoi ce script
------------------
La base (messages, visites, projets) vit dans le volume Docker
« angelo_api_data », invisible depuis le dépôt. Le script :

1. produit une copie **cohérente** de SQLite avec l'API « backup »
   (compatible même pendant que l'API fonctionne — pas de copie à froid
   d'un fichier en cours d'écriture) ;
2. récupère cette copie et le dossier media/ via `docker compose cp` ;
3. range le tout dans backups/AAAA-MM-JJ-HHMMSS/ (ignoré par git) ;
4. supprime les plus vieilles sauvegardes (7 par défaut).

Restauration
------------
    docker compose cp backups/<dossier>/db.sqlite3 angelo-api:/app/data/db.sqlite3
    docker compose cp backups/<dossier>/media/.    angelo-api:/media/
    docker compose restart api

À planifier : une fois par semaine (cron Linux, planificateur de
tâches Windows…). Voir la section « Sécurité » du README.
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKUP_ROOT = ROOT / "backups"
# Nom du SERVICE dans docker-compose.yml (docker compose cp attend un
# service, pas le container_name).
SERVICE = "api"

# Copie SQLite interne au conteneur, exécutée via `docker compose exec`.
_SQLITE_SNIPPET = (
    "import sqlite3;"
    "src = sqlite3.connect('/app/data/db.sqlite3');"
    "dst = sqlite3.connect('/tmp/db-backup.sqlite3');"
    "src.backup(dst);"
    "dst.close(); src.close();"
    "print('ok')"
)


def _run(args: list[str]) -> subprocess.CompletedProcess:
    proc = subprocess.run(
        args,
        cwd=ROOT,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "").strip()
        raise RuntimeError(f"{' '.join(args)}\n{detail}")
    return proc


def make_backup() -> Path:
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    target = BACKUP_ROOT / stamp
    target.mkdir(parents=True, exist_ok=False)

    try:
        print("1/4 Copie SQLite cohérente dans le conteneur…")
        _run(["docker", "compose", "exec", "-T", "api", "python", "-c",
              _SQLITE_SNIPPET])

        print("2/4 Récupération de la base…")
        _run(["docker", "compose", "cp",
              f"{SERVICE}:/tmp/db-backup.sqlite3",
              str(target / "db.sqlite3")])

        print("3/4 Récupération des médias (photo, CV, visuels)…")
        _run(["docker", "compose", "cp",
              f"{SERVICE}:/media",
              str(target / "media")])

        print("4/4 Nettoyage du conteneur…")
        _run(["docker", "compose", "exec", "-T", "api", "rm", "-f",
              "/tmp/db-backup.sqlite3"])

        db = target / "db.sqlite3"
        if not db.exists() or db.stat().st_size == 0:
            raise RuntimeError("La copie SQLite est vide ou absente.")
    except Exception:
        # Pas de dossier vide en cas d'echec (Docker arrete, conteneur
        # absent…) : backups/ ne contient que des sauvegardes utiles.
        shutil.rmtree(target, ignore_errors=True)
        raise

    print(f"✓ Sauvegarde créée : {target.relative_to(ROOT)} "
          f"({db.stat().st_size // 1024} Ko)")
    return target


def prune(keep: int) -> None:
    if not BACKUP_ROOT.exists():
        return
    folders = sorted(
        (p for p in BACKUP_ROOT.iterdir() if p.is_dir()),
        key=lambda p: p.name,
    )
    obsolete = folders[:-keep] if keep > 0 else folders
    for folder in obsolete:
        shutil.rmtree(folder, ignore_errors=True)
    if obsolete:
        print(f"✓ {len(obsolete)} ancienne(s) sauvegarde(s) supprimée(s) "
              f"(conservation : {keep})")


def list_backups() -> None:
    if not BACKUP_ROOT.exists():
        print("Aucune sauvegarde.")
        return
    folders = sorted(
        (p for p in BACKUP_ROOT.iterdir() if p.is_dir()),
        key=lambda p: p.name,
    )
    if not folders:
        print("Aucune sauvegarde.")
        return
    for folder in folders:
        db = folder / "db.sqlite3"
        size = f"{db.stat().st_size // 1024} Ko" if db.exists() else "—"
        print(f"  {folder.name}  (base : {size})")
    print(f"{len(folders)} sauvegarde(s) dans {BACKUP_ROOT}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--keep", type=int, default=7,
                        help="sauvegardes à conserver (défaut : 7)")
    parser.add_argument("--list", action="store_true",
                        help="lister les sauvegardes existantes")
    args = parser.parse_args()

    if args.list:
        list_backups()
        return 0

    try:
        make_backup()
        prune(args.keep)
    except Exception as exc:  # noqa: BLE001 — affichage utilisateur
        print(f"✗ Échec : {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
