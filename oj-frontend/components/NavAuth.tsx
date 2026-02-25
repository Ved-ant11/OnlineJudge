"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchAuthStatus, logout } from '@/lib/api';
import Link from 'next/link';

export default function NavAuth() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  const syncAuth = async () => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
    const data = await fetchAuthStatus();
    if (data) {
      setUsername(data.username);
      localStorage.setItem("username", data.username);
    } else {
      setUsername(null);
      localStorage.removeItem("username");
    }
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
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('username');
    setUsername(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {username ? (
        <>
          <Link href="/profile" className="text-sm text-neutral-300 font-medium hover:text-neutral-100 transition-colors">
            {username}
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
