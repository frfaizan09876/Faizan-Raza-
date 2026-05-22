import { useState, useEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import Header from "./components/Header";
import Navbar, { TabType } from "./components/Navbar";
import HomePage from "./components/HomePage";
import PipesColourPage from "./components/PipesColourPage";
import AboutUsPage from "./components/AboutUsPage";
import CalculatorPage from "./components/CalculatorPage";
import AuthModal from "./components/AuthModal";
import DownloadModal from "./components/DownloadModal";
import PortalAuthScreen from "./components/PortalAuthScreen";
import UserHistoryPage from "./components/UserHistoryPage";
import ChatOrderModal from "./components/ChatOrderModal";
import ManagerChatPage from "./components/ManagerChatPage";
import { INITIAL_APP_STATE } from "./initialData";
import { FactoryInfo, PipeConfig, PipeItem, AppState, MachineItem } from "./types";

export default function App() {
  // 1. Initial State Loading from Local Storage for true operational persistence
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem("faizan_bangles_app_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Safely merge dynamic machine and custom logo fields if missing in stale storage
        if (!parsed.machines) {
          parsed.machines = INITIAL_APP_STATE.machines;
        }
        if (parsed.logoUrl === undefined) {
          parsed.logoUrl = INITIAL_APP_STATE.logoUrl;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse app state", e);
      }
    }
    return INITIAL_APP_STATE;
  });

  // 2. Auth state
  const [isManager, setIsManager] = useState<boolean>(() => {
    return localStorage.getItem("faizan_bangles_is_manager") === "true";
  });
  const [managerName, setManagerName] = useState<string | null>(() => {
    return localStorage.getItem("faizan_bangles_manager_name");
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("faizan_bangles_current_user");
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isChatOrderOpen, setIsChatOrderOpen] = useState(false);
  const [chatOrderInitialTab, setChatOrderInitialTab] = useState<"SELECT" | "CHAT" | "ORDER">("SELECT");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 3.5 Hook into native app installation prompt events
  useEffect(() => {
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforePrompt as any);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt as any);
    };
  }, []);

  // 3. Tab State
  const [activeTab, setActiveTab] = useState<TabType>("HOME_PAGE");

  // Persist state whenever it changes
  useEffect(() => {
    localStorage.setItem("faizan_bangles_app_state", JSON.stringify(appState));
  }, [appState]);

  // Handle Login Event
  const handleLoginSuccess = (name: string, isActualManager: boolean, username: string) => {
    setIsManager(isActualManager);
    setManagerName(isActualManager ? name : null);
    setCurrentUser(username);
    localStorage.setItem("faizan_bangles_is_manager", isActualManager ? "true" : "false");
    localStorage.setItem("faizan_bangles_manager_name", isActualManager ? name : "");
    localStorage.setItem("faizan_bangles_current_user", username);
  };

  // 2.5 Dynamic notifications for the Manager (Messages, Orders)
  const [managerNotifications, setManagerNotifications] = useState<any[]>([]);

  const handleRemoveNotification = (id: string) => {
    setManagerNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const stored = localStorage.getItem("faizan_latest_manager_notification");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id === id) {
          localStorage.removeItem("faizan_latest_manager_notification");
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (!isManager) {
      setManagerNotifications([]);
      return;
    }

    const loadNotification = (data: any) => {
      if (!data || !data.type || !data.sender) return;
      setManagerNotifications((prev) => {
        if (prev.some((n) => n.id === data.id)) return prev;
        return [
          {
            ...data,
            timestamp: data.timestamp || Date.now(),
          },
          ...prev,
        ];
      });
    };

    const handleNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) loadNotification(detail);
    };

    const handleNewOrder = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        loadNotification({
          id: detail.id,
          type: "ORDER",
          sender: detail.sender,
          text: `Placed order for "${detail.machineName}" (${detail.count} custom pipes)`,
          timestamp: detail.timestamp,
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "faizan_latest_manager_notification" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            loadNotification(parsed);
          }
        } catch (err) {
          console.error("Storage notification parse error", err);
        }
      }
    };

    window.addEventListener("faizan_new_message_alert", handleNewMessage);
    window.addEventListener("faizan_new_order_alert", handleNewOrder);
    window.addEventListener("storage", handleStorageChange);

    // Initial check for any unhandled latest notifications
    try {
      const stored = localStorage.getItem("faizan_latest_manager_notification");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Date.now() - (parsed.timestamp || 0) < 60000) {
          loadNotification(parsed);
        }
      }
    } catch (_) {}

    return () => {
      window.removeEventListener("faizan_new_message_alert", handleNewMessage);
      window.removeEventListener("faizan_new_order_alert", handleNewOrder);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isManager]);

  // 2.7 Dynamic notifications for ordinary customers/users (from Manager Faizan)
  const [userNotifications, setUserNotifications] = useState<any[]>([]);

  const handleRemoveUserNotification = (id: string) => {
    setUserNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const stored = localStorage.getItem("faizan_latest_user_notification");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id === id) {
          localStorage.removeItem("faizan_latest_user_notification");
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isManager || !currentUser) {
      setUserNotifications([]);
      return;
    }

    const loadUserNotification = (data: any) => {
      if (!data || !data.recipient || !data.text) return;
      
      const receiver = data.recipient.toLowerCase().trim();
      const current = currentUser.toLowerCase().trim();
      if (receiver !== current) return;

      setUserNotifications((prev) => {
        if (prev.some((n) => n.id === data.id)) return prev;
        return [
          {
            ...data,
            timestamp: data.timestamp || Date.now(),
          },
          ...prev,
        ];
      });
    };

    const handleNewUserMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) loadUserNotification(detail);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "faizan_latest_user_notification" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            loadUserNotification(parsed);
          }
        } catch (err) {
          console.error("Storage notification parse error", err);
        }
      }
    };

    window.addEventListener("faizan_new_user_message_alert", handleNewUserMessage);
    window.addEventListener("storage", handleStorageChange);

    // Initial check for any user notifications
    try {
      const stored = localStorage.getItem("faizan_latest_user_notification");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Date.now() - (parsed.timestamp || 0) < 60000) {
          loadUserNotification(parsed);
        }
      }
    } catch (_) {}

    return () => {
      window.removeEventListener("faizan_new_user_message_alert", handleNewUserMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isManager, currentUser]);

  // Handle Logout Event
  const handleLogout = () => {
    setIsManager(false);
    setManagerName(null);
    setCurrentUser(null);
    setActiveTab("HOME_PAGE");
    localStorage.removeItem("faizan_bangles_is_manager");
    localStorage.removeItem("faizan_bangles_manager_name");
    localStorage.removeItem("faizan_bangles_current_user");
  };

  // 4. Update Handlers for Dynamic Inputs
  const handleUpdatePipeConfig = (newConfig: PipeConfig) => {
    setAppState((prev) => ({
      ...prev,
      pipeConfig: newConfig,
    }));
  };

  const handleUpdateFactoryInfo = (newInfo: FactoryInfo) => {
    setAppState((prev) => ({
      ...prev,
      factoryInfo: newInfo,
    }));
  };

  const handleAddPipe = (newPipe: PipeItem) => {
    setAppState((prev) => ({
      ...prev,
      pipesList: [newPipe, ...prev.pipesList],
    }));
  };

  const handleDeletePipe = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      pipesList: prev.pipesList.filter((p) => p.id !== id),
    }));
  };

  const handleUpdatePipe = (updatedPipe: PipeItem) => {
    setAppState((prev) => ({
      ...prev,
      pipesList: prev.pipesList.map((p) => p.id === updatedPipe.id ? updatedPipe : p),
    }));
  };

  const handleUpdateMachines = (newMachines: MachineItem[]) => {
    setAppState((prev) => ({
      ...prev,
      machines: newMachines,
    }));
  };

  const handleUpdateLogo = (newLogoUrl: string) => {
    setAppState((prev) => ({
      ...prev,
      logoUrl: newLogoUrl,
    }));
  };

  // Immediate PWA installation trigger where supported, fallback to the helpful walk-through modal instruction otherwise
  const handleDownloadClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User accepted prompt outcome: ${outcome}`);
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        } else {
          // If the user cancelled or denied, show the detailed help modal anyway
          setIsDownloadOpen(true);
        }
      } catch (err) {
        console.error("Native installation triggered fail:", err);
        setIsDownloadOpen(true);
      }
    } else {
      // Show modal detailing iOS/Android instructions if PWA API event isn't ready or supported natively
      setIsDownloadOpen(true);
    }
  };

  if (!currentUser) {
    return (
      <PortalAuthScreen
        onLoginSuccess={handleLoginSuccess}
        logoUrl={appState.logoUrl || ""}
      />
    );
  }

  return (
    /* 
       Golden Background for the application. 
       We utilize a premium metallic satin-gold radial/linear gradient wrapper
       to fulfill 'our is website ka background colour golden ho' uniquely and gorgeously.
    */
    <div 
      id="main-app-container"
      className="min-h-screen bg-gradient-to-br from-[#dfaf37] via-[#f7d070] to-[#b8860b] text-gray-900 font-sans flex flex-col pb-32 selection:bg-[#1c1a14] selection:text-[#fcd975]"
    >
      {/* Decorative Golden Ambient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/15 pointer-events-none" />

      {/* Header component */}
      <Header
        isManager={isManager}
        managerName={managerName}
        currentUser={currentUser}
        logoUrl={appState.logoUrl || ""}
        onUpdateLogo={handleUpdateLogo}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
        onDownloadClick={handleDownloadClick}
        onChatOrderClick={(tab) => {
          setChatOrderInitialTab(tab);
          setIsChatOrderOpen(true);
        }}
        onCalculatorClick={() => {
          setActiveTab("CALCULATOR");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Main viewport Container */}
      <main id="tab-viewport" className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 relative z-10">
        
        {/* Dynamic Inner Container holding golden satin content panels */}
        <div id="content-container">
          {activeTab === "HOME_PAGE" && (
            <HomePage
              isManager={isManager}
              pipeConfig={appState.pipeConfig}
              onUpdatePipeConfig={handleUpdatePipeConfig}
              machines={appState.machines}
              onUpdateMachines={handleUpdateMachines}
              currentUser={currentUser}
            />
          )}

          {activeTab === "AVAILABLE_PIPES_COLOUR" && (
            <PipesColourPage
              isManager={isManager}
              pipesList={appState.pipesList}
              onAddPipe={handleAddPipe}
              onDeletePipe={handleDeletePipe}
              onUpdatePipe={handleUpdatePipe}
            />
          )}

          {activeTab === "ABOUT_US" && (
            <AboutUsPage
              isManager={isManager}
              factoryInfo={appState.factoryInfo}
              onUpdateFactoryInfo={handleUpdateFactoryInfo}
              onLogoutClick={handleLogout}
            />
          )}

          {activeTab === "CALCULATOR" && (
            <CalculatorPage
              currentUser={currentUser}
            />
          )}

          {activeTab === "USER_HISTORY" && isManager && (
            <UserHistoryPage />
          )}

          {activeTab === "MANAGER_CHAT_TAB" && isManager && (
            <ManagerChatPage />
          )}
        </div>
      </main>

      {/* Sticky Bottom Floating Ribbon Decor */}
      <div className="fixed bottom-[92px] left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="bg-[#1c1c18]/90 border border-[#dfaf37]/40 py-1.5 px-4 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-center flex items-center gap-2 max-w-xs backdrop-blur-md">
          <Trophy size={14} className="text-[#fcd975] shrink-0" />
          <span className="text-[10px] text-white/90 font-serif font-bold tracking-wider uppercase">
            Faizan Bangles Official App
          </span>
        </div>
      </div>

      {/* Manager Session overlay widget */}
      {isManager && (
        <div className="fixed top-24 left-4 z-40 bg-[#1c1c18]/90 text-white border border-[#dfaf37] py-1.5 px-3 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          <Sparkles className="text-[#fcd975] animate-pulse" size={12} />
          <span>Editor Mode Active</span>
        </div>
      )}

      {/* Bottom Option Bar Sticky */}
      <Navbar
        activeTab={activeTab}
        isManager={isManager}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Authentication controls system (Golden signup and login system) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Download app walkthrough assistant */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />

      {/* Royal Chat & Order Customizer Modal */}
      <ChatOrderModal
        isOpen={isChatOrderOpen}
        onClose={() => setIsChatOrderOpen(false)}
        currentUser={currentUser || ""}
        isManager={isManager}
        machines={appState.machines}
        pipesList={appState.pipesList}
        pipeConfig={appState.pipeConfig}
        initialTab={chatOrderInitialTab}
        onOrderPlaced={() => {
          // Trigger balance update globally across loaded panels
          window.dispatchEvent(new Event("balance_refresh"));
        }}
      />

      {/* Toast Notification Container for Manager alerts */}
      {isManager && managerNotifications.length > 0 && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
          {managerNotifications.map((notif) => (
            <div
              key={notif.id}
              className="pointer-events-auto w-full bg-[#181816]/95 border-2 border-[#dfaf37] rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#dfaf37] via-[#ffd700] to-[#dfaf37]" />
              
              <div className="flex gap-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    {notif.type === "CHAT" ? (
                      <span className="text-[9px] bg-[#dfaf37]/20 text-[#fcd975] border border-[#dfaf37]/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        📩 Naya Message Aaya
                      </span>
                    ) : (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        📦 Naya Order Aaya
                      </span>
                    )}
                    <span className="text-[8px] text-gray-400 font-mono font-bold">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs font-black text-white">
                    @{notif.sender}
                  </p>
                  
                  <p className="text-[11px] text-gray-300 font-sans tracking-wide leading-tight mt-1">
                    {notif.text}
                  </p>
                  
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => {
                        if (notif.type === "CHAT") {
                          setActiveTab("MANAGER_CHAT_TAB");
                        } else {
                          setActiveTab("USER_HISTORY");
                        }
                        handleRemoveNotification(notif.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-gradient-to-r from-[#dfaf37] to-[#b8860b] text-black font-black uppercase text-[9px] tracking-wider py-1.5 px-3 rounded transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      {notif.type === "CHAT" ? "💬 Chat Box" : "📝 Order Status"}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveNotification(notif.id)}
                      className="bg-neutral-800 text-gray-400 hover:text-white font-black uppercase text-[9px] tracking-wider py-1.5 px-2 rounded transition-colors cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveNotification(notif.id)}
                  className="text-gray-400 hover:text-white font-black hover:scale-105 active:scale-95 duration-150 text-xs self-start p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification Container for User Alerts from Manager */}
      {!isManager && currentUser && userNotifications.length > 0 && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none animate-in fade-in duration-300">
          {userNotifications.map((notif) => (
            <div
              key={notif.id}
              className="pointer-events-auto w-full bg-[#111c21]/95 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right duration-300 relative overflow-hidden"
            >
              {/* Dynamic status line indicators */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-500" />
              
              <div className="flex gap-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    {notif.type === "CHAT_REPLY" ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        💬 Naya Message Aaya
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        🔔 Order Status Update
                      </span>
                    )}
                    <span className="text-[8px] text-gray-400 font-mono font-bold">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs font-black text-white">
                    @Manager Faizan Raza
                  </p>
                  
                  <p className="text-[11px] text-gray-300 font-sans tracking-wide leading-tight mt-1">
                    {notif.text}
                  </p>
                  
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => {
                        if (notif.type === "CHAT_REPLY") {
                          setChatOrderInitialTab("CHAT");
                        } else {
                          setChatOrderInitialTab("ORDER");
                        }
                        setIsChatOrderOpen(true);
                        handleRemoveUserNotification(notif.id);
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black uppercase text-[9px] tracking-wider py-1.5 px-3 rounded transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      {notif.type === "CHAT_REPLY" ? "💬 Chat Box" : "📦 View Order"}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveUserNotification(notif.id)}
                      className="bg-neutral-800 text-gray-400 hover:text-white font-black uppercase text-[9px] tracking-wider py-1.5 px-2 rounded transition-colors cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveUserNotification(notif.id)}
                  className="text-gray-400 hover:text-white font-black hover:scale-105 active:scale-95 duration-150 text-xs self-start p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
