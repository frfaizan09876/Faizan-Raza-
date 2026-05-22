import { useEffect, useState } from "react";
import { X, Smartphone, ArrowDownToLine, Check, Share, PlusSquare, Sparkles, Copy, Link } from "lucide-react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess: () => void;
}

export default function DownloadModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}: DownloadModalProps) {
  const [deviceSystem, setDeviceSystem] = useState<"android" | "ios" | "desktop">("android");
  const [isNativePromptAvailable, setIsNativePromptAvailable] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic discovery of the real-world deployed/preview URL of our application
  const appUrl = typeof window !== "undefined" ? window.location.href : "https://faizanbangles.web.app";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Unable to copy URL to system clipboard", err);
    }
  };

  useEffect(() => {
    // Detect system OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceSystem("ios");
    } else if (/android/.test(ua)) {
      setDeviceSystem("android");
    } else {
      setDeviceSystem("desktop");
    }
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      setIsNativePromptAvailable(true);
    } else {
      setIsNativePromptAvailable(false);
    }
  }, [deferredPrompt]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome === "accepted") {
        onInstallSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Installation prompt failed", err);
    }
  };

  return (
    <div 
      id="download-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="download-modal-container"
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#dfaf37] via-[#fcd975] to-[#aa7c11] p-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="relative rounded-3xl bg-[#1c1c18] p-5 sm:p-6 text-white text-left max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-transparent">
          {/* Top visual strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b8860b] via-[#f7d070] to-[#b8860b]" />

          {/* Close trigger */}
          <button
            id="close-download-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-transform hover:scale-105"
            aria-label="Close download modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#dfaf37] to-[#aa7c11] shadow-[0_4px_15px_rgba(223,175,55,0.4)] animate-bounce">
              <ArrowDownToLine className="h-7 w-7 text-[#1c1c18]" />
            </div>
            <h2 id="download-title" className="font-serif text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f7d070] to-[#a0740a]">
              DOWNLOAD OFFICIAL APP 📱
            </h2>
            <p className="text-xs text-[#dfaf37] font-black uppercase tracking-wider">
              Bina kisi sourse ke asaaani se direct apne mobile me convert karein!
            </p>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
              Isko install karne se aapke mobile screen par real-time digital app icon set ho jayegi, jisko tap karte hi bina Google search direct aapki factory status khul jayegi.
            </p>
          </div>

          {/* Tab Selector for different operating systems */}
          <div className="flex bg-[#2b2b23] border border-[#d4af37]/20 rounded-xl p-1 mb-5">
            <button
              onClick={() => setDeviceSystem("android")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                deviceSystem === "android" ? "bg-[#dfaf37] text-black shadow-md font-extrabold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              🤖 Android Phone
            </button>
            <button
              onClick={() => setDeviceSystem("ios")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                deviceSystem === "ios" ? "bg-[#dfaf37] text-black shadow-md font-extrabold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              🍎 iPhone / iPad
            </button>
            <button
              onClick={() => setDeviceSystem("desktop")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                deviceSystem === "desktop" ? "bg-[#dfaf37] text-black shadow-md font-extrabold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              💻 Desktop PC
            </button>
          </div>

          {/* Core App View Showcase (How it looks on user device) */}
          <div className="bg-black/50 border border-[#dfaf37]/20 rounded-2xl p-4 flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#dfaf37] via-[#f7d070] to-[#aa7c11] flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl">👑</span>
            </div>
            <div className="flex-grow space-y-0.5">
              <h4 className="text-sm font-serif font-black tracking-wide text-white uppercase">
                Faizan Bangles App
              </h4>
              <p className="text-[11px] text-[#fcd975] font-semibold">
                Status: Ready to be added inside Home Screen
              </p>
            </div>
          </div>

          {/* Interactive URL Share and Clipboard Copy utility */}
          <div className="bg-gradient-to-r from-amber-950/40 to-black/60 border-2 border-[#dfaf37] rounded-3xl p-4 mb-6 space-y-2.5 text-left shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#fcd975] tracking-widest flex items-center gap-1.5 animate-pulse">
                <Link size={12} className="text-[#dfaf37]" /> App Share Link / Digital URL
              </span>
              {isCopied && (
                <span className="text-[9px] bg-emerald-950/80 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider animate-bounce">
                  ✓ Copied successfully!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-[#12110e] border border-white/10 rounded-xl p-1.5 overflow-hidden">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-grow bg-transparent text-[11px] font-mono text-gray-300 py-1 px-2 focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 bg-[#dfaf37] hover:brightness-110 active:scale-95 text-[#1c1c18] font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                title="Copy Address to Clipboard"
              >
                {isCopied ? <Check size={11} className="text-emerald-900" /> : <Copy size={11} />}
                <span>{isCopied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Guidelines based on System selection */}
          <div className="space-y-4 text-sm leading-relaxed text-gray-300">
            {deviceSystem === "android" && (
              <div className="space-y-4">
                {/* DIRECT APK DOWNLOAD BLOCK */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-black/40 border border-[#dfaf37]/45 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#dfaf37] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Direct Install</span>
                    <h4 className="text-xs font-bold text-[#fcd975] uppercase tracking-wide">
                      Download Standalone APK Installer
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Get the standalone <strong className="text-white">FaizanBangles.apk</strong> package file directly for quick manual installation.
                  </p>
                  <a
                    href="/FaizanBangles.apk"
                    download="FaizanBangles.apk"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#dfaf37] via-[#fcd975] to-[#aa7c11] text-[#1c1c18] font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg text-center"
                  >
                    <ArrowDownToLine size={14} className="shrink-0" />
                    <span>Download APK File</span>
                  </a>

                  {/* Fully functional & synchronized notice */}
                  <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl p-2.5 text-[10px] space-y-1">
                    <p className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} className="text-emerald-400 shrink-0" /> Real-time Synchronized
                    </p>
                    <p className="text-gray-300 leading-normal">
                      APK download hone ke baad aapka app pura automatically live sync ke saath work karega. Manager jo bhi machines status edit karenge ya naye colors add karenge, woh APK me usi waqt real-time update ho jayenge!
                    </p>
                  </div>
                </div>

                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">OR USE WEB APP INSTALMENT (RECOMMENDED)</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <p className="text-xs font-bold text-white uppercase tracking-wider mb-1 text-[#e8c87a]">
                  📌 Chrome Web-App Installation Steps:
                </p>
                
                {isNativePromptAvailable ? (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2 text-center">
                    <p className="text-xs font-semibold text-emerald-300">
                      ⚡ Automated instant installer is available!
                    </p>
                    <button
                      id="native-install-android-btn"
                      onClick={handleNativeInstall}
                      className="w-full py-2 bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-black font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 shadow-md cursor-pointer"
                    >
                      Install App Automatically
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">1</span>
                      <p>Apne phone par <strong className="text-[#fcd975]">Google Chrome Browser</strong> kholkar is URL ko likhein.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">2</span>
                      <p>Tab screen ke upar right corner me <span className="text-white font-bold bg-white/10 px-1 py-0.5 rounded">3 dots waale⋮ menu</span> ko dabaein.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">3</span>
                      <p>Wahan <strong className="text-[#fcd975]">"Add to Home screen"</strong> ya <strong className="text-[#fcd975]">"Install App"</strong> ka option select karein.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">4</span>
                      <p>Confirm karte hi Crown logo ke saath application seedhe aapke mobile screen par set ho jayegi!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {deviceSystem === "ios" && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-2 text-[#e8c87a]">
                  📌 iPhone / iPad Safari Installation Steps:
                </p>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">1</span>
                    <p>Open this portal inside the default <strong className="text-white">Safari Browser</strong> on your iOS device.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">2</span>
                    <p>Tap on the native Safari <strong className="text-[#fcd975] flex items-center gap-1 inline-flex bg-white/5 py-0.5 px-1.5 rounded text-white">Share Icon <Share size={11} className="inline text-[#fcd975]" /></strong> at the bottom browser panel.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">3</span>
                    <p>Scroll down the share list sheet and select <strong className="text-[#fcd975] flex items-center gap-1 inline-flex bg-white/5 py-0.5 px-1.5 rounded text-white">"Add to Home Screen" <PlusSquare size={11} className="inline text-[#fcd975]" /></strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="bg-[#dfaf37] text-black w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] shrink-0">4</span>
                    <p>Tap <strong className="text-white font-bold">Add</strong> in the top-right corner. Complete!</p>
                  </div>
                </div>
              </div>
            )}

            {deviceSystem === "desktop" && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-2 text-[#e8c87a]">
                  📌 Desktop PWA Installation:
                </p>
                {isNativePromptAvailable ? (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2 text-center">
                    <p className="text-xs font-semibold text-emerald-300">
                      ⚡ Install directly onto your Windows/Mac/Linux workstation!
                    </p>
                    <button
                      id="native-install-desktop-btn"
                      onClick={handleNativeInstall}
                      className="w-full py-2 bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-black font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 shadow-md cursor-pointer"
                    >
                      Install App to PC
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <p>1. Open this page in <strong className="text-white">Google Chrome</strong> or <strong className="text-white">Microsoft Edge Browser</strong>.</p>
                    <p>2. At the top URL search bar on the right side, click on the <strong className="text-[#fcd975]">"Install App" tag/icon</strong>.</p>
                    <p>3. Enjoy access to standard full-grid controls in administrative mode!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-[#dfaf37] animate-pulse" />
            <p className="text-[11px] font-medium text-[#e8c87a] uppercase tracking-wider">
              ⭐ Optimized for mobile performance
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
