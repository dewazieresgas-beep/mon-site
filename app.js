(function () {
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
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
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
    if (!s || !s.role) window.location.href = "../index.html";
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
    const key = pageKeyFromPath(window.location.pathname);
    if (!key) return;

    const allowed = roleToAllowedPages[s.role] || [];
    if (!allowed.includes(key)) {
      // Redirige vers l'accueil si pas autorisé
      window.location.href = "./accueil.html";
    }
  }

  function navHTML(session) {
    const allowed = roleToAllowedPages[session.role] || [];

    const links = [
      { key: "accueil", label: "Accueil général", href: "./accueil.html" },
      { key: "gc", label: "Goudalle Charpente", href: "./goudalle-charpente.html" },
      { key: "cbco", label: "CBCO", href: "./cbco.html" },
      { key: "gm", label: "Goudalle Maçonnerie", href: "./goudalle-maconnerie.html" },
      { key: "sylve", label: "SYLVE Support", href: "./sylve-support.html" },
      { key: "bchdf", label: "BCHDF", href: "./bchdf.html" },
    ];

    const filtered = links.filter(l => allowed.includes(l.key));
    const items = filtered.map(l => `<a href="${l.href}">${l.label}</a>`).join("");

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

  // Auto-protect pages
  if (window.location.pathname.includes("/pages/")) {
    enforceAccess();
    window.addEventListener("DOMContentLoaded", mountNav);
  }
})();
