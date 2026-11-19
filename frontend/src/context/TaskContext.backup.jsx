
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

import taskReducer from "./taskReducer";
import useLocalStorage from "../hooks/useLocalStorage";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  // Get saved tasks from localStorage
  const [savedTasks, setSavedTasks] = useLocalStorage(
    "taskflow-tasks",
    []
  );

  const [state, dispatch] = useReducer(
    taskReducer,
    {
      tasks: savedTasks,
      filter: "all",
      search: "",
    }
  );

  // Save tasks whenever state.tasks changes
  useEffect(() => {
    setSavedTasks(state.tasks);
  }, [state.tasks, setSavedTasks]);

  const addTask = useCallback((taskData) => {
    const newTask = {
      id: Date.now(),
      name: taskData.name,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      completed: false,
    };

    dispatch({
      type: "ADD_TASK",
      payload: newTask,
    });
  }, []);

  const toggleTask = useCallback((taskId) => {
    dispatch({
      type: "TOGGLE_TASK",
      payload: taskId,
    });
  }, []);

  const deleteTask = useCallback((taskId) => {
    dispatch({
      type: "DELETE_TASK",
      payload: taskId,
    });
  }, []);

const editTask = useCallback(
  (taskId, taskData) => {
    dispatch({
      type: "EDIT_TASK",
      payload: {
        id: taskId,
        name: taskData.name,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      },
    });
  },
  []
);

  const changeFilter = useCallback(
    (newFilter) => {
      dispatch({
        type: "SET_FILTER",
        payload: newFilter,
      });
    },
    []
  );

  const changeSearch = useCallback(
    (newSearch) => {
      dispatch({
        type: "SET_SEARCH",
        payload: newSearch,
      });
    },
    []
  );

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
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

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