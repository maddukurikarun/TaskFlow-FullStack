
import { useEffect } from "react";

function Toast({ notifications = [], onDismiss }) {
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return window.setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration || 3500);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type || "success"}`}
          role={notification.type === "error" ? "alert" : "status"}
          aria-live={notification.type === "error" ? "assertive" : "polite"}
        >
          <span className="toast-icon" aria-hidden="true">
            {notification.type === "error"
              ? "!"
              : notification.type === "warning"
                ? "⚠"
                : "✓"}
          </span>

          <div className="toast-content">
            <strong>
              {notification.title ||
                (notification.type === "error" ? "Something went wrong" : "Success")}
            </strong>
            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
