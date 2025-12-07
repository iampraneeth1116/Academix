"use client";

import { useState } from "react";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { login } from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Selected role
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo credentials
  const DEMO = {
    admin: { username: "admin1", password: "admin@1" },
    teacher: { username: "teacher1", password: "teacher123" },
    student: { username: "student1", password: "student123" },
  };

  const fillDemo = () => {
    setUsername(DEMO[role].username);
    setPassword(DEMO[role].password);
    setError("");
    toast(`Demo credentials for ${role} filled ✨`, { icon: "🎉" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ username, password });

      toast.success("Login successful 🎉");

      const user = res.user; // ✅ FIX: now TypeScript knows user exists

      setTimeout(() => {
        if (user.role === "ADMIN") router.push("/admin");
        if (user.role === "TEACHER") router.push("/teacher");
        if (user.role === "STUDENT") router.push("/student");
      }, 800);

    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ROLE NAVBAR */}
        <div className="flex justify-around mb-6">
          {/* {(["admin", "teacher", "student"] as const).map((r) => ( */}
          {(["admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-lg font-medium ${
                role === r ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {role.charAt(0).toUpperCase() + role.slice(1)} Login
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Demo credentials ({role}):
            </p>
            <p className="text-xs text-gray-600">
              <b>Username:</b> {DEMO[role].username}
            </p>
            <p className="text-xs text-gray-600">
              <b>Password:</b> {DEMO[role].password}
            </p>

            <button
              onClick={fillDemo}
              className="mt-3 w-full text-xs font-medium border py-1.5 rounded"
            >
              Use demo credentials
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
