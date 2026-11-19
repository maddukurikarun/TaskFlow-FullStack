function getDueDateStatus(dueDate) {
  if (!dueDate) {
    return {
      label: "No due date",
      type: "none",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(dueDate);
  selectedDate.setHours(0, 0, 0, 0);

  const difference =
    selectedDate.getTime() - today.getTime();

  const daysDifference =
    difference / (1000 * 60 * 60 * 24);

  if (daysDifference < 0) {
    return {
      label: "Overdue",
      type: "overdue",
    };
  }

  if (daysDifference === 0) {
    return {
      label: "Due today",
      type: "today",
    };
  }

  if (daysDifference === 1) {
    return {
      label: "Due tomorrow",
      type: "tomorrow",
    };
  }

  return {
    label: `Due in ${daysDifference} days`,
    type: "upcoming",
  };
}

export default getDueDateStatus;