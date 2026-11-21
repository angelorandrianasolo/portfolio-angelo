/* Applique le theme (clair/sombre) avant le premier rendu pour eviter le
   flash blanc. Charge de facon bloquante dans le <head> des deux pages.

   Extrait du HTML : la Content-Security-Policy de Nginx n'autorise que
   les scripts externes (script-src 'self'), pas les scripts inline. */
(function () {
    "use strict";

    document.documentElement.classList.add("js");

    var theme = null;
    try {
        theme = localStorage.getItem("portfolio-theme");
    } catch (error) {}

    if (!theme) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    if (theme === "dark") {
        document.documentElement.classList.add("dark-theme");
    }
})();
