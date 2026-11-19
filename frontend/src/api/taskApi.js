
const API_URL = "http://127.0.0.1:8000/api/tasks/";
const REFRESH_URL = "http://127.0.0.1:8000/api/token/refresh/";

let refreshPromise = null;

// Find which storage contains the active login.
function getAuthStorage() {
  if (localStorage.getItem("accessToken")) {
    return localStorage;
  }

  if (sessionStorage.getItem("accessToken")) {
    return sessionStorage;
  }

  if (localStorage.getItem("refreshToken")) {
    return localStorage;
  }

  if (sessionStorage.getItem("refreshToken")) {
    return sessionStorage;
  }

  return sessionStorage;
}

// Get the current access token.
function getAuthHeaders() {
  const storage = getAuthStorage();
  const token = storage.getItem("accessToken");

  return {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

// Clear authentication data from both storage locations.
function clearAuthStorage() {
  ["accessToken", "refreshToken", "username"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

// Notify the app when authentication has genuinely expired.
function notifyAuthExpired() {
  clearAuthStorage();
  window.dispatchEvent(new Event("auth-expired"));
}

// Refresh the access token using the refresh token.
async function refreshAccessToken() {
  const storage = getAuthStorage();
  const refreshToken = storage.getItem("refreshToken");

  if (!refreshToken) {
    notifyAuthExpired();
    throw new Error("Your session has expired. Please log in again.");
  }

  let response;

  try {
    response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });
  } catch {
    // A network failure does not necessarily mean the token expired.
    throw new Error(
      "Unable to refresh your session. Check your connection and try again."
    );
  }

  if (!response.ok) {
    notifyAuthExpired();
    throw new Error("Your session has expired. Please log in again.");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid refresh response.");
  }

  if (!data.access) {
    notifyAuthExpired();
    throw new Error("The server returned an invalid session token.");
  }

  storage.setItem("accessToken", data.access);

  // Support refresh-token rotation if enabled on the backend.
  if (data.refresh) {
    storage.setItem("refreshToken", data.refresh);
  }

  return data.access;
}

// Make an authenticated request and retry once after refreshing a token.
async function authorizedFetch(url, options = {}) {
  const makeRequest = () =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...getAuthHeaders(),
      },
    });

  let response = await makeRequest();

  if (response.status !== 401) {
    return response;
  }

  // Share one refresh request if multiple API calls return 401 together.
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  // If refresh fails, preserve the error rather than retrying without a token.
  await refreshPromise;

  // Retry the original request once with the refreshed access token.
  response = await makeRequest();

  // If the refreshed token is also rejected, end the session.
  if (response.status === 401) {
    notifyAuthExpired();
  }

  return response;
}

// Parse successful responses and produce readable API errors.
async function handleResponse(response, errorMessage) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const message =
      errorData.detail ||
      errorData.message ||
      (Object.keys(errorData).length > 0
        ? JSON.stringify(errorData)
        : errorMessage);

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Get all tasks belonging to the logged-in user.
export async function getTasks() {
  const response = await authorizedFetch(API_URL);

  return handleResponse(response, "Failed to fetch tasks");
}

// Create a new task.
export async function createTask(taskData) {
  const response = await authorizedFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: taskData.name,
      priority: taskData.priority,
      due_date: taskData.dueDate || null,
      completed: taskData.completed ?? false,
    }),
  });

  return handleResponse(response, "Failed to create task");
}

// Update an existing task.
export async function updateTask(taskId, taskData) {
  const response = await authorizedFetch(`${API_URL}${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: taskData.name,
      priority: taskData.priority,
      due_date: taskData.dueDate || null,
      completed: taskData.completed,
    }),
  });

  return handleResponse(response, "Failed to update task");
}

// Delete a task.
export async function deleteTask(taskId) {
  const response = await authorizedFetch(`${API_URL}${taskId}/`, {
    method: "DELETE",
  });

  return handleResponse(response, "Failed to delete task");
}

// Get task-completion statistics for the last seven days.
export async function getWeeklyProductivity() {
  const response = await authorizedFetch(
    `${API_URL}weekly-productivity/`
  );

  return handleResponse(
    response,
    "Failed to fetch weekly productivity"
  );
}

export async function getMonthlyProductivity() {
  const response = await authorizedFetch(
    `${API_URL}monthly-productivity/`
  );

  return handleResponse(
    response,
    "Failed to fetch monthly productivity"
  );
}
