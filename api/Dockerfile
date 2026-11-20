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

# Répertoires de données persistants (montés en volume dans compose).
RUN mkdir -p data media staticfiles

EXPOSE 8000

# migrate  -> schéma SQLite
# ensure_admin -> compte à partir de ADMIN_USERNAME / ADMIN_PASSWORD
# seed_projects -> projets initiaux (idempotent)
# gunicorn -> serveur de production
CMD ["sh", "-c", "\
    python manage.py migrate --noinput && \
    python manage.py ensure_admin && \
    python manage.py seed_projects && \
    gunicorn config.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 2 \
        --threads 2 \
        --timeout 60 \
        --access-logfile - \
        --error-logfile -"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
    CMD python -c "import urllib.request,sys; \
        sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"
