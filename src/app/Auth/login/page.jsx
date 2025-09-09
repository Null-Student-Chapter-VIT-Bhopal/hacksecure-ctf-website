"use client";

import { useState, useEffect } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Flag,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CTFLogin() {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      toast.error("Already Logged In...", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
        toastId: "auth",
      });
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teamId) {
      setError("Please enter your team ID");
      return;
    }

    if (!password) {
      setError("Please enter your team password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.token && data.user) {
          login(data.token, data.user);
        }
        setSuccess("Login successful! Welcome back to HackSecure.");
        toast.success("Logged in successfully!", {
          theme: "dark",
          position: "bottom-right",
          autoClose: 3000,
          toastId: "auth",
        });
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      toast.error("Oops... Something went Wrong..", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
      });
      console.log(err);

      return;
    }

    setLoading(false);
  };

  return (
    <div className="text-white flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">
              Sign in to continue
            </h1>
          </div>

          <p className="text-gray-400">
            Powered by Null Student Chapter VIT Bhopal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#191919] backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Login Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="teamid"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                HackSecure Team ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="teamid"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="TEAM-XXXXXX"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Team Cipher
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-400">{success}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !teamId || !password}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-900 hover:bg-red-600 disabled:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <hr className="my-4 border-gray-700/50" />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-red-400 font-semibold">
                  ⚠️ Warning & Info
                </span>
              </div>
              <div className="mt-6">
                <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
                  <li>
                    Keep your Team ID and Password secret. Sharing them outside
                    your team may result in disqualification.
                  </li>
                  <li>
                    All team members must use the same credentials, including
                    the team leader.
                  </li>
                  <li>
                    Do not attempt to create new accounts. Only credentials
                    provided by the admin are valid.
                  </li>
                  <li>
                    Enter credentials exactly as provided to avoid login issues.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
