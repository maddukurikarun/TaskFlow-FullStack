
export default function Home() {
  const username =
    localStorage.getItem("username") ||
    sessionStorage.getItem("username") ||
    "User";

  return (
    <main className="home-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">WORKSPACE / HOME</p>
          <h1>Welcome back, {username}</h1>
          <p className="page-subtitle">
            Here's your personal workspace to plan and manage your work.
          </p>
        </div>

        <div className="home-profile-mark">
          {username.charAt(0).toUpperCase()}
        </div>
      </header>

      <section className="home-welcome-panel">
        <div className="welcome-panel-content">
          <span className="welcome-label">YOUR WORKSPACE</span>
          <h2>Make today productive.</h2>
          <p>
            Keep your work organized, focus on priorities,
            and track your progress with TaskFlow.
          </p>
        </div>

        <div className="welcome-decoration" aria-hidden="true">
          <div className="decoration-square decoration-square-one" />
          <div className="decoration-square decoration-square-two" />
          <div className="decoration-circle">✓</div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>Your workspace</h2>
            <p>Tools to help you stay organized.</p>
          </div>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <div className="home-feature-icon dashboard-feature-icon">
              ▦
            </div>
            <h3>Dashboard</h3>
            <p>
              Review your task statistics and monitor your progress.
            </p>
            <span className="feature-status">Workspace overview</span>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon tasks-feature-icon">
              ☑
            </div>
            <h3>My Tasks</h3>
            <p>
              Create tasks, set priorities, and manage your daily work.
            </p>
            <span className="feature-status">Task management</span>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon focus-feature-icon">
              ◎
            </div>
            <h3>Stay focused</h3>
            <p>
              Keep your tasks organized and work through them one by one.
            </p>
            <span className="feature-status">Personal productivity</span>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <span>TaskFlow Workspace</span>
        <span>Organize work. Make progress.</span>
      </footer>
    </main>
  );
}
