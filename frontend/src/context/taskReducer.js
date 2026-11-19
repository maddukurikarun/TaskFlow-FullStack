
function taskReducer(state, action) {
  switch (action.type) {

    // Load tasks from Django API
    case "LOAD_TASKS":
      return {
        ...state,
        tasks: action.payload,
      };

    // Add a new task
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    // Toggle task completion
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                completed: !task.completed,
              }
            : task
        ),
      };

    // Delete a task
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter(
          (task) => task.id !== action.payload
        ),
      };

    // Edit a task
    case "EDIT_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                name: action.payload.name,
                priority: action.payload.priority,
                dueDate: action.payload.dueDate,
              }
            : task
        ),
      };

    // Change filter
    case "SET_FILTER":
      return {
        ...state,
        filter: action.payload,
      };

    // Search tasks
    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
      };

    default:
      return state;
  }
}

export default taskReducer;
