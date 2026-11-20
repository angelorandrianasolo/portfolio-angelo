"""Test des uploads : photo de profil, CV, visuels de projets.

    python tests/test_uploads.py                      # serveur local :8000
    API_BASE=http://localhost:8080 python tests/test_uploads.py   # Docker
"""
import io
import json
import os
import uuid
import urllib.error
import urllib.parse
import urllib.request
import http.cookiejar

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000") + "/api"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

from _creds import login_payload

ok = True


def check(label, cond, extra=""):
    global ok
    if not cond:
        ok = False
    print(f"[{'OK ' if cond else 'KO '}] {label} {extra}")


def csrf():
    opener.open(BASE + "/auth/csrf/").read()
    for c in jar:
        if c.name == "csrftoken":
            return c.value
    return ""


def call(method, path, body=None, form=False):
    headers = {"X-CSRFToken": csrf()}
    data = None
    if body is not None:
        if form:
            data = urllib.parse.urlencode(body).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        resp = opener.open(req)
        return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:300]}


def multipart(fields, files):
    """Construit un corps multipart/form-data."""
    boundary = uuid.uuid4().hex
    out = io.BytesIO()
    for name, value in fields.items():
        out.write(f"--{boundary}\r\n".encode())
        out.write(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        out.write(str(value).encode() + b"\r\n")
    for name, (fname, content, mime) in files.items():
        out.write(f"--{boundary}\r\n".encode())
        out.write(
            f'Content-Disposition: form-data; name="{name}"; filename="{fname}"\r\n'
            .encode()
        )
        out.write(f"Content-Type: {mime}\r\n\r\n".encode())
        out.write(content + b"\r\n")
    out.write(f"--{boundary}--\r\n".encode())
    return out.getvalue(), f"multipart/form-data; boundary={boundary}"


def upload(path, fields, files):
    body, ctype = multipart(fields, files)
    req = urllib.request.Request(
        BASE + path, data=body, method="POST",
        headers={"X-CSRFToken": csrf(), "Content-Type": ctype},
    )
    try:
        resp = opener.open(req)
        return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:300]}


# --- Login ------------------------------------------------------------
code, r = call("POST", "/auth/login/", login_payload())
check("login", code == 200, f"got {code}")

# --- Petits fichiers de test -----------------------------------------
from PIL import Image

buf = io.BytesIO()
Image.new("RGB", (240, 240), (90, 77, 240)).save(buf, format="PNG")
PNG = buf.getvalue()

buf2 = io.BytesIO()
Image.new("RGB", (600, 400), (20, 20, 30)).save(buf2, format="JPEG")
JPEG = buf2.getvalue()

# PDF minimal (une page vide valide)
PDF = (
    b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n"
    b"trailer<</Root 1 0 R>>\n%%EOF\n"
)

# --- 1. Photo de profil ----------------------------------------------
code, r = upload("/admin/profile/photo/", {}, {"photo": ("profil.png", PNG, "image/png")})
check("upload photo", code == 200 and r.get("photo"), f"got {code} {r.get('photo')}")
photo_url = r.get("photo")

code, r2 = call("GET", "/public/")
check("photo visible publiquement", r2.get("photo") == photo_url)

# --- 2. CV ------------------------------------------------------------
code, r = upload("/admin/profile/cv/", {}, {"cv": ("CV Angelo Randrianasolo.pdf", PDF, "application/pdf")})
check("upload CV", code == 200 and r.get("has_cv") is True, f"got {code} {r}")
cv_url = r.get("cv_url")

code, r2 = call("GET", "/public/")
check("CV disponible publiquement", r2.get("has_cv") is True and r2.get("cv_url") == cv_url)
check("nom du CV", "CV Angelo Randrianasolo" in (r2.get("cv_filename") or ""),
      f"-> {r2.get('cv_filename')}")

# --- 3. Telechargement CV trace --------------------------------------
code, r = call("POST", "/cv/download/", {}, form=True)
check("trace telechargement CV", code == 201, f"got {code} {r}")

code, r = call("POST", "/cv/download/", {}, form=True)
check("dedup telechargement", code == 202, f"got {code}")

code, r = call("GET", "/admin/cv/")
check("stats CV admin", code == 200 and r["count"] >= 1, f"count={r.get('count')}")

# --- 4. Mauvais type de fichier --------------------------------------
code, r = upload("/admin/profile/photo/", {}, {"photo": ("hack.php", b"<?php ?>", "image/png")})
check("photo extension refusee", code == 400, f"got {code} {r}")

code, r = upload("/admin/profile/cv/", {}, {"cv": ("cv.exe", b"MZ", "application/pdf")})
check("CV extension refusee", code == 400, f"got {code} {r}")

code, r = upload("/admin/profile/photo/", {}, {"photo": ("faux.png", b"pas une image", "image/png")})
check("image corrompue refusee", code == 400, f"got {code} {r}")

# --- 5. Visuel de projet ---------------------------------------------
code, r = call("POST", "/admin/projects/", {
    "title": "Application mobile de suivi",
    "description": "App mobile avec backend API REST.",
    "technologies": ["Flutter", "Django"],
    "is_published": True,
})
check("projet cree", code == 201, f"got {code}")
pid = r.get("id")

body, ctype = multipart({}, {"image": ("mockup.png", PNG, "image/png")})
req = urllib.request.Request(
    BASE + f"/admin/projects/{pid}/", data=body, method="POST",
    headers={"X-CSRFToken": csrf(), "Content-Type": ctype},
)
resp = opener.open(req)
r = json.loads(resp.read().decode())
check("visuel projet upload", r.get("image"), f"-> {r.get('image')}")

code, r = call("GET", "/projects/")
img = r["results"][0].get("image")
check("visuel visible publiquement", bool(img), f"-> {img}")

# --- 6. Le fichier est bien sur disque -------------------------------
# Verification disque locale : sans interet si API_BASE pointe un serveur
# distant (Docker) — les fichiers vivent alors dans un volume conteneur.
media_root = os.environ.get("MEDIA_ROOT") or os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "api", "media"
)

if os.environ.get("API_BASE"):
    print("[--] verification disque sautee : API_BASE pointe un serveur distant")
elif os.path.isdir(media_root):
    found = []
    for root, _, files in os.walk(media_root):
        for f in files:
            found.append(os.path.relpath(os.path.join(root, f), media_root))
    check("fichiers physiques presents", len(found) >= 3, f"-> {found}")
else:
    print(f"[--] media root introuvable: {media_root}")

# --- 7. Suppression ---------------------------------------------------
code, r = call("DELETE", f"/admin/projects/{pid}/")
check("suppression projet + visuel", code == 200, f"got {code}")

code, r = call("DELETE", "/admin/profile/photo/delete/")
check("suppression photo", code == 200 and r.get("photo") is None)

code, r = call("DELETE", "/admin/profile/cv/delete/")
check("suppression CV", code == 200 and r.get("has_cv") is False)

code, r = call("GET", "/public/")
check("etat final propre", r["photo"] is None and r["has_cv"] is False)

print()
print("RESULTAT:", "TOUS LES TESTS PASSENT" if ok else "DES TESTS ECHOUENT")
