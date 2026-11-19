import { useMemo } from "react";

function useFilteredTasks(
  tasks,
  filter,
  search,
  sortBy
) {
  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed);

      const matchesSearch = task.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.id - a.id;

        case "oldest":
          return a.id - b.id;

        case "priority": {
          const priorityOrder = {
            High: 3,
            Medium: 2,
            Low: 1,
          };

          return (
            priorityOrder[b.priority] -
            priorityOrder[a.priority]
          );
        }

        case "dueDate": {
          if (!a.dueDate && !b.dueDate) {
            return 0;
          }

          if (!a.dueDate) {
            return 1;
          }

          if (!b.dueDate) {
            return -1;
          }

          return (
            new Date(a.dueDate) -
            new Date(b.dueDate)
          );
        }

        default:
          return 0;
      }
    });
  }, [tasks, filter, search, sortBy]);

  return filteredTasks;
}

export default useFilteredTasks;
