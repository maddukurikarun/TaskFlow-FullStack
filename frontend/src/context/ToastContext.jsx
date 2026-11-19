
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = "success", title) => {
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
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
