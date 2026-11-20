"""Routeur de l'API REST du portfolio."""
from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    # --- Authentification ---------------------------------------------
    path("auth/csrf/", views.csrf_view),
    path("auth/login/", views.login_view),
    path("auth/logout/", views.logout_view),
    path("auth/me/", views.me_view),

    # --- Public ---------------------------------------------------------
    path("public/", views.public_bootstrap),
    path("projects/", views.project_list),
    path("visits/", views.visit_create),
    path("cv/download/", views.cv_download),
    path("github/repos/", views.github_repos),
    path("contact/", views.contact_create),

    # --- Back-office : statistiques ------------------------------------
    path("admin/overview/", views.admin_overview),
    path("admin/visits/", views.admin_visits),
    path("admin/cv/", views.admin_cv_stats),

    # --- Back-office : messages de contact ------------------------------
    path("admin/messages/", views.admin_messages),
    path("admin/messages/<int:pk>/", views.admin_message_detail),

    # --- Back-office : projets -----------------------------------------
    path("admin/projects/", views.admin_projects),
    path("admin/projects/<int:pk>/", views.admin_project_detail),

    # --- Back-office : compte (identifiant / mot de passe) --------------
    path("admin/account/", views.admin_account),

    # --- Back-office : profil (photo / CV) ------------------------------
    path("admin/profile/", views.admin_profile),
    path("admin/profile/photo/", views.admin_profile_photo),
    path("admin/profile/photo/delete/", views.admin_profile_photo_delete),
    path("admin/profile/cv/", views.admin_profile_cv),
    path("admin/profile/cv/delete/", views.admin_profile_cv_delete),
]
