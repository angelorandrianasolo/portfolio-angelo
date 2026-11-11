
// ========================================
// 1. SELECTION DES ELEMENTS HTML
// ========================================

const themeToggle = document.getElementById("theme-toggle");
const languageToggle = document.getElementById("language-toggle");


// ========================================
// 2. TRADUCTIONS FRANCAIS / ANGLAIS
// ========================================

const translations = {

    fr: {
        "nav.home": "Accueil",
        "nav.about": "À propos",
        "nav.skills": "Compétences",
        "nav.projects": "Projets",
        "nav.contact": "Contact",

        "hero.greeting": "Bonjour, je suis",
        "hero.job": "Développeur Full Stack",
        "hero.description": "Étudiant en génie logiciel, passionné par le développement web, les nouvelles technologies et la cybersécurité.",
        "hero.projects": "Découvrir mes projets",
        "hero.contact": "Me contacter",

        "about.title": "À propos de moi",
        "skills.title": "Mes compétences",
        "projects.title": "Mes projets",
        "contact.title": "Contact"
    },

    en: {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.skills": "Skills",
        "nav.projects": "Projects",
        "nav.contact": "Contact",

        "hero.greeting": "Hello, I'm",
        "hero.job": "Full Stack Developer",
        "hero.description": "Software engineering student passionate about web development, new technologies and cybersecurity.",
        "hero.projects": "Discover my projects",
        "hero.contact": "Contact me",

        "about.title": "About me",
        "skills.title": "My skills",
        "projects.title": "My projects",
        "contact.title": "Contact"
    }
};


// ========================================
// 3. CHANGEMENT DE LANGUE
// ========================================

function changeLanguage(language) {

    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach(element => {

        const key = element.getAttribute("data-i18n");

        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }

    });

    document.documentElement.lang = language;

    languageToggle.textContent = language === "fr" ? "EN" : "FR";

    localStorage.setItem("portfolio-language", language);
}


// Clic sur le bouton de langue

languageToggle.addEventListener("click", () => {

    const currentLanguage =
        localStorage.getItem("portfolio-language") || "fr";

    const newLanguage = currentLanguage === "fr" ? "en" : "fr";

    changeLanguage(newLanguage);

});


// ========================================
// 4. CHANGEMENT DE THEME
// ========================================

function changeTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark-theme");

        themeToggle.textContent = "☀️";

    } else {

        document.body.classList.remove("dark-theme");

        themeToggle.textContent = "🌙";

    }

    localStorage.setItem("portfolio-theme", theme);
}


// Clic sur le bouton de thème

themeToggle.addEventListener("click", () => {

    const isDark = document.body.classList.contains("dark-theme");

    const newTheme = isDark ? "light" : "dark";

    changeTheme(newTheme);

});


// ========================================
// 5. RESTAURATION DES PREFERENCES
// ========================================

function loadPreferences() {

    const savedTheme =
        localStorage.getItem("portfolio-theme") || "light";

    const savedLanguage =
        localStorage.getItem("portfolio-language") || "fr";

    changeTheme(savedTheme);

    changeLanguage(savedLanguage);

}


// ========================================
// 6. INITIALISATION
// ========================================

loadPreferences();