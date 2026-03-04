"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {API_BASE_URL} from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("username", data.username);
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Logged in");
        router.push("/problems");
      } else {
        toast.error("Invalid credentials")
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid credentials")
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center dot-grid overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm p-8">
        <h1 className="text-2xl font-bold text-center tracking-tight text-neutral-100">
          Execut<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">.</span>
        </h1>
        <p className="text-sm text-neutral-500 text-center mt-2">Log in to your account</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">Email</label>
            <input
              className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950/50 px-3 text-sm text-neutral-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-neutral-600"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">Password</label>
            <input
              className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950/50 px-3 text-sm text-neutral-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-neutral-600"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="shrink-0 flex h-10 w-full items-center justify-center rounded-md bg-neutral-100 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:bg-white hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <svg
                className="h-4 w-4 animate-spin text-neutral-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.2"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              "Login"
            )}
          </button>
          <div className="border-t border-neutral-800 pt-4 mt-1">
            <div className="flex items-baseline justify-center gap-1 text-sm text-neutral-500">
              <p>Don&apos;t have an account?</p>
              <Link href="/signup" className="font-medium text-neutral-300 hover:text-blue-400 transition-colors ease-out duration-300">
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}  
export default Login;