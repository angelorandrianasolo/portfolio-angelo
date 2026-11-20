"""Test de bout en bout de l'API REST du portfolio.

    python tests/test_api.py                      # serveur local :8000
    API_BASE=http://localhost:8080 python tests/test_api.py   # Docker

La suite attend une base VIDE : `migrate` puis `ensure_admin` sur un
`DJANGO_DB_PATH` neuf (sans `seed_projects`).
"""
import json
import os
import urllib.error
import urllib.request
import http.cookiejar

from _creds import ADMIN_USERNAME, login_payload

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000") + "/api"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def csrf_token():
    opener.open(BASE + "/auth/csrf/").read()
    for c in jar:
        if c.name == "csrftoken":
            return c.value
    return ""


def call(method, path, body=None, ctype="application/json", form=False):
    url = BASE + path
    data = None
    headers = {"X-CSRFToken": csrf_token()}
    if body is not None:
        if form:
            data = urllib.parse.urlencode(body).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = ctype
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = opener.open(req)
        return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:200]}


import urllib.parse  # noqa: E402

ok = True


def check(label, cond, extra=""):
    global ok
    status = "OK " if cond else "KO "
    if not cond:
        ok = False
    print(f"[{status}] {label} {extra}")


# --- Authentification -------------------------------------------------
code, r = call("GET", "/auth/me/")
check("me anonymous", code == 200 and r["authenticated"] is False)

code, r = call("GET", "/admin/overview/")
check("admin sans session -> 401", code == 401, f"got {code}")

code, r = call("POST", "/admin/projects/", {"title": "x"})
check("POST projets sans session -> 401", code == 401, f"got {code}")

code, r = call("POST", "/auth/login/",
               {"username": ADMIN_USERNAME, "password": "wrong"})
check("bad password -> 401", code == 401, f"got {code}")

code, r = call("POST", "/auth/login/", login_payload())
check("login ok", code == 200 and r.get("username") == ADMIN_USERNAME, f"got {code}")

code, r = call("GET", "/auth/me/")
check("me authenticated", code == 200 and r["authenticated"] is True)

# --- Admin protege : verifie plus haut, avant login -------------------

# --- CRUD Projets -----------------------------------------------------
code, r = call("POST", "/admin/projects/", {
    "title": "API REST de gestion de bibliothèque",
    "summary": "API REST complète avec authentification JWT et pagination.",
    "summary_en": "Complete REST API with JWT authentication and pagination.",
    "description": "Conception d'une API REST documentée (OpenAPI) avec authentification JWT, validation stricte et tests automatisés.",
    "description_en": "Full REST API documented with JWT auth, strict validation and automated tests.",
    "technologies": ["Django", "Django REST Framework", "PostgreSQL"],
    "category": "Backend",
    "website_url": "https://exemple.com",
    "repo_url": "https://github.com/angelorandrianasolo/api-biblio",
    "icon": "\U0001f527",
    "is_published": True,
    "is_featured": True,
    "order": 1,
})
check("create project", code == 201 and r.get("id"), f"got {code} {r}")
pid1 = r.get("id")

code, r = call("POST", "/admin/projects/", {
    "title": "Portfolio dynamique",
    "summary": "Site vitrine relié à une API Django.",
    "description": "Architecture MVC, back-office complet, suivi des visiteurs.",
    "technologies": ["Django", "Nginx", "JavaScript"],
    "category": "Full Stack",
    "icon": "\U0001f310",
    "is_published": True,
})
check("create project 2", code == 201 and r.get("slug"), f"slug={r.get('slug')}")
pid2 = r.get("id")

code, r = call("POST", "/admin/projects/", {"summary": "sans titre"})
check("sans titre -> 400", code == 400, f"got {code}")

code, r = call("POST", "/admin/projects/", {
    "title": "URL invalide",
    "website_url": "pas-une-url",
})
check("url invalide -> 400", code == 400, f"got {code} {r}")

code, r = call("PUT", f"/admin/projects/{pid1}/", {"is_featured": False, "order": 3})
check("update project", code == 200 and r["is_featured"] is False and r["order"] == 3,
      f"got {code}")

code, r = call("GET", "/projects/?lang=en")
check("liste publique EN", code == 200 and len(r["results"]) == 2,
      f"count={len(r.get('results', []))}")
en_descs = " ".join(x["description"] for x in r.get("results", []))
check("traduction EN utilisee", "REST API documented" in en_descs)
en_summaries = " ".join(x["summary"] for x in r.get("results", []))
check("accroche EN utilisee", "Complete REST API" in en_summaries)
check("accroche presente partout",
      all(x["summary"] for x in r.get("results", [])))

code, r = call("GET", "/projects/?lang=fr")
fr_descs = " ".join(x["description"] for x in r.get("results", []))
check("liste publique FR", code == 200 and "Conception" in fr_descs)

code, r = call("DELETE", f"/admin/projects/{pid2}/")
check("delete project", code == 200, f"got {code}")

code, r = call("GET", "/projects/")
check("liste apres suppression", code == 200 and len(r["results"]) == 1)

code, r = call("GET", "/admin/projects/")
check("liste admin", code == 200 and len(r["results"]) == 1)

# --- Visites ----------------------------------------------------------
code, r = call("POST", "/visits/", {"path": "/", "referrer": ""}, form=True)
check("visite enregistree", code == 201 and r["tracked"] is True, f"got {code}")

code, r = call("POST", "/visits/", {"path": "/", "referrer": ""}, form=True)
check("visite dedup session", code == 202 and r["tracked"] is False, f"got {code}")

# --- CV (aucun fichier CV) -------------------------------------------
code, r = call("POST", "/cv/download/", {}, form=True)
check("CV absent -> 404", code == 404, f"got {code}")

# --- Bootstrap public -------------------------------------------------
code, r = call("GET", "/public/")
check("bootstrap public", code == 200 and r["counters"]["visits"] >= 1
      and r["counters"]["projects"] == 1, f"got {code} {r['counters']}")

# --- Profil -----------------------------------------------------------
code, r = call("GET", "/admin/profile/")
check("profil admin", code == 200 and r["has_cv"] is False)

code, r = call("DELETE", "/admin/profile/cv/delete/")
check("supprimer CV absent", code == 200)

# --- GitHub -----------------------------------------------------------
try:
    code, r = call("GET", "/github/repos/")
    if code == 200:
        names = [x["name"] for x in r["results"]]
        check("github repos", len(r["results"]) > 0, f"-> {names[:4]}")
        check("github sans forks", all(not x["is_fork"] for x in r["results"]))
    else:
        check("github repos (indisponible)", False, f"got {code} {r}")
except Exception as e:
    print(f"[--] github: {e}")

print()
print("RESULTAT:", "TOUS LES TESTS PASSENT" if ok else "DES TESTS ECHOUENT")
