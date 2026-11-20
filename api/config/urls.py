"""Routeur racine : l'API est montee sur /api/, plus un healthcheck.

En developpement (DEBUG=1), Django sert egalement les fichiers televerses
depuis MEDIA_ROOT. En production, c'est Nginx qui les sert depuis le volume
partage : `static()` renvoie alors une liste vide.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    """Healthcheck pour Docker / l'orchestrateur (sans dependance BDD)."""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health", health),
    path("api/", include("core.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
