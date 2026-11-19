
import { useEffect, useState } from "react";

import Navbar from "./Components/Navbar";
import Home from "./Components/home";
import Dashboard from "./Components/Dashboard";
import TaskList from "./Components/TaskList";
import Auth from "./Components/Auth";
import Toast from "./Components/Toast";

import { TaskProvider } from "./context/TaskContext";
import {
  ToastProvider,
  useToast,
} from "./context/ToastContext";

import "./App.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () =>
      Boolean(
        localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken")
      )
  );

  const [currentPage, setCurrentPage] = useState("home");

  const { notifications, notify, dismiss } = useToast();

  // TEMPORARY TEST: verify that notifications are displayed.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      notify(
        "Notifications are working!",
        "success",
        "Test notification"
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [notify]);

  // Handle expired authentication.
  useEffect(() => {
    function handleAuthExpired() {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("username");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");

      setIsLoggedIn(false);
      setCurrentPage("home");

      notify(
        "Your session has expired. Please log in again.",
        "warning",
        "Session expired"
      );
    }

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );
    };
  }, [notify]);

  function handleLogin() {
    setIsLoggedIn(true);
    setCurrentPage("home");

    notify(
      "Welcome to TaskFlow!",
      "success",
      "Login successful"
    );
  }

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("username");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");

    setIsLoggedIn(false);
    setCurrentPage("home");

    notify(
      "You have logged out successfully.",
      "success",
      "Logged out"
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <TaskProvider>
          <div className="app">
            <Navbar
              onLogout={handleLogout}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
            />

            {currentPage === "home" && (
              <Home onNavigate={setCurrentPage} />
            )}

            {currentPage === "dashboard" && (
              <main className="main-container">
                <section className="hero-section">
                  <h1>TaskFlow Dashboard</h1>
                  <p>
                    Organize your tasks, manage your priorities,
                    and stay productive.
                  </p>
                </section>

                <section id="dashboard">
                  <Dashboard />
                </section>
              </main>
            )}

            {currentPage === "tasks" && (
              <main className="main-container">
                <section className="hero-section">
                  <h1>My Tasks</h1>
                  <p>
                    View and manage all your tasks in one place.
                  </p>
                </section>

                <section className="tasks-section" id="tasks">
                  <TaskList />
                </section>
              </main>
            )}
          </div>
        </TaskProvider>
      ) : (
        <Auth onLogin={handleLogin} />
      )}

      <Toast
        notifications={notifications}
        onDismiss={dismiss}
      />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
