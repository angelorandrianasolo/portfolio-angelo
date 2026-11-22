# -*- coding: utf-8 -*-
"""Lance les 6 suites comme le README : base vierge locale + Docker.

Usage (depuis n'importe ou) :
    python tests/run_all.py

Fonctionne sur Windows et sur Linux (CI GitHub Actions) : la racine du
depot est determinee depuis l'emplacement de ce fichier. Les suites
Docker attendent un `docker compose up -d` deja effectue.
"""
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = os.environ.copy()

# .env en UTF-8 (jamais via PowerShell)
dotenv = ROOT / ".env"
if dotenv.exists():
    for line in dotenv.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip()

db = Path(tempfile.gettempdir()) / "t_secu.sqlite3"
if db.exists():
    db.unlink()
ENV["DJANGO_DB_PATH"] = str(db)
ENV["DJANGO_DEBUG"] = "1"          # médias servis par runserver
ENV.pop("API_BASE", None)
ENV.pop("SITE_BASE", None)

FAIL = re.compile(r"\[KO |DES TESTS ECHOUENT|ECHEC|Traceback")


def tail(out: str, n: int = 4) -> str:
    lines = [l for l in (out or "").strip().splitlines() if l.strip()]
    return "\n".join(lines[-n:]) or "(aucune sortie)"


def check(name: str, out: str, code: int) -> bool:
    bad = bool(FAIL.search(out or ""))
    ok = (code == 0) and not bad
    print(f"===== {name} : {'OK' if ok else 'ECHEC'} (exit {code}) =====")
    print(tail(out))
    return ok


print("1. Base vierge + admin…", flush=True)
r = subprocess.run([sys.executable, "api/manage.py", "migrate", "--noinput"],
                   cwd=ROOT, env=ENV, capture_output=True,
                   encoding="utf-8", errors="replace")
print(tail(r.stdout + r.stderr, 1))
r = subprocess.run([sys.executable, "api/manage.py", "ensure_admin"],
                   cwd=ROOT, env=ENV, capture_output=True,
                   encoding="utf-8", errors="replace")
print(tail(r.stdout + r.stderr, 1))

print("2. Serveur local :8000…", flush=True)
srv_log = open(Path(tempfile.gettempdir()) / "runserver_secu.log", "w",
               encoding="utf-8")
srv = subprocess.Popen(
    [sys.executable, "api/manage.py", "runserver", "8000", "--noreload"],
    cwd=ROOT, env=ENV, stdout=srv_log, stderr=subprocess.STDOUT,
)
time.sleep(7)

results = []
try:
    for name in ("test_api.py", "test_uploads.py",
                 "test_contact_live.py", "test_contact.py"):
        try:
            p = subprocess.run([sys.executable, "-u", f"tests/{name}"],
                               cwd=ROOT, env=ENV, capture_output=True,
                               encoding="utf-8", errors="replace",
                               timeout=240)
            results.append(check(name, (p.stdout or "") + (p.stderr or ""),
                                 p.returncode))
        except subprocess.TimeoutExpired as exc:
            out = (exc.stdout or b"") if isinstance(exc.stdout, bytes) \
                else (exc.stdout or "")
            print(f"===== {name} : TIMEOUT240s =====")
            print(tail(out if isinstance(out, str) else str(out)))
            results.append(False)
finally:
    srv.terminate()
    try:
        srv.wait(timeout=5)
    except Exception:
        srv.kill()
    srv_log.close()

print("3. Suites Docker :8080…")
ENV2 = ENV.copy()
ENV2["API_BASE"] = "http://127.0.0.1:8080"
ENV2["SITE_BASE"] = "http://127.0.0.1:8080"
for name in ("test_csrf.py", "test_nginx.py"):
    p = subprocess.run([sys.executable, f"tests/{name}"],
                       cwd=ROOT, env=ENV2, capture_output=True,
                       encoding="utf-8", errors="replace")
    results.append(check(name, (p.stdout or "") + (p.stderr or ""),
                         p.returncode))

print()
print("BILAN :", "TOUS LES TESTS PASSENT" if all(results)
      else f"{results.count(False)} SUITE(S) EN ECHEC")
sys.exit(0 if all(results) else 1)
