#!/usr/bin/env python3
"""
Serveur de developpement du portfolio.

Sert les fichiers statiques de `src/` et rejoue vers l'API Django
(`/api/`, `/health`, `/media/`) exactement comme le fait Nginx en
production. Un seul port, meme origine, cookies et CSRF inchanges.

    python tools/devserver.py            # http://localhost:8090
    PORT=9000 API=http://127.0.0.1:8000 python tools/devserver.py

Prerequis : l'API doit tourner (`python api/manage.py runserver`).
"""
import http.server
import os
import socketserver
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
API = os.environ.get("API", "http://127.0.0.1:8000").rstrip("/")
PORT = int(os.environ.get("PORT", "8090"))

# Chemins transmis a Django (proxy)
PROXY_PREFIXES = ("/api/", "/health", "/media/")

# Entetes que le navigateur doit voir renvoyes tels quels
HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
}


class ProxyError(Exception):
    def __init__(self, status: int, body: bytes, content_type: str):
        super().__init__(f"upstream {status}")
        self.status = status
        self.body = body
        self.content_type = content_type


def forward_to_api(handler: http.server.BaseHTTPRequestHandler) -> None:
    """Reenvoie la requete vers Django et copie la reponse."""
    length = int(handler.headers.get("Content-Length") or 0)
    body = handler.rfile.read(length) if length else None

    headers = {
        key: value
        for key, value in handler.headers.items()
        if key.lower() not in HOP_BY_HOP and key.lower() != "host"
    }
    headers["Host"] = handler.headers.get("Host", "localhost")
    headers["X-Forwarded-For"] = handler.client_address[0]
    headers["X-Forwarded-Proto"] = "http"

    url = API + handler.path
    request = urllib.request.Request(
        url, data=body, headers=headers, method=handler.command
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read()
            status = response.status
            content_type = response.headers.get("Content-Type", "application/octet-stream")
            extra = response.headers
    except urllib.error.HTTPError as error:
        payload = error.read()
        status = error.code
        content_type = error.headers.get("Content-Type", "application/octet-stream")
        extra = error.headers
    except (urllib.error.URLError, OSError) as error:
        payload = (
            '{"detail": "API Django indisponible. '
            'Lancez python api/manage.py runserver."}'
        ).encode()
        status = 502
        content_type = "application/json"
        extra = None

    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(payload)))

    if extra is not None:
        for key in ("Set-Cookie", "Cache-Control", "Expires", "Last-Modified",
                    "ETag", "Location"):
            for value in extra.get_all(key, []):
                handler.send_header(key, value)

    handler.end_headers()
    handler.wfile.write(payload)


class StaticHandler(http.server.SimpleHTTPRequestHandler):
    """Sert `src/`, ou proxy vers Django pour /api, /health, /media."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SRC), **kwargs)

    def _is_proxy(self) -> bool:
        return self.path.split("?")[0] in ("/health",) or self.path.startswith(
            PROXY_PREFIXES
        )

    def _dispatch(self) -> None:
        if self._is_proxy():
            forward_to_api(self)
        else:
            super().do_GET()

    def do_GET(self):
        self._dispatch()

    def do_POST(self):
        forward_to_api(self)

    def do_PUT(self):
        forward_to_api(self)

    def do_PATCH(self):
        forward_to_api(self)

    def do_DELETE(self):
        forward_to_api(self)

    def do_HEAD(self):
        if self._is_proxy():
            forward_to_api(self)
        else:
            super().do_HEAD()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> None:
    if not SRC.is_dir():
        sys.exit(f"Dossier introuvable : {SRC}")

    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), StaticHandler) as httpd:
        print(f"Portfolio  -> http://localhost:{PORT}")
        print(f"API proxy  -> {API}   (/api, /health, /media)")
        print("Ctrl+C pour arreter.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nArrete.")


if __name__ == "__main__":
    main()
