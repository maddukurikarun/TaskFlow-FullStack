
function Navbar({ onLogout, currentPage, onNavigate }) {
  const username =
    localStorage.getItem("username") ||
    sessionStorage.getItem("username") ||
    "User";

  const navItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "tasks", label: "My Tasks", icon: "☷" },
  ];

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-brand"
        onClick={() => onNavigate("home")}
      >
        <span className="sidebar-logo">T</span>
        <span>TaskFlow</span>
      </button>

      <p className="sidebar-section-label">WORKSPACE</p>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${
              currentPage === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
            aria-current={
              currentPage === item.id ? "page" : undefined
            }
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <strong>{username}</strong>
            <span>Workspace member</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span aria-hidden="true">↪</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
