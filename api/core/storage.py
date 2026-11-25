"""Stockage des fichiers medias en base de donnees (production cloud).

Le disque des plans gratuits (Render) est ephemere : un rede ploiement
efface /app/media. Les fichiers vivent donc dans la table ``core_fileblob``,
dans PostgreSQL (Neon) : persistence, sauvegarde et restauration assurees par
la seule base, sans service externe ni carte bancaire.

Active par ``MEDIA_BACKEND=db`` (voir config/settings.py). Sans cette
variable, FileSystemStorage reste utilise : developpement et tests ne
changent rien.

Les URLs restent ``/media/<chemin>`` : aucun changement côté frontend,
Nginx local et production servent le même chemin.
"""
from __future__ import annotations

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage


class DatabaseStorage(Storage):
    """Un fichier = une ligne (chemin + octets) dans core_fileblob."""

    # --- écriture ---------------------------------------------------------
    def _save(self, name, content):
        from core.models import FileBlob

        data = content.read()
        FileBlob.objects.update_or_create(
            name=name,
            defaults={"content": data, "size": len(data)},
        )
        return name

    def delete(self, name):
        from core.models import FileBlob

        FileBlob.objects.filter(name=name).delete()

    # --- lecture ----------------------------------------------------------
    def _open(self, name, mode="rb"):
        from core.models import FileBlob

        try:
            blob = FileBlob.objects.get(name=name)
        except FileBlob.DoesNotExist:
            # Même sémantique que le disque : fichier introuvable.
            raise FileNotFoundError(name) from None
        return ContentFile(bytes(blob.content), name=name)

    def exists(self, name):
        from core.models import FileBlob

        return FileBlob.objects.filter(name=name).exists()

    def size(self, name):
        from core.models import FileBlob

        try:
            return FileBlob.objects.get(name=name).size
        except FileBlob.DoesNotExist:
            raise FileNotFoundError(name) from None

    def listdir(self, path):
        """Pas d'arborescence réelle : tout est aplatit dans un seul champ."""
        from core.models import FileBlob

        prefix = f"{path.rstrip('/')}/" if path else ""
        directories, files = set(), []
        for name in FileBlob.objects.filter(name__startswith=prefix).values_list(
            "name", flat=True
        ):
            rest = name[len(prefix) :]
            if "/" in rest:
                directories.add(rest.split("/", 1)[0])
            else:
                files.append(rest)
        return sorted(directories), files

    # --- URLs (identiques à FileSystemStorage) ----------------------------
    def url(self, name):
        return settings.MEDIA_URL + name
