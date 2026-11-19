
import { memo, useState } from "react";
import { useTaskContext } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import getDueDateStatus from "../utils/dueDateUtils";

function TaskItem({ task, visibleColumns = {} }) {
  const { toggleTask, deleteTask, editTask } = useTaskContext();
  const { notify } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const dueDateStatus = getDueDateStatus(task.dueDate);

  const columns = {
    id: true,
    name: true,
    priority: true,
    dueDate: true,
    status: true,
    actions: true,
    ...visibleColumns,
  };

  const priorityClass = String(task.priority || "low").toLowerCase();
  const isCompleted = Boolean(task.completed);

  async function handleSave() {
    const trimmedName = editName.trim();

    if (trimmedName.length < 3) {
      setActionError("Task name must contain at least 3 characters.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      await editTask(task.id, {
        name: trimmedName,
        priority: editPriority,
        dueDate: editDueDate || null,
        completed: task.completed,
      });

      setIsEditing(false);

      notify(
        `"${trimmedName}" was updated successfully.`,
        "success",
        "Task updated"
      );
    } catch (error) {
      console.error("Failed to update task:", error);
      setActionError("Could not update the task. Please try again.");

      notify(
        "Could not update the task. Please try again.",
        "error",
        "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      setActionError("");

      await deleteTask(task.id);

      setShowDeleteConfirm(false);

      notify(
        `"${task.name}" was deleted successfully.`,
        "success",
        "Task deleted"
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
      setActionError("Could not delete the task. Please try again.");

      notify(
        "Could not delete the task. Please try again.",
        "error",
        "Deletion failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    try {
      setSaving(true);
      setActionError("");

      await toggleTask(task.id);

      notify(
        isCompleted
          ? `"${task.name}" is now active.`
          : `"${task.name}" was marked as completed.`,
        "success",
        isCompleted ? "Task reopened" : "Task completed"
      );
    } catch (error) {
      console.error("Failed to update completion:", error);
      setActionError("Could not update task status. Please try again.");

      notify(
        "Could not update task status. Please try again.",
        "error",
        "Status update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setEditName(task.name);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || "");
    setActionError("");
    setShowDeleteConfirm(false);
    setIsEditing(true);
  }

  function cancelEdit() {
    setEditName(task.name);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || "");
    setActionError("");
    setIsEditing(false);
  }

  return (
    <>
      <tr
        className={`ops-task-row ${
          isCompleted ? "ops-task-completed" : "ops-task-active"
        } ${isEditing ? "ops-task-editing" : ""}`}
      >
        {columns.id && (
          <td className="ops-id-cell">
            <span className="ops-task-id">
              <span
                className={`ops-status-dot ${
                  isCompleted ? "completed" : "active"
                }`}
                aria-hidden="true"
              />
              {`TSK${String(task.id).padStart(3, "0")}`}
            </span>
          </td>
        )}

        {columns.name && (
          <td className="ops-name-cell">
            {isEditing ? (
              <input
                className="ops-edit-input"
                type="text"
                aria-label="Task name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                disabled={saving}
              />
            ) : (
              <span className="ops-task-name">{task.name}</span>
            )}

            {actionError && (
              <p className="ops-action-error" role="alert">
                {actionError}
              </p>
            )}
          </td>
        )}

        {columns.priority && (
          <td className="ops-priority-cell">
            {isEditing ? (
              <select
                className="ops-edit-input"
                aria-label="Task priority"
                value={editPriority}
                onChange={(event) => setEditPriority(event.target.value)}
                disabled={saving}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            ) : (
              <span
                className={`ops-priority ops-priority-${priorityClass}`}
              >
                <span
                  className="ops-priority-indicator"
                  aria-hidden="true"
                />
                {task.priority}
              </span>
            )}
          </td>
        )}

        {columns.dueDate && (
          <td className="ops-due-date-cell">
            {isEditing ? (
              <input
                className="ops-edit-input"
                type="date"
                aria-label="Task due date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
                disabled={saving}
              />
            ) : (
              <span
                className={`ops-due-date due-${dueDateStatus.type}`}
              >
                {task.dueDate || dueDateStatus.label}
              </span>
            )}
          </td>
        )}

        {columns.status && (
          <td className="ops-status-cell">
            <span
              className={`ops-status-badge ${
                isCompleted ? "ops-status-completed" : "ops-status-active"
              }`}
            >
              <span className="ops-status-indicator" aria-hidden="true" />
              {isCompleted ? "Completed" : "Active"}
            </span>
          </td>
        )}

        {columns.actions && (
          <td className="ops-actions-cell">
            <div className="ops-row-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="ops-icon-button ops-save"
                    title="Save changes"
                    aria-label="Save changes"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "…" : "✓"}
                  </button>

                  <button
                    type="button"
                    className="ops-icon-button ops-cancel"
                    title="Cancel editing"
                    aria-label="Cancel editing"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="ops-icon-button ops-edit"
                    title="Edit task"
                    aria-label={`Edit ${task.name}`}
                    onClick={startEdit}
                    disabled={saving}
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    className="ops-icon-button ops-delete"
                    title="Delete task"
                    aria-label={`Delete ${task.name}`}
                    onClick={() => {
                      setActionError("");
                      setShowDeleteConfirm(true);
                    }}
                    disabled={saving}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="ops-icon-button ops-complete"
                    title={isCompleted ? "Mark as active" : "Mark as completed"}
                    aria-label={
                      isCompleted ? "Undo completion" : "Complete task"
                    }
                    onClick={handleToggle}
                    disabled={saving}
                  >
                    {isCompleted ? "↶" : "✓"}
                  </button>
                </>
              )}
            </div>
          </td>
        )}
      </tr>

      {showDeleteConfirm && (
        <tr className="ops-confirm-row">
          <td colSpan={Object.values(columns).filter(Boolean).length}>
            <div
              className="ops-delete-confirm"
              role="alertdialog"
              aria-label="Confirm task deletion"
            >
              <span>
                Delete "{task.name}"? This action cannot be undone.
              </span>

              <button
                type="button"
                className="ops-confirm-delete-button"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>

              <button
                type="button"
                className="ops-cancel-delete-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default memo(TaskItem);
