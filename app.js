(() => {
  "use strict";

  const KEY = "intranet_session_v1";

  const roleToLabel = {
    direction: "Direction",
    gc: "Goudalle Charpente",
    cbco: "CBCO",
    gm: "Goudalle Maçonnerie",
    sylve: "SYLVE Support",
    bchdf: "BCHDF",
  };

  const roleToAllowedPages = {
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

    const allowed = roleToAllowedPages[s.role] || [];
    if (!allowed.includes(key)) {
      window.location.href = "./accueil.html";
    }
  }

  function sidebarHTML(session) {
    const allowed = roleToAllowedPages[session.role] || [];
    const currentKey = pageKeyFromPath(window.location.pathname) || "";

    const links = [
      { key: "accueil", href: "./accueil.html", logo: "groupe.png", title: "accueil general" },
      { key: "gc", href: "./goudalle-charpente.html", logo: "goudalle-charpente.png", title: "goudalle charpente" },
      { key: "cbco", href: "./cbco.html", logo: "cbco.png", title: "cbco" },
      { key: "gm", href: "./goudalle-maconnerie.html", logo: "goudalle-maconnerie.png", title: "goudalle maconnerie" },
      { key: "sylve", href: "./sylve-support.html", logo: "sylve-support.png", title: "sylve support" },
      { key: "bchdf", href: "./bchdf.html", logo: "bchdf.png", title: "bchdf" },
    ];

    return links
      .filter((l) => allowed.includes(l.key))
      .map((l) => {
        const active = l.key === currentKey ? "active" : "";
        const src = "/mon-site/assets/logos/" + l.logo;
        return `<a class="sidebtn ${active}" href="${l.href}" title="${l.title}">
                  <img src="${src}" alt="${l.title}">
                </a>`;
      })
      .join("");
  }

  function mountSidebar() {
    const session = requireAuth();
    if (!session) return;

    const host = document.getElementById("navHost");
    if (!host) return;

    host.innerHTML = sidebarHTML(session);
  }

  function mountSessionBar() {
    const session = requireAuth();
    if (!session) return;

    const where = document.querySelector(".content");
    if (!where) return;

    const who = roleToLabel[session.role] || session.role;
    const user = session.username ? `• ${session.username}` : "";

    const wrap = document.createElement("div");
    wrap.className = "sessionbar";
    wrap.innerHTML = `
      <div class="pill">
        <span><span class="badge">${who}</span> ${user}</span>
        <button id="logoutBtn" type="button">deconnexion</button>
      </div>
    `;

    // insère la barre avant le <main>
    const main = where.querySelector("main");
    if (main) where.insertBefore(wrap, main);
    else where.prepend(wrap);

    const btn = document.getElementById("logoutBtn");
    if (btn) btn.addEventListener("click", logout);
  }

  function setLogo() {
    const img =
      document.getElementById("companylogo") ||
      document.getElementById("companyLogo");

    if (!img) return;

    const file = (window.location.pathname.split("/").pop() || "").toLowerCase();

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

    img.src = "/mon-site/assets/logos/" + logoFile;
    img.style.display = "block";

    img.onerror = () => {
      console.warn("logo introuvable:", img.src, "page:", file);
    };
  }

  // expose login helper for index.html
  window.IntranetAuth = {
    login({ role, username }) {
      setSession({ role, username: username || "" });
    },
    getSession,
    logout,
  };

  // pages uniquement
  if (window.location.pathname.toLowerCase().includes("/pages/")) {
    enforceAccess();
    window.addEventListener("DOMContentLoaded", () => {
      mountSidebar();
      mountSessionBar();
      setLogo();
    });
  }
})();
