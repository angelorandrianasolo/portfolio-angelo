"""Test de bout en bout du formulaire de contact via HTTP (serveur live)."""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import http.cookiejar

from _creds import login_payload

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000") + "/api"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

FAILED = []


def check(label, condition, detail=""):
    print(f"[{'OK  ' if condition else 'KO  '}] {label}"
          + (f"  -> {detail}" if detail and not condition else ""))
    if not condition:
        FAILED.append(label)


def csrf_token():
    opener.open(BASE + "/auth/csrf/").read()
    for c in jar:
        if c.name == "csrftoken":
            return c.value
    return ""


def call(method, path, body=None, form=False):
    data = None
    headers = {"X-CSRFToken": csrf_token()}
    if body is not None:
        if form:
            data = urllib.parse.urlencode(body).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=data, headers=headers,
                                 method=method)
    try:
        resp = opener.open(req)
        return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:200]}


# --- 1. Message public valide -------------------------------------------
status, body = call("POST", "/contact/", {
    "name": "Marie Visiteuse",
    "email": "marie@example.mg",
    "subject": "Collaboration",
    "message": "Bonjour Angelo, je souhaite vous confier un projet web.",
    "website": "",
})
check("POST /contact/ -> 201", status == 201, f"status={status}")
check("reponse detail", "detail" in body, str(body))

# --- 2. Validation ------------------------------------------------------
status, _ = call("POST", "/contact/", {"name": "", "email": "a@b.co",
                                       "message": "x" * 30})
check("nom vide -> 400", status == 400, f"status={status}")

status, _ = call("POST", "/contact/", {"name": "A", "email": "invalid",
                                       "message": "x" * 30})
check("email invalide -> 400", status == 400, f"status={status}")

status, _ = call("POST", "/contact/", {"name": "A", "email": "a@b.co",
                                       "message": "court"})
check("message court -> 400", status == 400, f"status={status}")

# --- 3. Honeypot --------------------------------------------------------
status, _ = call("POST", "/contact/", {"name": "Bot", "email": "b@spam.io",
                                       "message": "x" * 30,
                                       "website": "http://spam"})
check("honeypot -> 201 (silencieux)", status == 201, f"status={status}")

# --- 4. Accès admin -----------------------------------------------------
jar.clear()
status, _ = call("GET", "/admin/messages/")
check("messages anonyme -> 401", status == 401, f"status={status}")

status, body = call("POST", "/auth/login/", login_payload())
check("login -> 200", status == 200, f"status={status} {body}")

status, data = call("GET", "/admin/messages/")
check("boite de reception -> 200", status == 200, f"status={status}")
check("au moins 1 message", data.get("count", 0) >= 1, str(data.get("count")))
check("non-lus signales", data.get("unread", 0) >= 1, str(data.get("unread")))
check("etat SMTP expose", "email_configured" in data, str(list(data)))
check("destinataire expose", "recipient" in data, str(list(data)))

results = data.get("results", [])
if results:
    m = results[0]
    check("message lisible", m.get("name") == "Marie Visiteuse", str(m.get("name")))
    check("email conservé", m.get("email") == "marie@example.mg")
    check("sujet conserve", m.get("subject") == "Collaboration")
    check("non lu", m.get("is_read") is False)
    check("etat email present", "email_sent" in m, str(list(m)))

    mid = m["id"]
    status, body = call("PATCH", f"/admin/messages/{mid}/", {"is_read": True})
    check("marquer lu -> 200", status == 200, f"status={status}")
    check("is_read=True", body.get("is_read") is True, str(body))

    status, data2 = call("GET", "/admin/messages/")
    check("unread diminue", data2["unread"] == data["unread"] - 1,
          f"{data['unread']} -> {data2['unread']}")

    status, _ = call("DELETE", f"/admin/messages/{mid}/")
    check("supprimer -> 200", status == 200, f"status={status}")

status, ov = call("GET", "/admin/overview/")
check("overview a messages", "messages" in ov.get("totals", {}),
      str(ov.get("totals")))
check("overview a unread_messages", "unread_messages" in ov.get("totals", {}))

print()
if FAILED:
    print(f"ECHEC : {len(FAILED)}")
    for item in FAILED:
        print("  - " + item)
    raise SystemExit(1)
print("TOUS LES TESTS PASSENT")
