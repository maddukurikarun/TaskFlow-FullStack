import { useEffect, useMemo, useState } from "react";

import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

import { useTaskContext } from "../context/TaskContext";
import useFilteredTasks from "../hooks/useFilteredTasks";

function TaskList() {
  const {
    tasks,
    filter,
    changeFilter,
    search,
    changeSearch,
    loading,
    error,
    reloadTasks,
  } = useTaskContext();

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumns, setShowColumns] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    priority: true,
    dueDate: true,
    status: true,
    actions: true,
  });

  const filteredTasks = useFilteredTasks(
    tasks,
    filter,
    search,
    "newest"
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / pageSize)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowAddTask(false);
      }
    }

    if (showAddTask) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showAddTask]);

  const visibleTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const startEntry =
    filteredTasks.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endEntry = Math.min(
    currentPage * pageSize,
    filteredTasks.length
  );

  function toggleColumn(column) {
    setVisibleColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function downloadCSV() {
    const headers = [
      "ID",
      "Task Name",
      "Priority",
      "Due Date",
      "Status",
    ];

    const rows = filteredTasks.map((task) => [
      task.id,
      task.name,
      task.priority,
      task.dueDate || "",
      task.completed ? "Completed" : "Active",
    ]);

    const csvCell = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "taskflow-tasks.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // Loading state
  if (loading) {
    return (
      <div className="ops-task-page">
        <div className="ops-message ops-message-dark" role="status">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state - styled for the dark theme
  if (error) {
    return (
      <div className="ops-task-page">
        <div
          className="ops-message ops-message-dark ops-message-error"
          role="alert"
        >
          <p>Unable to load tasks: {error}</p>

          <button
            type="button"
            onClick={reloadTasks}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="ops-task-page">
      <header className="ops-page-header">
        <h2>Task Definitions</h2>
      </header>

      <div className="ops-table-panel">
        <div className="ops-toolbar">
          <div className="ops-search">
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search tasks"
              value={search}
              onChange={(event) =>
                changeSearch(event.target.value)
              }
            />

            <span aria-hidden="true">⌕</span>
          </div>

          <div className="ops-toolbar-actions">
            <select
              className="ops-page-size"
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value))
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <div className="ops-columns-wrap">
              <button
                className="ops-toolbar-button"
                type="button"
                aria-expanded={showColumns}
                onClick={() =>
                  setShowColumns((value) => !value)
                }
              >
                ☷ Edit Columns
              </button>

              {showColumns && (
                <div className="ops-columns-menu">
                  {[
                    ["id", "ID"],
                    ["name", "Task Name"],
                    ["priority", "Priority"],
                    ["dueDate", "Due Date"],
                    ["status", "Status"],
                    ["actions", "Actions"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() => toggleColumn(key)}
                        disabled={key === "name"}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              className="ops-toolbar-button"
              type="button"
              onClick={downloadCSV}
            >
              ⇩ Download
            </button>

            <button
              className="ops-add-button"
              type="button"
              title="Add task"
              aria-label="Add task"
              onClick={() => setShowAddTask(true)}
            >
              +
            </button>
          </div>
        </div>

        <div className="ops-table-scroll">
          <table className="ops-task-table">
            <thead>
              <tr>
                {visibleColumns.id && <th>ID</th>}
                {visibleColumns.name && <th>Task Name</th>}
                {visibleColumns.priority && <th>Priority</th>}
                {visibleColumns.dueDate && <th>Due Date</th>}
                {visibleColumns.status && <th>Status</th>}

                {visibleColumns.actions && (
                  <th className="ops-actions-heading">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  visibleColumns={visibleColumns}
                />
              ))}

              {visibleTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      Object.values(visibleColumns).filter(Boolean)
                        .length
                    }
                    className="ops-empty"
                  >
                    {search
                      ? "No matching tasks found."
                      : tasks.length === 0
                        ? "No tasks yet. Click + to add a task."
                        : "No tasks found on this page."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="ops-table-footer">
          <span>
            Showing {startEntry} to {endEntry} of{" "}
            {filteredTasks.length} entries
          </span>

          <nav
            className="ops-pagination"
            aria-label="Pagination"
          >
            {[
              {
                label: "<<",
                page: 1,
                disabled: currentPage === 1,
              },
              {
                label: "<",
                page: currentPage - 1,
                disabled: currentPage === 1,
              },
              {
                label: String(currentPage),
                page: currentPage,
                active: true,
                disabled: false,
              },
              {
                label: ">",
                page: currentPage + 1,
                disabled: currentPage === totalPages,
              },
              {
                label: ">>",
                page: totalPages,
                disabled: currentPage === totalPages,
              },
            ].map((item, index) => (
              <button
                key={index}
                type="button"
                className={item.active ? "active" : ""}
                disabled={item.disabled}
                onClick={() => setCurrentPage(item.page)}
                aria-current={
                  item.active ? "page" : undefined
                }
              >
                {item.label}
              </button>
            ))}
          </nav>
        </footer>
      </div>

      {showAddTask && (
        <div
          className="add-task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddTask(false);
            }
          }}
        >
          <div
            className="add-task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-modal-title"
          >
            <button
              type="button"
              className="add-task-close"
              aria-label="Close add task form"
              onClick={() => setShowAddTask(false)}
            >
              ×
            </button>

            <TaskForm
              onTaskAdded={() => setShowAddTask(false)}
              onCancel={() => setShowAddTask(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default TaskList;