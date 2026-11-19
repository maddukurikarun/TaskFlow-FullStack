
import { useState } from "react";
import { useTaskContext } from "../context/TaskContext";
import useToast from "../hooks/useToast";

function TaskForm({ onTaskAdded, onCancel }) {
  const { addTask } = useTaskContext();
  const { notify } = useToast();

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedName = taskName.trim();

    if (trimmedName.length < 3) {
      setError("Task name must be at least 3 characters.");
      return;
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(`${dueDate}T00:00:00`);

      if (selectedDate < today) {
        setError("Due date cannot be in the past.");
        return;
      }
    }

    try {
      setError("");
      setIsSubmitting(true);

      await addTask({
        name: trimmedName,
        priority,
        dueDate,
      });

      notify(
        `"${trimmedName}" was created successfully.`,
        "success",
        "Task created"
      );

      setTaskName("");
      setPriority("Medium");
      setDueDate("");

      onTaskAdded?.();
    } catch (err) {
      console.error("Failed to add task:", err);

      setError(
        "Could not save the task. Please check your connection and try again."
      );

      notify(
        "Could not save the task. Check your connection and try again.",
        "error",
        "Task creation failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="task-form">
      <div className="section-header">
        <h2>Add New Task</h2>
        <p>Create a task and set its priority.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="taskName">Task Name</label>
          <input
            id="taskName"
            type="text"
            placeholder="e.g. Learn React"
            value={taskName}
            disabled={isSubmitting}
            autoFocus
            onChange={(event) => {
              setTaskName(event.target.value);
              if (error) setError("");
            }}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            disabled={isSubmitting}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            disabled={isSubmitting}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        <div className="task-form-modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-task-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
