const AUTH_URL = "http://127.0.0.1:8000/api/";

export async function registerUser(userData) {
  const response = await fetch(`${AUTH_URL}register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function loginUser(username, password) {
  const response = await fetch(`${AUTH_URL}login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || JSON.stringify(data)
    );
  }

  return data;
}