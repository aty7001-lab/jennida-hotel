"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";

export default function LoginForm({ dict }: { dict: any }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(dict.error);
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-sm p-8 md:p-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="bg-indigo-50 p-3 rounded-xl inline-flex items-center justify-center mb-4">
            <LayoutGrid className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-900 mb-2">HOTEL<span className="text-indigo-600">.SYS</span></h1>
          <p className="text-sm text-slate-500">{dict.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center mb-6 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.email}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" 
              placeholder="admin@hotel.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.password}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" 
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-indigo-600 rounded-md text-white font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : dict.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
