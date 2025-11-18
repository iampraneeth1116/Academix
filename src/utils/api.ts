// ==========================
// Types
// ==========================
export interface LoginParams {
  username: string;
  password: string;
}

export interface UserPayload {
  id: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  type: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

export interface LoginResponse {
  message: string;
  user: UserPayload;
  token?: string;
}

export interface LogoutResponse {
  message: string;
}

// ==========================
// Login Function
// ==========================
export async function login({
  username,
  password,
}: LoginParams): Promise<LoginResponse> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Login failed (${res.status})`);
    }

    const data = (await res.json()) as LoginResponse;
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// ==========================
// Logout Function
// ==========================
export async function logout(): Promise<LogoutResponse> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Logout failed (${res.status})`);
    }

    // redirect after logout
    window.location.href = "/login";

    const data = (await res.json()) as LogoutResponse;
    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
