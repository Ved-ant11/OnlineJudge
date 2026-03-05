"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchAuthStatus, logout } from "@/lib/api";
import Link from "next/link";

export default function NavAuth() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username");
    }
    return null;
  });

  useEffect(() => {
    let cancelled = false;

    fetchAuthStatus().then((data) => {
      if (cancelled) return;
      if (data) {
        setUsername(data.username);
        localStorage.setItem("username", data.username);
      } else {
        setUsername(null);
        localStorage.removeItem("username");
      }
    });

    const handleAuthChange = () => {
      fetchAuthStatus().then((data) => {
        if (cancelled) return;
        if (data) {
          setUsername(data.username);
          localStorage.setItem("username", data.username);
        } else {
          setUsername(null);
          localStorage.removeItem("username");
        }
      });
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };
  const handleSignup = () => {
    router.push("/signup");
  };
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("username");
    setUsername(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {username ? (
        <>
          <Link
            href="/profile"
            className="text-sm text-neutral-300 font-medium hover:text-neutral-100 transition-colors"
          >
            {username}
          </Link>
          <button
            className="px-3 py-1.5 rounded-full text-sm bg-rose-950/50 text-rose-200 border border-rose-800 hover:bg-rose-900 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className="px-3 py-1.5 rounded-full text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-all duration-200"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="px-4 py-1.5 rounded-full text-sm font-medium text-neutral-100 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 transition-all duration-200 active:scale-[0.97]"
            onClick={handleSignup}
          >
            Sign up →
          </button>
        </>
      )}
    </div>
  );
}
