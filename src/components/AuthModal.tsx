import React, { useState } from "react";
import { X, Lock, User, UserPlus, LogIn, Sparkles, Check, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, isActualManager: boolean, username: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("faizan_user_accounts") || "[]");

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please enter your Full Name.");
        return;
      }

      // Check if username is 'Faizan' (case-insensitive) to prevent hijacking manager role
      if (trimmedUsername.toLowerCase() === "faizan") {
        setError("Username 'Faizan' is reserved for the Manager.");
        return;
      }

      // Check if username already exists in general users
      const exists = storedUsers.some((usr: any) => usr.username.toLowerCase() === trimmedUsername.toLowerCase());
      if (exists) {
        setError("Username already exists. Please choose a different Username.");
        return;
      }

      // Register standard user account
      const newAccount = { 
        username: trimmedUsername, 
        password: trimmedPassword, 
        fullName: fullName.trim() 
      };
      storedUsers.push(newAccount);
      localStorage.setItem("faizan_user_accounts", JSON.stringify(storedUsers));
      
      setSuccess("Account Created Successfully! Welcome to Faizan Bangles Portal.");
      setTimeout(() => {
        onLoginSuccess(fullName.trim(), false, trimmedUsername);
        onClose();
        // Reset state
        setUsername("");
        setPassword("");
        setFullName("");
        setIsSignUp(false);
      }, 1500);

    } else {
      // Logic for combined login
      let authenticated = false;
      let isActualManager = false;
      let nameToUse = "";

      // Check if entering exclusive predetermined Manager credentials
      if (trimmedUsername === "Faizan" && trimmedPassword === "Faizan@792") {
        authenticated = true;
        isActualManager = true;
        nameToUse = "Faizan Raza";
      } else {
        // Check regular user accounts
        const found = storedUsers.find(
          (usr: any) => usr.username.toLowerCase() === trimmedUsername.toLowerCase() && usr.password === trimmedPassword
        );
        if (found) {
          authenticated = true;
          isActualManager = false;
          nameToUse = found.fullName;
        }
      }

      if (authenticated) {
        if (isActualManager) {
          setSuccess("Welcome back, Manager Faizan!");
        } else {
          setSuccess(`Welcome back, ${nameToUse}!`);
        }
        
        const finalLoggedInUsername = isActualManager
          ? "Faizan"
          : (storedUsers.find(
              (usr: any) => usr.username.toLowerCase() === trimmedUsername.toLowerCase()
            )?.username || trimmedUsername);

        setTimeout(() => {
          onLoginSuccess(nameToUse, isActualManager, finalLoggedInUsername);
          onClose();
          setUsername("");
          setPassword("");
        }, 1200);
      } else {
        setError("Invalid username or password. Please verify your credentials.");
      }
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Golden container mimicking royal satin feel */}
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#dfaf37] via-[#fcd975] to-[#aa7c11] p-[3px] shadow-[0_20px_50px_rgba(184,134,11,0.4)] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="relative rounded-2xl bg-[#1c1c18] p-6 text-white text-left">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b8860b] via-[#f7d070] to-[#b8860b]" />
          
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#e8c87a] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>

          {/* Golden Header Badge */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#dfaf37] to-[#aa7c11] shadow-[0_4px_15px_rgba(223,175,55,0.4)]">
            <Sparkles className="h-7 w-7 text-[#1c1c18]" />
          </div>

          <div className="mt-4 text-center">
            <h2 id="auth-modal-title" className="font-serif text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f7d070] to-[#a0740a]">
              {isSignUp ? "Create Your Account" : "Access Portal & Sign In"}
            </h2>
            <p id="auth-modal-sub" className="mt-1 text-xs text-gray-400">
              {isSignUp 
                ? "Register a standard user account with Faizan Bangles" 
                : "Enter credentials to access your user or administrator account"
              }
            </p>
          </div>

          <form id="auth-form" onSubmit={handleAuth} className="mt-6 space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#f7d070] block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-input-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Raza"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#f7d070] block">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-input-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#f7d070] block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-sm"
                />
              </div>
            </div>

            {error && (
              <p id="auth-error-msg" className="bg-red-950/40 border border-red-500/30 text-red-400 p-2 text-xs rounded text-center flex items-center justify-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {success && (
              <p id="auth-success-msg" className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-2 text-xs rounded text-center flex items-center justify-center gap-1.5 font-medium animate-pulse">
                <Check size={14} />
                {success}
              </p>
            )}

            {/* Submit Button in Royal Gold Theme */}
            <button
              id="auth-submit-btn"
              type="submit"
              className="mt-2 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#dfaf37] via-[#fcd975] to-[#aa7c11] text-[#1c1c18] font-bold text-sm tracking-wide shadow-lg hover:shadow-[#dfaf37]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSignUp ? (
                <>
                  <UserPlus size={16} />
                  <span>CREATE ACCOUNT</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>LOGIN</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle SignUp / LogIn Footer */}
          <div className="mt-5 text-center text-xs">
            <span className="text-gray-400">
              {isSignUp ? "Already have an account?" : "New to this platform?"}
            </span>{" "}
            <button
              id="auth-toggle-view"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-[#f7d070] hover:underline font-semibold cursor-pointer"
            >
              {isSignUp ? "Log In here" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
