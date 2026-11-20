"""Isole l'en-tete qui declenche l'echec CSRF (DEBUG=1)."""
import json
import re
import urllib.error
import urllib.request
import http.cookiejar

BASE = "http://localhost:8080"


def attempt(extra, label):
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.open(BASE + "/api/auth/csrf/")
    tok = [c.value for c in cj if c.name == "csrftoken"][0]
    h = {"Content-Type": "application/json", "X-CSRFToken": tok}
    h.update(extra)
    req = urllib.request.Request(
        BASE + "/api/visits/",
        data=json.dumps({"path": "/", "referrer": ""}).encode(),
        headers=h,
        method="POST",
    )
    try:
        status = op.open(req).status
        reason = "(accepte)"
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode("utf8", "ignore")
        m = re.search(r'id="summary"[^>]*>(.*?)</div>', body, re.S)
        reason = re.sub(r"<[^>]+>", " ", m.group(1)) if m else ""
        reason = re.sub(r"\s+", " ", reason).strip()[:160]
    print(f"{label:<28} {status}  {reason}")


attempt({}, "aucun en-tete")
attempt({"Origin": BASE}, "Origin")
attempt({"Referer": BASE + "/"}, "Referer")
attempt({"Origin": BASE, "Referer": BASE + "/"}, "Origin + Referer")
attempt({"Referer": BASE + "/other"}, "Referer (autre chemin)")
attempt({"Origin": "http://localhost:9999"}, "Origin (faux hote)")
