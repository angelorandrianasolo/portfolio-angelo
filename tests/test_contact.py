"""Tests du formulaire de contact — API Django (client de test intégré).

Lancez-le depuis n'importe quel dossier :
    python tests/test_contact.py
"""
import os
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "api")

os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"
os.environ["DJANGO_DEBUG"] = "1"
os.environ["DJANGO_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "contact.sqlite3")
os.environ["EMAIL_BACKEND"] = "django.core.mail.backends.locmem.EmailBackend"
os.environ["CONTACT_MAX_PER_HOUR"] = "3"

sys.path.insert(0, BASE)
sys.path.insert(0, os.path.dirname(__file__))

from _creds import ADMIN_USERNAME, CONTACT_RECIPIENT, ISOLATED_PASSWORD

import django
django.setup()

from django.core.management import call_command
call_command("migrate", "--noinput", verbosity=0)

from django.core import mail
from django.test import Client
from core.models import ContactMessage

FAILED = []


def check(label, condition, detail=""):
    mark = "OK  " if condition else "KO  "
    print(f"[{mark}] {label}" + (f"  -> {detail}" if detail and not condition else ""))
    if not condition:
        FAILED.append(label)


def post(client, payload):
    return client.post(
        "/api/contact/",
        data=json_bytes(payload),
        content_type="application/json",
    )


def json_bytes(obj):
    import json
    return json.dumps(obj).encode("utf-8")


def main():
    # --- Jeton CSRF ------------------------------------------------------
    client = Client()
    client.get("/api/auth/csrf/")
    token = client.cookies.get("csrftoken").value if client.cookies.get("csrftoken") else ""

    def post_csrf(payload):
        import json
        req = client.post(
            "/api/contact/",
            data=json.dumps(payload).encode("utf-8"),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        return req

    # 1. Message valide ---------------------------------------------------
    r = post_csrf({
        "name": "Jean Test",
        "email": "jean@example.com",
        "subject": "Proposition",
        "message": "Bonjour, je souhaite discuter d'un projet ensemble.",
        "website": "",
    })
    check("POST valide -> 201", r.status_code == 201, f"status={r.status_code}")
    body = r.json()
    check("email_signalé envoyé", body.get("email_sent") is True, str(body))
    check("message stocké", ContactMessage.objects.count() == 1)
    check("email envoyé (locmem)", len(mail.outbox) == 1, f"outbox={len(mail.outbox)}")
    if mail.outbox:
        msg = mail.outbox[0]
        check("destinataire", msg.to == [CONTACT_RECIPIENT], str(msg.to))
        check("corps contient le message",
              "projet ensemble" in msg.body, msg.body[:200])
        check("expéditeur non vide", bool(msg.from_email), repr(msg.from_email))
        check("sujet transmis", msg.subject == "Proposition", msg.subject)

    # 2. Rejet : nom manquant --------------------------------------------
    r = post_csrf({"name": "", "email": "a@b.co", "message": "x" * 30})
    check("nom vide -> 400", r.status_code == 400, f"status={r.status_code}")

    # 3. Rejet : email invalide ------------------------------------------
    r = post_csrf({"name": "A", "email": "pas-un-email", "message": "x" * 30})
    check("email invalide -> 400", r.status_code == 400, f"status={r.status_code}")

    # 4. Rejet : message trop court --------------------------------------
    r = post_csrf({"name": "A", "email": "a@b.co", "message": "court"})
    check("message < 10 -> 400", r.status_code == 400, f"status={r.status_code}")

    # 5. Rejet : trop long ------------------------------------------------
    r = post_csrf({"name": "A", "email": "a@b.co", "message": "x" * 5001})
    check("message > 5000 -> 400", r.status_code == 400, f"status={r.status_code}")

    # 6. Honeypot : 201 mais rien stocké ----------------------------------
    before = ContactMessage.objects.count()
    r = post_csrf({
        "name": "Bot", "email": "bot@spam.com",
        "message": "x" * 30, "website": "http://spam",
    })
    check("honeypot -> 201", r.status_code == 201, f"status={r.status_code}")
    check("honeypot non stocké",
          ContactMessage.objects.count() == before,
          f"count={ContactMessage.objects.count()}")

    # 7. Méthode interdite ------------------------------------------------
    r = client.get("/api/contact/")
    check("GET -> 405", r.status_code == 405, f"status={r.status_code}")

    # 8. Sans CSRF -> 403 -------------------------------------------------
    # Le client de test ignore CSRF par defaut : on en cree un qui l'applique.
    from django.test import Client as StrictClient
    fresh = StrictClient(enforce_csrf_checks=True)
    r = fresh.post(
        "/api/contact/",
        data=json_bytes({"name": "X", "email": "x@y.zz", "message": "y" * 30}),
        content_type="application/json",
    )
    check("sans CSRF -> 403", r.status_code == 403, f"status={r.status_code}")

    # 8bis. JSON envoye SANS en-tete Content-Type (repli de parse_payload) --
    # Regression : un oubli de l'en-tete faisait arriver des champs vides et
    # la vue repondait « champ obligatoire » alors que tout etait envoye.
    r = client.post(
        "/api/contact/",
        data=json_bytes({
            "name": "Sans Content-Type",
            "email": "sct@example.com",
            "message": "Message envoye sans en-tete Content-Type.",
        }),
        content_type="text/plain",
        HTTP_X_CSRFTOKEN=token,
    )
    check("JSON sans Content-Type -> 201", r.status_code == 201,
          f"status={r.status_code} {r.json()}")
    check("JSON sans Content-Type stocke",
          ContactMessage.objects.filter(email="sct@example.com").exists())
    ContactMessage.objects.filter(email="sct@example.com").delete()

    # 8ter. Une visite envoyee en JSON brut garde son chemin ---------------
    from core.models import Visit
    c2 = Client()
    c2.get("/api/auth/csrf/")
    t2 = c2.cookies.get("csrftoken").value
    r = c2.post(
        "/api/visits/",
        data=json_bytes({"path": "/admin.html?x=1", "referrer": "https://t.mg"}),
        content_type="text/plain",
        HTTP_X_CSRFTOKEN=t2,
    )
    check("visite JSON brut -> 201", r.status_code == 201,
          f"status={r.status_code}")
    v = Visit.objects.order_by("-id").first()
    check("visite conserve le chemin", bool(v) and v.path == "/admin.html?x=1",
          repr(v.path if v else None))
    check("visite conserve le referer", bool(v) and v.referrer == "https://t.mg",
          repr(v.referrer if v else None))
    Visit.objects.all().delete()

    # 9. Back-office non authentifié -> 401 -------------------------------
    anon = Client()
    r = anon.get("/api/admin/messages/")
    check("messages anonyme -> 401", r.status_code == 401, f"status={r.status_code}")

    # 10. Back-office authentifié ----------------------------------------
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user, _ = User.objects.get_or_create(username=ADMIN_USERNAME)
    user.set_password(ISOLATED_PASSWORD)
    user.save()

    admin = Client()
    admin.get("/api/auth/csrf/")
    atoken = admin.cookies.get("csrftoken").value
    r = admin.post(
        "/api/auth/login/",
        data=json_bytes({"username": ADMIN_USERNAME,
                         "password": ISOLATED_PASSWORD}),
        content_type="application/json",
        HTTP_X_CSRFTOKEN=atoken,
    )
    check("login -> 200", r.status_code == 200, f"status={r.status_code}")

    r = admin.get("/api/admin/messages/")
    check("liste messages -> 200", r.status_code == 200, f"status={r.status_code}")
    data = r.json()
    check("count = 1", data.get("count") == 1, str(data.get("count")))
    check("unread = 1", data.get("unread") == 1, str(data.get("unread")))
    check("email_configured signalé",
          "email_configured" in data, str(data.keys()))
    check("results non vide", len(data.get("results", [])) == 1)

    mid = data["results"][0]["id"]
    r = admin.patch(
        f"/api/admin/messages/{mid}/",
        data=json_bytes({"is_read": True}),
        content_type="application/json",
        HTTP_X_CSRFTOKEN=atoken,
    )
    check("marquer lu -> 200", r.status_code == 200, f"status={r.status_code}")
    check("is_read=True", r.json().get("is_read") is True)

    r = admin.get("/api/admin/messages/")
    check("unread = 0 après lecture", r.json().get("unread") == 0)

    r = admin.get("/api/admin/overview/")
    check("overview contient messages",
          "messages" in r.json()["totals"], str(r.json()["totals"]))
    check("overview contient unread_messages",
          r.json()["totals"].get("unread_messages") == 0)

    r = admin.delete(f"/api/admin/messages/{mid}/", HTTP_X_CSRFTOKEN=atoken)
    check("supprimer -> 200", r.status_code == 200, f"status={r.status_code}")
    check("liste vide", admin.get("/api/admin/messages/").json()["count"] == 0)

    print()
    if FAILED:
        print(f"ECHEC : {len(FAILED)} test(s)")
        for item in FAILED:
            print("  - " + item)
        return 1
    print("TOUS LES TESTS PASSENT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
