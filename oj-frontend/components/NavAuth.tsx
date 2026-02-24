"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NavAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const syncAuth = () => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    setToken(storedToken);
    setUsername(storedUsername);
  };

  useEffect(() => {
    syncAuth();
    const handleAuthChange = () => syncAuth();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };
  const handleSignup = () => {
    router.push('/signup');
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {token ? (
        <>
          <Link href="/profile" className="text-sm text-neutral-300 font-medium hover:text-neutral-100 transition-colors">
            {username || "User"}
          </Link>
          <button
            className="px-3 py-1.5 rounded-lg text-sm bg-rose-950/50 text-rose-200 border border-rose-800 hover:bg-rose-900 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            onClick={handleSignup}
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}
