export interface LoginParams {
  username: string;
  password: string;
}

export interface Admin {
  id: string;
  username: string;
}

export interface LoginResponse {
  message: string;
  admin: Admin;
  token?: string;
}

export async function login({ username, password }: LoginParams): Promise<LoginResponse> {
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

export interface LogoutResponse {
  message: string;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Logout failed (${res.status})`);
    }
    window.location.href = '/login';

    const data = (await res.json()) as LogoutResponse;
    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
