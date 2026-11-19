
import { useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    if (isRegister && !cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (isRegister && password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerUser({
          username: cleanUsername,
          email: cleanEmail,
          password,
        });

        setMessage("Account created successfully! Please log in.");
        setIsRegister(false);
        setPassword("");
        setEmail("");
      } else {
        const data = await loginUser(cleanUsername, password);

        // Clear any previous login session.
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("username");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");

        // Remember Me determines where login details are stored.
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("accessToken", data.access);
        storage.setItem("refreshToken", data.refresh);
        storage.setItem("username", cleanUsername);

        onLogin();
      }
    } catch (err) {
      let errorMessage = err.message || "Something went wrong.";

      // Convert Django/API validation responses into readable messages.
      try {
        const details = JSON.parse(errorMessage);

        if (typeof details === "string") {
          errorMessage = details;
        } else if (details.detail) {
          errorMessage = details.detail;
        } else if (details.non_field_errors) {
          errorMessage = details.non_field_errors.join(" ");
        } else {
          const firstField = Object.keys(details)[0];
          const firstError = firstField ? details[firstField] : null;

          if (firstError) {
            errorMessage = Array.isArray(firstError)
              ? firstError.join(" ")
              : String(firstError);
          }
        }
      } catch {
        // Keep the original message if it isn't JSON.
      }

      if (
        errorMessage.toLowerCase().includes("no active account") ||
        errorMessage.toLowerCase().includes("credentials")
      ) {
        errorMessage = "Invalid username or password. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError("");
    setMessage("");
    setPassword("");
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>TaskFlow</h1>

        <p>
          {isRegister
            ? "Create your account"
            : "Sign in to manage your tasks"}
        </p>

        <label htmlFor="username">
          Username <span className="required-mark">*</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder="Enter your username"
          required
        />

        {isRegister && (
          <>
            <label htmlFor="email">
              Email <span className="required-mark">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </>
        )}

        <label htmlFor="password">
          Password <span className="required-mark">*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder={
            isRegister ? "Create a password" : "Enter your password"
          }
          minLength={isRegister ? 8 : undefined}
          required
        />

        {!isRegister && (
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember Me</span>
          </label>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="auth-success" role="status">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create Account"
              : "Log In"}
        </button>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to TaskFlow?"}{" "}
          <button
            type="button"
            className="auth-link"
            onClick={switchMode}
          >
            {isRegister ? "Log in" : "Register"}
          </button>
        </p>

        <p className="auth-required-note">
          <span className="required-mark">*</span> Required fields
        </p>
      </form>
    </div>
  );
}
