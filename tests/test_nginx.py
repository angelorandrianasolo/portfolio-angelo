"""Test de bout en bout a travers Nginx (port 8080).

    docker compose up -d
    python tests/test_nginx.py            # SITE_BASE=http://localhost:8090 pour un autre hote
"""
import io
import json
import os
import uuid
import urllib.error
import urllib.request
import http.cookiejar

from _creds import login_payload

BASE = os.environ.get("SITE_BASE", "http://localhost:8080")
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def csrf():
    op.open(BASE + "/api/auth/csrf/")
    for c in cj:
        if c.name == "csrftoken":
            return c.value
    return ""


def call(path, method="GET", data=None, json_body=None, headers=None):
    h = {"X-CSRFToken": csrf()}
    body = None
    if json_body is not None:
        body = json.dumps(json_body).encode()
        h["Content-Type"] = "application/json"
    elif data is not None:
        body = data
    if headers:
        h.update(headers)
    req = urllib.request.Request(BASE + path, data=body, headers=h, method=method)
    try:
        r = op.open(req, timeout=20)
        raw = r.read()
        ct = r.headers.get("Content-Type", "")
        return r.status, json.loads(raw) if ct.startswith("application/json") else raw[:200]
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:200]


print("login      :", call("/api/auth/login/", "POST",
                           json_body=login_payload()))
print("me         :", call("/api/auth/me/"))

# --- televersement photo ------------------------------------------------
boundary = "----b" + uuid.uuid4().hex
mp = io.BytesIO()


def part(name, value, filename=None):
    mp.write(("--%s\r\n" % boundary).encode())
    head = 'Content-Disposition: form-data; name="%s"' % name
    if filename:
        head += '; filename="%s"' % filename
    mp.write(head.encode())
    mp.write(b"\r\n\r\n")
    mp.write(value)
    mp.write(b"\r\n")


from PIL import Image

buf = io.BytesIO()
Image.new("RGB", (64, 64), (90, 77, 240)).save(buf, format="PNG")
png = buf.getvalue()
part("photo", png, "test.png")
mp.write(("--%s--\r\n" % boundary).encode())

print("upload     :", call("/api/admin/profile/photo/", "POST", data=mp.getvalue(),
      headers={"Content-Type": "multipart/form-data; boundary=" + boundary}))

# --- le media passe-t-il bien par Nginx ? ------------------------------
pub = call("/api/public/")[1]
print("public     :", pub)
r = op.open(urllib.request.Request(BASE + pub["photo"]), timeout=10)
print("media nginx:", r.status, r.headers.get("Content-Type"), len(r.read()), "octets")

# --- suppression --------------------------------------------------------
print("delete     :", call("/api/admin/profile/photo/delete/", "DELETE"))
print("apres      :", call("/api/public/")[1]["photo"])

# --- session invalide = 401 --------------------------------------------
cj.clear()
print("sans session:", call("/api/admin/overview/"))
