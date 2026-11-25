"""
Modeles de l'API REST du portfolio.

Cinq entites :
  * Visit           — trace de passage d'un visiteur
  * CvDownload      — trace de telechargement du CV
  * Project         — projet affiche sur le site, gere depuis le back-office
  * Profile         — singleton : photo de profil et fichier CV
  * ContactMessage  — message recu via le formulaire de contact
"""
from django.db import models
from django.utils.text import slugify


class Visit(models.Model):
    """Un passage sur le site (une seule fois par session)."""

    path = models.CharField(max_length=500, blank=True, default="/")
    referrer = models.CharField(max_length=500, blank=True, default="")
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    country = models.CharField(max_length=120, blank=True, default="")
    is_bot = models.BooleanField(default=False)
    created_at = models.DateTimeField("date", auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Visite"
        verbose_name_plural = "Visites"

    def __str__(self):
        return f"{self.path} — {self.created_at:%d/%m/%Y %H:%M}"


class CvDownload(models.Model):
    """Un telechargement du CV."""

    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    created_at = models.DateTimeField("date", auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Telechargement de CV"
        verbose_name_plural = "Telechargements de CV"

    def __str__(self):
        return f"CV — {self.created_at:%d/%m/%Y %H:%M}"


class Project(models.Model):
    """Projet affiche publiquement, entierement gere depuis l'interface."""

    title = models.CharField("Titre", max_length=200)
    slug = models.SlugField("Slug", unique=True, blank=True, max_length=220)
    summary = models.CharField("Accroche", max_length=255, blank=True, default="")
    summary_en = models.CharField(
        "Accroche (EN)", max_length=255, blank=True, default=""
    )
    description = models.TextField("Description", blank=True, default="")
    description_en = models.TextField("Description (EN)", blank=True, default="")
    technologies = models.JSONField(
        "Technologies", default=list, blank=True,
        help_text="Liste de chaines, ex. ['Node.js', 'PostgreSQL']",
    )
    icon = models.CharField("Icône", max_length=12, default="🚀", blank=True)
    category = models.CharField("Categorie", max_length=80, blank=True, default="")
    website_url = models.URLField("Lien du projet", blank=True, default="")
    repo_url = models.URLField("Lien GitHub", blank=True, default="")
    image = models.ImageField(
        "Visuel", upload_to="projects/", blank=True, null=True
    )
    mockup = models.ImageField(
        "Maquette", upload_to="mockups/", blank=True, null=True
    )
    is_published = models.BooleanField("Publie", default=True)
    is_featured = models.BooleanField("En vedette", default=False)
    order = models.IntegerField("Ordre", default=0)
    created_at = models.DateTimeField("Cree le", auto_now_add=True)
    updated_at = models.DateTimeField("Mis a jour le", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Projet"
        verbose_name_plural = "Projets"

    def generate_slug(self) -> None:
        """Genere un slug unique a partir du titre (idempotent)."""
        if self.slug:
            return
        base = slugify(self.title)[:200] or "projet"
        slug, n = base, 2
        while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base}-{n}"
            n += 1
        self.slug = slug

    def save(self, *args, **kwargs):
        self.generate_slug()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def to_dict(self, lang: str = "fr") -> dict:
        """Serialisation en dict pour la reponse JSON."""
        description = (
            self.description_en
            if lang == "en" and self.description_en
            else self.description
        )
        summary = (
            self.summary_en if lang == "en" and self.summary_en else self.summary
        )
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "summary": summary,
            "description": description,
            # Exposes pour que le back-office puisse recharger le formulaire
            # de modification sans perdre les traductions anglaises.
            "summary_en": self.summary_en,
            "description_en": self.description_en,
            "technologies": self.technologies or [],
            "icon": self.icon,
            "category": self.category,
            "website_url": self.website_url,
            "repo_url": self.repo_url,
            "image": self.image.url if self.image else None,
            "mockup": self.mockup.url if self.mockup else None,
            "photos": [photo.to_dict() for photo in self.photos.all()],
            "is_published": self.is_published,
            "is_featured": self.is_featured,
            "order": self.order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ProjectPhoto(models.Model):
    """Photo supplementaire d'un projet : galerie multi-photos."""

    project = models.ForeignKey(
        Project,
        related_name="photos",
        on_delete=models.CASCADE,
        verbose_name="Projet",
    )
    image = models.ImageField("Photo", upload_to="projects/photos/")
    thumb = models.ImageField(
        "Miniature", upload_to="projects/photos/thumbs/",
        blank=True, null=True,
        help_text="Version reduite (900 px) generee automatiquement.",
    )
    order = models.IntegerField("Ordre", default=0)
    created_at = models.DateTimeField("Ajoutee le", auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Photo du projet"
        verbose_name_plural = "Photos du projet"

    def __str__(self):
        return f"Photo {self.pk} — {self.project.title}"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "url": self.image.url if self.image else None,
            "thumb": self.thumb.url if self.thumb else None,
            "order": self.order,
        }


class Profile(models.Model):
    """Singleton : photo de profil et fichier CV du titulaire du portfolio."""

    photo = models.ImageField(
        "Photo de profil", upload_to="profile/", blank=True, null=True
    )
    cv = models.FileField(
        "CV (PDF)", upload_to="cv/", blank=True, null=True
    )
    cv_filename = models.CharField(
        "Nom affiche du CV", max_length=160, blank=True, default="CV"
    )
    contact_email = models.EmailField(
        "E-mail recepteur des messages", max_length=254, blank=True, default=""
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil"
        verbose_name_plural = "Profil"

    def __str__(self):
        return "Profil"

    @classmethod
    def get(cls) -> "Profile":
        """Renvoie l'instance unique, creee a la premiere utilisation."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def to_dict(self) -> dict:
        return {
            "photo": self.photo.url if self.photo else None,
            "has_cv": bool(self.cv),
            "cv_url": self.cv.url if self.cv else None,
            "cv_filename": self.cv_filename or "CV",
            "contact_email": self.contact_email,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ContactMessage(models.Model):
    """Message envoye depuis le formulaire de contact public.

    Le message est TOUJOURS enregistre, meme si l'envoi d'email echoue :
    il reste alors lisible dans le back-office.
    """

    name = models.CharField("Nom", max_length=120)
    email = models.EmailField("Email")
    subject = models.CharField("Sujet", max_length=200, blank=True, default="")
    message = models.TextField("Message")
    ip = models.GenericIPAddressField("IP", null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    is_read = models.BooleanField("Lu", default=False)
    email_sent = models.BooleanField("Email envoye", default=False)
    created_at = models.DateTimeField("Recu le", auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"

    def __str__(self):
        return f"{self.name} — {self.created_at:%d/%m/%Y %H:%M}"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "ip": self.ip,
            "is_read": self.is_read,
            "email_sent": self.email_sent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class FileBlob(models.Model):
    """Contenu binaire d'un fichier media (voir core.storage.DatabaseStorage).

    Une ligne = un fichier (photo, miniature, CV). `name` est exactement la
    valeur du champ ImageField/FieldFile (chemin relatif type
    ``projects/xxx.jpg``) : l'aller-retour disque <-> base reste transparent
    et les URLs /media/... ne changent pas.

    Pourquoi la base : le disque des plans gratuits est ephemere (un rede-
    ploiement effacerait /app/media). PostgreSQL (Neon) est persistant et
    sauvegarde : les medias ne peuvent plus se perdre, sans service externe
    ni carte bancaire.
    """

    name = models.CharField("Chemin", max_length=500, unique=True)
    content = models.BinaryField("Contenu")
    size = models.PositiveIntegerField("Taille (octets)", default=0)
    updated_at = models.DateTimeField("Mis a jour", auto_now=True)

    class Meta:
        verbose_name = "Fichier media"
        verbose_name_plural = "Fichiers medias"

    def __str__(self):
        return f"{self.name} ({self.size} octets)"
