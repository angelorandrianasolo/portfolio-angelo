"""Importe les fichiers d'un dossier vers le stockage actif.

Utile pour la migration vers le cloud : les fichiers du volume Docker sont
copies dans la base (MEDIA_BACKEND=db) avec exactement les memes chemins,
donc les URLs /media/... du dump restent valides. Idempotent : un fichier
deja present sous le meme nom n'est pas reecrit.

    python manage.py sync_media --src /media_source
"""
from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Copie les fichiers d'un dossier vers le stockage actif."

    def add_arguments(self, parser):
        parser.add_argument(
            "--src",
            default=None,
            help="Dossier source (defaut : MEDIA_ROOT).",
        )

    def handle(self, *args, **options):
        src = Path(options["src"] or settings.MEDIA_ROOT)
        if not src.is_dir():
            raise SystemExit(f"Dossier introuvable : {src}")

        total = added = skipped = errors = 0
        for path in sorted(src.rglob("*")):
            if not path.is_file() or path.name == ".gitkeep":
                continue
            total += 1
            rel = path.relative_to(src).as_posix()
            if default_storage.exists(rel):
                skipped += 1
                continue
            try:
                with path.open("rb") as handle:
                    default_storage.save(rel, handle)
                added += 1
                self.stdout.write(f"  importe : {rel}")
            except Exception as exc:  # noqa: BLE001 — on signale et on continue
                errors += 1
                self.stderr.write(f"  ECHEC : {rel} ({exc})")

        self.stdout.write(
            self.style.SUCCESS(
                f"{total} fichier(s) : {added} importe(s), "
                f"{skipped} deja present(s), {errors} erreur(s)."
            )
        )
