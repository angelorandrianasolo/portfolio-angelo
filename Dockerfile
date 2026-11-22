# =========================================================
# Site public — Nginx servi en lecture seule, SANS privilège
# =========================================================
FROM nginx:1.29-alpine

# Configuration principale adaptée : pid + temporaires dans /tmp,
# indispensables une fois la ligne USER nginx ajoutée plus bas.
COPY nginx.main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY src/ /usr/share/nginx/html/

EXPOSE 8080

# Aucun privilège : maître et workers tournent en « nginx ». Le port 8080
# (> 1024) ne demande aucun droit spécial. En HTTPS, voir le README
# (cap_add: NET_BIND_SERVICE).
USER nginx

CMD ["nginx", "-g", "daemon off;"]
