"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!res.ok) throw new Error("Logout failed");

        const data = await res.json();
        console.log("✅ Logout successful:", data.message);

        toast.success("Logged out successfully 👋");

        window.location.href = '/login';
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout");
        router.push("/login"); 
      }
    };

    logoutUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-800 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Logging you out...</p>
      </div>
    </div>
  );
}
