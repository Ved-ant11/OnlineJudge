"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {API_BASE_URL} from "@/lib/api";
import Link from "next/link";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/problems");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center">
      <div className="text-2xl font-semibold text-neutral-100">Sign Up</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mt-6">
        <input className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-neutral-600" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-neutral-600" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-neutral-600" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="shrink-0 text-xs text-red-400 px-1">{error}</p>}
  
        <button
          disabled={loading}
          className="shrink-0 flex h-9 w-full items-center justify-center rounded-md bg-neutral-100 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            "Signup"
          )}
        </button>
        <p className="shrink-0 text-xs text-neutral-400 px-1">Already have an account?</p>
        <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors gap-6">
          Login
        </Link>
      </form>
    </div>
  )
}  
export default Signup;