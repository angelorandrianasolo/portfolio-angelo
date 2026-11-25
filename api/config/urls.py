"""Routeur racine : l'API est montee sur /api/, plus un healthcheck.

Trois modes de service des medias (/media/...) :

- developpement (DEBUG=1, disque) : ``static()`` de Django ;
- production Nginx (disque, volume partage) : Nginx, ``static()`` vide ;
- production cloud (MEDIA_BACKEND=db) : la route ``media_db`` lit la table
  core_fileblob — le disque etant ephemere sur les plans gratuits.
"""
import mimetypes

from django.conf import settings
from django.conf.urls.static import static
from django.http import Http404, HttpResponse, JsonResponse
from django.urls import include, path


def health(request):
    """Healthcheck pour Docker / l'orchestrateur (sans dependance BDD)."""
    return JsonResponse({"status": "ok"})


def media_db(request, path):
    """Sert un media depuis la base (MEDIA_BACKEND=db, production cloud)."""
    from core.models import FileBlob

    try:
        blob = FileBlob.objects.get(name=path)
    except FileBlob.DoesNotExist:
        raise Http404("Fichier introuvable")

    content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    response = HttpResponse(bytes(blob.content), content_type=content_type)
    # Cache 7 jours, comme le faisait Nginx pour /media/.
    response["Cache-Control"] = "public, max-age=604800"
    response["X-Content-Type-Options"] = "nosniff"
    return response


urlpatterns = [
    path("health", health),
    path("api/", include("core.urls")),
]

if getattr(settings, "MEDIA_BACKEND", "") == "db":
    urlpatterns += [path("media/<path:path>", media_db)]
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
