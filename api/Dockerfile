# =========================================================
# API REST — Django + Gunicorn
# Contexte de build : racine du dépôt (pour requirements.txt)
# =========================================================
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dépendances d'abord : la couche reste valide tant que requirements.txt
# ne change pas.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ .

# Certificat racine Avast (Web/Mail Shield) : ce poste intercepte le TLS
# sortant, sans cette racine le conteneur refuse la connexion SMTP et aucun
# e-mail ne peut partir. Fichier public, propre a cette machine.
RUN if [ -f certs/avast-root.pem ]; then \
        cp certs/avast-root.pem /usr/local/share/ca-certificates/avast-root.crt \
        && update-ca-certificates; \
    fi

# Répertoires de données persistants (montés en volume dans compose).
RUN mkdir -p data media staticfiles \
    && useradd --uid 1001 --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app

EXPOSE 8000

# migrate  -> schéma SQLite
# ensure_admin -> compte à partir de ADMIN_USERNAME / ADMIN_PASSWORD
# seed_projects -> projets initiaux (idempotent)
# gunicorn -> serveur de production
#
# L'entrée se fait en root uniquement pour appartenir les volumes (écrits
# par une image précédente en root), puis setpriv redescend en « appuser » :
# migrate et gunicorn tournent sans aucun privilège.
CMD ["sh", "-c", "\
    chown -R appuser:appuser /app/data /app/media && \
    setpriv --reuid=appuser --regid=appuser --init-groups sh -c \"\
python manage.py migrate --noinput && \
python manage.py ensure_admin && \
python manage.py seed_projects && \
gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --threads 2 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -\""]

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
    CMD python -c "import urllib.request,sys; \
        sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"
