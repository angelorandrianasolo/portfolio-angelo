"""
API REST du portfolio.

Public  : bootstrap, projets, visites, telechargements de CV, GitHub.
Back-office (authentifie) : statistiques, CRUD des projets, photo et CV.
"""
import json
import logging
import os
import re
from datetime import timedelta
from urllib import error as urlerror
from urllib import request as urlrequest

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.cache import cache
from django.core.mail import send_mail
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .models import ContactMessage, CvDownload, Profile, Project, Visit

# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

BOT_PATTERN = re.compile(
    r"bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit"
    r"|headless|lighthouse|preview|uptime|monitor",
    re.I,
)

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_CV_EXT = {".pdf", ".doc", ".docx"}

logger = logging.getLogger(__name__)

# Champ piege du formulaire de contact : rempli par un robot, invisible
# pour un humain. On repond comme si tout allait bien sans rien enregistrer.
HONEYPOT_FIELD = "website"

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def json_body(request) -> dict:
    try:
        data = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def parse_payload(request) -> tuple:
    """Accepte `application/json`, `multipart/form-data` **ou** du JSON brut.

    Le dernier cas est un repli : un client qui oublie l'en-tête
    `Content-Type` ferait sinon arriver des champs vides en silence — la
    vue repondrait « champ obligatoire » alors que tout a bien ete envoye.
    """
    content_type = (request.content_type or "").lower()

    # 1. JSON annonce explicitement
    if "application/json" in content_type:
        return json_body(request), {}

    # 2. Formulaire (urlencoded ou multipart) : deja parse par Django
    if request.POST or request.FILES:
        return request.POST, request.FILES

    # 3. Corps JSON sans en-tete : on tente le parsing du corps brut
    if "text/plain" in content_type or not content_type:
        data = json_body(request)
        if data:
            return data, {}

    return request.POST, request.FILES


def client_ip(request) -> str | None:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:45] or None
    return request.META.get("REMOTE_ADDR") or None


def bad_request(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"detail": message}, status=status)


def admin_required(view_func):
    """Exige une session administrateur valide, sinon repond 401 en JSON."""

    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"detail": "Session expiree, reconnectez-vous."}, status=401
            )
        return view_func(request, *args, **kwargs)

    wrapper.__name__ = view_func.__name__
    return wrapper


def as_bool(value, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).lower() in {"1", "true", "yes", "on"}


def as_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def validate_upload(file, allowed_ext: set, label: str):
    """Valide taille et extension. Renvoie un message d'erreur ou None."""
    if file is None:
        return None

    name = file.name or ""
    ext = os.path.splitext(name)[1].lower()

    if ext not in allowed_ext:
        allowed = ", ".join(sorted(allowed_ext))
        return f"{label} : extension {ext or '(vide)' } refusee ({allowed})."

    if file.size > settings.MAX_UPLOAD_SIZE:
        limit_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
        return f"{label} : fichier trop volumineux (max {limit_mb} Mo)."

    if ext in ALLOWED_IMAGE_EXT:
        try:
            from PIL import Image

            file.seek(0)
            with Image.open(file) as img:
                img.verify()
            file.seek(0)
        except Exception:
            return f"{label} : fichier image invalide ou corrompu."

    return None


# ---------------------------------------------------------------------------
# Authentification
# ---------------------------------------------------------------------------


@ensure_csrf_cookie
@require_http_methods(["GET"])
def csrf_view(request):
    """Fournit le jeton CSRF (cookie `csrftoken`) au back-office."""
    return JsonResponse({"detail": "ok"})


@require_http_methods(["POST"])
def login_view(request):
    data = json_body(request)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return bad_request("Identifiant et mot de passe requis.")

    user = authenticate(request, username=username, password=password)
    if user is None:
        # Compte desactive ou mauvais mot de passe : meme message.
        return JsonResponse(
            {"detail": "Identifiants incorrects."}, status=401
        )

    login(request, user)
    return JsonResponse({"username": user.username})


@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Deconnecte."})


@require_http_methods(["GET"])
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False, "username": None})
    return JsonResponse(
        {"authenticated": True, "username": request.user.username}
    )


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------


@require_http_methods(["GET"])
def public_bootstrap(request):
    """Configuration publique : photo, CV, compteurs."""
    profile = Profile.get()

    return JsonResponse(
        {
            "photo": profile.photo.url if profile.photo else None,
            "has_cv": bool(profile.cv),
            "cv_url": profile.cv.url if profile.cv else None,
            "cv_filename": profile.cv_filename or "CV",
            "github": settings.GITHUB_USERNAME,
            "counters": {
                "visits": Visit.objects.filter(is_bot=False).count(),
                "projects": Project.objects.filter(is_published=True).count(),
                "downloads": CvDownload.objects.count(),
            },
        }
    )


@require_http_methods(["GET"])
def project_list(request):
    lang = "en" if request.GET.get("lang") == "en" else "fr"
    projects = Project.objects.filter(is_published=True)
    return JsonResponse(
        {"results": [p.to_dict(lang) for p in projects]}
    )


@require_http_methods(["POST"])
def visit_create(request):
    """Enregistre une visite — une seule fois par session."""
    if request.session.get("visit_tracked"):
        return JsonResponse({"tracked": False}, status=202)

    # parse_payload accepte JSON, formulaire, ou JSON sans Content-Type :
    # sans ce passage, un envoi brut laisserait `request.POST` vide et la
    # visite serait enregistree sous « / » en silence.
    fields, _ = parse_payload(request)

    user_agent = request.META.get("HTTP_USER_AGENT", "")[:1000]
    is_bot = bool(BOT_PATTERN.search(user_agent))

    Visit.objects.create(
        path=str(fields.get("path") or "/")[:500],
        referrer=str(fields.get("referrer") or "")[:500],
        ip=client_ip(request),
        user_agent=user_agent,
        country=str(fields.get("country") or "")[:120],
        is_bot=is_bot,
    )
    request.session["visit_tracked"] = True

    return JsonResponse({"tracked": True}, status=201)


@require_http_methods(["POST"])
def cv_download(request):
    """Enregistre un telechargement du CV."""
    if not Profile.get().cv:
        return bad_request("Aucun CV disponible.", status=404)

    if request.session.get("cv_tracked"):
        return JsonResponse({"tracked": False}, status=202)

    CvDownload.objects.create(
        ip=client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
    )
    request.session["cv_tracked"] = True

    return JsonResponse({"tracked": True}, status=201)


@require_http_methods(["GET"])
def github_repos(request):
    """Proxy des depots publics GitHub, mis en cache."""
    username = settings.GITHUB_USERNAME
    cache_key = f"github:repos:{username}"
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse({"cached": True, "results": cached})

    url = (
        f"https://api.github.com/users/{username}/repos"
        "?sort=updated&direction=desc&per_page=8"
    )
    req = urlrequest.Request(
        url,
        headers={
            "User-Agent": "angelo-portfolio",
            "Accept": "application/vnd.github+json",
        },
    )

    try:
        with urlrequest.urlopen(req, timeout=8) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except (urlerror.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return JsonResponse(
            {"cached": False, "results": [], "detail": "GitHub indisponible."},
            status=503,
        )

    results = [
        {
            "name": repo.get("name"),
            "description": repo.get("description") or "",
            "url": repo.get("html_url"),
            "homepage": repo.get("homepage") or "",
            "language": repo.get("language") or "",
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "topics": repo.get("topics") or [],
            "updated_at": repo.get("pushed_at"),
            "is_fork": bool(repo.get("fork")),
        }
        for repo in raw
        if isinstance(repo, dict) and not repo.get("fork")
    ][:8]

    cache.set(cache_key, results, settings.GITHUB_CACHE_SECONDS)
    return JsonResponse({"cached": False, "results": results})


# ---------------------------------------------------------------------------
# Back-office — statistiques
# ---------------------------------------------------------------------------


@admin_required
@require_http_methods(["GET"])
def admin_overview(request):
    now = timezone.now()
    today = now.date()

    def since(days: int) -> int:
        return Visit.objects.filter(
            is_bot=False, created_at__gte=now - timedelta(days=days)
        ).count()

    recent_visits = list(
        Visit.objects.filter(is_bot=False)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(total=Count("id"))
        .order_by("-day")[:30]
    )

    recent_downloads = list(
        CvDownload.objects.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(total=Count("id"))
        .order_by("-day")[:30]
    )

    top_pages = (
        Visit.objects.filter(is_bot=False)
        .values("path")
        .annotate(total=Count("id"))
        .order_by("-total")[:8]
    )

    return JsonResponse(
        {
            "totals": {
                "visits": Visit.objects.filter(is_bot=False).count(),
                "downloads": CvDownload.objects.count(),
                "projects": Project.objects.count(),
                "published": Project.objects.filter(is_published=True).count(),
                "messages": ContactMessage.objects.count(),
                "unread_messages": ContactMessage.objects.filter(
                    is_read=False
                ).count(),
            },
            "periods": {
                "today": since(1),
                "week": since(7),
                "month": since(30),
            },
            "visits_per_day": [
                {"day": r["day"].isoformat(), "total": r["total"]}
                for r in recent_visits
            ],
            "downloads_per_day": [
                {"day": r["day"].isoformat(), "total": r["total"]}
                for r in recent_downloads
            ],
            "top_pages": [
                {"path": r["path"], "total": r["total"]} for r in top_pages
            ],
            "today": today.isoformat(),
        }
    )


@admin_required
@require_http_methods(["GET"])
def admin_visits(request):
    limit = min(as_int(request.GET.get("limit"), 100), 500)
    visits = Visit.objects.all()[:limit]

    return JsonResponse(
        {
            "count": Visit.objects.count(),
            "results": [
                {
                    "id": v.id,
                    "path": v.path,
                    "referrer": v.referrer,
                    "ip": v.ip,
                    "country": v.country,
                    "is_bot": v.is_bot,
                    "user_agent": (v.user_agent or "")[:180],
                    "created_at": v.created_at.isoformat(),
                }
                for v in visits
            ],
        }
    )


@admin_required
@require_http_methods(["GET"])
def admin_cv_stats(request):
    limit = min(as_int(request.GET.get("limit"), 100), 500)

    return JsonResponse(
        {
            "count": CvDownload.objects.count(),
            "results": [
                {
                    "id": d.id,
                    "ip": d.ip,
                    "user_agent": (d.user_agent or "")[:180],
                    "created_at": d.created_at.isoformat(),
                }
                for d in CvDownload.objects.all()[:limit]
            ],
        }
    )


# ---------------------------------------------------------------------------
# Back-office — projets (CRUD)
# ---------------------------------------------------------------------------

TEXT_FIELDS = (
    "title",
    "slug",
    "summary",
    "summary_en",
    "description",
    "description_en",
    "icon",
    "category",
    "website_url",
    "repo_url",
)
BOOL_FIELDS = ("is_published", "is_featured")


@admin_required
@require_http_methods(["GET", "POST"])
def admin_projects(request):
    if request.method == "GET":
        return JsonResponse(
            {"results": [p.to_dict() for p in Project.objects.all()]}
        )

    fields, files = parse_payload(request)

    title = (fields.get("title") or "").strip()
    if not title:
        return bad_request("Le titre du projet est obligatoire.")

    file_error = validate_files(files)
    if file_error:
        return bad_request(file_error)

    project = Project(title=title)
    _apply_fields(project, fields, files)

    if not project.summary:
        project.summary = (project.description or "")[:140]

    project.generate_slug()

    try:
        project.full_clean()
    except Exception as exc:  # messages de validation Django
        return bad_request(_validation_message(exc))

    project.save()
    attach_files(project, files)

    return JsonResponse(project.to_dict(), status=201)


@admin_required
@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def admin_project_detail(request, pk: int):
    """Lecture, mise a jour (POST/PUT/PATCH) ou suppression d'un projet.

    POST est accepte car Django ne peuple `request.FILES` que pour POST :
    c'est la methode utilisee par le back-office quand un visuel est joint.
    """
    project = get_object_or_404(Project, pk=pk)

    if request.method == "GET":
        return JsonResponse(project.to_dict())

    if request.method == "DELETE":
        for field in ("image", "mockup"):
            getattr(project, field).delete(save=False)
        project.delete()
        return JsonResponse({"detail": "Projet supprime."})

    fields, files = parse_payload(request)

    file_error = validate_files(files)
    if file_error:
        return bad_request(file_error)

    _apply_fields(project, fields, files)

    try:
        project.full_clean()
    except Exception as exc:
        return bad_request(_validation_message(exc))

    project.save()
    attach_files(project, files)

    return JsonResponse(project.to_dict())


def _apply_fields(project: Project, fields, files) -> None:
    for name in TEXT_FIELDS:
        if name in fields and fields[name] is not None:
            setattr(project, name, str(fields[name]).strip())

    if "technologies" in fields:
        techs = fields["technologies"]
        if isinstance(techs, str):
            try:
                techs = json.loads(techs)
            except json.JSONDecodeError:
                techs = [t.strip() for t in techs.split(",")]
        if isinstance(techs, list):
            project.technologies = [str(t).strip() for t in techs if str(t).strip()]

    if "order" in fields:
        project.order = as_int(fields.get("order"), project.order)

    for name in BOOL_FIELDS:
        if name in fields:
            setattr(project, name, as_bool(fields[name], getattr(project, name)))


FILE_LABELS = {"image": "Visuel", "mockup": "Maquette"}


def validate_files(files) -> str | None:
    """Valide tous les fichiers recus. Renvoie un message d'erreur ou None."""
    for field, allowed in (("image", ALLOWED_IMAGE_EXT),
                           ("mockup", ALLOWED_IMAGE_EXT)):
        upload = files.get(field)
        if not upload or not getattr(upload, "name", ""):
            continue
        error = validate_upload(upload, allowed, FILE_LABELS[field])
        if error:
            return error
    return None


def attach_files(project: Project, files) -> None:
    """Remplace les visuels transmis (les anciens sont supprimes du disque)."""
    attached = False

    for field in ("image", "mockup"):
        upload = files.get(field)
        if not upload or not getattr(upload, "name", ""):
            continue

        current = getattr(project, field)
        if current:
            current.delete(save=False)

        setattr(project, field, upload)
        attached = True

    if attached:
        project.save()


def _validation_message(exc) -> str:
    if hasattr(exc, "message_dict"):
        return " | ".join(
            f"{field} : {' ; '.join(msgs)}"
            for field, msgs in exc.message_dict.items()
        )
    messages = getattr(exc, "messages", None)
    if messages:
        return " ".join(str(m) for m in messages)
    return str(exc)


# ---------------------------------------------------------------------------
# Back-office — profil (photo et CV)
# ---------------------------------------------------------------------------


@admin_required
@require_http_methods(["GET"])
def admin_profile(request):
    return JsonResponse(Profile.get().to_dict())


@admin_required
@require_http_methods(["POST"])
def admin_profile_photo(request):
    if "photo" not in request.FILES:
        return bad_request("Aucune image recue.")

    profile = Profile.get()
    error = validate_upload(
        request.FILES["photo"], ALLOWED_IMAGE_EXT, "Photo de profil"
    )
    if error:
        return bad_request(error)

    if profile.photo:
        profile.photo.delete(save=False)

    profile.photo = request.FILES["photo"]
    profile.save()

    return JsonResponse(profile.to_dict())


@admin_required
@require_http_methods(["DELETE"])
def admin_profile_photo_delete(request):
    profile = Profile.get()
    if profile.photo:
        profile.photo.delete(save=False)
    profile.photo = None
    profile.save()
    return JsonResponse(profile.to_dict())


@admin_required
@require_http_methods(["POST"])
def admin_profile_cv(request):
    if "cv" not in request.FILES:
        return bad_request("Aucun fichier recu.")

    profile = Profile.get()
    error = validate_upload(request.FILES["cv"], ALLOWED_CV_EXT, "CV")
    if error:
        return bad_request(error)

    if profile.cv:
        profile.cv.delete(save=False)

    profile.cv = request.FILES["cv"]
    profile.cv_filename = os.path.splitext(
        request.FILES["cv"].name or "CV"
    )[0][:160]
    profile.save()

    return JsonResponse(profile.to_dict())


@admin_required
@require_http_methods(["DELETE"])
def admin_profile_cv_delete(request):
    profile = Profile.get()
    if profile.cv:
        profile.cv.delete(save=False)
    profile.cv = None
    profile.cv_filename = "CV"
    profile.save()
    return JsonResponse(profile.to_dict())


# ---------------------------------------------------------------------------
# Compte administrateur — changement d'identifiant / mot de passe
# ---------------------------------------------------------------------------

MIN_PASSWORD_LENGTH = 8


@admin_required
@require_http_methods(["PATCH"])
def admin_account(request):
    """Modifie l'identifiant et/ou le mot de passe depuis le back-office.

    Le mot de passe ACTUEL est toujours exigé : une session volée ou
    laissée ouverte ne permet donc pas de prendre le contrôle du compte.
    """
    fields, _ = parse_payload(request)
    user = request.user

    current_password = str(fields.get("current_password") or "")
    username = fields.get("username")
    new_password = fields.get("new_password")

    if not current_password or not user.check_password(current_password):
        return bad_request("Mot de passe actuel incorrect.")

    if username is None and new_password is None:
        return bad_request("Aucune modification fournie.")

    errors = []

    if username is not None:
        username = str(username).strip()
        if len(username) < 3:
            errors.append("L'identifiant doit contenir au moins 3 caracteres.")
        elif (
            get_user_model()
            .objects.filter(username__iexact=username)
            .exclude(pk=user.pk)
            .exists()
        ):
            errors.append("Cet identifiant est deja utilise.")

    if new_password is not None:
        new_password = str(new_password)
        if len(new_password) < MIN_PASSWORD_LENGTH:
            errors.append(
                f"Le mot de passe doit contenir au moins {MIN_PASSWORD_LENGTH} "
                "caracteres."
            )
        elif new_password == current_password:
            errors.append("Le nouveau mot de passe doit etre different de l'actuel.")

    if errors:
        return bad_request(" ".join(errors))

    updated = []

    if username is not None:
        user.username = username
        updated.append("identifiant")

    if new_password is not None:
        user.set_password(new_password)
        updated.append("mot de passe")

    user.save()

    if new_password is not None:
        # Conserve les donnees de session mais change son identifiant
        # (protection contre la fixation de session). L'admin reste connecte.
        request.session.cycle_key()

    return JsonResponse({"username": user.username, "updated": updated})


# ---------------------------------------------------------------------------
# Contact — formulaire public
# ---------------------------------------------------------------------------


@require_http_methods(["POST"])
def contact_create(request):
    """Recoit un message du formulaire public.

    Le message est TOUJOURS enregistre : si l'envoi d'email echoue (SMTP
    non configure, coupure...), il reste lisible dans le back-office.
    """
    fields, _ = parse_payload(request)

    # Champ piege : on simule un succes pour ne pas informer le robot.
    if str(fields.get(HONEYPOT_FIELD) or "").strip():
        return JsonResponse({"detail": "Message envoye, merci !"}, status=201)

    name = str(fields.get("name") or "").strip()[:120]
    email = str(fields.get("email") or "").strip()[:254]
    subject = str(fields.get("subject") or "").strip()[:200]
    message = str(fields.get("message") or "").strip()

    if not name:
        return bad_request("Votre nom est obligatoire.")
    if not EMAIL_PATTERN.match(email):
        return bad_request("Adresse email invalide.")
    if len(message) < 10:
        return bad_request("Le message doit contenir au moins 10 caracteres.")
    if len(message) > 5000:
        return bad_request("Le message est trop long (5000 caracteres maximum).")

    ip = client_ip(request)

    # Anti-spam : plafond par IP sur la derniere heure.
    if ip and settings.CONTACT_MAX_PER_HOUR:
        recent = ContactMessage.objects.filter(
            ip=ip, created_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        if recent >= settings.CONTACT_MAX_PER_HOUR:
            return JsonResponse(
                {"detail": "Trop de messages envoyes. Reessayez plus tard."},
                status=429,
            )

    email_sent = False

    # Le backend « console » n'envoie rien : il ecrit simplement dans les
    # logs et ne leve aucune erreur. Sans ce controle, email_sent passerait
    # a True et le back-office afficherait « Email envoye » a tort.
    # Un backend SMTP exige en plus des identifiants renseignes, sinon
    # l'envoi echouerait a coup. Les autres backends (locmem pour les
    # tests, file…) fonctionnent sans identifiants.
    backend = settings.EMAIL_BACKEND
    if "console" in backend:
        mail_ready = False
    elif "smtp" in backend:
        mail_ready = bool(settings.EMAIL_HOST_USER) and bool(
            settings.EMAIL_HOST_PASSWORD
        )
    else:
        mail_ready = True

    if mail_ready:
        try:
            body = (
                f"Message de {name} <{email}>\n"
                f"Recu le {timezone.localtime():%d/%m/%Y a %H:%M}\n"
                f"IP : {ip or 'inconnue'}\n"
                f"\n{'-' * 60}\n\n{message}\n"
            )
            send_mail(
                subject or f"Nouveau message de {name}",
                body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_RECIPIENT],
                fail_silently=False,
            )
            email_sent = True
        except Exception:
            # Le message reste consultable dans le back-office.
            logger.exception("Echec d'envoi d'email pour un message de contact")
    else:
        logger.info(
            "SMTP non configure : message conserve dans le back-office seul "
            "(voir la section « Formulaire de contact » du README)."
        )

    ContactMessage.objects.create(
        name=name,
        email=email,
        subject=subject,
        message=message,
        ip=ip,
        user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:1000],
        email_sent=email_sent,
    )

    return JsonResponse(
        {
            "detail": "Message envoye, merci ! Je vous reponds rapidement.",
            "email_sent": email_sent,
        },
        status=201,
    )


# ---------------------------------------------------------------------------
# Contact — lecture cote back-office
# ---------------------------------------------------------------------------


@admin_required
@require_http_methods(["GET"])
def admin_messages(request):
    limit = min(as_int(request.GET.get("limit"), 100), 500)
    results = list(ContactMessage.objects.all()[:limit])
    return JsonResponse(
        {
            "count": ContactMessage.objects.count(),
            "unread": ContactMessage.objects.filter(is_read=False).count(),
            # Vrai uniquement si un envoi reeel est possible.
            "email_configured": (
                settings.EMAIL_BACKEND.endswith("smtp.EmailBackend")
                and bool(settings.EMAIL_HOST_USER)
                and bool(settings.EMAIL_HOST_PASSWORD)
            ),
            "recipient": settings.CONTACT_RECIPIENT,
            "results": [m.to_dict() for m in results],
        }
    )


@admin_required
@require_http_methods(["PATCH", "DELETE"])
def admin_message_detail(request, pk):
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == "DELETE":
        message.delete()
        return JsonResponse({"detail": "Message supprime."})

    fields, _ = parse_payload(request)
    if "is_read" in fields:
        message.is_read = as_bool(fields.get("is_read"), message.is_read)
        message.save(update_fields=["is_read"])

    return JsonResponse(message.to_dict())
