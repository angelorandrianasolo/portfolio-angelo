"""Peuple le back-office avec les projets initiaux du portfolio.

Idempotent : identifie par `slug`, donc rien n'est ecrase si le
projet existe deja (meme si son titre a ete modifie depuis l'interface).

    python manage.py seed_projects
"""
from django.core.management.base import BaseCommand

from core.models import Project

PROJECTS = [
    {
        "title": "Meilleur-prix",
        "slug": "meilleur-prix",
        "summary": "Les prix varient d'un marché à l'autre à Madagascar : comparez les offres en un clic et achetez au meilleur prix.",
        "summary_en": "Prices change from market to market in Madagascar: compare offers in one click and buy at the best price.",
        "description": (
            "Application de comparaison des prix qui répertorie les produits "
            "proposés dans les marchés malgaches et situe la meilleure offre "
            "sur une carte interactive. Recherche instantanée, filtres par "
            "catégorie et géolocalisation des étals."
        ),
        "description_en": (
            "Price comparison app listing products sold in Malagasy markets "
            "and pinpointing the best deal on an interactive map. Instant "
            "search, category filters and stall geolocation."
        ),
        "technologies": ["Node.js", "PostgreSQL", "JavaScript", "Leaflet.js"],
        "icon": "\U0001f6d2",
        "category": "Web",
        "is_featured": True,
        "order": 1,
    },
    {
        "title": "Tantsaha Connect",
        "slug": "tantsaha-connect",
        "summary": "Manquer une saison coûte cher : Tantsaha donne aux agriculteurs malgaches la météo locale, le calendrier des travaux et des conseils au bon moment.",
        "summary_en": "A missed season is costly: Tantsaha gives Malagasy farmers local weather, a work calendar and timely advice.",
        "description": (
            "Application mobile et web destinée à accompagner les "
            "agriculteurs malgaches : prévisions météorologiques locales, "
            "calendrier des travaux et recommandations culturales "
            "adaptées à la saison."
        ),
        "description_en": (
            "Mobile and web application supporting Malagayan farmers: "
            "local weather forecasts, work calendar and seasonal "
            "crop recommendations."
        ),
        "technologies": ["React.js", "React Native", "Node.js", "MySQL"],
        "icon": "\U0001f331",
        "category": "Mobile",
        "is_featured": True,
        "order": 2,
    },
    {
        "title": "Portfolio & API REST",
        "slug": "portfolio-api-rest",
        "summary": "Ce portfolio consomme sa propre API REST Django : un aperçu concret de mon architecture (MVC, Docker, tests automatisés).",
        "summary_en": "This portfolio runs on its own Django REST API: a concrete look at my architecture (MVC, Docker, automated tests).",
        "description": (
            "Architecture MVC en Django : un back-office permet de gérer "
            "les projets, la photo de profil et le CV sans toucher au code, "
            "avec suivi des visites et des téléchargements de CV. Service "
            "conteneurisé avec Nginx et Docker Compose."
        ),
        "description_en": (
            "Django MVC architecture: an admin panel manages projects, "
            "profile photo and CV without touching code, with visitor and "
            "CV download tracking. Containerised with Nginx and Docker "
            "Compose."
        ),
        "technologies": ["Django", "Python", "Nginx", "Docker", "JavaScript"],
        "icon": "\U0001f3e0",
        "category": "Full Stack",
        "is_featured": False,
        "order": 3,
    },
]


class Command(BaseCommand):
    help = "Insere les projets initiaux du portfolio (idempotent)."

    def handle(self, *args, **options):
        created = 0

        for data in PROJECTS:
            fields = dict(data)
            _, was_created = Project.objects.get_or_create(
                slug=data["slug"],
                defaults=fields,
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created} projet(s) cree(s), {Project.objects.count()} au total."
            )
        )
