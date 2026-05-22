import { Home, Palette, Info, History, Calculator, MessageSquare } from "lucide-react";

export type TabType = "HOME_PAGE" | "AVAILABLE_PIPES_COLOUR" | "ABOUT_US" | "CALCULATOR" | "USER_HISTORY" | "MANAGER_CHAT_TAB";

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isManager?: boolean;
}

export default function Navbar({ activeTab, onTabChange, isManager }: NavbarProps) {
  const tabs = [
    {
      id: "HOME_PAGE" as TabType,
      num: "01",
      label: "Home Page",
      icon: Home,
    },
    {
      id: "AVAILABLE_PIPES_COLOUR" as TabType,
      num: "02",
      label: "Available Pipes Colour",
      icon: Palette,
    },
    {
      id: "ABOUT_US" as TabType,
      num: "03",
      label: "About Us",
      icon: Info,
    }
  ];

  // Dynamically include User Registration & Audit Logs tab for the Manager only
  if (isManager) {
    tabs.push({
      id: "USER_HISTORY" as TabType,
      num: "04",
      label: "User History",
      icon: History,
    });
    tabs.push({
      id: "MANAGER_CHAT_TAB" as TabType,
      num: "05",
      label: "Chat Center",
      icon: MessageSquare,
    });
  }

  return (
    <nav 
      id="bento-bottom-navbar" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t-2 border-[#D4AF37]/50 px-2 sm:px-4 py-2 sm:py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex items-center"
    >
      <div className="w-full max-w-4xl mx-auto flex items-center justify-start sm:justify-around gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id.toLowerCase()}`}
              onClick={() => onTabChange(tab.id)}
              className="flex-none xs:flex-1 group snap-center shrink-0 min-w-[105px] sm:min-w-[120px] transition-all select-none cursor-pointer py-1"
            >
              <div className="flex flex-col items-center w-full">
                {/* Number indicator */}
                <div className={`text-[9px] sm:text-[10px] font-black mb-1 group-hover:scale-110 transition-transform tracking-wider ${
                  isActive ? "text-[#D4AF37]" : "text-white/40"
                }`}>
                  {tab.num}
                </div>
                
                {isActive ? (
                  <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider bg-[#D4AF37] text-black px-2.5 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 shadow-[0_3px_12px_rgba(212,175,55,0.35)] animate-in zoom-in-95 duration-200 w-full text-center">
                    <Icon size={12} className="shrink-0" />
                    <span className="truncate max-w-[85px] xs:max-w-none">{tab.label}</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs uppercase font-black tracking-normal text-white/60 hover:text-[#D4AF37] transition-all px-1.5 py-1.5 select-none flex items-center justify-center gap-1 w-full text-center rounded-lg hover:bg-white/5">
                    <Icon size={11} className="shrink-0 opacity-60 group-hover:opacity-100" />
                    <span className="truncate max-w-[85px] xs:max-w-none">{tab.label}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

