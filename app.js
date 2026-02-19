(() => {
  "use strict";

  // =========================
  // Session (login simulé)
  // =========================
  const KEY = "intranet_session_v1";

  const roleToLabel = {
    direction: "Direction",
    gc: "Goudalle Charpente",
    cbco: "cbco",
    gm: "Goudalle Maçonnerie",
    sylve: "SYLVE Support",
    bchdf: "BCHDF",
  };

  const roleToAllowedpages = {
    direction: ["accueil", "gc", "cbco", "gm", "sylve", "bchdf"],
    gc: ["accueil", "gc"],
    cbco: ["accueil", "cbco"],
    gm: ["accueil", "gm"],
    sylve: ["accueil", "sylve"],
    bchdf: ["accueil", "bchdf"],
  };

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(KEY, JSON.stringify(session));
  }

  function logout() {
    localStorage.removeItem(KEY);
    // depuis /pages/* on remonte d’un niveau
    window.location.href = "../index.html";
  }

  function requireAuth() {
    const s = getSession();
    if (!s || !s.role) {
      window.location.href = "../index.html";
      return null;
    }
    return s;
  }

  function pageKeyFromPath(pathname) {
    const p = pathname.toLowerCase();
    if (p.includes("accueil.html")) return "accueil";
    if (p.includes("goudalle-charpente.html")) return "gc";
    if (p.includes("cbco.html")) return "cbco";
    if (p.includes("goudalle-maconnerie.html")) return "gm";
    if (p.includes("sylve-support.html")) return "sylve";
    if (p.includes("bchdf.html")) return "bchdf";
    return null;
  }

  function enforceAccess() {
    const s = requireAuth();
    if (!s) return;

    const key = pageKeyFromPath(window.location.pathname);
    if (!key) return;

    const allowed = roleToAllowedpages[s.role] || [];
    if (!allowed.includes(key)) {
      window.location.href = "./accueil.html";
    }
  }

  function navHTML(session) {
    const allowed = roleToAllowedpages[session.role] || [];

    const links = [
      { key: "accueil", label: "Accueil général", href: "./accueil.html" },
      { key: "gc", label: "Goudalle Charpente", href: "./goudalle-charpente.html" },
      { key: "cbco", label: "cbco", href: "./cbco.html" },
      { key: "gm", label: "Goudalle Maçonnerie", href: "./goudalle-maconnerie.html" },
      { key: "sylve", label: "SYLVE Support", href: "./sylve-support.html" },
      { key: "bchdf", label: "BCHDF", href: "./bchdf.html" },
    ];

    const items = links
      .filter((l) => allowed.includes(l.key))
      .map((l) => `<a href="${l.href}">${l.label}</a>`)
      .join("");

    const who = roleToLabel[session.role] || session.role;
    const user = session.username ? `• ${session.username}` : "";

    return `
      <nav class="nav">
        ${items}
        <div class="pill">
          <span><span class="badge">${who}</span> ${user}</span>
          <button id="logoutBtn" type="button">Déconnexion</button>
        </div>
      </nav>
    `;
  }

  function mountNav() {
    const session = requireAuth();
    if (!session) return;

    const host = document.getElementById("navHost");
    if (!host) return;

    host.innerHTML = navHTML(session);

    const btn = document.getElementById("logoutBtn");
    if (btn) btn.addEventListener("click", logout);
  }

  // Expose login helper for index.html
  window.IntranetAuth = {
    login({ role, username }) {
      setSession({ role, username: username || "" });
    },
    getSession,
    logout,
  };

  // =========================
  // Logo (automatique)
  // =========================
  function setLogo() {
    const img =
  document.getElementById("companylogo") ||
  document.getElementById("companyLogo");
    if (!img) return;

    // nom de fichier actuel (ex: "cbco.html")
    const file = (window.location.pathname.split("/").pop() || "").toLowerCase();
    const sub = document.querySelector(".brand-sub");
if (sub) sub.textContent = sub.textContent + " • " + file;


    const map = {
      "accueil.html": "groupe.png",
      "goudalle-charpente.html": "goudalle-charpente.png",
      "cbco.html": "cbco.png",
      "goudalle-maconnerie.html": "goudalle-maconnerie.png",
      "sylve-support.html": "sylve-support.png",
      "bchdf.html": "bchdf.png",
    };

    const logoFile = map[file];
    if (!logoFile) {
      img.style.display = "none";
      return;
    }

    // Chemin absolu (fiable sur GitHub pages)
    const base = "/mon-site/assets/logos/" + logoFile;
// évite le cache (utile si 1 seul logo refuse de se mettre à jour)
img.src = base + "?v=" + Date.now();
    img.style.display = "block";

    img.onerror = () => {
      console.warn("logo introuvable:", img.src, "page:", file);
    };
  }

  // =========================
  // Boot (pages uniquement)
  // =========================
  if (window.location.pathname.toLowerCase().includes("/pages/")) {
    enforceAccess();
    window.addEventListener("DOMContentLoaded", () => {
      mountNav();
      setLogo();
    });
  }
})();
