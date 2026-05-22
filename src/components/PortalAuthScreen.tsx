import React, { useState } from "react";
import { Lock, User, UserPlus, LogIn, Sparkles, Check, AlertCircle, Crown, Phone } from "lucide-react";

interface PortalAuthScreenProps {
  onLoginSuccess: (name: string, isActualManager: boolean, username: string) => void;
  logoUrl: string;
}

export default function PortalAuthScreen({ onLoginSuccess, logoUrl }: PortalAuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logHistoryEvent = (event: {
    fullName: string;
    username: string;
    password?: string;
    phoneNumber?: string;
    eventType: "signup" | "login";
  }) => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem("faizan_auth_history") || "[]");
      const newHistoryItem = {
        id: "hist_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        fullName: event.fullName,
        username: event.username,
        password: event.password || "",
        phoneNumber: event.phoneNumber || "",
        timestamp: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        eventType: event.eventType,
      };
      savedHistory.unshift(newHistoryItem);
      localStorage.setItem("faizan_auth_history", JSON.stringify(savedHistory));
    } catch (err) {
      console.error("Failed to log auth event history", err);
    }
  };

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
      if (!phoneNumber.trim()) {
        setError("Please enter your Mobile Number.");
        return;
      }

      // Check if username is 'Faizan' (case-insensitive) to prevent hijacking manager role
      if (trimmedUsername.toLowerCase() === "faizan") {
        setError("Username 'Faizan' is reserved for the Manager.");
        return;
      }

      // Check if username already exists in general users
      const exists = storedUsers.some(
        (usr: any) => usr.username.toLowerCase() === trimmedUsername.toLowerCase()
      );
      if (exists) {
        setError("Username already exists. Please choose a different Username.");
        return;
      }

      // Register standard user account
      const newAccount = {
        username: trimmedUsername,
        password: trimmedPassword,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      };
      storedUsers.push(newAccount);
      localStorage.setItem("faizan_user_accounts", JSON.stringify(storedUsers));

      // Log signup event in audit history
      logHistoryEvent({
        fullName: fullName.trim(),
        username: trimmedUsername,
        password: trimmedPassword,
        phoneNumber: phoneNumber.trim(),
        eventType: "signup",
      });

      setSuccess("Account Created Successfully! Unlocking portal access...");
      setTimeout(() => {
        onLoginSuccess(fullName.trim(), false, trimmedUsername);
        // Reset inputs
        setUsername("");
        setPassword("");
        setFullName("");
        setPhoneNumber("");
        setIsSignUp(false);
      }, 1500);

    } else {
      // Logic for login
      let authenticated = false;
      let isActualManager = false;
      let nameToUse = "";
      let phoneToUse = "";

      // Check if entering exclusive predetermined Manager credentials
      if (trimmedUsername.toLowerCase() === "faizan" && trimmedPassword === "Faizan@792") {
        authenticated = true;
        isActualManager = true;
        nameToUse = "Faizan Raza";
        phoneToUse = "Manager Main Line";
      } else {
        // Check regular user accounts
        const found = storedUsers.find(
          (usr: any) =>
            usr.username.toLowerCase() === trimmedUsername.toLowerCase() &&
            usr.password === trimmedPassword
        );
        if (found) {
          if (found.isSuspended) {
            setError("🔴 ACCESS DENIED! Your account is SUSPENDED count by Manager Faizan Raza. Please contact the manager to ACTIVATE your account.");
            return;
          }
          authenticated = true;
          isActualManager = false;
          nameToUse = found.fullName;
          phoneToUse = found.phoneNumber || "No Phone Registered";
        }
      }

      if (authenticated) {
        const finalLoggedInUsername = isActualManager
          ? "Faizan"
          : (storedUsers.find(
              (usr: any) => usr.username.toLowerCase() === trimmedUsername.toLowerCase()
            )?.username || trimmedUsername);

        // Log successful login event in audit history
        logHistoryEvent({
          fullName: nameToUse,
          username: finalLoggedInUsername,
          password: trimmedPassword,
          phoneNumber: phoneToUse,
          eventType: "login",
        });

        if (isActualManager) {
          setSuccess("Welcome back, Manager Faizan! Initializing secure editor mode...");
        } else {
          setSuccess(`Welcome back, ${nameToUse}! Opening factory catalog...`);
        }

        setTimeout(() => {
          onLoginSuccess(nameToUse, isActualManager, finalLoggedInUsername);
          setUsername("");
          setPassword("");
        }, 1200);
      } else {
        setError("Invalid username or password. Please verify your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfaf37] via-[#f7d070] to-[#b8860b] text-[#1c1c18] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#1c1a14] selection:text-[#fcd975]">
      {/* Decorative Golden Ambient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/25 pointer-events-none" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#dfaf37] via-[#fcd975] to-[#aa7c11] p-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.55)] z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative rounded-3xl bg-[#1c1c18] p-6 sm:p-8 text-white text-left">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b8860b] via-[#f7d070] to-[#b8860b]" />

          {/* Logo container */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dfaf37] via-[#fcd975] to-[#aa7c11] shadow-[0_4px_20px_rgba(223,175,55,0.4)] overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Crown className="h-8 w-8 text-[#1c1c18]" />
            )}
          </div>

          <div className="mt-5 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-[#fcd975] to-[#dfaf37] uppercase">
              FAIZAN BANGLES
            </h2>
            <div className="mt-1 flex items-center justify-center gap-1">
              <span className="h-1 w-12 bg-gradient-to-r from-transparent to-[#dfaf37]" />
              <span className="text-[10px] text-[#e8c87a] uppercase tracking-[0.2em] font-black">
                Official Factory Portal
              </span>
              <span className="h-1 w-12 bg-gradient-to-l from-transparent to-[#dfaf37]" />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {isSignUp
                ? "Register below to browse available glass colors and monitor machine states"
                : "Please login with your username and password to enter the application"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-[#f7d070] tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Muhammad Raza"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-[#f7d070] tracking-wider block">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-[#f7d070] tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isSignUp ? "Choose Username" : "Enter Username"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-[#f7d070] tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Choose Password" : "Enter Password"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2b2b23] border border-[#d4af37]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 font-bold animate-pulse">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Login button in royal theme with custom offset shadow */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#dfaf37] via-[#fcd975] to-[#aa7c11] text-[#1c1c18] font-black text-xs uppercase tracking-widest shadow-xl hover:brightness-110 hover:shadow-[#dfaf37]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSignUp ? (
                <>
                  <UserPlus size={15} />
                  <span>Create Account &amp; Login</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Enter Factory App</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <span className="text-gray-400">
              {isSignUp ? "Already registered on this phone?" : "Don't have an account yet?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-[#fcd975] hover:underline font-extrabold uppercase tracking-wider text-[10px] cursor-pointer"
            >
              {isSignUp ? "Sign In Click Here" : "Create Account Click Here"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding Label */}
      <p className="mt-6 text-[10px] text-black/60 font-serif font-black uppercase tracking-widest">
        © Faizan Bangles. High Performance Glass & Piling App.
      </p>
    </div>
  );
}
