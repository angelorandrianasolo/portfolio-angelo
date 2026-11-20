/* =========================================================
   ESPACE ADMINISTRATION — logique applicative
   Aucune dépendance externe : fetch + DOM.
   ========================================================= */

"use strict";

// ---------------------------------------------------------
// 1. Utilitaires
// ---------------------------------------------------------

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function readCookie(name) {
    const match = document.cookie.match(
        new RegExp("(^|;\\s*)" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : "";
}

/** Appel d'API avec jeton CSRF renouvelé automatiquement. */
async function api(path, options = {}, isRetry = false) {
    const method = (options.method || "GET").toUpperCase();
    const mutating = method !== "GET" && method !== "HEAD";

    const headers = Object.assign({}, options.headers || {});
    let body = options.body;

    if (body && !(body instanceof FormData) && typeof body !== "string") {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        body = JSON.stringify(body);
    }

    if (mutating) {
        await fetch("/api/auth/csrf/", { credentials: "same-origin" })
            .catch(() => null);
        headers["X-CSRFToken"] = readCookie("csrftoken");
    }

    const response = await fetch(path, {
        method, headers, body, credentials: "same-origin"
    });
    lastApi = method + " " + path + " → " + response.status;
    refreshDiag();

    if (response.status === 403 && mutating && !isRetry) {
        return api(path, options, true);
    }

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(
            (payload && payload.detail) || "Erreur " + response.status
        );
    }

    return payload;
}

let toastTimer = null;

function toast(message, type) {
    const element = $("#toast");
    if (!element) return;

    element.textContent = message;
    element.className = "toast" + (type ? " is-" + type : "");
    element.hidden = false;

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        element.hidden = true;
    }, 3600);
}

function showError(id, message) {
    const element = $(id);
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
}

function clearMessages(ids) {
    ids.forEach(id => {
        const element = $(id);
        if (element) {
            element.hidden = true;
            element.textContent = "";
        }
    });
}

// ---------------------------------------------------------
// Diagnostic de connexion (visible sur l'ecran de connexion)
// ---------------------------------------------------------

const JS_VERSION = "20261119c";
let lastApi = "aucun appel";

function refreshDiag(extra) {
    const element = $("#login-diag");
    if (!element) return;
    const cookieOk = !!readCookie("csrftoken");
    element.textContent =
        "JS " + JS_VERSION +
        " · dernier appel : " + lastApi +
        " · cookie CSRF : " + (cookieOk ? "lu" : "ABSENT") +
        (extra ? " · " + extra : "");
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
});

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short"
});

function formatDate(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatDay(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T00:00:00");
    return Number.isNaN(date.getTime()) ? iso : shortDateFormatter.format(date);
}

function escapeHtml(value) {
    const escapes = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    };
    return String(value == null ? "" : value).replace(
        /[&<>"']/g, c => escapes[c]
    );
}

function safeUrl(value) {
    if (!value) return null;
    try {
        const url = new URL(value, window.location.origin);
        return (url.protocol === "http:" || url.protocol === "https:")
            ? url.href : null;
    } catch (error) {
        return null;
    }
}


// ---------------------------------------------------------
// 2. Navigation par onglets
// ---------------------------------------------------------

function activateTab(name) {
    $$(".app-tab").forEach(button => {
        const active = button.dataset.tab === name;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
    });

    $$(".panel").forEach(panel => {
        const active = panel.id === "panel-" + name;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
    });

    // Rafraichit la vue demandee
    if (name === "overview") loadOverview();
    if (name === "visitors") loadVisits();
    if (name === "cv") loadCv();
    if (name === "messages") loadMessages();
    if (name === "photo") loadPhoto();
    if (name === "projects") loadProjects();
    if (name === "account") loadAccount();
}

$$(".app-tab").forEach(button => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
});


// ---------------------------------------------------------
// 3. Vue d'ensemble
// ---------------------------------------------------------

/** Date locale → « AAAA-MM-JS » sans conversion UTC (sinon décalage d'un jour). */
function toIsoDay(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}

function lastNDays(count) {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = count - 1; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(toIsoDay(date));
    }
    return days;
}

function buildChart(containerId, emptyId, series, days) {
    const container = $(containerId);
    const empty = $(emptyId);
    if (!container) return;

    const lookup = new Map(series.map(point => [point.day, point.total]));
    const values = days.map(day => lookup.get(day) || 0);
    const max = Math.max.apply(null, values.concat([1]));
    const total = values.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        container.innerHTML = "";
        container.hidden = true;
        if (empty) empty.hidden = false;
        return;
    }

    container.hidden = false;
    if (empty) empty.hidden = true;

    container.innerHTML = values.map((value, index) => {
        const height = Math.max(3, Math.round((value / max) * 100));
        const classes = value === 0 ? "chart-bar is-zero" : "chart-bar";
        return `
            <span class="${classes}"
                  style="height: ${height}%"
                  title="${escapeHtml(formatDay(days[index]))} : ${value}"></span>`;
    }).join("");
}

async function loadOverview() {
    try {
        const data = await api("/api/admin/overview/");

        const setKpi = (key, value) => {
            const element = document.querySelector('[data-kpi="' + key + '"]');
            if (element) element.textContent = String(value);
        };

        setKpi("visits", data.totals.visits);
        setKpi("today", data.periods.today);
        setKpi("week", data.periods.week);
        setKpi("month", data.periods.month);
        setKpi("downloads", data.totals.downloads);
        setKpi("projects", data.totals.published + " / " + data.totals.projects);

        const days = lastNDays(30);

        buildChart("#chart-visits", "#chart-visits-empty",
            data.visits_per_day, days);
        buildChart("#chart-downloads", "#chart-downloads-empty",
            data.downloads_per_day, days);

        const hint = $("#visits-total-hint");
        if (hint) hint.textContent = data.totals.visits + " au total";

        // Pages les plus visitees
        const list = $("#top-pages");
        const empty = $("#top-pages-empty");

        if (list) {
            if (!data.top_pages.length) {
                list.innerHTML = "";
                if (empty) empty.hidden = false;
            } else {
                if (empty) empty.hidden = true;
                const max = data.top_pages[0].total || 1;
                list.innerHTML = data.top_pages.map(page => `
                    <li>
                        <span class="label">${escapeHtml(page.path)}</span>
                        <span class="bar">
                            <i style="width: ${Math.round((page.total / max) * 100)}%"></i>
                        </span>
                        <span class="value">${page.total}</span>
                    </li>`).join("");
            }
        }

        setBadge("#count-visits", data.totals.visits);
        setBadge("#count-downloads", data.totals.downloads);
        setBadge("#count-projects", data.totals.published);

        // Compteur de messages non lus sur l'onglet
        const unreadBadge = $("#count-messages");
        if (unreadBadge) {
            unreadBadge.textContent = String(data.totals.unread_messages || 0);
            unreadBadge.hidden = !data.totals.unread_messages;
        }

    } catch (error) {
        toast(error.message, "error");
    }
}

function setBadge(selector, value) {
    const element = $(selector);
    if (element) element.textContent = String(value);
}

$("#refresh-overview").addEventListener("click", loadOverview);


// ---------------------------------------------------------
// 4. Visiteurs
// ---------------------------------------------------------

async function loadVisits() {
    const limit = $("#visits-limit").value;

    try {
        const data = await api("/api/admin/visits/?limit=" + encodeURIComponent(limit));
        const body = $("#visits-table tbody");
        const empty = $("#visits-empty");

        setBadge("#count-visits", data.count);

        if (!data.results.length) {
            body.innerHTML = "";
            if (empty) empty.hidden = false;
            return;
        }

        if (empty) empty.hidden = true;

        body.innerHTML = data.results.map(visit => `
            <tr>
                <td class="primary">${escapeHtml(formatDate(visit.created_at))}</td>
                <td><code>${escapeHtml(visit.path)}</code></td>
                <td><code>${escapeHtml(visit.ip || "—")}</code></td>
                <td>
                    ${visit.referrer
                        ? escapeHtml(truncate(visit.referrer, 42))
                        : '<span class="pill pill--muted">Direct</span>'}
                </td>
                <td><span class="ua" title="${escapeHtml(visit.user_agent)}">${
                    escapeHtml(visit.user_agent || "—")
                }</span></td>
            </tr>`).join("");

    } catch (error) {
        toast(error.message, "error");
    }
}

function truncate(value, length) {
    const text = String(value || "");
    return text.length > length ? text.slice(0, length - 1) + "…" : text;
}

$("#visits-limit").addEventListener("change", loadVisits);
$("#refresh-visits").addEventListener("click", loadVisits);


// ---------------------------------------------------------
// 5. CV
// ---------------------------------------------------------

async function loadCv() {
    try {
        const profile = await api("/api/admin/profile/");
        const box = $("#cv-current");

        if (profile.has_cv && profile.cv_url) {
            const url = safeUrl(profile.cv_url);
            box.innerHTML = `
                <p class="file-name">${escapeHtml(profile.cv_filename || "CV")}</p>
                <p class="file-meta">
                    Mis à jour le ${escapeHtml(formatDate(profile.updated_at))} —
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                        ouvrir
                    </a>
                </p>`;
            $("#cv-delete-btn").hidden = false;
        } else {
            box.innerHTML = '<p class="file-empty">Aucun CV téléversé.</p>';
            $("#cv-delete-btn").hidden = true;
        }

        $("#cv-upload-btn").disabled = !$("#cv-file").files.length;

    } catch (error) {
        toast(error.message, "error");
    }

    try {
        const stats = await api("/api/admin/cv/");
        setBadge("#count-downloads", stats.count);
        $("#cv-count").textContent = stats.count + " au total";

        const log = $("#cv-log");
        const empty = $("#cv-log-empty");

        if (!stats.results.length) {
            log.innerHTML = "";
            if (empty) empty.hidden = false;
        } else {
            if (empty) empty.hidden = true;
            log.innerHTML = stats.results.map(item => `
                <li>
                    <span class="log-what">${escapeHtml(item.ip || "IP inconnue")}</span>
                    <span class="log-when">${escapeHtml(formatDate(item.created_at))}</span>
                </li>`).join("");
        }
    } catch (error) {
        toast(error.message, "error");
    }
}

$("#cv-file").addEventListener("change", () => {
    $("#cv-upload-btn").disabled = !$("#cv-file").files.length;
    clearMessages(["#cv-error", "#cv-ok"]);
});

$("#cv-form").addEventListener("submit", async event => {
    event.preventDefault();
    clearMessages(["#cv-error", "#cv-ok"]);

    const file = $("#cv-file").files[0];
    if (!file) return;

    const button = $("#cv-upload-btn");
    button.disabled = true;
    button.textContent = "Envoi…";

    try {
        const form = new FormData();
        form.append("cv", file);
        await api("/api/admin/profile/cv/", { method: "POST", body: form });

        toast("CV mis à jour.", "ok");
        $("#cv-file").value = "";
        await loadCv();
        loadOverview();

    } catch (error) {
        showError("#cv-error", error.message);
        button.disabled = false;
    } finally {
        button.textContent = "Téléverser";
    }
});

$("#cv-delete-btn").addEventListener("click", async () => {
    if (!window.confirm("Supprimer définitivement le CV ?")) return;

    clearMessages(["#cv-error", "#cv-ok"]);

    try {
        await api("/api/admin/profile/cv/delete/", { method: "DELETE" });
        toast("CV supprimé.", "ok");
        await loadCv();
        loadOverview();
    } catch (error) {
        showError("#cv-error", error.message);
    }
});


// ---------------------------------------------------------
// 5bis. Messages de contact
// ---------------------------------------------------------

let messagesCache = [];

function messageCard(message, emailConfigured) {
    const unread = message.is_read ? "" : " is-unread";

    // « Envoyé » n'est vrai que si un SMTP reeel est configure : avec le
    // backend console, l'appel reussit mais rien ne quitte le serveur.
    const emailPill = message.email_sent && emailConfigured
        ? '<span class="pill pill--ok">Email envoyé</span>'
        : '<span class="pill pill--warn">Email non envoyé</span>';

    const subject = message.subject
        ? `<p class="message-subject">${escapeHtml(message.subject)}</p>`
        : "";

    return `
        <article class="message-card${unread}" data-id="${message.id}">
            <div class="message-head">
                <div class="message-who">
                    <span class="message-avatar" aria-hidden="true">${
                        escapeHtml((message.name || "?").trim().charAt(0).toUpperCase())
                    }</span>
                    <div>
                        <p class="message-name">${escapeHtml(message.name)}</p>
                        <a class="message-mail"
                           href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a>
                    </div>
                </div>
                <div class="message-meta">
                    ${message.is_read ? "" : '<span class="pill pill--brand">Nouveau</span>'}
                    ${emailPill}
                    <time datetime="${escapeHtml(message.created_at || "")}">${
                        escapeHtml(formatDate(message.created_at))
                    }</time>
                </div>
            </div>

            ${subject}
            <p class="message-body">${escapeHtml(message.message)}</p>

            <div class="message-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-action="read">
                    ${message.is_read ? "Marquer non lu" : "Marquer lu"}
                </button>
                <a class="btn btn-ghost btn-sm"
                   href="mailto:${escapeHtml(message.email)}?subject=${encodeURIComponent(
                       "Re : " + (message.subject || "Votre message")
                   )}">Répondre</a>
                <button type="button" class="btn btn-danger btn-sm"
                        data-action="delete">Supprimer</button>
            </div>
        </article>`;
}

async function loadMessages() {
    const limit = $("#messages-limit").value;

    try {
        const data = await api(
            "/api/admin/messages/?limit=" + encodeURIComponent(limit)
        );

        messagesCache = data.results;

        // Compteur de non-lus sur l'onglet
        const badge = $("#count-messages");
        if (badge) {
            badge.textContent = String(data.unread);
            badge.hidden = !data.unread;
        }

        // Etat de l'envoi d'email
        const status = $("#mail-status");
        if (status) {
            if (data.email_configured) {
                status.textContent =
                    "Les nouveaux messages sont envoyés à " + data.recipient + ".";
                status.className = "panel-note is-ok";
            } else {
                status.textContent =
                    "L'envoi d'email n'est pas configuré : les messages restent " +
                    "lisibles ici. Renseignez SMTP dans .env pour les recevoir " +
                    "dans votre boîte mail.";
                status.className = "panel-note is-warn";
            }
            status.hidden = false;
        }

        // Adresse de reception : pre-remplie avec l'adresse effective
        // (saisie dans ce panneau, sinon celle du .env).
        const recipientField = $("#recipient-input");
        if (recipientField && document.activeElement !== recipientField) {
            recipientField.value = data.recipient || "";
        }

        const list = $("#message-list");
        const empty = $("#messages-empty");

        if (!data.results.length) {
            list.innerHTML = "";
            if (empty) empty.hidden = false;
            return;
        }

        if (empty) empty.hidden = true;
        list.innerHTML = data.results
            .map(item => messageCard(item, data.email_configured))
            .join("");

    } catch (error) {
        toast(error.message, "error");
    }
}

$("#message-list").addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const card = button.closest(".message-card");
    if (!card) return;

    const id = card.dataset.id;
    const message = messagesCache.find(item => String(item.id) === id);
    if (!message) return;

    if (button.dataset.action === "delete") {
        if (!window.confirm("Supprimer définitivement ce message ?")) return;

        try {
            await api("/api/admin/messages/" + id + "/", { method: "DELETE" });
            toast("Message supprimé.", "ok");
            await loadMessages();
            loadOverview();
        } catch (error) {
            toast(error.message, "error");
        }
        return;
    }

    // Marquer lu / non lu
    button.disabled = true;
    try {
        await api("/api/admin/messages/" + id + "/", {
            method: "PATCH",
            body: { is_read: !message.is_read }
        });
        await loadMessages();
        loadOverview();
    } catch (error) {
        button.disabled = false;
        toast(error.message, "error");
    }
});

$("#messages-limit").addEventListener("change", loadMessages);
$("#refresh-messages").addEventListener("click", loadMessages);

// Adresse qui recoit les messages (modifiable sans toucher au code).
$("#recipient-form").addEventListener("submit", async event => {
    event.preventDefault();
    clearMessages(["#recipient-error", "#recipient-ok"]);

    const field = $("#recipient-input");
    const value = field.value.trim();

    if (!value) {
        showError(
            "#recipient-error",
            "Saisissez une adresse, ou utilisez « Revenir à l'adresse .env »."
        );
        field.focus();
        return;
    }

    const button = $("#recipient-save");
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Enregistrement…";

    try {
        await api("/api/admin/profile/", {
            method: "PATCH",
            body: { contact_email: value }
        });
        showError("#recipient-ok", "Destinataire enregistré : " + value + ".");
        toast("Destinataire mis à jour.", "ok");
        await loadMessages();
    } catch (error) {
        showError("#recipient-error", error.message);
    } finally {
        button.disabled = false;
        button.textContent = label;
    }
});

$("#recipient-reset").addEventListener("click", async () => {
    clearMessages(["#recipient-error", "#recipient-ok"]);

    const button = $("#recipient-reset");
    button.disabled = true;

    try {
        await api("/api/admin/profile/", {
            method: "PATCH",
            body: { contact_email: "" }
        });
        toast("Adresse du .env rétablie.", "ok");
        await loadMessages();
    } catch (error) {
        showError("#recipient-error", error.message);
    } finally {
        button.disabled = false;
    }
});


// ---------------------------------------------------------
// 6. Photo de profil
// ---------------------------------------------------------

async function loadPhoto() {
    try {
        const profile = await api("/api/admin/profile/");
        const preview = $("#photo-preview");

        if (profile.photo) {
            const url = safeUrl(profile.photo);
            preview.innerHTML = url
                ? `<img src="${escapeHtml(url)}" alt="Photo de profil actuelle">`
                : '<span class="photo-placeholder">AR</span>';
            $("#photo-delete-btn").hidden = false;
        } else {
            preview.innerHTML = '<span class="photo-placeholder">AR</span>';
            $("#photo-delete-btn").hidden = true;
        }

        $("#photo-upload-btn").disabled = !$("#photo-file").files.length;

    } catch (error) {
        toast(error.message, "error");
    }
}

$("#photo-file").addEventListener("change", () => {
    $("#photo-upload-btn").disabled = !$("#photo-file").files.length;
    clearMessages(["#photo-error", "#photo-ok"]);
});

$("#photo-form").addEventListener("submit", async event => {
    event.preventDefault();
    clearMessages(["#photo-error", "#photo-ok"]);

    const file = $("#photo-file").files[0];
    if (!file) return;

    const button = $("#photo-upload-btn");
    button.disabled = true;
    button.textContent = "Envoi…";

    try {
        const form = new FormData();
        form.append("photo", file);
        await api("/api/admin/profile/photo/", { method: "POST", body: form });

        toast("Photo mise à jour.", "ok");
        $("#photo-file").value = "";
        await loadPhoto();

    } catch (error) {
        showError("#photo-error", error.message);
        button.disabled = false;
    } finally {
        button.textContent = "Mettre à jour la photo";
    }
});

$("#photo-delete-btn").addEventListener("click", async () => {
    if (!window.confirm("Supprimer la photo de profil ?")) return;

    clearMessages(["#photo-error", "#photo-ok"]);

    try {
        await api("/api/admin/profile/photo/delete/", { method: "DELETE" });
        toast("Photo supprimée.", "ok");
        await loadPhoto();
    } catch (error) {
        showError("#photo-error", error.message);
    }
});


// ---------------------------------------------------------
// 7. Projets
// ---------------------------------------------------------

const THUMB_COLORS = [
    "linear-gradient(135deg,#4438d8,#8b7cff)",
    "linear-gradient(135deg,#0b8f7a,#22c55e)",
    "linear-gradient(135deg,#b45309,#f59e0b)",
    "linear-gradient(135deg,#9d174d,#ec4899)",
    "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    "linear-gradient(135deg,#3f3f46,#a1a1aa)"
];

let projectsCache = [];

async function loadProjects() {
    const container = $("#project-list");

    try {
        const data = await api("/api/admin/projects/");
        projectsCache = data.results || [];

        setBadge("#count-projects",
            projectsCache.filter(p => p.is_published).length);

        if (!projectsCache.length) {
            container.innerHTML = `
                <p class="table-empty">
                    Aucun projet. Créez votre premier projet avec
                    « + Nouveau projet ».
                </p>`;
            return;
        }

        container.innerHTML = projectsCache.map((project, index) => {
            const image = safeUrl(project.image);
            const thumb = image
                ? `<img src="${escapeHtml(image)}" alt="">`
                : escapeHtml(project.icon || "🚀");

            const tags = (project.technologies || [])
                .slice(0, 5)
                .map(tech => `<span>${escapeHtml(tech)}</span>`)
                .join("");

            const links = [];
            if (safeUrl(project.website_url)) {
                links.push(`<a class="btn btn-ghost btn-sm" target="_blank"
                    rel="noopener noreferrer"
                    href="${escapeHtml(safeUrl(project.website_url))}">Site ↗</a>`);
            }
            if (safeUrl(project.repo_url)) {
                links.push(`<a class="btn btn-ghost btn-sm" target="_blank"
                    rel="noopener noreferrer"
                    href="${escapeHtml(safeUrl(project.repo_url))}">Code ↗</a>`);
            }

            return `
                <article class="project-row" data-id="${project.id}">
                    <div class="project-thumb"
                         style="background: ${THUMB_COLORS[index % 6]}">
                        ${thumb}
                    </div>

                    <div class="project-info">
                        <div class="project-title">
                            ${escapeHtml(project.title)}
                            <span class="pill ${project.is_published ? "pill--ok" : "pill--off"}">
                                ${project.is_published ? "Publié" : "Brouillon"}
                            </span>
                            ${project.is_featured
                                ? '<span class="pill">Vedette</span>' : ""}
                        </div>

                        <p class="project-meta">
                            ${escapeHtml(project.category || "Sans catégorie")}
                            · ordre ${project.order}
                        </p>

                        <div class="project-tags">${tags}</div>
                    </div>

                    <div class="project-actions">
                        <button type="button" class="btn btn-ghost btn-sm"
                                data-action="toggle">
                            ${project.is_published ? "Dépublier" : "Publier"}
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm"
                                data-action="edit">Modifier</button>
                        <button type="button" class="btn btn-danger btn-sm"
                                data-action="delete">Supprimer</button>
                        ${links.join("")}
                    </div>
                </article>`;
        }).join("");

    } catch (error) {
        container.innerHTML = `<p class="table-empty">${escapeHtml(error.message)}</p>`;
    }
}

$("#project-list").addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const row = button.closest(".project-row");
    const id = Number(row.dataset.id);
    const project = projectsCache.find(item => item.id === id);
    if (!project) return;

    const action = button.dataset.action;

    if (action === "edit") {
        openProjectModal(project);
        return;
    }

    if (action === "toggle") {
        button.disabled = true;
        try {
            await api("/api/admin/projects/" + id + "/", {
                method: "PUT",
                body: { is_published: !project.is_published }
            });
            toast(project.is_published ? "Projet dépublié." : "Projet publié.", "ok");
            await loadProjects();
            loadOverview();
        } catch (error) {
            toast(error.message, "error");
            button.disabled = false;
        }
        return;
    }

    if (action === "delete") {
        const confirmed = window.confirm(
            "Supprimer définitivement « " + project.title + " » ?"
        );
        if (!confirmed) return;

        button.disabled = true;
        try {
            await api("/api/admin/projects/" + id + "/", { method: "DELETE" });
            toast("Projet supprimé.", "ok");
            await loadProjects();
            loadOverview();
        } catch (error) {
            toast(error.message, "error");
            button.disabled = false;
        }
    }
});


// ---------------------------------------------------------
// 8. Modale projet
// ---------------------------------------------------------

const modal = $("#project-modal");
const projectForm = $("#project-form");
let lastFocused = null;

function openProjectModal(project) {
    lastFocused = document.activeElement;

    clearMessages(["#project-error", "#project-ok"]);
    projectForm.reset();

    $("#project-modal-title").textContent = project
        ? "Modifier le projet" : "Nouveau projet";

    $("#p-id").value = project ? project.id : "";
    $("#p-title").value = project ? project.title : "";
    $("#p-category").value = project ? (project.category || "") : "";
    $("#p-icon").value = project ? (project.icon || "") : "";
    $("#p-order").value = project ? project.order : 0;
    $("#p-summary").value = project ? (project.summary || "") : "";
    $("#p-summary-en").value = project ? (project.summary_en || "") : "";
    $("#p-description").value = project ? (project.description || "") : "";
    $("#p-description-en").value = project ? (project.description_en || "") : "";
    $("#p-technologies").value = project
        ? (project.technologies || []).join(", ") : "";
    $("#p-website").value = project ? (project.website_url || "") : "";
    $("#p-repo").value = project ? (project.repo_url || "") : "";
    $("#p-published").checked = project ? !!project.is_published : true;
    $("#p-featured").checked = project ? !!project.is_featured : false;

    // Visuels existants
    const thumbs = $("#p-thumbs");
    const items = [];

    if (project && safeUrl(project.image)) {
        items.push(`
            <span class="thumb-item">Visuel
                <img src="${escapeHtml(safeUrl(project.image))}" alt="">
            </span>`);
    }
    if (project && safeUrl(project.mockup)) {
        items.push(`
            <span class="thumb-item">Maquette
                <img src="${escapeHtml(safeUrl(project.mockup))}" alt="">
            </span>`);
    }

    thumbs.innerHTML = items.join("");
    thumbs.hidden = items.length === 0;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("#p-title").focus();
}

function closeProjectModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
}

$("#new-project-btn").addEventListener("click", () => openProjectModal(null));

$$("[data-close]").forEach(element => {
    element.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
        closeProjectModal();
    }
});

projectForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessages(["#project-error", "#project-ok"]);

    const id = $("#p-id").value;
    const title = $("#p-title").value.trim();

    if (!title) {
        showError("#project-error", "Le titre est obligatoire.");
        $("#p-title").focus();
        return;
    }

    const button = $("#project-save-btn");
    button.disabled = true;
    button.textContent = "Enregistrement…";

    try {
        const form = new FormData();

        form.append("title", title);
        form.append("category", $("#p-category").value.trim());
        form.append("icon", $("#p-icon").value.trim());
        form.append("order", $("#p-order").value || "0");
        form.append("summary", $("#p-summary").value.trim());
        form.append("summary_en", $("#p-summary-en").value.trim());
        form.append("description", $("#p-description").value.trim());
        form.append("description_en", $("#p-description-en").value.trim());
        form.append("technologies", JSON.stringify(
            $("#p-technologies").value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean)
        ));
        form.append("website_url", $("#p-website").value.trim());
        form.append("repo_url", $("#p-repo").value.trim());
        form.append("is_published", $("#p-published").checked ? "true" : "false");
        form.append("is_featured", $("#p-featured").checked ? "true" : "false");

        const image = $("#p-image").files[0];
        const mockup = $("#p-mockup").files[0];
        if (image) form.append("image", image);
        if (mockup) form.append("mockup", mockup);

        const url = id
            ? "/api/admin/projects/" + id + "/"
            : "/api/admin/projects/";

        await api(url, { method: "POST", body: form });

        toast(id ? "Projet mis à jour." : "Projet créé.", "ok");
        closeProjectModal();
        await loadProjects();
        loadOverview();

    } catch (error) {
        showError("#project-error", error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Enregistrer";
    }
});


// ---------------------------------------------------------
// 9. Theme
// ---------------------------------------------------------

const themeToggle = $("#theme-toggle");

function syncThemeButton() {
    const dark = document.documentElement.classList.contains("dark-theme");
    themeToggle.textContent = dark ? "☀️" : "🌙";
    themeToggle.setAttribute(
        "aria-label",
        dark ? "Passer en mode clair" : "Passer en mode sombre"
    );
}

themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark-theme");
    try {
        localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
    } catch (error) {}
    syncThemeButton();
});

syncThemeButton();


// ---------------------------------------------------------
// 10. Authentification
// ---------------------------------------------------------

const loginScreen = $("#login-screen");
const app = $("#app");

function showLogin(message) {
    app.hidden = true;
    loginScreen.hidden = false;
    if (message) showError("#login-error", message);
}

function showApp(username) {
    loginScreen.hidden = true;
    app.hidden = false;
    $("#app-user").textContent = username || "";
    // loadOverview ne doit JAMAIS pouvoir faire échouer la connexion :
    // une exception ici serait attrapée par le formulaire et affichée dans
    // #login-error, déjà masqué → échec silencieux.
    try {
        const p = loadOverview();
        if (p && typeof p.catch === "function") {
            p.catch(err => console.error("loadOverview:", err));
        }
    } catch (err) {
        console.error("loadOverview:", err);
    }
}

async function checkSession() {
    refreshDiag("vérification de session…");
    try {
        const me = await api("/api/auth/me/");
        if (me.authenticated) {
            showApp(me.username);
        } else {
            showLogin();
            refreshDiag("session absente");
        }
    } catch (error) {
        showLogin("Impossible de joindre l'API.");
        refreshDiag("API inaccessible");
    }
}

$("#login-form").addEventListener("submit", async event => {
    event.preventDefault();

    // Filet de sécurité : quoi qu'il arrive, l'utilisateur voit un message.
    // Sans lui, une exception hors try/catch (DOM absent, JS obsolète…)
    // laisse la page de connexion intacte et muette.
    const failSafe = message => {
        clearMessages(["#login-error"]);
        showError("#login-error", message);
        toast(message, "err");
    };

    try {
        clearMessages(["#login-error"]);

        const userField = $("#login-username");
        const passField = $("#login-password");
        if (!userField || !passField) {
            failSafe("Formulaire introuvable — rechargez la page (Ctrl+Maj+R).");
            return;
        }

        const username = userField.value.trim();
        const password = passField.value;

        if (!username || !password) {
            failSafe("Identifiant et mot de passe requis.");
            return;
        }

        const button = $("#login-submit");
        button.disabled = true;
        button.textContent = "Connexion…";

        try {
            const result = await api("/api/auth/login/", {
                method: "POST",
                body: { username, password }
            });

            if (!result || !result.username) {
                throw new Error(
                    "Réponse inattendue du serveur (connexion non confirmée)."
                );
            }

            showApp(result.username);
            passField.value = "";
            toast("Connexion réussie.", "ok");
            refreshDiag("CONNECTÉ");
        } catch (error) {
            failSafe(error && error.message ? error.message : "Connexion impossible.");
            refreshDiag("ÉCHEC");
        } finally {
            button.disabled = false;
            button.textContent = "Se connecter";
        }
    } catch (error) {
        failSafe(error && error.message ? error.message : "Erreur inattendue.");
    }
});

// Rien ne doit rester muet : toute erreur JS non attrapée devient visible.
window.addEventListener("error", event => {
    toast("Erreur JS : " + (event.message || "inconnue"), "err");
});
window.addEventListener("unhandledrejection", event => {
    const r = event.reason;
    toast("Erreur réseau : " + (r && r.message ? r.message : String(r)), "err");
});

$("#logout-btn").addEventListener("click", async () => {
    try {
        await api("/api/auth/logout/", { method: "POST", body: {} });
    } catch (error) {
        // On redirige quand meme vers l'ecran de connexion.
    }
    showLogin();
    toast("Déconnecté.", "ok");
});


// ---------------------------------------------------------
// 10 bis. Mon compte — identifiant et mot de passe
// ---------------------------------------------------------

/** Bascule un champ entre « mot de passe » et « texte visible ». */
function togglePassword(input, button) {
    if (!input || !button) return;
    const wasHidden = input.type === "password";
    input.type = wasHidden ? "text" : "password";
    button.setAttribute("aria-pressed", String(wasHidden));
    const label = wasHidden
        ? "Masquer le mot de passe"
        : "Afficher le mot de passe";
    button.setAttribute("aria-label", label);
    button.title = label;
}

// Delegation : couvre le champ de connexion et ceux de l'onglet Compte.
$$("[data-pw-toggle]").forEach(button => {
    button.addEventListener("click", () => {
        togglePassword(
            document.getElementById(button.dataset.pwToggle),
            button
        );
    });
});

function loadAccount() {
    const current = $("#app-user").textContent || "";
    const field = $("#acc-username");
    if (field) {
        // Pre-rempli uniquement a la premiere ouverture : on ne renvoie
        // l'identifiant au serveur que s'il a reellement change.
        if (!field.dataset.original) {
            field.value = current;
            field.dataset.original = current;
        }
    }
    const hint = $("#acc-current-name");
    if (hint) hint.textContent = current;
}

$("#account-form").addEventListener("submit", async event => {
    event.preventDefault();
    clearMessages(["#account-error", "#account-ok"]);

    const field = $("#acc-username");
    const typed = field.value.trim();
    const original = field.dataset.original || "";
    const currentPassword = $("#acc-current").value;
    const newPassword = $("#acc-new").value;

    if (!currentPassword) {
        showError("#account-error", "Saisissez votre mot de passe actuel.");
        $("#acc-current").focus();
        return;
    }

    const body = { current_password: currentPassword };

    if (typed && typed !== original) body.username = typed;
    if (newPassword) body.new_password = newPassword;

    if (!body.username && !body.new_password) {
        showError(
            "#account-error",
            "Rien à modifier : saisissez un nouvel identifiant et/ou un nouveau mot de passe."
        );
        return;
    }

    const button = $("#account-save");
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Enregistrement…";

    try {
        const result = await api("/api/admin/account/", {
            method: "PATCH",
            body
        });

        $("#acc-current").value = "";
        $("#acc-new").value = "";

        if (result.username) {
            $("#app-user").textContent = result.username;
            $("#login-username").value = result.username;
            field.dataset.original = result.username;
            const hint = $("#acc-current-name");
            if (hint) hint.textContent = result.username;
        }

        const what = (result.updated || []).join(" et ") || "compte";
        showError("#account-ok", "Mis à jour : " + what + ".");
        toast("Compte mis à jour.", "ok");
    } catch (error) {
        showError("#account-error", error.message);
    } finally {
        button.disabled = false;
        button.textContent = label;
    }
});


// ---------------------------------------------------------
// 11. Demarrage
// ---------------------------------------------------------

checkSession();
