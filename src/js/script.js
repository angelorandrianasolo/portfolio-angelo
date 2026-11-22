
// ========================================
// 1. SELECTION DES ELEMENTS HTML
// ========================================

const themeToggle = document.getElementById("theme-toggle");
const languageToggle = document.getElementById("language-toggle");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const backToTop = document.getElementById("back-to-top");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const projectsGrid = document.getElementById("projects-grid");
const githubGrid = document.getElementById("github-grid");
const cvButton = document.getElementById("cv-download");
const heroPhoto = document.getElementById("hero-photo");
const statProjects = document.getElementById("stat-projects");
const statRepos = document.getElementById("stat-repos");

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ========================================
// 2. TRADUCTIONS FRANCAIS / ANGLAIS
// ========================================

const translations = {

    fr: {
        "meta.title": "Angelo Randrianasolo | Développeur Full Stack",
        "meta.description": "Portfolio d'Angelo Randrianasolo, développeur Full Stack : applications web et mobiles, API REST et architectures MVC.",

        "a11y.skip": "Aller au contenu",
        "a11y.nav": "Navigation principale",
        "a11y.footerNav": "Liens du pied de page",
        "a11y.lang": "Passer en anglais (EN)",
        "a11y.menu.open": "Ouvrir le menu",
        "a11y.menu.close": "Fermer le menu",
        "a11y.theme.toDark": "Passer en mode sombre (🌙)",
        "a11y.theme.toLight": "Passer en mode clair (☀️)",
        "a11y.top": "Revenir en haut de page",
        "a11y.email": "Envoyer un email à Angelo",
        "a11y.phone": "Appeler Angelo",
        "a11y.github": "Profil GitHub de Angelo",
        "a11y.linkedin": "Profil LinkedIn de Angelo",

        "nav.home": "Accueil",
        "nav.about": "À propos",
        "nav.skills": "Compétences",
        "nav.projects": "Projets",
        "nav.github": "GitHub",
        "nav.contact": "Contact",

        "hero.available": "Disponible pour des opportunités",
        "hero.greeting": "Bonjour, je suis",
        "hero.job": "Développeur Full Stack",
        "hero.description": "Je conçois des applications web et mobiles, des API REST documentées et des architectures MVC maintenables. Actuellement étudiant en L3 génie logiciel.",
        "hero.projects": "Voir mes projets",
        "hero.contact": "Me contacter",
        "hero.cv": "Télécharger mon CV",
        "hero.meta1": "Génie logiciel",
        "hero.meta2": "Web & Mobile",
        "hero.statProjects": "Projets",
        "hero.statRepos": "Dépôts GitHub",

        "services.kicker": "Services",
        "services.title": "Ce que je propose",
        "services.intro": "De la conception à la mise en production, je prends en charge la chaîne complète d'un produit numérique.",
        "services.web.title": "Applications web",
        "services.web.desc": "Sites vitrines, tableaux de bord et applications métier performants, accessibles et adaptés à tous les écrans.",
        "services.web.p1": "Interfaces soignées et accessibles",
        "services.web.p2": "Référencement technique",
        "services.web.p3": "Déploiement conteneurisé",
        "services.mobile.title": "Applications mobiles",
        "services.mobile.desc": "Applications cross-platform partageant une même base de code avec leur version web.",
        "services.mobile.p1": "iOS et Android",
        "services.mobile.p2": "Interface native et fluide",
        "services.mobile.p3": "Connexion à votre API",
        "services.api.title": "API & back-end",
        "services.api.desc": "API REST documentées, authentification sécurisée, modélisation de données et logique métier.",
        "services.api.p1": "Conception REST et MVC",
        "services.api.p2": "Bases de données relationnelles",
        "services.api.p3": "Tests et documentation",

        "about.kicker": "À propos",
        "about.title": "À propos de moi",
        "about.text1": "Développeur Full Stack, je conçois des applications web et mobiles de bout en bout : interface, API REST, modélisation de données et déploiement.",
        "about.text2": "Je porte une attention particulière à l'architecture — une séparation stricte entre le modèle, la vue et le contrôleur — afin de livrer des codebases lisibles, testables et faciles à faire évoluer.",
        "about.text3": "Actuellement étudiant en L3 génie logiciel, je cherche des stages, des missions freelance et des projets ouverts sur lesquels apporter une réelle valeur ajoutée.",
        "about.location.label": "Localisation",
        "about.location.value": "Madagascar",
        "about.status.label": "Statut",
        "about.status.value": "Étudiant en L3 — Génie logiciel",
        "about.focus.label": "Spécialité",
        "about.focus.value": "Développeur Full Stack",
        "about.availability.label": "Disponibilité",
        "about.availability.value": "Stages & freelance",

        "parcours.title": "Parcours",
        "parcours.1.tag": "En cours",
        "parcours.1.title": "L3 Génie logiciel",
        "parcours.1.text": "Formation en génie logiciel à Madagascar : algorithmique, architectures logicielles (MVC, API REST) et projets pratiques.",
        "parcours.2.tag": "Projets",
        "parcours.2.title": "Applications livrées en autonomie",
        "parcours.2.text": "Meilleur-prix et Tantsaha Connect : de l'idée au déploiement, avec React / React Native, Node.js et des bases de données relationnelles.",
        "parcours.3.tag": "Recherche",
        "parcours.3.title": "Stage & missions freelance",
        "parcours.3.text": "Disponible pour rejoindre une équipe ou collaborer en remote sur des produits utiles.",

        "arch.kicker": "Méthodes",
        "arch.title": "Architecture logicielle",
        "arch.intro": "Une même exigence sur chaque projet : des frontières nettes entre les responsabilités, une API stable et un code qui dure.",
        "arch.flowAria": "Cycle d'une requête",
        "arch.flow.1": "Requête HTTP",
        "arch.flow.2": "Routeur",
        "arch.flow.3": "Contrôleur",
        "arch.flow.4": "Modèle",
        "arch.flow.5": "Vue / JSON",
        "arch.rest.title": "API REST",
        "arch.rest.desc": "Des ressources nommées, des méthodes HTTP sémantiques, des codes de statut cohérents et une pagination prévisible.",
        "arch.rest.p1": "Endpoints versionnés et documentés",
        "arch.rest.p2": "Authentification et contrôle d'accès",
        "arch.rest.p3": "Validation et gestion des erreurs",
        "arch.mvc.title": "Modèle · Vue · Contrôleur",
        "arch.mvc.desc": "La logique métier ne dépend jamais du rendu. Chaque couche se remplace sans toucher aux autres.",
        "arch.mvc.p1": "Modèle : données et règles métier",
        "arch.mvc.p2": "Vue : présentation et accessibilité",
        "arch.mvc.p3": "Contrôleur : orchestration des flux",
        "arch.django.title": "Django",
        "arch.django.desc": "Mon cadre de prédilection côté serveur : un ORM typé, des migrations versionnées et la sécurité intégrée.",
        "arch.django.p1": "ORM, migrations et requêtes optimisées",
        "arch.django.p2": "Protection CSRF, XSS et injection SQL",
        "arch.django.p3": "Back-office d'administration natif",

        "skills.kicker": "Compétences",
        "skills.title": "Mes compétences",
        "skills.frontend": "Frontend",
        "skills.backend": "Backend",
        "skills.database": "Bases de données",
        "skills.tools": "Outils et environnements",
        "skills.architecture": "Conception et architecture",

        "projects.kicker": "Projets",
        "projects.title": "Mes projets",
        "projects.intro": "Une sélection de réalisations, enrichie en direct depuis mon espace d'administration.",
        "projects.loading": "Chargement des projets…",
        "projects.emptyTitle": "Aucun projet publié",
        "projects.empty": "Les projets apparaîtront ici dès qu'ils seront publiés depuis l'administration.",
        "projects.unavailableTitle": "Projets indisponibles",
        "projects.unavailable": "Impossible de joindre l'API. Réessayez dans un instant.",
        "projects.visit": "Visiter le site",
        "projects.code": "Voir le code",
        "projects.featured": "En vedette",
        "gallery.open": "Voir les photos du projet",
        "gallery.close": "Fermer la galerie",
        "gallery.prev": "Photo précédente",
        "gallery.next": "Photo suivante",
        "gallery.count": "photos",

        "github.kicker": "GitHub",
        "github.title": "Ce que je pousse",
        "github.intro": "Synchronisé automatiquement avec mon profil GitHub — les dépôts publics les plus récents.",
        "github.loading": "Chargement des dépôts…",
        "github.emptyTitle": "Aucun dépôt à afficher",
        "github.empty": "Les dépôts publics apparaîtront ici.",
        "github.unavailableTitle": "GitHub indisponible",
        "github.unavailable": "L'API GitHub ne répond pas. Consultez directement mon profil.",
        "github.view": "Voir tout mon profil GitHub",
        "github.stars": "étoiles",
        "github.updated": "MAJ",

        "contact.kicker": "Contact",
        "contact.title": "Contact",
        "contact.subtitle": "Une idée de projet, une opportunité ou simplement une question ? N'hésitez pas à me contacter, je réponds toujours.",
        "contact.email.label": "Email",
        "contact.phone.label": "Téléphone",
        "contact.cta": "Envoyez-moi un email",

        "contact.form.kicker": "Écrivez-moi",
        "contact.form.hint": "Le message arrive directement dans ma boîte mail.",
        "contact.form.name": "Nom",
        "contact.form.email": "Email",
        "contact.form.subject": "Sujet",
        "contact.form.message": "Message",
        "contact.form.submit": "Envoyer le message",
        "contact.form.sending": "Envoi en cours…",
        "contact.form.success": "Message envoyé, merci ! Je vous réponds rapidement.",
        "contact.form.error": "Impossible d'envoyer le message. Réessayez ou écrivez-moi directement par email.",
        "contact.form.invalidName": "Merci d'indiquer votre nom.",
        "contact.form.invalidEmail": "Merci d'indiquer une adresse email valide.",
        "contact.form.invalidMessage": "Le message doit contenir au moins 10 caractères.",

        "footer.tagline": "Développeur Full Stack : applications web et mobiles, API REST et architectures MVC.",
        "footer.nav": "Navigation",
        "footer.social": "Réseaux",
        "footer.rights": "Tous droits réservés.",
        "footer.admin": "Espace administration",
        "footer.stack": "Propulsé par une API REST en Django",
        "footer.privacy": "Confidentialité"
    },

    en: {
        "meta.title": "Angelo Randrianasolo | Full Stack Developer",
        "meta.description": "Angelo Randrianasolo's portfolio, Full Stack developer: web and mobile applications, REST APIs and MVC architectures.",

        "a11y.skip": "Skip to content",
        "a11y.nav": "Main navigation",
        "a11y.footerNav": "Footer links",
        "a11y.lang": "Switch to French (FR)",
        "a11y.menu.open": "Open menu",
        "a11y.menu.close": "Close menu",
        "a11y.theme.toDark": "Switch to dark mode (🌙)",
        "a11y.theme.toLight": "Switch to light mode (☀️)",
        "a11y.top": "Back to top",
        "a11y.email": "Email Angelo",
        "a11y.phone": "Call Angelo",
        "a11y.github": "Angelo's GitHub profile",
        "a11y.linkedin": "Angelo's LinkedIn profile",

        "nav.home": "Home",
        "nav.about": "About",
        "nav.skills": "Skills",
        "nav.projects": "Projects",
        "nav.github": "GitHub",
        "nav.contact": "Contact",

        "hero.available": "Open to opportunities",
        "hero.greeting": "Hello, I'm",
        "hero.job": "Full Stack Developer",
        "hero.description": "I build web and mobile applications, documented REST APIs and maintainable MVC architectures. Currently a third-year software engineering student.",
        "hero.projects": "See my projects",
        "hero.contact": "Contact me",
        "hero.cv": "Download my CV",
        "hero.meta1": "Software engineering",
        "hero.meta2": "Web & Mobile",
        "hero.statProjects": "Projects",
        "hero.statRepos": "GitHub repos",

        "services.kicker": "Services",
        "services.title": "What I offer",
        "services.intro": "From design to production, I cover the full chain of a digital product.",
        "services.web.title": "Web applications",
        "services.web.desc": "Showcase sites, dashboards and business applications that are fast, accessible and responsive.",
        "services.web.p1": "Polished, accessible interfaces",
        "services.web.p2": "Technical SEO",
        "services.web.p3": "Containerized deployment",
        "services.mobile.title": "Mobile applications",
        "services.mobile.desc": "Cross-platform apps sharing a single codebase with their web version.",
        "services.mobile.p1": "iOS and Android",
        "services.mobile.p2": "Native, fluid interface",
        "services.mobile.p3": "Connected to your API",
        "services.api.title": "API & back-end",
        "services.api.desc": "Documented REST APIs, secure authentication, data modelling and business logic.",
        "services.api.p1": "REST and MVC design",
        "services.api.p2": "Relational databases",
        "services.api.p3": "Testing and documentation",

        "about.kicker": "About",
        "about.title": "About me",
        "about.text1": "As a Full Stack developer I build web and mobile applications end to end: interface, REST API, data modelling and deployment.",
        "about.text2": "I care deeply about architecture — a strict separation between model, view and controller — to ship codebases that are readable, testable and easy to extend.",
        "about.text3": "Currently a third-year software engineering student, I'm looking for internships, freelance work and open projects where I can add real value.",
        "about.location.label": "Location",
        "about.location.value": "Madagascar",
        "about.status.label": "Status",
        "about.status.value": "L3 student — Software engineering",
        "about.focus.label": "Focus",
        "about.focus.value": "Full Stack Developer",
        "about.availability.label": "Availability",
        "about.availability.value": "Internships & freelance",

        "parcours.title": "Background",
        "parcours.1.tag": "Current",
        "parcours.1.title": "BSc Software Engineering (L3)",
        "parcours.1.text": "Software engineering studies in Madagascar: algorithms, software architectures (MVC, REST APIs) and hands-on projects.",
        "parcours.2.tag": "Projects",
        "parcours.2.title": "Applications shipped",
        "parcours.2.text": "Meilleur-prix and Tantsaha Connect: from idea to deployment, using React / React Native, Node.js and relational databases.",
        "parcours.3.tag": "Seeking",
        "parcours.3.title": "Internship & freelance work",
        "parcours.3.text": "Available to join a team or work remotely on useful products.",

        "arch.kicker": "Methods",
        "arch.title": "Software architecture",
        "arch.intro": "The same standard on every project: clear boundaries between responsibilities, a stable API and code that lasts.",
        "arch.flowAria": "Lifecycle of a request",
        "arch.flow.1": "HTTP request",
        "arch.flow.2": "Router",
        "arch.flow.3": "Controller",
        "arch.flow.4": "Model",
        "arch.flow.5": "View / JSON",
        "arch.rest.title": "REST API",
        "arch.rest.desc": "Named resources, semantic HTTP methods, consistent status codes and predictable pagination.",
        "arch.rest.p1": "Versioned, documented endpoints",
        "arch.rest.p2": "Authentication and access control",
        "arch.rest.p3": "Validation and error handling",
        "arch.mvc.title": "Model · View · Controller",
        "arch.mvc.desc": "Business logic never depends on rendering. Each layer can be swapped without touching the others.",
        "arch.mvc.p1": "Model: data and business rules",
        "arch.mvc.p2": "View: presentation and accessibility",
        "arch.mvc.p3": "Controller: flow orchestration",
        "arch.django.title": "Django",
        "arch.django.desc": "My server-side framework of choice: a typed ORM, versioned migrations and security built in.",
        "arch.django.p1": "ORM, migrations and optimised queries",
        "arch.django.p2": "CSRF, XSS and SQL injection protection",
        "arch.django.p3": "Native administration back-office",

        "skills.kicker": "Skills",
        "skills.title": "My skills",
        "skills.frontend": "Frontend",
        "skills.backend": "Backend",
        "skills.database": "Databases",
        "skills.tools": "Tools & environments",
        "skills.architecture": "Design & architecture",

        "projects.kicker": "Projects",
        "projects.title": "My projects",
        "projects.intro": "A selection of work, updated live from my administration panel.",
        "projects.loading": "Loading projects…",
        "projects.emptyTitle": "No published project",
        "projects.empty": "Projects will appear here as soon as they are published from the admin panel.",
        "projects.unavailableTitle": "Projects unavailable",
        "projects.unavailable": "Cannot reach the API. Please try again shortly.",
        "projects.visit": "Visit site",
        "projects.code": "View code",
        "projects.featured": "Featured",
        "gallery.open": "View project photos",
        "gallery.close": "Close gallery",
        "gallery.prev": "Previous photo",
        "gallery.next": "Next photo",
        "gallery.count": "photos",

        "github.kicker": "GitHub",
        "github.title": "What I push",
        "github.intro": "Automatically synced with my GitHub profile — the most recent public repositories.",
        "github.loading": "Loading repositories…",
        "github.emptyTitle": "No repository to show",
        "github.empty": "Public repositories will appear here.",
        "github.unavailableTitle": "GitHub unavailable",
        "github.unavailable": "The GitHub API is not responding. Check my profile directly.",
        "github.view": "View my full GitHub profile",
        "github.stars": "stars",
        "github.updated": "Updated",

        "contact.kicker": "Contact",
        "contact.title": "Contact",
        "contact.subtitle": "A project idea, an opportunity or simply a question? Feel free to reach out, I always reply.",
        "contact.email.label": "Email",
        "contact.phone.label": "Phone",
        "contact.cta": "Send me an email",

        "contact.form.kicker": "Write to me",
        "contact.form.hint": "Your message lands straight in my inbox.",
        "contact.form.name": "Name",
        "contact.form.email": "Email",
        "contact.form.subject": "Subject",
        "contact.form.message": "Message",
        "contact.form.submit": "Send message",
        "contact.form.sending": "Sending…",
        "contact.form.success": "Message sent, thank you! I'll get back to you shortly.",
        "contact.form.error": "Could not send the message. Try again or email me directly.",
        "contact.form.invalidName": "Please enter your name.",
        "contact.form.invalidEmail": "Please enter a valid email address.",
        "contact.form.invalidMessage": "The message must be at least 10 characters long.",

        "footer.tagline": "Full Stack developer: web and mobile applications, REST APIs and MVC architectures.",
        "footer.nav": "Navigation",
        "footer.social": "Social",
        "footer.rights": "All rights reserved.",
        "footer.admin": "Administration panel",
        "footer.stack": "Powered by a Django REST API",
        "footer.privacy": "Privacy policy"
    }
};

let currentLanguage = "fr";

// Contenu dynamique deja charge (pour eviter un double chargement)
let projectsLoaded = false;
let currentCvUrl = null;


// ========================================
// 3. OUTILS : SECURITE ET API
// ========================================

const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
};

/** Echappe toute donnee injectee dans le DOM. */
function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
        /[&<>"']/g,
        character => HTML_ESCAPES[character]
    );
}

/** N'accepte que les URLs http(s) pour les liens sortants. */
function safeUrl(value) {
    if (!value) return null;
    try {
        const url = new URL(value, window.location.origin);
        return (url.protocol === "http:" || url.protocol === "https:")
            ? url.href
            : null;
    } catch (error) {
        return null;
    }
}

function readCookie(name) {
    const match = document.cookie.match(
        new RegExp("(^|;\\s*)" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : "";
}

/**
 * Appel d'API. Recupere le jeton CSRF avant toute mutation et
 * le renouvelle une fois si le serveur le rejette.
 */
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
        method,
        headers,
        body,
        credentials: "same-origin"
    });

    // Jeton expire ou invalide : on en demande un nouveau, une seule fois.
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
        const message = payload && payload.detail
            ? payload.detail
            : "Erreur " + response.status;
        const failure = new Error(message);
        // Conserve la reponse : le appeleant peut traduire ou classifier
        failure.payload = payload;
        failure.status = response.status;
        throw failure;
    }

    return payload;
}


// ========================================
// 4. LANGUE
// ========================================

function applyLanguage(language, save) {

    if (!translations[language]) {
        language = "fr";
    }

    currentLanguage = language;

    // Textes
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    // Libelles d'accessibilite (aria-label)
    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
        const key = element.getAttribute("data-i18n-aria");
        if (translations[language][key]) {
            element.setAttribute("aria-label", translations[language][key]);
        }
    });

    document.documentElement.lang = language;
    document.title = translations[language]["meta.title"];

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && translations[language]["meta.description"]) {
        descriptionMeta.setAttribute(
            "content",
            translations[language]["meta.description"]
        );
    }

    languageToggle.textContent = language === "fr" ? "EN" : "FR";

    updateThemeToggleLabel();

    if (save) {
        localStorage.setItem("portfolio-language", language);
    }

    // Recharge les contenus serveur dans la nouvelle langue
    if (projectsLoaded) {
        loadProjects();
    }
}

languageToggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "fr" ? "en" : "fr", true);
});

function t(key) {
    return (translations[currentLanguage] || translations.fr)[key] || key;
}


// ========================================
// 5. THEME CLAIR / SOMBRE
// ========================================

function isDarkTheme() {
    return document.documentElement.classList.contains("dark-theme");
}

function updateThemeToggleLabel() {
    const key = isDarkTheme()
        ? "a11y.theme.toLight"
        : "a11y.theme.toDark";

    themeToggle.textContent = isDarkTheme() ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", translations[currentLanguage][key]);
}

function applyTheme(theme, save) {
    const dark = theme === "dark";

    document.documentElement.classList.toggle("dark-theme", dark);

    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", dark ? "#121019" : "#f6f5fb");
    }

    updateThemeToggleLabel();

    if (save) {
        localStorage.setItem("portfolio-theme", theme);
    }
}

themeToggle.addEventListener("click", () => {
    applyTheme(isDarkTheme() ? "light" : "dark", true);
});


// ========================================
// 6. MENU MOBILE
// ========================================

function setMenuOpen(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
        "aria-label",
        translations[currentLanguage][open ? "a11y.menu.close" : "a11y.menu.open"]
    );
}

navToggle.addEventListener("click", () => {
    setMenuOpen(!navMenu.classList.contains("open"));
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        setMenuOpen(false);
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 1040 && navMenu.classList.contains("open")) {
        setMenuOpen(false);
    }
});


// ========================================
// 7. ANIMATIONS D'APPARITION AU SCROLL
// ========================================

let revealObserver = null;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
}

/** Observe les elements .reveal ajoutes dynamiquement. */
function observeReveals(root) {
    const scope = root || document;
    const elements = scope.querySelectorAll(".reveal:not(.is-visible)");

    elements.forEach(element => {
        if (revealObserver) {
            revealObserver.observe(element);
        } else {
            element.classList.add("is-visible");
        }
    });
}

observeReveals(document);


// ========================================
// 8. LIEN ACTIF AU SCROLL (scroll spy)
// ========================================

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");

if ("IntersectionObserver" in window) {

    const spyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Sections sans entree de menu : on conserve l'etat precedent
            const matching = Array.from(navLinks).filter(link =>
                link.getAttribute("href") === "#" + entry.target.id
            );

            if (matching.length === 0) return;

            navLinks.forEach(link => {
                const isActive = matching.includes(link);
                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(section => spyObserver.observe(section));
}


// ========================================
// 9. BOUTON RETOUR EN HAUT
// ========================================

backToTop.hidden = false;

const header = document.querySelector(".header");

function onScroll() {
    const y = window.scrollY;

    backToTop.classList.toggle("visible", y > 500);

    if (header) {
        header.classList.toggle("scrolled", y > 12);
    }
}

window.addEventListener("scroll", onScroll, { passive: true });

onScroll();

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });
});


// ========================================
// 10. ANNEE COURANTE DU PIED DE PAGE
// ========================================

const yearElement = document.getElementById("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ========================================
// 11. RENDU DES PROJETS
// ========================================

function projectGallery(project) {
    const urls = [];
    const cover = safeUrl(project.image);
    if (cover) urls.push(cover);

    const photos = Array.isArray(project.photos) ? project.photos : [];
    photos.forEach(photo => {
        const url = photo && safeUrl(photo.thumb || photo.url);
        if (url && !urls.includes(url)) urls.push(url);
    });
    return urls;
}

function projectCover(project, index) {
    const gallery = projectGallery(project);
    const image = gallery[0] || null;
    const category = project.category
        ? `<span class="project-category">${escapeHtml(project.category)}</span>`
        : "";
    const featured = project.is_featured
        ? `<span class="project-featured">${escapeHtml(t("projects.featured"))}</span>`
        : "";
    const topLine = (category || featured)
        ? `<div class="project-topline">${category}${featured}</div>`
        : "";
    const picture = image
        ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">`
        : `<span class="project-icon" aria-hidden="true">${escapeHtml(project.icon || "🚀")}</span>`;
    const badge = gallery.length > 1
        ? `<span class="project-gallery-badge">${gallery.length} ${escapeHtml(t("gallery.count"))}</span>`
        : "";
    const interactive = gallery.length > 1;
    const coverAttrs = interactive
        ? `role="button" tabindex="0"
           data-gallery="${escapeHtml(gallery.join("|"))}"
           aria-label="${escapeHtml(t("gallery.open"))}"`
        : `aria-hidden="true"`;

    return `
        <div class="project-cover cover-${index % 6}${interactive ? " has-gallery" : ""}" ${coverAttrs}>
            ${picture}
            <span class="project-cover-grid"></span>
            ${badge}
            ${topLine}
        </div>`;
}

function projectLinks(project) {
    const website = safeUrl(project.website_url);
    const repository = safeUrl(project.repo_url);

    if (!website && !repository) return "";

    const arrow = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    return `
        <div class="project-links">
            ${website ? `
                <a class="project-link project-link--primary"
                   href="${escapeHtml(website)}" target="_blank"
                   rel="noopener noreferrer">
                   ${escapeHtml(t("projects.visit"))}${arrow}
                </a>` : ""}
            ${repository ? `
                <a class="project-link project-link--ghost"
                   href="${escapeHtml(repository)}" target="_blank"
                   rel="noopener noreferrer">
                   ${escapeHtml(t("projects.code"))}${arrow}
                </a>` : ""}
        </div>`;
}

function projectCard(project, index) {
    const technologies = Array.isArray(project.technologies)
        ? project.technologies : [];

    return `
        <article class="project-card reveal">
            ${projectCover(project, index)}
            <div class="project-body">
                <h3>${escapeHtml(project.title)}</h3>
                <p class="project-summary">${escapeHtml(
                    project.summary || project.description || ""
                )}</p>
                ${technologies.length ? `
                    <div class="project-technologies">
                        ${technologies
                            .map(tech => `<span>${escapeHtml(tech)}</span>`)
                            .join("")}
                    </div>` : ""}
                ${projectLinks(project)}
            </div>
        </article>`;
}

function stateBlock(titleKey, messageKey) {
    return `
        <p class="projects-state">
            <strong>${escapeHtml(t(titleKey))}</strong>
            ${escapeHtml(t(messageKey))}
        </p>`;
}


// ========================================
// 11bis. GALERIE DE PHOTOS DES PROJETS
// ========================================

const galleryState = { urls: [], index: 0, root: null };

function galleryLabels() {
    const root = galleryState.root;
    if (!root) return;
    root.querySelector(".lightbox-close")
        .setAttribute("aria-label", t("gallery.close"));
    root.querySelector(".lightbox-prev")
        .setAttribute("aria-label", t("gallery.prev"));
    root.querySelector(".lightbox-next")
        .setAttribute("aria-label", t("gallery.next"));
}

function ensureGalleryRoot() {
    if (galleryState.root) return galleryState.root;

    const root = document.createElement("div");
    root.className = "lightbox";
    root.hidden = true;
    root.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Fermer">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Precedente">&#10094;</button>
        <img class="lightbox-img" alt="">
        <button type="button" class="lightbox-next" aria-label="Suivante">&#10095;</button>
        <span class="lightbox-counter" aria-live="polite"></span>`;
    document.body.appendChild(root);

    root.querySelector(".lightbox-close")
        .addEventListener("click", closeGallery);
    root.querySelector(".lightbox-prev")
        .addEventListener("click", () => stepGallery(-1));
    root.querySelector(".lightbox-next")
        .addEventListener("click", () => stepGallery(1));
    root.addEventListener("click", event => {
        if (event.target === root) closeGallery();
    });

    // Swipe tactile (mobile) : glisser a gauche = suivante.
    let touchX = null;
    root.addEventListener("touchstart", event => {
        touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    root.addEventListener("touchend", event => {
        if (touchX === null) return;
        const delta = event.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(delta) >= 45) stepGallery(delta < 0 ? 1 : -1);
    }, { passive: true });

    galleryState.root = root;
    return root;
}

function showGallerySlide() {
    const root = galleryState.root;
    if (!root) return;
    root.querySelector(".lightbox-img").src =
        galleryState.urls[galleryState.index] || "";
    root.querySelector(".lightbox-counter").textContent =
        (galleryState.index + 1) + " / " + galleryState.urls.length;
}

function openGallery(urls, index) {
    galleryState.urls = urls;
    galleryState.index = index;
    ensureGalleryRoot();
    galleryLabels();
    galleryState.root.hidden = false;
    document.body.style.overflow = "hidden";
    showGallerySlide();
    galleryState.root.querySelector(".lightbox-close").focus();
}

function stepGallery(delta) {
    const count = galleryState.urls.length;
    if (!count) return;
    galleryState.index = (galleryState.index + delta + count) % count;
    showGallerySlide();
}

function closeGallery() {
    if (!galleryState.root) return;
    galleryState.root.hidden = true;
    document.body.style.overflow = "";
}

if (projectsGrid) {
    const openGalleryFromCover = cover => {
        const urls = (cover.dataset.gallery || "").split("|").filter(Boolean);
        if (urls.length) openGallery(urls, 0);
    };

    projectsGrid.addEventListener("click", event => {
        const cover = event.target.closest(".project-cover.has-gallery");
        if (cover) openGalleryFromCover(cover);
    });

    projectsGrid.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const cover = event.target.closest(".project-cover.has-gallery");
        if (!cover) return;
        event.preventDefault();
        openGalleryFromCover(cover);
    });
}

document.addEventListener("keydown", event => {
    if (!galleryState.root || galleryState.root.hidden) return;
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") stepGallery(-1);
    if (event.key === "ArrowRight") stepGallery(1);
});

async function loadProjects() {
    if (!projectsGrid) return;

    projectsGrid.setAttribute("aria-busy", "true");

    try {
        const payload = await api(
            "/api/projects/?lang=" + encodeURIComponent(currentLanguage)
        );
        const projects = (payload && payload.results) || [];

        if (projects.length === 0) {
            projectsGrid.innerHTML = stateBlock(
                "projects.emptyTitle", "projects.empty"
            );
        } else {
            projectsGrid.innerHTML = projects.map(projectCard).join("");
            observeReveals(projectsGrid);
        }

        if (statProjects) {
            statProjects.textContent = String(projects.length);
        }

        projectsLoaded = true;

    } catch (error) {
        projectsGrid.innerHTML = stateBlock(
            "projects.unavailableTitle", "projects.unavailable"
        );
        if (statProjects) statProjects.textContent = "—";
    } finally {
        projectsGrid.setAttribute("aria-busy", "false");
    }
}


// ========================================
// 12. RENDU DES DEPOTS GITHUB
// ========================================

const REPO_ICON = `
    <svg class="repo-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0C17.3 5 18.3 5.3 18.3 5.3c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
    </svg>`;

const REPO_ARROW = `
    <svg class="repo-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

function formatRepoDate(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(currentLanguage === "fr" ? "fr-FR" : "en-GB", {
        month: "short",
        year: "numeric"
    }).format(date);
}

function repoCard(repo) {
    const url = safeUrl(repo.url);
    // Depot sans description : pas de paragraphe du tout (et non le texte
    // de l'état vide « github.empty », reserve au groupe entier).
    const description = repo.description
        ? `<p class="repo-desc">${escapeHtml(repo.description)}</p>`
        : "";

    const language = repo.language
        ? `<span><i class="repo-dot" aria-hidden="true"></i>${escapeHtml(repo.language)}</span>`
        : "";

    const stars = repo.stars > 0
        ? `<span aria-label="${repo.stars} ${escapeHtml(t("github.stars"))}">★ ${repo.stars}</span>`
        : "";

    const updated = formatRepoDate(repo.updated_at);
    const updatedBlock = updated
        ? `<span>${escapeHtml(t("github.updated"))} ${escapeHtml(updated)}</span>`
        : "";

    const inner = `
        ${REPO_ICON}
        <div class="repo-head">
            <span class="repo-name">${escapeHtml(repo.name)}</span>
        </div>
        ${description}
        <div class="repo-meta">${language}${stars}${updatedBlock}</div>
        ${REPO_ARROW}`;

    if (!url) {
        return `<article class="repo-card reveal">${inner}</article>`;
    }

    return `
        <a class="repo-card reveal" href="${escapeHtml(url)}"
           target="_blank" rel="noopener noreferrer">
            ${inner}
        </a>`;
}

async function loadGithub() {
    if (!githubGrid) return;

    githubGrid.setAttribute("aria-busy", "true");

    try {
        const payload = await api("/api/github/repos/");
        const repos = (payload && payload.results) || [];

        if (payload && payload.detail) {
            // API GitHub en panne : message explicite, reponse 200,
            // donc aucune erreur console.
            githubGrid.innerHTML = stateBlock(
                "github.unavailableTitle", "github.unavailable"
            );
            if (statRepos) statRepos.textContent = "—";
        } else if (repos.length === 0) {
            githubGrid.innerHTML = stateBlock(
                "github.emptyTitle", "github.empty"
            );
            if (statRepos) statRepos.textContent = String(repos.length);
        } else {
            githubGrid.innerHTML = repos.map(repoCard).join("");
            observeReveals(githubGrid);
            if (statRepos) statRepos.textContent = String(repos.length);
        }

    } catch (error) {
        githubGrid.innerHTML = stateBlock(
            "github.unavailableTitle", "github.unavailable"
        );
        if (statRepos) statRepos.textContent = "—";
    } finally {
        githubGrid.setAttribute("aria-busy", "false");
    }
}


// ========================================
// 13. PROFIL PUBLIC : PHOTO ET CV
// ========================================

function applyProfile(profile) {
    if (!profile) return;

    if (profile.photo && heroPhoto) {
        heroPhoto.src = safeUrl(profile.photo) || "";
        heroPhoto.hidden = false;
        const avatar = document.querySelector(".hero-avatar");
        if (avatar) avatar.classList.add("has-photo");
    }

    if (profile.has_cv && profile.cv_url && cvButton) {
        currentCvUrl = safeUrl(profile.cv_url);
        if (currentCvUrl) {
            cvButton.href = currentCvUrl;
            cvButton.hidden = false;
        }
    }
}

// Telechargement du CV : trace puis redirection
if (cvButton) {
    cvButton.addEventListener("click", async event => {
        if (!currentCvUrl) return;

        event.preventDefault();

        try {
            await api("/api/cv/download/", { method: "POST", body: {} });
        } catch (error) {
            // Le suivi est best-effort : le telechargement continue.
        }

        window.location.href = currentCvUrl;
    });
}


// ========================================
// 14. SUIVI DES VISITES
// ========================================

function trackVisit() {
    // On passe l'objet brut : `api()` ajoute alors l'en-tête
    // `Content-Type: application/json`. Un corps stringifie sans en-tête
    // serait ignore par Django et la visite serait enregistree « / ».
    const body = {
        path: window.location.pathname + window.location.search,
        referrer: document.referrer || ""
    };

    api("/api/visits/", { method: "POST", body })
        .catch(() => null);
}


// ========================================
// 14bis. FORMULAIRE DE CONTACT
// ========================================

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const contactSubmit = document.getElementById("contact-submit");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function markField(input, valid) {
    const field = input.closest(".field");
    if (field) {
        field.classList.toggle("is-invalid", !valid);
    }
    // Annonce aux lecteurs d'ecran que la valeur est refusee
    input.setAttribute("aria-invalid", String(!valid));
}

function showStatus(message, state) {
    contactStatus.textContent = message;
    contactStatus.hidden = false;
    contactStatus.classList.toggle("is-ok", state === "ok");
    contactStatus.classList.toggle("is-info", state === "info");
    contactStatus.classList.toggle("is-error", state === "error");
}

function validateContactForm() {
    const name = document.getElementById("cf-name");
    const email = document.getElementById("cf-email");
    const message = document.getElementById("cf-message");

    const nameOk = name.value.trim().length > 0;
    const emailOk = EMAIL_RE.test(email.value.trim());
    const messageOk = message.value.trim().length >= 10;

    markField(name, nameOk);
    markField(email, emailOk);
    markField(message, messageOk);

    if (nameOk && emailOk && messageOk) {
        return true;
    }

    const firstInvalid = !nameOk ? name : !emailOk ? email : message;
    showStatus(
        !nameOk ? t("contact.form.invalidName")
            : !emailOk ? t("contact.form.invalidEmail")
            : t("contact.form.invalidMessage"),
        "error"
    );
    firstInvalid.focus();
    return false;
}

async function submitContactForm(event) {
    event.preventDefault();

    // Envoi deja en cours
    if (contactSubmit.classList.contains("is-busy")) {
        return;
    }

    if (!validateContactForm()) {
        return;
    }

    const body = {
        name: document.getElementById("cf-name").value.trim(),
        email: document.getElementById("cf-email").value.trim(),
        subject: document.getElementById("cf-subject").value.trim(),
        message: document.getElementById("cf-message").value.trim(),
        // Piege a robots : champ hors ecran, jamais rempli par un humain
        website: contactForm.elements.website.value
    };

    contactSubmit.classList.add("is-busy");
    contactSubmit.disabled = true;
    showStatus(t("contact.form.sending"), "info");

    try {
        // Objet brut : `api()` fixe `Content-Type: application/json`.
        await api("/api/contact/", { method: "POST", body });
        contactForm.reset();
        contactForm.querySelectorAll(".field.is-invalid")
            .forEach(field => field.classList.remove("is-invalid"));
        contactForm.querySelectorAll("[aria-invalid]")
            .forEach(el => el.removeAttribute("aria-invalid"));
        showStatus(t("contact.form.success"), "ok");
    } catch (error) {
        // Detail renvoye par le serveur s'il y en a un ; sinon panne
        // reseau ou erreur inattendue : on affiche le message localise.
        const detail = error && error.payload && error.payload.detail;
        showStatus(detail || t("contact.form.error"), "error");
    } finally {
        contactSubmit.classList.remove("is-busy");
        contactSubmit.disabled = false;
    }
}

function setupContactForm() {
    if (!contactForm) {
        return;
    }

    contactForm.addEventListener("submit", submitContactForm);

    // L'erreur disparaît dès que le visiteur corrige le champ
    contactForm.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", () => {
            const field = input.closest(".field");
            if (field) {
                field.classList.remove("is-invalid");
            }
            input.removeAttribute("aria-invalid");
        });
    });
}


// ========================================
// 15. RESTAURATION DES PREFERENCES
// ========================================

function loadPreferences() {
    let savedTheme = null;
    let savedLanguage = null;

    try {
        savedTheme = localStorage.getItem("portfolio-theme");
        savedLanguage = localStorage.getItem("portfolio-language");
    } catch (error) {}

    if (!savedTheme) {
        savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark" : "light";
    }

    applyTheme(savedTheme, false);
    applyLanguage(savedLanguage || "fr", false);
}


// ========================================
// 16. INITIALISATION
// ========================================

async function init() {
    loadPreferences();

    // Contenu serveur — chaque appel est isole : une panne n'empeche
    // pas le reste de la page de fonctionner.
    api("/api/public/")
        .then(applyProfile)
        .catch(() => null);

    loadProjects();
    loadGithub();
    trackVisit();
    setupContactForm();
}

init();
