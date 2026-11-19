
import { useMemo } from "react";
import { useTaskContext } from "../context/TaskContext";

function Dashboard() {
  const {
    tasks = [],
    weeklyProductivity = [],
    weeklyLoading,
    weeklyError,
    reloadWeeklyProductivity,
  } = useTaskContext();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;

    const highPriority = tasks.filter(
      (task) =>
        !task.completed &&
        String(task.priority || "").toLowerCase() === "high"
    ).length;

    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(`${task.dueDate}T00:00:00`);

      return (
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < today
      );
    }).length;

    const dueToday = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(`${task.dueDate}T00:00:00`);

      return (
        !Number.isNaN(dueDate.getTime()) &&
        dueDate.getTime() === today.getTime()
      );
    }).length;

    return {
      total,
      completed,
      active,
      highPriority,
      overdue,
      dueToday,
      completionPercentage:
        total === 0
          ? 0
          : Math.round((completed / total) * 100),
    };
  }, [tasks]);

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 5),
    [tasks]
  );

  const statusChart = [
    {
      label: "Completed",
      value: analytics.completed,
      color: "completed",
    },
    {
      label: "Active",
      value: analytics.active,
      color: "active",
    },
  ];

  const priorityChart = [
    {
      label: "High",
      value: tasks.filter(
        (task) =>
          String(task.priority || "").toLowerCase() === "high"
      ).length,
      color: "high",
    },
    {
      label: "Medium",
      value: tasks.filter(
        (task) =>
          String(task.priority || "").toLowerCase() === "medium"
      ).length,
      color: "medium",
    },
    {
      label: "Low",
      value: tasks.filter(
        (task) =>
          String(task.priority || "").toLowerCase() === "low"
      ).length,
      color: "low",
    },
  ];

  const stats = [
    {
      label: "Total Tasks",
      value: analytics.total,
      icon: "▦",
      color: "blue",
      note: "All tasks in your workspace",
    },
    {
      label: "Completed",
      value: analytics.completed,
      icon: "✓",
      color: "green",
      note: "Successfully finished",
    },
    {
      label: "Active Tasks",
      value: analytics.active,
      icon: "◷",
      color: "purple",
      note: "Still in progress",
    },
    {
      label: "Overdue",
      value: analytics.overdue,
      icon: "!",
      color: "red",
      note: "Past their due date",
    },
  ];

  function renderChart(data) {
    return data.map((item) => {
      const percentage =
        analytics.total === 0
          ? 0
          : Math.round((item.value / analytics.total) * 100);

      return (
        <div className="chart-bar-item" key={item.label}>
          <div className="chart-bar-label">
            <span>
              <i
                className={`chart-legend-dot ${item.color}`}
                aria-hidden="true"
              />
              {item.label}
            </span>

            <strong>
              {item.value} ({percentage}%)
            </strong>
          </div>

          <div
            className="chart-track"
            role="progressbar"
            aria-label={`${item.label} tasks`}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`chart-fill ${item.color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    });
  }

  const maxDailyCompletions = Math.max(
    1,
    ...weeklyProductivity.map((day) => day.completed)
  );

  const weeklyTotal = weeklyProductivity.reduce(
    (total, day) => total + day.completed,
    0
  );

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="page-eyebrow">WORKSPACE / DASHBOARD</p>

          <h2>Dashboard Overview</h2>

          <p>
            Track your productivity, monitor deadlines, and stay focused.
          </p>
        </div>

        <div className="dashboard-date">
          <span className="dashboard-date-icon">◷</span>

          <div>
            <span>Today</span>

            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-card-top">
              <span className="stat-label">{stat.label}</span>
              <span className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </span>
            </div>

            <strong className="stat-number">{stat.value}</strong>

            <span className="stat-note">{stat.note}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-lower-grid">
        <section className="progress-card">
          <div className="progress-header">
            <div>
              <p className="dashboard-section-eyebrow">
                YOUR PERFORMANCE
              </p>

              <h3>Task Completion</h3>
              <p>Your overall productivity progress</p>
            </div>

            <div
              className="progress-ring"
              role="img"
              aria-label={`${analytics.completionPercentage}% of tasks completed`}
            >
              <span>{analytics.completionPercentage}%</span>
            </div>
          </div>

          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={analytics.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task completion"
          >
            <div
              className="progress-fill"
              style={{
                width: `${analytics.completionPercentage}%`,
              }}
            />
          </div>

          <div className="progress-summary">
            <span>
              <i className="summary-dot completed-dot" />
              {analytics.completed} completed
            </span>

            <span>
              <i className="summary-dot active-dot" />
              {analytics.active} remaining
            </span>
          </div>

          {analytics.total === 0 ? (
            <p className="dashboard-hint">
              Create your first task to start tracking your progress.
            </p>
          ) : analytics.completionPercentage === 100 ? (
            <p className="dashboard-success">
              Excellent work! All your tasks are completed.
            </p>
          ) : (
            <p className="dashboard-hint">
              Keep going! Every completed task moves you forward.
            </p>
          )}
        </section>

        <section className="priority-card">
          <div className="section-title-row">
            <div>
              <p className="dashboard-section-eyebrow">
                NEEDS ATTENTION
              </p>

              <h3>Priority Overview</h3>
              <p>Tasks to focus on first</p>
            </div>

            <span className="priority-indicator">!</span>
          </div>

          <div className="priority-metric">
            <strong className="priority-number">
              {analytics.highPriority}
            </strong>

            <span>High-priority tasks</span>
          </div>

          <div className="priority-divider" />

          <div className="priority-detail-row">
            <span>
              <i className="summary-dot overdue-dot" />
              Overdue tasks
            </span>

            <strong
              className={analytics.overdue > 0 ? "text-danger" : ""}
            >
              {analytics.overdue}
            </strong>
          </div>

          <div className="priority-detail-row">
            <span>
              <i className="summary-dot today-dot" />
              Due today
            </span>

            <strong>{analytics.dueToday}</strong>
          </div>

          {analytics.overdue > 0 && (
            <p className="overdue-notice">
              {analytics.overdue} overdue{" "}
              {analytics.overdue === 1 ? "task needs" : "tasks need"}{" "}
              attention.
            </p>
          )}
        </section>
      </div>

      <div className="dashboard-charts-grid">
        <section className="analytics-chart-card">
          <div className="section-title-row">
            <div>
              <p className="dashboard-section-eyebrow">
                TASK BREAKDOWN
              </p>

              <h3>Task Status</h3>
              <p>Completed versus remaining tasks</p>
            </div>
          </div>

          {renderChart(statusChart)}

          {analytics.total === 0 && (
            <p className="dashboard-hint">
              Add tasks to see your status breakdown.
            </p>
          )}
        </section>

        <section className="analytics-chart-card">
          <div className="section-title-row">
            <div>
              <p className="dashboard-section-eyebrow">
                PRIORITY BREAKDOWN
              </p>

              <h3>Tasks by Priority</h3>
              <p>Understand your workload distribution</p>
            </div>
          </div>

          {renderChart(priorityChart)}

          {analytics.total === 0 && (
            <p className="dashboard-hint">
              Add tasks to see your priority breakdown.
            </p>
          )}
        </section>
      </div>

      {/* Weekly productivity chart */}
      <section className="analytics-chart-card weekly-productivity-card">
        <div className="section-title-row">
          <div>
            <p className="dashboard-section-eyebrow">
              LAST SEVEN DAYS
            </p>

            <h3>Weekly Productivity</h3>
            <p>Tasks completed each day</p>
          </div>

          {!weeklyLoading && !weeklyError && (
            <span className="recent-task-count">
              {weeklyTotal} completed
            </span>
          )}
        </div>

        {weeklyLoading ? (
          <p className="dashboard-hint">
            Loading weekly productivity...
          </p>
        ) : weeklyError ? (
          <div className="weekly-chart-error" role="alert">
            <p className="dashboard-hint">{weeklyError}</p>

            <button
              type="button"
              onClick={reloadWeeklyProductivity}
            >
              Try Again
            </button>
          </div>
        ) : weeklyProductivity.length === 0 ? (
          <p className="dashboard-hint">
            No weekly productivity data is available yet.
          </p>
        ) : (
          <>
            <div className="weekly-chart">
              {weeklyProductivity.map((item) => {
                const height =
                  item.completed === 0
                    ? 0
                    : Math.max(
                        8,
                        (item.completed / maxDailyCompletions) * 100
                      );

                return (
                  <div
                    className="weekly-chart-column"
                    key={item.date}
                    title={`${item.date}: ${item.completed} completed`}
                  >
                    <span className="weekly-chart-count">
                      {item.completed}
                    </span>

                    <div className="weekly-chart-bar-area">
                      <div
                        className="weekly-chart-bar"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className="weekly-chart-day">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {weeklyTotal === 0 && (
              <p className="dashboard-hint">
                Complete a task to start building your weekly productivity
                history.
              </p>
            )}
          </>
        )}
      </section>

      <section className="recent-tasks-card">
        <div className="section-title-row">
          <div>
            <p className="dashboard-section-eyebrow">
              WORKSPACE ACTIVITY
            </p>

            <h3>Recent Tasks</h3>
            <p>Your latest tasks at a glance</p>
          </div>

          <span className="recent-task-count">
            {analytics.total} total
          </span>
        </div>

        {recentTasks.length === 0 ? (
          <div className="recent-empty">
            <span className="recent-empty-icon">☷</span>

            <h4>No tasks yet</h4>

            <p>
              Your tasks will appear here when you create them.
            </p>
          </div>
        ) : (
          <div className="recent-task-list">
            {recentTasks.map((task) => {
              const priority = String(
                task.priority || "Medium"
              ).toLowerCase();

              return (
                <article
                  className="recent-task-item"
                  key={task.id}
                >
                  <span
                    className={`task-status-dot ${
                      task.completed ? "is-completed" : "is-active"
                    }`}
                    aria-hidden="true"
                  />

                  <div className="recent-task-info">
                    <strong
                      className={task.completed ? "task-done" : ""}
                    >
                      {task.name}
                    </strong>

                    <span>
                      {task.dueDate
                        ? `Due ${task.dueDate}`
                        : "No due date"}
                    </span>
                  </div>

                  <span
                    className={`task-priority-badge ${priority}`}
                  >
                    {task.priority || "Medium"}
                  </span>

                  <span
                    className={`task-state-badge ${
                      task.completed ? "completed" : "pending"
                    }`}
                  >
                    <i />
                    {task.completed ? "Completed" : "Active"}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default Dashboard;
