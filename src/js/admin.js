/* =========================================================
   ESPACE ADMINISTRATION — logique applicative
   Aucune dépendance externe : fetch + DOM.
   ========================================================= */

"use strict";

// ---------------------------------------------------------
// 0. Internationalisation (fr / en)
// ---------------------------------------------------------

const ADMIN_I18N = {
    fr: {
        "meta.title": "Espace administration | Angelo Randrianasolo",
        "meta.description": "Espace d'administration du portfolio d'Angelo Randrianasolo : visiteurs, téléchargements de CV, projets et photo de profil.",

        "a11y.lang": "Changer de langue",
        "a11y.sections": "Sections",
        "a11y.theme": "Basculer le thème",
        "a11y.themeDark": "Passer en mode sombre",
        "a11y.themeLight": "Passer en mode clair",

        "app.badge": "Administration",
        "common.logout": "Se déconnecter",
        "common.refresh": "Rafraîchir",
        "common.save": "Enregistrer",
        "common.saving": "Enregistrement…",
        "common.cancel": "Annuler",
        "common.delete": "Supprimer",
        "common.edit": "Modifier",
        "common.close": "Fermer",
        "common.loading": "Chargement…",
        "common.upload": "Téléverser",
        "common.sending": "Envoi…",
        "common.rows": "Nombre de lignes",
        "common.showPw": "Afficher le mot de passe",
        "common.hidePw": "Masquer le mot de passe",
        "common.total": "{n} au total",
        "common.and": " et ",
        "common.errorStatus": "Erreur {status}",
        "common.unexpected": "Erreur inattendue.",

        "login.title": "Espace administration",
        "login.sub": "Gérez vos projets, votre photo, votre CV et suivez vos visiteurs.",
        "login.username": "Identifiant",
        "login.password": "Mot de passe",
        "login.submit": "Se connecter",
        "login.connecting": "Connexion…",
        "login.back": "← Retour au site",
        "login.required": "Identifiant et mot de passe requis.",
        "login.success": "Connexion réussie.",
        "login.impossible": "Connexion impossible.",
        "login.unexpected": "Réponse inattendue du serveur (connexion non confirmée).",
        "login.formMissing": "Formulaire introuvable — rechargez la page (Ctrl+Maj+R).",
        "login.apiDown": "Impossible de joindre l'API.",
        "login.loggedOut": "Déconnecté.",

        "diag.none": "aucun appel",
        "diag.lastCall": "dernier appel",
        "diag.csrf": "cookie CSRF",
        "diag.yes": "lu",
        "diag.no": "ABSENT",
        "diag.checking": "vérification de session…",
        "diag.noSession": "session absente",
        "diag.apiDown": "API inaccessible",
        "diag.connected": "CONNECTÉ",
        "diag.failed": "ÉCHEC",
        "diag.jsError": "Erreur JS : ",
        "diag.networkError": "Erreur réseau : ",

        "tab.overview": "Vue d'ensemble",
        "tab.visitors": "Visiteurs",
        "tab.cv": "CV",
        "tab.messages": "Messages",
        "tab.photo": "Photo de profil",
        "tab.projects": "Projets",
        "tab.account": "Compte",

        "overview.kicker": "Statistiques",
        "overview.title": "Vue d'ensemble",
        "overview.kpiVisits": "Visites au total",
        "overview.kpiToday": "Aujourd'hui",
        "overview.kpiWeek": "7 derniers jours",
        "overview.kpiMonth": "30 derniers jours",
        "overview.kpiDownloads": "Téléchargements CV",
        "overview.kpiProjects": "Projets publiés",
        "overview.visitsCard": "Visites sur 30 jours",
        "overview.visitsAria": "Histogramme des visites par jour",
        "overview.visitsEmpty": "Aucune visite enregistrée pour l'instant.",
        "overview.cvCard": "Téléchargements de CV sur 30 jours",
        "overview.cvAria": "Histogramme des téléchargements de CV par jour",
        "overview.cvEmpty": "Aucun téléchargement pour l'instant.",
        "overview.topPages": "Pages les plus visitées",
        "overview.noData": "Pas encore de données.",

        "visits.kicker": "Journal",
        "visits.title": "Visiteurs",
        "visits.limit50": "50 dernières",
        "visits.limit100": "100 dernières",
        "visits.limit250": "250 dernières",
        "visits.thDate": "Date",
        "visits.thPage": "Page",
        "visits.thOrigin": "Origine",
        "visits.thBrowser": "Navigateur",
        "visits.empty": "Aucune visite enregistrée.",
        "visits.direct": "Direct",

        "cv.kicker": "Document",
        "cv.title": "Curriculum vitæ",
        "cv.current": "Fichier actuel",
        "cv.none": "Aucun CV téléversé.",
        "cv.newFile": "Nouveau fichier (PDF, DOC, DOCX)",
        "cv.delete": "Supprimer le CV",
        "cv.downloads": "Téléchargements",
        "cv.nobody": "Personne n'a encore téléchargé votre CV.",
        "cv.updatedOn": "Mis à jour le {date} —",
        "cv.open": "ouvrir",
        "cv.unknownIp": "IP inconnue",
        "cv.updated": "CV mis à jour.",
        "cv.deleted": "CV supprimé.",
        "cv.confirmDelete": "Supprimer définitivement le CV ?",

        "photo.kicker": "Identité",
        "photo.title": "Photo de profil",
        "photo.hint": "Sans photo, vos initiales « AR » sont affichées dans la bannière d'accueil. Formats acceptés : JPG, PNG, WEBP, GIF — 20 Mo maximum.",
        "photo.newPhoto": "Nouvelle photo",
        "photo.update": "Mettre à jour la photo",
        "photo.delete": "Supprimer la photo",
        "photo.currentAlt": "Photo de profil actuelle",
        "photo.updated": "Photo mise à jour.",
        "photo.deleted": "Photo supprimée.",
        "photo.confirmDelete": "Supprimer la photo de profil ?",

        "projects.kicker": "Contenu",
        "projects.title": "Projets",
        "projects.new": "+ Nouveau projet",
        "projects.newTitle": "Nouveau projet",
        "projects.editTitle": "Modifier le projet",
        "projects.empty": "Aucun projet. Créez votre premier projet avec « + Nouveau projet ».",
        "projects.siteLink": "Site ↗",
        "projects.codeLink": "Code ↗",
        "projects.published": "Publié",
        "projects.draft": "Brouillon",
        "projects.featured": "Vedette",
        "projects.noCategory": "Sans catégorie",
        "projects.order": "ordre {n}",
        "projects.unpublish": "Dépublier",
        "projects.publish": "Publier",
        "projects.unpublished": "Projet dépublié.",
        "projects.publishedToast": "Projet publié.",
        "projects.confirmDelete": "Supprimer définitivement « {title} » ?",
        "projects.deleted": "Projet supprimé.",
        "projects.titleRequired": "Le titre est obligatoire.",
        "projects.updated": "Projet mis à jour.",
        "projects.created": "Projet créé.",

        "messages.kicker": "Boîte de réception",
        "messages.title": "Messages reçus",
        "messages.limit50": "50 derniers",
        "messages.limit100": "100 derniers",
        "messages.limit250": "250 derniers",
        "messages.recipientTitle": "Destinataire des messages",
        "messages.recipientHint": "Recevoir les nouveaux messages dans votre boîte mail",
        "messages.recipientLabel": "Adresse qui reçoit les messages",
        "messages.recipientReset": "Revenir à l'adresse .env",
        "messages.empty": "Aucun message pour l'instant.",
        "messages.sentTo": "Les nouveaux messages sont envoyés à {email}.",
        "messages.notConfigured": "L'envoi d'email n'est pas configuré : les messages restent lisibles ici. Renseignez SMTP dans .env pour les recevoir dans votre boîte mail.",
        "messages.emailSent": "Email envoyé",
        "messages.emailNotSent": "Email non envoyé",
        "messages.new": "Nouveau",
        "messages.markRead": "Marquer lu",
        "messages.markUnread": "Marquer non lu",
        "messages.reply": "Répondre",
        "messages.re": "Re",
        "messages.defaultSubject": "Votre message",
        "messages.confirmDelete": "Supprimer définitivement ce message ?",
        "messages.deleted": "Message supprimé.",
        "messages.recipientEmpty": "Saisissez une adresse, ou utilisez « Revenir à l'adresse .env ».",
        "messages.recipientSaved": "Destinataire enregistré : {email}.",
        "messages.recipientUpdated": "Destinataire mis à jour.",
        "messages.recipientResetDone": "Adresse du .env rétablie.",

        "account.kicker": "Sécurité",
        "account.title": "Mon compte",
        "account.credentials": "Identifiant et mot de passe",
        "account.newUsername": "Nouvel identifiant",
        "account.currentPassword": "Mot de passe actuel *",
        "account.newPassword": "Nouveau mot de passe — 8 caractères minimum, laisser vide pour ne pas le changer",
        "account.howTitle": "Comment ça marche",
        "account.rule1": "Le <strong>mot de passe actuel</strong> est toujours demandé : une session ouverte ne suffit pas pour modifier le compte.",
        "account.rule2": "Vous restez connecté après modification.",
        "account.rule3": "Un identifiant déjà pris par un autre compte est refusé.",
        "account.rule4": "Le nouveau mot de passe doit être différent de l'actuel et contenir au moins 8 caractères.",
        "account.hint": "Ces identifiants servent uniquement à cet espace privé. Ils ne sont jamais affichés sur le site public.",
        "account.needCurrentPassword": "Saisissez votre mot de passe actuel.",
        "account.nothingToChange": "Rien à modifier : saisissez un nouvel identifiant et/ou un nouveau mot de passe.",
        "account.labelUsername": "identifiant",
        "account.labelPassword": "mot de passe",
        "account.labelAccount": "compte",
        "account.updated": "Mis à jour : {what}.",
        "account.updatedToast": "Compte mis à jour.",

        "modal.title": "Titre *",
        "modal.category": "Catégorie",
        "modal.icon": "Icône (emoji)",
        "modal.order": "Ordre d'affichage",
        "modal.summary": "Accroche — français",
        "modal.summaryEn": "Accroche — anglais",
        "modal.description": "Description — français",
        "modal.descriptionEn": "Description — anglais",
        "modal.technologies": "Technologies (séparées par des virgules)",
        "modal.website": "Lien du projet",
        "modal.repo": "Dépôt GitHub",
        "modal.image": "Visuel (JPG, PNG, WEBP, GIF)",
        "modal.imageShort": "Visuel",
        "modal.mockup": "Maquette (image)",
        "modal.mockupShort": "Maquette",
        "modal.published": "Publié sur le site",
        "modal.featured": "Mettre en vedette"
    },

    en: {
        "meta.title": "Administration | Angelo Randrianasolo",
        "meta.description": "Administration area of Angelo Randrianasolo's portfolio: visitors, CV downloads, projects and profile photo.",

        "a11y.lang": "Change language",
        "a11y.sections": "Sections",
        "a11y.theme": "Toggle theme",
        "a11y.themeDark": "Switch to dark mode",
        "a11y.themeLight": "Switch to light mode",

        "app.badge": "Administration",
        "common.logout": "Sign out",
        "common.refresh": "Refresh",
        "common.save": "Save",
        "common.saving": "Saving…",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.close": "Close",
        "common.loading": "Loading…",
        "common.upload": "Upload",
        "common.sending": "Sending…",
        "common.rows": "Rows per page",
        "common.showPw": "Show password",
        "common.hidePw": "Hide password",
        "common.total": "{n} in total",
        "common.and": " and ",
        "common.errorStatus": "Error {status}",
        "common.unexpected": "Unexpected error.",

        "login.title": "Administration",
        "login.sub": "Manage your projects, photo and CV, and keep track of your visitors.",
        "login.username": "Username",
        "login.password": "Password",
        "login.submit": "Sign in",
        "login.connecting": "Signing in…",
        "login.back": "← Back to site",
        "login.required": "Username and password required.",
        "login.success": "Signed in successfully.",
        "login.impossible": "Unable to sign in.",
        "login.unexpected": "Unexpected server response (sign-in not confirmed).",
        "login.formMissing": "Form not found — reload the page (Ctrl+Shift+R).",
        "login.apiDown": "Cannot reach the API.",
        "login.loggedOut": "Signed out.",

        "diag.none": "no call",
        "diag.lastCall": "last call",
        "diag.csrf": "CSRF cookie",
        "diag.yes": "read",
        "diag.no": "MISSING",
        "diag.checking": "checking session…",
        "diag.noSession": "no session",
        "diag.apiDown": "API unreachable",
        "diag.connected": "CONNECTED",
        "diag.failed": "FAILED",
        "diag.jsError": "JS error: ",
        "diag.networkError": "Network error: ",

        "tab.overview": "Overview",
        "tab.visitors": "Visitors",
        "tab.cv": "CV",
        "tab.messages": "Messages",
        "tab.photo": "Profile photo",
        "tab.projects": "Projects",
        "tab.account": "Account",

        "overview.kicker": "Statistics",
        "overview.title": "Overview",
        "overview.kpiVisits": "Total visits",
        "overview.kpiToday": "Today",
        "overview.kpiWeek": "Last 7 days",
        "overview.kpiMonth": "Last 30 days",
        "overview.kpiDownloads": "CV downloads",
        "overview.kpiProjects": "Published projects",
        "overview.visitsCard": "Visits over 30 days",
        "overview.visitsAria": "Histogram of daily visits",
        "overview.visitsEmpty": "No visits recorded yet.",
        "overview.cvCard": "CV downloads over 30 days",
        "overview.cvAria": "Histogram of daily CV downloads",
        "overview.cvEmpty": "No downloads yet.",
        "overview.topPages": "Most visited pages",
        "overview.noData": "No data yet.",

        "visits.kicker": "Log",
        "visits.title": "Visitors",
        "visits.limit50": "Last 50",
        "visits.limit100": "Last 100",
        "visits.limit250": "Last 250",
        "visits.thDate": "Date",
        "visits.thPage": "Page",
        "visits.thOrigin": "Referrer",
        "visits.thBrowser": "Browser",
        "visits.empty": "No visits recorded.",
        "visits.direct": "Direct",

        "cv.kicker": "Document",
        "cv.title": "Curriculum vitæ",
        "cv.current": "Current file",
        "cv.none": "No CV uploaded.",
        "cv.newFile": "New file (PDF, DOC, DOCX)",
        "cv.delete": "Delete CV",
        "cv.downloads": "Downloads",
        "cv.nobody": "Nobody has downloaded your CV yet.",
        "cv.updatedOn": "Updated on {date} —",
        "cv.open": "open",
        "cv.unknownIp": "Unknown IP",
        "cv.updated": "CV updated.",
        "cv.deleted": "CV deleted.",
        "cv.confirmDelete": "Permanently delete the CV?",

        "photo.kicker": "Identity",
        "photo.title": "Profile photo",
        "photo.hint": "Without a photo, your initials « AR » are shown in the banner. Accepted formats: JPG, PNG, WEBP, GIF — 20 MB max.",
        "photo.newPhoto": "New photo",
        "photo.update": "Update photo",
        "photo.delete": "Delete photo",
        "photo.currentAlt": "Current profile photo",
        "photo.updated": "Photo updated.",
        "photo.deleted": "Photo deleted.",
        "photo.confirmDelete": "Delete the profile photo?",

        "projects.kicker": "Content",
        "projects.title": "Projects",
        "projects.new": "+ New project",
        "projects.newTitle": "New project",
        "projects.editTitle": "Edit project",
        "projects.empty": "No projects yet. Create your first project with « + New project ».",
        "projects.siteLink": "Site ↗",
        "projects.codeLink": "Code ↗",
        "projects.published": "Published",
        "projects.draft": "Draft",
        "projects.featured": "Featured",
        "projects.noCategory": "No category",
        "projects.order": "order {n}",
        "projects.unpublish": "Unpublish",
        "projects.publish": "Publish",
        "projects.unpublished": "Project unpublished.",
        "projects.publishedToast": "Project published.",
        "projects.confirmDelete": "Permanently delete « {title} »?",
        "projects.deleted": "Project deleted.",
        "projects.titleRequired": "Title is required.",
        "projects.updated": "Project updated.",
        "projects.created": "Project created.",

        "messages.kicker": "Inbox",
        "messages.title": "Received messages",
        "messages.limit50": "Last 50",
        "messages.limit100": "Last 100",
        "messages.limit250": "Last 250",
        "messages.recipientTitle": "Message recipient",
        "messages.recipientHint": "Receive new messages in your inbox",
        "messages.recipientLabel": "Address that receives the messages",
        "messages.recipientReset": "Revert to .env address",
        "messages.empty": "No messages yet.",
        "messages.sentTo": "New messages are sent to {email}.",
        "messages.notConfigured": "Email sending is not configured: messages stay readable here. Set SMTP in .env to receive them in your inbox.",
        "messages.emailSent": "Email sent",
        "messages.emailNotSent": "Email not sent",
        "messages.new": "New",
        "messages.markRead": "Mark as read",
        "messages.markUnread": "Mark as unread",
        "messages.reply": "Reply",
        "messages.re": "Re",
        "messages.defaultSubject": "Your message",
        "messages.confirmDelete": "Permanently delete this message?",
        "messages.deleted": "Message deleted.",
        "messages.recipientEmpty": "Enter an address, or use « Revert to .env address ».",
        "messages.recipientSaved": "Recipient saved: {email}.",
        "messages.recipientUpdated": "Recipient updated.",
        "messages.recipientResetDone": ".env address restored.",

        "account.kicker": "Security",
        "account.title": "My account",
        "account.credentials": "Username and password",
        "account.newUsername": "New username",
        "account.currentPassword": "Current password *",
        "account.newPassword": "New password — 8 characters minimum, leave empty to keep it",
        "account.howTitle": "How it works",
        "account.rule1": "The <strong>current password</strong> is always required: an open session alone is not enough to change the account.",
        "account.rule2": "You stay signed in after the change.",
        "account.rule3": "A username already taken by another account is rejected.",
        "account.rule4": "The new password must differ from the current one and contain at least 8 characters.",
        "account.hint": "These credentials are only for this private area. They are never shown on the public site.",
        "account.needCurrentPassword": "Enter your current password.",
        "account.nothingToChange": "Nothing to change: enter a new username and/or a new password.",
        "account.labelUsername": "username",
        "account.labelPassword": "password",
        "account.labelAccount": "account",
        "account.updated": "Updated: {what}.",
        "account.updatedToast": "Account updated.",

        "modal.title": "Title *",
        "modal.category": "Category",
        "modal.icon": "Icon (emoji)",
        "modal.order": "Display order",
        "modal.summary": "Tagline — French",
        "modal.summaryEn": "Tagline — English",
        "modal.description": "Description — French",
        "modal.descriptionEn": "Description — English",
        "modal.technologies": "Technologies (comma separated)",
        "modal.website": "Project link",
        "modal.repo": "GitHub repository",
        "modal.image": "Image (JPG, PNG, WEBP, GIF)",
        "modal.imageShort": "Image",
        "modal.mockup": "Mockup (image)",
        "modal.mockupShort": "Mockup",
        "modal.published": "Published on the site",
        "modal.featured": "Feature on homepage"
    }
};

let currentLanguage = "fr";

/** Traduit une clé ; {placeholders} remplacés par `vars`. */
function t(key, vars) {
    const dict = ADMIN_I18N[currentLanguage] || ADMIN_I18N.fr;
    let text = dict[key] !== undefined ? dict[key] : key;
    if (vars) {
        Object.keys(vars).forEach(name => {
            text = text.split("{" + name + "}").join(String(vars[name]));
        });
    }
    return text;
}

/** Applique la langue à toute la page admin. */
function applyLanguage(language, save) {
    if (!ADMIN_I18N[language]) language = "fr";
    currentLanguage = language;

    const dict = ADMIN_I18N[language];

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (dict[key] !== undefined) element.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-html]").forEach(element => {
        const key = element.getAttribute("data-i18n-html");
        if (dict[key] !== undefined) element.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
        const key = element.getAttribute("data-i18n-aria");
        if (dict[key] !== undefined) element.setAttribute("aria-label", dict[key]);
    });

    document.querySelectorAll("[data-i18n-title]").forEach(element => {
        const key = element.getAttribute("data-i18n-title");
        if (dict[key] !== undefined) element.setAttribute("title", dict[key]);
    });

    document.documentElement.lang = language;
    document.title = dict["meta.title"];

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && dict["meta.description"]) {
        descriptionMeta.setAttribute("content", dict["meta.description"]);
    }

    // Bouton : affiche la langue cible (comme sur le site public)
    document.querySelectorAll(".lang-toggle").forEach(button => {
        button.textContent = language === "fr" ? "EN" : "FR";
    });

    buildFormatters(language === "fr" ? "fr-FR" : "en-GB");
    syncThemeButton();

    // Etat réel des boutons « afficher le mot de passe »
    document.querySelectorAll("[data-pw-toggle]").forEach(button => {
        const input = document.getElementById(button.dataset.pwToggle);
        if (!input) return;
        const label = input.type === "text"
            ? t("common.hidePw") : t("common.showPw");
        button.setAttribute("aria-label", label);
        button.title = label;
    });

    if (save) {
        try {
            localStorage.setItem("portfolio-language", language);
        } catch (error) {}
    }

    // Recharge les contenus serveur affichés dans la nouvelle langue
    if (typeof app !== "undefined" && app && !app.hidden) {
        activateTab(currentTab);
    } else {
        refreshDiag();
    }
}

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
            (payload && payload.detail)
            || t("common.errorStatus", { status: response.status })
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

const JS_VERSION = "20261120a";
let lastApi = "";

function refreshDiag(extra) {
    const element = $("#login-diag");
    if (!element) return;
    const cookieOk = !!readCookie("csrftoken");
    element.textContent =
        "JS " + JS_VERSION +
        " · " + t("diag.lastCall") + " : " + (lastApi || t("diag.none")) +
        " · " + t("diag.csrf") + " : " + (cookieOk ? t("diag.yes") : t("diag.no")) +
        (extra ? " · " + extra : "");
}

let dateFormatter = null;
let shortDateFormatter = null;

/** Recrée les formatteurs de date dans la langue choisie. */
function buildFormatters(locale) {
    dateFormatter = new Intl.DateTimeFormat(locale, {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
    shortDateFormatter = new Intl.DateTimeFormat(locale, {
        day: "2-digit", month: "short"
    });
}

buildFormatters("fr-FR");

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

let currentTab = "overview";

function activateTab(name) {
    currentTab = name;
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
        if (hint) {
            hint.textContent = t("common.total", { n: data.totals.visits });
        }

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
                        : `<span class="pill pill--muted">${t("visits.direct")}</span>`}
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
                    ${t("cv.updatedOn", {
                        date: escapeHtml(formatDate(profile.updated_at))
                    })}
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                        ${t("cv.open")}
                    </a>
                </p>`;
            $("#cv-delete-btn").hidden = false;
        } else {
            box.innerHTML =
                `<p class="file-empty">${t("cv.none")}</p>`;
            $("#cv-delete-btn").hidden = true;
        }

        $("#cv-upload-btn").disabled = !$("#cv-file").files.length;

    } catch (error) {
        toast(error.message, "error");
    }

    try {
        const stats = await api("/api/admin/cv/");
        setBadge("#count-downloads", stats.count);
        $("#cv-count").textContent =
            t("common.total", { n: stats.count });

        const log = $("#cv-log");
        const empty = $("#cv-log-empty");

        if (!stats.results.length) {
            log.innerHTML = "";
            if (empty) empty.hidden = false;
        } else {
            if (empty) empty.hidden = true;
            log.innerHTML = stats.results.map(item => `
                <li>
                    <span class="log-what">${escapeHtml(item.ip || t("cv.unknownIp"))}</span>
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
    button.textContent = t("common.sending");

    try {
        const form = new FormData();
        form.append("cv", file);
        await api("/api/admin/profile/cv/", { method: "POST", body: form });

        toast(t("cv.updated"), "ok");
        $("#cv-file").value = "";
        await loadCv();
        loadOverview();

    } catch (error) {
        showError("#cv-error", error.message);
        button.disabled = false;
    } finally {
        button.textContent = t("common.upload");
    }
});

$("#cv-delete-btn").addEventListener("click", async () => {
    if (!window.confirm(t("cv.confirmDelete"))) return;

    clearMessages(["#cv-error", "#cv-ok"]);

    try {
        await api("/api/admin/profile/cv/delete/", { method: "DELETE" });
        toast(t("cv.deleted"), "ok");
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
        ? `<span class="pill pill--ok">${t("messages.emailSent")}</span>`
        : `<span class="pill pill--warn">${t("messages.emailNotSent")}</span>`;

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
                    ${message.is_read ? "" : `<span class="pill pill--brand">${t("messages.new")}</span>`}
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
                    ${message.is_read ? t("messages.markUnread") : t("messages.markRead")}
                </button>
                <a class="btn btn-ghost btn-sm"
                   href="mailto:${escapeHtml(message.email)}?subject=${encodeURIComponent(
                       t("messages.re") + " : " +
                       (message.subject || t("messages.defaultSubject"))
                   )}">${t("messages.reply")}</a>
                <button type="button" class="btn btn-danger btn-sm"
                        data-action="delete">${t("common.delete")}</button>
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
                    t("messages.sentTo", { email: data.recipient });
                status.className = "panel-note is-ok";
            } else {
                status.textContent = t("messages.notConfigured");
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
        if (!window.confirm(t("messages.confirmDelete"))) return;

        try {
            await api("/api/admin/messages/" + id + "/", { method: "DELETE" });
            toast(t("messages.deleted"), "ok");
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
            t("messages.recipientEmpty")
        );
        field.focus();
        return;
    }

    const button = $("#recipient-save");
    const label = button.textContent;
    button.disabled = true;
    button.textContent = t("common.saving");

    try {
        await api("/api/admin/profile/", {
            method: "PATCH",
            body: { contact_email: value }
        });
        showError(
            "#recipient-ok",
            t("messages.recipientSaved", { email: value })
        );
        toast(t("messages.recipientUpdated"), "ok");
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
        toast(t("messages.recipientResetDone"), "ok");
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
                ? `<img src="${escapeHtml(url)}" alt="${t("photo.currentAlt")}">`
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
    button.textContent = t("common.sending");

    try {
        const form = new FormData();
        form.append("photo", file);
        await api("/api/admin/profile/photo/", { method: "POST", body: form });

        toast(t("photo.updated"), "ok");
        $("#photo-file").value = "";
        await loadPhoto();

    } catch (error) {
        showError("#photo-error", error.message);
        button.disabled = false;
    } finally {
        button.textContent = t("photo.update");
    }
});

$("#photo-delete-btn").addEventListener("click", async () => {
    if (!window.confirm(t("photo.confirmDelete"))) return;

    clearMessages(["#photo-error", "#photo-ok"]);

    try {
        await api("/api/admin/profile/photo/delete/", { method: "DELETE" });
        toast(t("photo.deleted"), "ok");
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
                    ${t("projects.empty")}
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
                    href="${escapeHtml(safeUrl(project.website_url))}">${t("projects.siteLink")}</a>`);
            }
            if (safeUrl(project.repo_url)) {
                links.push(`<a class="btn btn-ghost btn-sm" target="_blank"
                    rel="noopener noreferrer"
                    href="${escapeHtml(safeUrl(project.repo_url))}">${t("projects.codeLink")}</a>`);
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
                                ${project.is_published ? t("projects.published") : t("projects.draft")}
                            </span>
                            ${project.is_featured
                                ? `<span class="pill">${t("projects.featured")}</span>` : ""}
                        </div>

                        <p class="project-meta">
                            ${escapeHtml(project.category || t("projects.noCategory"))}
                            · ${t("projects.order", { n: project.order })}
                        </p>

                        <div class="project-tags">${tags}</div>
                    </div>

                    <div class="project-actions">
                        <button type="button" class="btn btn-ghost btn-sm"
                                data-action="toggle">
                            ${project.is_published ? t("projects.unpublish") : t("projects.publish")}
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm"
                                data-action="edit">${t("common.edit")}</button>
                        <button type="button" class="btn btn-danger btn-sm"
                                data-action="delete">${t("common.delete")}</button>
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
            toast(project.is_published
                ? t("projects.unpublished") : t("projects.publishedToast"), "ok");
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
            t("projects.confirmDelete", { title: project.title })
        );
        if (!confirmed) return;

        button.disabled = true;
        try {
            await api("/api/admin/projects/" + id + "/", { method: "DELETE" });
            toast(t("projects.deleted"), "ok");
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
        ? t("projects.editTitle") : t("projects.newTitle");

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
            <span class="thumb-item">${t("modal.imageShort")}
                <img src="${escapeHtml(safeUrl(project.image))}" alt="">
            </span>`);
    }
    if (project && safeUrl(project.mockup)) {
        items.push(`
            <span class="thumb-item">${t("modal.mockupShort")}
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
        showError("#project-error", t("projects.titleRequired"));
        $("#p-title").focus();
        return;
    }

    const button = $("#project-save-btn");
    button.disabled = true;
    button.textContent = t("common.saving");

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

        toast(id ? t("projects.updated") : t("projects.created"), "ok");
        closeProjectModal();
        await loadProjects();
        loadOverview();

    } catch (error) {
        showError("#project-error", error.message);
    } finally {
        button.disabled = false;
        button.textContent = t("common.save");
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
        dark ? t("a11y.themeLight") : t("a11y.themeDark")
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
    refreshDiag(t("diag.checking"));
    try {
        const me = await api("/api/auth/me/");
        if (me.authenticated) {
            showApp(me.username);
        } else {
            showLogin();
            refreshDiag(t("diag.noSession"));
        }
    } catch (error) {
        showLogin(t("login.apiDown"));
        refreshDiag(t("diag.apiDown"));
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
            failSafe(t("login.formMissing"));
            return;
        }

        const username = userField.value.trim();
        const password = passField.value;

        if (!username || !password) {
            failSafe(t("login.required"));
            return;
        }

        const button = $("#login-submit");
        button.disabled = true;
        button.textContent = t("login.connecting");

        try {
            const result = await api("/api/auth/login/", {
                method: "POST",
                body: { username, password }
            });

            if (!result || !result.username) {
                throw new Error(t("login.unexpected"));
            }

            showApp(result.username);
            passField.value = "";
            toast(t("login.success"), "ok");
            refreshDiag(t("diag.connected"));
        } catch (error) {
            failSafe(error && error.message ? error.message : t("login.impossible"));
            refreshDiag(t("diag.failed"));
        } finally {
            button.disabled = false;
            button.textContent = t("login.submit");
        }
    } catch (error) {
        failSafe(error && error.message ? error.message : t("common.unexpected"));
    }
});

// Rien ne doit rester muet : toute erreur JS non attrapée devient visible.
window.addEventListener("error", event => {
    toast(t("diag.jsError") + (event.message || "?"), "err");
});
window.addEventListener("unhandledrejection", event => {
    const r = event.reason;
    toast(t("diag.networkError") +
        (r && r.message ? r.message : String(r)), "err");
});

$("#logout-btn").addEventListener("click", async () => {
    try {
        await api("/api/auth/logout/", { method: "POST", body: {} });
    } catch (error) {
        // On redirige quand meme vers l'ecran de connexion.
    }
    showLogin();
    toast(t("login.loggedOut"), "ok");
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
        ? t("common.hidePw")
        : t("common.showPw");
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
        showError("#account-error", t("account.needCurrentPassword"));
        $("#acc-current").focus();
        return;
    }

    const body = { current_password: currentPassword };

    if (typed && typed !== original) body.username = typed;
    if (newPassword) body.new_password = newPassword;

    if (!body.username && !body.new_password) {
        showError("#account-error", t("account.nothingToChange"));
        return;
    }

    const button = $("#account-save");
    const label = button.textContent;
    button.disabled = true;
    button.textContent = t("common.saving");

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

        // Le serveur renvoie les libelles en français : on les traduit.
        const labels = {
            "identifiant": t("account.labelUsername"),
            "mot de passe": t("account.labelPassword")
        };
        const parts = (result.updated || [])
            .map(item => labels[item] || item);
        const what = parts.join(t("common.and")) || t("account.labelAccount");
        showError("#account-ok", t("account.updated", { what: what }));
        toast(t("account.updatedToast"), "ok");
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

// Bascule FR <-> EN (ecran de connexion + barre du haut)
$$(".lang-toggle").forEach(button => {
    button.addEventListener("click", () => {
        applyLanguage(currentLanguage === "fr" ? "en" : "fr", true);
    });
});

// Meme cle de preference que le site public : une seule langue pour tout
// le portfolio. La page est deja rendue en francais par defaut.
let savedLanguage = null;
try {
    savedLanguage = localStorage.getItem("portfolio-language");
} catch (error) {}
applyLanguage(savedLanguage === "en" ? "en" : "fr", false);

checkSession();
