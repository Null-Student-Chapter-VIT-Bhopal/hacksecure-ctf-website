"use client";

import { useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CTFLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const isValidVITEmail = (email) => {
    const vitEmailRegex = /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/;
    return vitEmailRegex.test(email);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter Access Key");
      return;
    }

    if (!isValidVITEmail(email)) {
      setError("Error...");
      return;
    }

    if (!password) {
      setError("Enter Cipher");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.token && data.user) {
          login(data.token, data.user);
        }
        setSuccess("Authenticated..");
        toast.success("Logged in successfully!", {
          theme: "dark",
          position: "bottom-right",
          autoClose: 3000,
        });
        router.push("/");
      } else {
        const data = await response.json();
        setError("Error...");
      }
    } catch (err) {
      toast.error("Error...", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
      });

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
              Admin Login
            </h1>
          </div>

          <p className="text-gray-400">
            Powered by Null Student Chapter VIT Bhopal
          </p>
        </div>

        <div className="bg-[#191919] backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ADMIN KEY
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xxx"
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
                ADMIN CIPHER
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="xxx"
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
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

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-900 hover:bg-red-600 disabled:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <div className="mt-6 text-center text-gray-400 text-sm">
              ⚠️ Authorized personnel only. All actions are logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
