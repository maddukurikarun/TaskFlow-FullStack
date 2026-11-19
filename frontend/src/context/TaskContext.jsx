
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import taskReducer from "./taskReducer";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskApi,
  getWeeklyProductivity,
  getMonthlyProductivity,
} from "../api/taskApi";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    filter: "all",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Weekly productivity state
  const [weeklyProductivity, setWeeklyProductivity] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [weeklyError, setWeeklyError] = useState("");

  // Monthly productivity state
  const [monthlyProductivity, setMonthlyProductivity] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [monthlyError, setMonthlyError] = useState("");

  // Load weekly productivity
  const loadWeeklyProductivity = useCallback(async () => {
    try {
      setWeeklyLoading(true);
      setWeeklyError("");

      const data = await getWeeklyProductivity();
      setWeeklyProductivity(data);
    } catch (err) {
      console.error("Failed to load weekly productivity:", err);
      setWeeklyError("Could not load weekly productivity.");
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  // Load monthly productivity
  const loadMonthlyProductivity = useCallback(async () => {
    try {
      setMonthlyLoading(true);
      setMonthlyError("");

      const data = await getMonthlyProductivity();
      setMonthlyProductivity(data);
    } catch (err) {
      console.error("Failed to load monthly productivity:", err);
      setMonthlyError("Could not load monthly productivity.");
    } finally {
      setMonthlyLoading(false);
    }
  }, []);

  // Refresh both productivity sections
  const refreshProductivity = useCallback(async () => {
    await Promise.all([
      loadWeeklyProductivity(),
      loadMonthlyProductivity(),
    ]);
  }, [loadWeeklyProductivity, loadMonthlyProductivity]);

  // Load tasks from Django API
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      // Support normal and paginated API responses
      const taskList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : null;

      if (!taskList) {
        throw new Error("Invalid task response from server.");
      }

      const formattedTasks = taskList.map((task) => ({
        id: task.id,
        name: task.name,
        priority: task.priority,
        dueDate: task.due_date,
        completed: task.completed,
        createdAt: task.created_at,
        completedAt: task.completed_at,
      }));

      dispatch({
        type: "LOAD_TASKS",
        payload: formattedTasks,
      });

    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Could not load tasks from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // IMPORTANT: Automatically load data when TaskProvider mounts
  useEffect(() => {
    loadTasks();
    refreshProductivity();
  }, [loadTasks, refreshProductivity]);

  // Add task
  const addTask = useCallback(
    async (taskData) => {
      const createdTask = await createTask(taskData);

      dispatch({
        type: "ADD_TASK",
        payload: {
          id: createdTask.id,
          name: createdTask.name,
          priority: createdTask.priority,
          dueDate: createdTask.due_date,
          completed: createdTask.completed,
          createdAt: createdTask.created_at,
          completedAt: createdTask.completed_at,
        },
      });

      await refreshProductivity();
    },
    [refreshProductivity]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    async (taskId) => {
      const task = state.tasks.find(
        (item) => item.id === taskId
      );

      if (!task) return;

      const updatedTask = await updateTask(taskId, {
        ...task,
        completed: !task.completed,
      });

      dispatch({
        type: "TOGGLE_TASK",
        payload: taskId,
      });

      await refreshProductivity();

      return updatedTask;
    },
    [state.tasks, refreshProductivity]
  );

  // Delete task
  const deleteTask = useCallback(
    async (taskId) => {
      await deleteTaskApi(taskId);

      dispatch({
        type: "DELETE_TASK",
        payload: taskId,
      });

      await refreshProductivity();
    },
    [refreshProductivity]
  );

  // Edit task
  const editTask = useCallback(
    async (taskId, taskData) => {
      const updatedTask = await updateTask(taskId, taskData);

      dispatch({
        type: "EDIT_TASK",
        payload: {
          id: taskId,
          name: updatedTask.name,
          priority: updatedTask.priority,
          dueDate: updatedTask.due_date,
        },
      });

      await refreshProductivity();
    },
    [refreshProductivity]
  );

  // Change filter
  const changeFilter = useCallback((newFilter) => {
    dispatch({
      type: "SET_FILTER",
      payload: newFilter,
    });
  }, []);

  // Change search
  const changeSearch = useCallback((newSearch) => {
    dispatch({
      type: "SET_SEARCH",
      payload: newSearch,
    });
  }, []);

  // Context values
  const contextValue = {
    tasks: state.tasks,

    addTask,
    toggleTask,
    deleteTask,
    editTask,

    filter: state.filter,
    changeFilter,

    search: state.search,
    changeSearch,

    loading,
    error,
    reloadTasks: loadTasks,

    weeklyProductivity,
    weeklyLoading,
    weeklyError,
    reloadWeeklyProductivity: loadWeeklyProductivity,

    monthlyProductivity,
    monthlyLoading,
    monthlyError,
    reloadMonthlyProductivity: loadMonthlyProductivity,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook
export function useTaskContext() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTaskContext must be used inside TaskProvider"
    );
  }

  return context;
}

export default TaskContext;
