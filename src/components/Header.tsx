import React from "react";
import { Crown, ArrowDownToLine, Camera, Trash2, Copy, Check, MessageSquare } from "lucide-react";

interface HeaderProps {
  isManager: boolean;
  managerName: string | null;
  currentUser: string | null;
  logoUrl: string;
  onUpdateLogo: (newLogo: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onDownloadClick: () => void;
  onChatOrderClick: (tab: "SELECT" | "CHAT" | "ORDER") => void;
  onCalculatorClick: () => void;
}

export default function Header({
  isManager,
  managerName,
  currentUser,
  logoUrl,
  onUpdateLogo,
  onLoginClick,
  onLogoutClick,
  onDownloadClick,
  onChatOrderClick,
  onCalculatorClick,
}: HeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Dynamic discovery of the real-world deployed/preview URL of our application to keep things robust
  const appUrl = typeof window !== "undefined" ? window.location.href : "https://faizanbangles.web.app";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Failed to copy link directly from header", err);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setLogoError("Please select a valid image file.");
        setTimeout(() => setLogoError(null), 4000);
        return;
      }
      if (file.size > 1.2 * 1024 * 1024) {
        setLogoError("Image is too large. Please select a logo below 1.2MB for local storage saves.");
        setTimeout(() => setLogoError(null), 4000);
        return;
      }
      setLogoError(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpdateLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateLogo("");
  };

  return (
    <header 
      id="faizan-bangles-header"
      className="relative overflow-hidden w-full bg-gradient-to-r from-[#1e1d17] via-[#2d281a] to-[#1e1d17] border-b border-[#dfaf37]/30 shadow-md py-4 px-6 text-white"
    >
      {/* Visual glowing satin backdrop effect */}
      <div className="absolute top-0 right-1/4 w-96 h-20 bg-[#dfaf37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-20 bg-[#fcd975]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative top gold line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#b8860b] via-[#f7d070] to-[#b8860b]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Elegant Royal Branding with Customizable Logo */}
        <div className="flex items-center gap-3 select-none">
          
          {/* Logo container. If manager is active, it acts as an upload target */}
          <div 
            onClick={() => isManager && fileInputRef.current?.click()}
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#dfaf37] via-[#f7d070] to-[#aa7c11] shadow-[0_0_15px_rgba(223,175,55,0.4)] overflow-hidden ${
              isManager ? "cursor-pointer group/logo" : ""
            }`}
            title={isManager ? "Manager: Click to set custom App Logo" : "Faizan Bangles Logo"}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="App Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Crown className="h-6.5 w-6.5 text-[#1c1c18]" />
            )}

            {/* Manager Camera upload overlay */}
            {isManager && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-all flex flex-col items-center justify-center">
                <Camera size={14} className="text-[#fcd975] animate-pulse" />
                <span className="text-[7px] text-white/95 font-bold uppercase tracking-wider scale-90">Upload</span>
              </div>
            )}
          </div>

          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleLogoFileChange}
            className="hidden"
          />

          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h1 id="brand-title" className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#fcd975] via-white to-[#dfaf37] drop-shadow-md">
                FAIZAN BANGLES
              </h1>
              
              {/* Optional delete button to clear logo if customized */}
              {isManager && logoUrl && (
                <button
                  onClick={handleRemoveCustomLogo}
                  className="p-1 rounded bg-[#1c1c18] border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-950 duration-150"
                  title="Restore default Crown logo"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            
            <p id="brand-subtitle" className="text-[10px] sm:text-xs text-[#e8c87a] opacity-85 uppercase tracking-[0.2em] font-medium font-sans">
              Premium Glass Craftsmanship &amp; Industrial Piping
            </p>



            {logoError && (
              <span className="text-[9px] text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1 animate-pulse">
                ⚠️ {logoError}
              </span>
            )}

            {isManager && !logoError && (
              <span className="text-[9px] text-[#fcd975] bg-amber-900/40 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1">
                ⚙️ Click icon to modify branding image
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Side (PWA Download + Profile Auth Controls) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          {/* Action cluster offering direct app setup and link share options */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {/* Robust DOWNLOAD APP button next to Login controls */}
              <button
                id="header-download-app-btn"
                onClick={onDownloadClick}
                className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase tracking-wider bg-[#2d2a20]/80 hover:bg-white/10 text-[#fcd975] border border-[#dfaf37]/50 py-2.5 px-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer animate-pulse"
                title="Install Web App / PWA configuration steps"
              >
                <ArrowDownToLine size={13} className="text-[#fcd975] shrink-0" />
                <span>Install Web App</span>
              </button>

              {/* QUICK COPY LINK BUTTON */}
              <button
                id="header-copy-link-btn"
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 font-sans font-bold text-xs uppercase tracking-wider py-2.5 px-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer border ${
                  copiedLink 
                    ? "bg-emerald-950/85 border-emerald-500/55 text-emerald-300 animate-in zoom-in-95 duration-200" 
                    : "bg-black/50 border-[#dfaf37]/35 text-[#fcd975] hover:bg-black/70"
                }`}
                title="Copy App URL path to share"
              >
                {copiedLink ? (
                  <Check size={12} className="text-emerald-400 shrink-0" />
                ) : (
                  <Copy size={12} className="text-[#fcd975] shrink-0" />
                )}
                <span>{copiedLink ? "Copied!" : "Copy URL"}</span>
              </button>
            </div>

            {/* SEPARATED CHAT & ORDER BUTTONS */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                id="header-chat-btn"
                onClick={() => onChatOrderClick("CHAT")}
                className="flex items-center justify-center gap-1 font-serif font-black text-[10px] md:text-sm uppercase tracking-wider bg-black/55 hover:bg-black/85 border border-[#dfaf37]/55 text-[#fcd975] py-2 px-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                title="Speak is with the support team or manager"
              >
                <span>📩CHAT SUPPORT TEAM</span>
              </button>
              
              <button
                id="header-order-btn"
                onClick={() => onChatOrderClick("ORDER")}
                className="flex items-center justify-center gap-1 font-serif font-black text-[10px] md:text-sm uppercase tracking-wider bg-gradient-to-r from-[#dfaf37] via-[#f7d070] to-[#b8860b] text-black border border-[#dfaf37] py-2 px-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-[0_4px_12px_rgba(223,175,55,0.25)] hover:brightness-110 cursor-pointer animate-pulse"
                title="Place a production customizable order"
              >
                <span>🛒ORDER</span>
              </button>
            </div>
          </div>

          {isManager || currentUser ? (
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
              {/* SLIM CALCULATOR BUTTON NEAR USERNAME */}
              <button
                id="header-calculator-btn"
                onClick={onCalculatorClick}
                className="flex items-center gap-1.5 font-sans font-black text-[10px] sm:text-xs uppercase tracking-wider bg-gradient-to-r from-neutral-950 to-neutral-900 hover:from-[#1e1c12] hover:to-neutral-950 text-[#dfaf37] border border-[#dfaf37]/60 py-2 px-3.5 sm:px-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                title="Open Calculator"
              >
                <span>🧮 CALCULATOR</span>
              </button>

              <div className="flex items-center gap-2 bg-[#2d2a20] border border-[#dfaf37]/40 py-1.5 px-3 rounded-full shadow-inner animate-in fade-in slide-in-from-right-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold text-white">
                  {isManager ? (
                    <>Manager: <span className="text-[#f7d070] font-bold">{managerName || "Faizan Raza"}</span></>
                  ) : (
                    <>User: <span className="text-[#f7d070] font-bold">{currentUser}</span></>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
              {/* SLIM CALCULATOR BUTTON NEAR LOGIN */}
              <button
                id="header-calculator-btn"
                onClick={onCalculatorClick}
                className="flex items-center gap-1.5 font-sans font-black text-[10px] sm:text-xs uppercase tracking-wider bg-gradient-to-r from-neutral-950 to-neutral-900 hover:from-[#1e1c12] hover:to-neutral-950 text-[#dfaf37] border border-[#dfaf37]/60 py-2 px-3.5 sm:px-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                title="Open Calculator"
              >
                <span>🧮 CALCULATOR</span>
              </button>

              <button
                id="header-login-btn"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#dfaf37] via-[#f7d070] to-[#aa7c11] text-[#1c1c18] py-2.5 px-4 rounded-full transition-all shadow-[0_4px_10px_rgba(223,175,55,0.2)] hover:scale-[1.03] active:scale-95 hover:brightness-110 cursor-pointer"
              >
                <Crown size={14} />
                <span>Login / Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
