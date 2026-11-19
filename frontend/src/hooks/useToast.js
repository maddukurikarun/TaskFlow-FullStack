
import { useCallback, useState } from "react";

function useToast() {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback(
    (message, type = "success", title) => {
      const id = `${Date.now()}-${Math.random()}`;

      setNotifications((current) => [
        ...current,
        {
          id,
          message,
          type,
          title,
          duration: type === "error" ? 5000 : 3500,
        },
      ]);

      return id;
    },
    []
  );

  const dismiss = useCallback((id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  return { notifications, notify, dismiss };
}

export default useToast;
