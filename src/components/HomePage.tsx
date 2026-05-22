import React, { useEffect, useState } from "react";
import { Clock, Cpu, Edit3, Check, X, Tag, Plus, Trash2, Power, RefreshCw, Calculator, History, Coins, Wallet, Sparkles } from "lucide-react";
import { PipeConfig, MachineItem } from "../types";
import AddFundModal from "./AddFundModal";

interface HomePageProps {
  isManager: boolean;
  pipeConfig: PipeConfig;
  onUpdatePipeConfig: (newConfig: PipeConfig) => void;
  machines: MachineItem[];
  onUpdateMachines: (newMachines: MachineItem[]) => void;
  currentUser: string;
}

export default function HomePage({
  isManager,
  pipeConfig,
  onUpdatePipeConfig,
  machines = [],
  onUpdateMachines,
  currentUser,
}: HomePageProps) {
  // Live dynamic Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Fund/Balance States
  const [userTotal, setUserTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`faizan_finance_${currentUser}_total`);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [userSpend, setUserSpend] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`faizan_finance_${currentUser}_spend`);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isAddFundOpen, setIsAddFundOpen] = useState(false);

  // Reload balances if currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    try {
      const total = localStorage.getItem(`faizan_finance_${currentUser}_total`);
      const spend = localStorage.getItem(`faizan_finance_${currentUser}_spend`);
      setUserTotal(total ? Number(total) : 0);
      setUserSpend(spend ? Number(spend) : 0);
    } catch {
      setUserTotal(0);
      setUserSpend(0);
    }
  }, [currentUser]);

  // Handle manual/external balance refreshes
  const handleReloadBalances = () => {
    try {
      const total = localStorage.getItem(`faizan_finance_${currentUser}_total`);
      const spend = localStorage.getItem(`faizan_finance_${currentUser}_spend`);
      setUserTotal(total ? Number(total) : 0);
      setUserSpend(spend ? Number(spend) : 0);
    } catch {}
  };

  useEffect(() => {
    window.addEventListener("balance_refresh", handleReloadBalances);
    return () => {
      window.removeEventListener("balance_refresh", handleReloadBalances);
    };
  }, [currentUser]);
  
  // Edit states for standard spec fields
  const [isEditingSizes, setIsEditingSizes] = useState(false);
  const [tempSizes, setTempSizes] = useState(pipeConfig.pipesSizeAvailable);

  // Colour prices state loaded from localStorage for true persistence
  const [colorPrices, setColorPrices] = useState<{ id: string; name: string; price: string }[]>(() => {
    try {
      const saved = localStorage.getItem("faizan_colour_prices_list");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse color prices list", e);
    }
    return [
      { id: "cp-1", name: "Ruby Red Satin", price: "₹1350/per1KG" },
      { id: "cp-2", name: "Royal Golden Electro", price: "₹1420/per1KG" },
      { id: "cp-3", name: "Emerald Gloss Finish", price: "₹1290/per1KG" },
      { id: "cp-4", name: "Saffron Pearl Satin", price: "₹1460/per1KG" }
    ];
  });

  const [newColorName, setNewColorName] = useState("");
  const [newColorPrice, setNewColorPrice] = useState("");
  const [colorPriceError, setColorPriceError] = useState("");

  // Pipes Size available state loaded from localStorage for true persistence
  const [pipeSizes, setPipeSizes] = useState<{ id: string; size: string; dais: string }[]>(() => {
    try {
      const saved = localStorage.getItem("faizan_pipe_sizes_table");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse pipe sizes list", e);
    }
    return [
      { id: "ps-1", size: "3-3", dais: "8DAIS" },
      { id: "ps-2", size: "2-15", dais: "7DAIS" },
      { id: "ps-3", size: "1-5", dais: "6DAIS" },
      { id: "ps-4", size: "1-2", dais: "8DAIS" }
    ];
  });
  const [newPipeSize, setNewPipeSize] = useState("");
  const [newPipeDais, setNewPipeDais] = useState("");
  const [pipeSizeError, setPipeSizeError] = useState("");

  // Machine addition/editing states
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [newMachineName, setNewMachineName] = useState("");
  const [newMachineStatus, setNewMachineStatus] = useState<"ONLINE" | "OFFLINE" | any>("ONLINE");

  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [editMachineName, setEditMachineName] = useState("");
  const [confirmDeleteMachineId, setConfirmDeleteMachineId] = useState<string | null>(null);

  // Credit Alert State for Manager direct transfers shown for 30 seconds
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    recipient: string;
    amount: number;
    description: string;
    type?: string;
  } | null>(null);
  const [alertTimeLeft, setAlertTimeLeft] = useState(30);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const dismissCurrentAlert = () => {
    setIsAlertVisible(false);
    if (activeAlert) {
      try {
        const dismissed = JSON.parse(localStorage.getItem("faizan_dismissed_alerts") || "[]");
        if (!dismissed.includes(activeAlert.id)) {
          dismissed.push(activeAlert.id);
          localStorage.setItem("faizan_dismissed_alerts", JSON.stringify(dismissed));
        }
      } catch (e) {
        console.error("Error setting dismissed alerts", e);
      }
    }
  };

  const triggerAlert = () => {
    try {
      const savedAlert = localStorage.getItem("faizan_latest_credit_alert");
      if (savedAlert) {
        const parsed = JSON.parse(savedAlert);
        if (parsed && parsed.recipient) {
          // Check if this specific alert ID was already dismissed
          const dismissed = JSON.parse(localStorage.getItem("faizan_dismissed_alerts") || "[]");
          if (dismissed.includes(parsed.id)) {
            setIsAlertVisible(false);
            return;
          }

          // Secure selective alert matching: both CREDITS and DEBITS only show to target recipient user
          if (parsed.recipient) {
            const currentLogged = currentUser ? currentUser.toLowerCase().trim() : "";
            const targetLogged = parsed.recipient ? parsed.recipient.toLowerCase().trim() : "";
            if (!currentLogged || currentLogged !== targetLogged) {
              setIsAlertVisible(false);
              return;
            }
          }

          setActiveAlert(parsed);
          setAlertTimeLeft(30);
          setIsAlertVisible(true);
        }
      }
    } catch (e) {
      console.error("Error reading latest credit alert", e);
    }
  };

  // Trigger alert when the homepage mounts (open website)
  useEffect(() => {
    triggerAlert();
  }, []);

  // Trigger alert when currentUser changes (login/signup)
  useEffect(() => {
    if (currentUser) {
      triggerAlert();
    }
  }, [currentUser]);

  // Hook dynamic listener for live manager credits
  useEffect(() => {
    const handleNewAlertEvent = () => {
      triggerAlert();
    };
    window.addEventListener("faizan_new_credit_alert", handleNewAlertEvent);
    return () => {
      window.removeEventListener("faizan_new_credit_alert", handleNewAlertEvent);
    };
  }, []);

  // Interval timer for 30 seconds countdown
  useEffect(() => {
    if (!isAlertVisible || alertTimeLeft <= 0) {
      if (alertTimeLeft <= 0 && isAlertVisible) {
        dismissCurrentAlert();
      }
      return;
    }

    const interval = setInterval(() => {
      setAlertTimeLeft((prev) => {
        if (prev <= 1) {
          dismissCurrentAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAlertVisible, alertTimeLeft, activeAlert]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize internal state with changes from other parts
  useEffect(() => {
    setTempSizes(pipeConfig.pipesSizeAvailable);
  }, [pipeConfig.pipesSizeAvailable]);

  // Handle Saves for sizes
  const handleSaveSizes = () => {
    onUpdatePipeConfig({
      ...pipeConfig,
      pipesSizeAvailable: tempSizes || "................",
    });
    setIsEditingSizes(false);
  };

  // Persist colorPrices to localStorage
  useEffect(() => {
    localStorage.setItem("faizan_colour_prices_list", JSON.stringify(colorPrices));
  }, [colorPrices]);

  // Add colour and price row entry
  const handleAddColorPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setColorPriceError("");

    if (!newColorName.trim()) {
      setColorPriceError("Enter color name.");
      return;
    }
    if (!newColorPrice.trim()) {
      setColorPriceError("Enter price.");
      return;
    }

    const newItem = {
      id: "cp-" + Date.now(),
      name: newColorName.trim(),
      price: newColorPrice.trim()
    };

    setColorPrices([...colorPrices, newItem]);
    setNewColorName("");
    setNewColorPrice("");
  };

  // Delete colour price row entry
  const handleDeleteColorPrice = (id: string) => {
    const filtered = colorPrices.filter((item) => item.id !== id);
    setColorPrices(filtered);
  };

  // Persist pipeSizes to localStorage
  useEffect(() => {
    localStorage.setItem("faizan_pipe_sizes_table", JSON.stringify(pipeSizes));
    window.dispatchEvent(new Event("pipe_sizes_refresh"));
  }, [pipeSizes]);

  // Add pipe size entry row
  const handleAddPipeSize = (e: React.FormEvent) => {
    e.preventDefault();
    setPipeSizeError("");

    if (!newPipeSize.trim()) {
      setPipeSizeError("Enter size.");
      return;
    }
    if (!newPipeDais.trim()) {
      setPipeSizeError("Enter dais.");
      return;
    }

    const newItem = {
      id: "ps-" + Date.now(),
      size: newPipeSize.trim(),
      dais: newPipeDais.trim()
    };

    setPipeSizes([...pipeSizes, newItem]);
    setNewPipeSize("");
    setNewPipeDais("");
  };

  // Delete pipe size entry row
  const handleDeletePipeSize = (id: string) => {
    const filtered = pipeSizes.filter((item) => item.id !== id);
    setPipeSizes(filtered);
  };

  // Toggle machine status online/offline
  const handleToggleStatus = (id: string) => {
    const updated = machines.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: m.status === "ONLINE" ? ("OFFLINE" as const) : ("ONLINE" as const),
        };
      }
      return m;
    });
    onUpdateMachines(updated);
  };

  // Add machine submit
  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;
    
    const newMachine: MachineItem = {
      id: "m-" + Date.now(),
      name: newMachineName.trim().toUpperCase(),
      status: newMachineStatus === "OFFLINE" ? "OFFLINE" : "ONLINE",
    };

    onUpdateMachines([...machines, newMachine]);
    setNewMachineName("");
    setNewMachineStatus("ONLINE");
    setIsAddingMachine(false);
  };

  // Delete machine
  const handleDeleteMachine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = machines.filter((m) => m.id !== id);
    onUpdateMachines(filtered);
    setConfirmDeleteMachineId(null);
  };

  // Save Name Edit
  const handleSaveNameEdit = (id: string) => {
    if (!editMachineName.trim()) return;
    const updated = machines.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          name: editMachineName.trim().toUpperCase(),
        };
      }
      return m;
    });
    onUpdateMachines(updated);
    setEditingMachineId(null);
  };

  // Format standard Indian date & time styles
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Extract numeric badge or prefix
  const getMachinePrefix = (name: string) => {
    const match = name.match(/^(\d+)/);
    return match ? match[1] : "⚙️";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 max-w-6xl mx-auto pb-16">
      
      {/* 30-Second Dynamic Store Credit Alert Banner */}
      {isAlertVisible && activeAlert && (
        <div className={`bg-gradient-to-r ${activeAlert.type === "debit" ? "from-[#1c1212] via-[#2d1212] to-[#1c1212] border-red-500" : "from-[#1c1a12] via-[#2d2511] to-[#1c1a12] border-[#dfaf37]"} border-2 rounded-3xl p-4 sm:p-5 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden`}>
          {/* Animated dynamic status light */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${activeAlert.type === "debit" ? "from-red-500 via-red-400 to-red-500" : "from-[#dfaf37] via-[#ffd700] to-[#dfaf37]"}`} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className={`absolute inset-0 rounded-xl ${activeAlert.type === "debit" ? "bg-red-500/25 animate-ping" : "bg-[#dfaf37]/25 animate-ping"}`} />
                <div className={`p-3 bg-gradient-to-br ${activeAlert.type === "debit" ? "from-red-500/20 to-red-500/5 border-red-500/60 text-red-400" : "from-[#dfaf37]/20 to-[#dfaf37]/5 border-[#dfaf37]/60 text-[#dfaf37]"} rounded-xl border relative`}>
                  <Sparkles size={18} className="animate-pulse" />
                </div>
              </div>
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${activeAlert.type === "debit" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"} px-2 py-0.5 rounded font-black uppercase tracking-widest`}>
                    {activeAlert.type === "debit" ? "Manager Debit Active Alert" : "Manager Credit Active Alert"}
                  </span>
                  <span className="text-[10px] text-[#fcd975] font-mono font-bold bg-[#141412] px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${activeAlert.type === "debit" ? "bg-red-400" : "bg-[#dfaf37]"} animate-pulse`} />
                    Closing in {alertTimeLeft}s
                  </span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#fcd975] tracking-wide uppercase">
                  {activeAlert.type === "debit" ? (
                    <>⚠️ ₹{activeAlert.amount} Withdrawn / Cut from @{activeAlert.recipient}</>
                  ) : (
                    <>🎉 ₹{activeAlert.amount} Credited to @{activeAlert.recipient}</>
                  )}
                </h3>
                <p className="text-xs text-gray-300 font-sans tracking-wide leading-relaxed font-semibold">
                  <strong className={`${activeAlert.type === "debit" ? "text-red-400" : "text-[#dfaf37]"} font-black uppercase text-[10px] mr-1`}>Reason:</strong>
                  {activeAlert.description}
                </p>
              </div>
            </div>
            
            {/* Dismiss action */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={dismissCurrentAlert}
                className="p-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95 flex items-center justify-center"
                title="Dismiss Alert"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Shrinking Timeline Progress Bar */}
          <div className="mt-3.5 h-[2px] bg-white/5 rounded-full overflow-hidden w-full">
            <div 
              className={`h-full bg-gradient-to-r ${activeAlert.type === "debit" ? "from-red-500 to-red-400" : "from-[#dfaf37] to-amber-500"} transition-all duration-1000 ease-linear`}
              style={{ width: `${(alertTimeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 1. Brand Sub-Banner above Bento Grid */}
      <div className="text-center py-2">
        <span className="inline-block px-4 py-1.5 bg-[#1A1A1A] text-[#D4AF37] rounded-full text-xs font-serif font-bold tracking-widest border border-[#B8860B] shadow-md uppercase">
          📢 FACTORY PRODUCTION STATUS &amp; MACHINE MANAGEMENT
        </span>
      </div>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 w-full auto-rows-auto">
        
        {/* Box 1: Account Balances Tile (col-span-12 or 4) */}
        <div 
          id="bento-clock-tile"
          className="col-span-12 md:col-span-4 bg-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between text-[#D4AF37] border-4 border-[#B8860B] shadow-2xl relative overflow-hidden group min-h-[190px]"
        >
          {/* Subtle golden background glow */}
          <div className="absolute inset-0 bg-radial-gradient(circle_at_center,_var(--tw-gradient-stops)) from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 border-b border-[#dfaf37]/20 pb-2">
            <Coins className="text-[#D4AF37] h-5 w-5 shrink-0" />
            <div>
              <h2 className="text-[#D4AF37] text-xs font-black uppercase tracking-widest block">
                💰 ACCOUNT BALANCES
              </h2>
            </div>
          </div>

          <div className="space-y-3 w-full relative z-10">
            {/* Box A: TOTAL AMOUNT */}
            <div className="bg-black/50 border border-neutral-800 rounded-2xl p-3 flex justify-between items-center transition-all hover:border-[#dfaf37]/30">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">TOTAL AMOUNT</span>
              <span className="text-sm font-mono font-black text-[#fcd975]">₹{userTotal}</span>
            </div>

            {/* Box B: TOTAL SPEND MONEY */}
            <div className="bg-black/50 border border-neutral-800 rounded-2xl p-3 flex justify-between items-center transition-all hover:border-[#dfaf37]/30">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">TOTAL SPEND MONEY</span>
              <span className="text-sm font-mono font-black text-red-400">₹{userSpend}</span>
            </div>

            {/* Box C: AVAILABLE AMOUNT */}
            <div className="bg-black/50 border border-neutral-800 rounded-2xl p-3 flex justify-between items-center transition-all hover:border-[#dfaf37]/30">
              <span className="text-[10px] uppercase font-black text-[#dfaf37] tracking-wider">AVAILABLE AMOUNT</span>
              <span className="text-base font-mono font-black text-emerald-400">₹{userTotal - userSpend}</span>
            </div>

            {/* Separate standalone Add Fund Button */}
            <button
              onClick={() => setIsAddFundOpen(true)}
              className="w-full py-2.5 bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] hover:brightness-110 active:scale-95 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg mt-3 flex items-center justify-center gap-2"
            >
              🪙 Add Fund
            </button>
          </div>
        </div>

        {/* Box 2: Available Machines Tile (Manageable Bento) */}
        <div 
          id="bento-machines-tile"
          className="col-span-12 md:col-span-8 bg-white/95 backdrop-blur rounded-3xl p-6 border-b-8 border-r-8 border-[#1A1A1A] flex flex-col justify-between text-[#1A1A1A] shadow-xl min-h-[190px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">🔌</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]">
                  Available Machines ({machines.length})
                </h2>
                <p className="text-xs text-gray-500 font-medium font-sans">
                  Configure, add, rename, delete, or toggle machine operation statuses in real-time.
                </p>
              </div>
            </div>

            {/* Add Machine trigger (Only visible to Manager) */}
            {isManager && !isAddingMachine && (
              <button
                onClick={() => setIsAddingMachine(true)}
                className="flex items-center gap-1.5 bg-[#dfaf37] text-[#1c1c18] border border-amber-600 hover:brightness-110 py-1.5 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all select-none shadow-md cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Machine</span>
              </button>
            )}
          </div>

          {/* Form to Add Brand-New Machine */}
          {isAddingMachine && (
            <form 
              onSubmit={handleAddMachine}
              className="bg-[#1A1A1A] text-white p-4 rounded-2xl border border-[#dfaf37]/40 mb-4 animate-in slide-in-from-top-3 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                <span className="text-xs text-[#fcd975] font-serif font-bold uppercase tracking-widest">⚙️ Configure New Production Machine</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddingMachine(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Machine Name / Type</label>
                  <input
                    type="text"
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                    placeholder="e.g. 32 PIPES MACHINE"
                    className="w-full text-xs bg-black text-white border border-[#dfaf37]/30 rounded-lg py-2 px-3 focus:outline-none focus:border-[#dfaf37]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Initial Status</label>
                  <select
                    value={newMachineStatus}
                    onChange={(e) => setNewMachineStatus(e.target.value)}
                    className="w-full text-xs bg-black text-white border border-[#dfaf37]/30 rounded-lg py-2 px-3 focus:outline-none focus:border-[#dfaf37] h-[34px]"
                  >
                    <option value="ONLINE">🟢 Active / ONLINE</option>
                    <option value="OFFLINE">🔴 Maintenance / OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsAddingMachine(false)}
                  className="text-[10px] uppercase font-bold tracking-wider py-1 px-3 border border-red-500/30 text-red-400 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[10px] bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-black font-black uppercase tracking-wider py-1 px-4 rounded-lg"
                >
                  Insert Machine
                </button>
              </div>
            </form>
          )}

          {/* Machines list dynamically loaded */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.length === 0 ? (
              <div className="col-span-12 py-8 text-center text-gray-400 font-sans italic text-sm">
                No Machines configured yet.
              </div>
            ) : (
              machines.map((machine) => {
                const isEditingThis = editingMachineId === machine.id;
                const isOnline = machine.status === "ONLINE";

                return (
                  <div 
                    key={machine.id}
                    className="bg-[#1A1A1A] text-white p-4 rounded-2xl flex flex-col justify-between border-2 border-[#D4AF37]/30 shadow-md relative group/m overflow-hidden"
                  >
                    {confirmDeleteMachineId === machine.id ? (
                      <div className="space-y-2 py-1 flex flex-col items-center justify-center text-center my-auto min-h-[44px]">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Delete Machine?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteMachineId(null);
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMachine(machine.id, e)}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3.5 rounded-lg text-[10px] font-black cursor-pointer"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    ) : isEditingThis ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editMachineName}
                          onChange={(e) => setEditMachineName(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-black border border-[#dfaf37]/60 text-[#fcd975] rounded focus:outline-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingMachineId(null)}
                            className="bg-gray-800 text-gray-300 py-1 px-2 rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNameEdit(machine.id)}
                            className="bg-[#dfaf37] text-black py-1 px-2.5 rounded text-[10px] font-black"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dfaf37]/10 to-[#b8860b]/35 border border-[#dfaf37]/30 flex items-center justify-center font-serif text-[#fcd975] text-xs font-black shrink-0 shadow-inner">
                            {getMachinePrefix(machine.name)}
                          </div>
                          <div>
                            <span className="font-serif font-black tracking-wide text-xs uppercase block text-white">
                              {machine.name}
                            </span>
                            <span className="text-[9px] text-[#fcd975] opacity-75 uppercase tracking-wider block font-bold mt-0.5">
                              {isOnline ? "⚡ ACTIVE PIPING NETWORK" : "⚠️ MAINTENANCE STAGE"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive status toggle for Manager, static badge for general users */}
                        <div className="flex items-center gap-2">
                          {isManager ? (
                            <button
                              onClick={() => handleToggleStatus(machine.id)}
                              className={`w-18 py-1 rounded-full text-[9px] font-black text-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                isOnline 
                                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/40" 
                                  : "bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900/40"
                              }`}
                              title="Click to toggle system online/offline status"
                            >
                              {machine.status}
                            </button>
                          ) : (
                            <span
                              className={`w-18 py-1 rounded-full text-[9px] font-black text-center border select-none ${
                                isOnline 
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/25" 
                                  : "bg-red-950/40 text-red-400 border-red-500/25"
                              }`}
                            >
                              {machine.status}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action controls list overlay inside cards for Manager only */}
                    {isManager && !isEditingThis && !confirmDeleteMachineId && (
                      <div className="absolute right-2 top-2 bg-black/85 rounded-lg p-1 flex gap-1 border border-white/10 z-15 shadow-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMachineId(machine.id);
                            setEditMachineName(machine.name);
                          }}
                          className="p-1 rounded text-amber-400 hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Rename Machine"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteMachineId(machine.id);
                          }}
                          className="p-1 rounded text-red-500 hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Delete Machine"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Box 3: Pipe Size Available Table (col-span-6 on desktop, dynamic manager controls) */}
        <div 
          id="bento-sizes-tile"
          className="col-span-12 md:col-span-6 bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between border-4 border-[#D4AF37] shadow-2xl text-white min-h-[340px]"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-[#dfaf37]/35 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📢</span>
                <h2 className="text-[#D4AF37] text-lg sm:text-xl font-black uppercase tracking-tight">
                  PIPES SIZE AVAILABLE
                </h2>
              </div>
            </div>

            {/* Custom Pipe Sizes Table */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse border border-[#dfaf37]/15 rounded-2xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-[#24231f] text-[#dfaf37] border-b border-[#dfaf37]/30 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-2 text-center w-12 border-r border-[#dfaf37]/20">S.No</th>
                    <th className="py-2.5 px-3">Available Sizes</th>
                    <th className="py-2.5 px-3">Available Dais</th>
                    {isManager && <th className="py-2.5 px-2 text-center w-12 border-l border-[#dfaf37]/20">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfaf37]/15 text-xs font-semibold">
                  {pipeSizes.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#dfaf37]/5 transition-colors uppercase font-medium">
                      <td className="py-2.5 px-2 text-center text-[10px] text-gray-400 font-mono font-bold border-r border-[#dfaf37]/15">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-white font-serif font-black text-xs">
                        {item.size}
                      </td>
                      <td className="py-2.5 px-3 text-[#fcd975] font-sans font-black text-xs tracking-wide">
                        {item.dais}
                      </td>
                      {isManager && (
                        <td className="py-2 px-2 text-center border-l border-[#dfaf37]/15">
                          <button
                            onClick={() => handleDeletePipeSize(item.id)}
                            type="button"
                            className="p-1 text-red-400 hover:text-red-500 hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                            title="Delete Size Row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {pipeSizes.length === 0 && (
                <div className="py-8 text-center text-gray-400 font-sans italic text-xs uppercase font-medium">
                  No Pipe Sizes currently logged in available category.
                </div>
              )}
            </div>
          </div>

          {/* Manager Action Form to Add Row Inline for Sizes */}
          {isManager ? (
            <div className="mt-4 pt-4 border-t border-dashed border-[#dfaf37]/25">
              <form onSubmit={handleAddPipeSize} className="p-3 bg-black/40 border border-[#dfaf37]/20 rounded-2xl space-y-2.5 shadow-inner">
                <span className="text-[10px] uppercase font-black text-[#dfaf37] tracking-wider block">
                  ⚡ Add New Size &amp; Dais Row (Manager Only)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">Available Size (e.g. 3-3)</label>
                    <input
                      type="text"
                      value={newPipeSize}
                      onChange={(e) => setNewPipeSize(e.target.value)}
                      placeholder="e.g. 3-3"
                      className="w-full text-xs bg-black text-[#dfaf37] border border-[#dfaf37]/30 rounded-xl py-1.5 px-2.5 placeholder-gray-600 focus:outline-none focus:border-[#dfaf37] font-semibold h-8"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">Available Dais (e.g. 8DAIS)</label>
                    <input
                      type="text"
                      value={newPipeDais}
                      onChange={(e) => setNewPipeDais(e.target.value)}
                      placeholder="e.g. 8DAIS"
                      className="w-full text-xs bg-black text-[#dfaf37] border border-[#dfaf37]/30 rounded-xl py-1.5 px-2.5 placeholder-gray-600 focus:outline-none focus:border-[#dfaf37] font-semibold h-8"
                    />
                  </div>
                </div>

                {pipeSizeError && (
                  <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">
                    ⚠️ {pipeSizeError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full h-8 text-[10px] bg-[#dfaf37] hover:bg-[#aa7c11] text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus size={12} />
                  <span>Add Size Entry</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-black/20 rounded-2xl text-[11px] font-mono text-[#fcd975]/60 text-center flex items-center justify-center gap-1 border border-[#dfaf37]/10">
              <Tag size={12} className="text-[#dfaf37]/50 shrink-0" />
              <span>Pipe Dimension Specifications. Locked to general users.</span>
            </div>
          )}
        </div>

        {/* Box 4: Per Colour Price Tablet Layout (col-span-6 on desktop, dynamic manager controls) */}
        <div 
          id="bento-price-tile"
          className="col-span-12 md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-b-8 border-r-8 border-[#1A1A1A] flex flex-col justify-between shadow-xl text-[#1A1A1A] min-h-[340px]"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-amber-600">📢</span>
                <h2 className="text-black text-lg sm:text-xl font-black uppercase tracking-tight">
                  PER COLOUR PRICE
                </h2>
              </div>
            </div>

            {/* Colour Prices Tablet List */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse border border-black/10 rounded-2xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-[#1c1c18] text-[#dfaf37] border-b border-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-2 text-center w-12">S.No</th>
                    <th className="py-2.5 px-3">Colour Name</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    {isManager && <th className="py-2.5 px-2 text-center w-12">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                  {colorPrices.map((item, index) => (
                    <tr key={item.id} className="hover:bg-amber-500/5 transition-colors uppercase font-medium">
                      <td className="py-2.5 px-2 text-center text-[10px] text-gray-400 font-mono font-bold border-r border-gray-100">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-[#1a1a1a] font-serif font-black text-xs">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-sans font-black text-xs text-right tracking-wide">
                        {item.price}
                      </td>
                      {isManager && (
                        <td className="py-2 px-2 text-center border-l border-gray-100">
                          <button
                            onClick={() => handleDeleteColorPrice(item.id)}
                            type="button"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {colorPrices.length === 0 && (
                <div className="py-8 text-center text-gray-400 font-sans italic text-xs uppercase font-medium">
                  No Colour price rates recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Manager Action Form to Add Row Inline */}
          {isManager ? (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <form onSubmit={handleAddColorPrice} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 shadow-inner">
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  ⚡ Add New Color &amp; Price Row (Manager Only)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-500 mb-0.5">Colour Name</label>
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="e.g. Saffron Yellow"
                      className="w-full text-xs bg-white border border-gray-300 rounded-xl py-1.5 px-2.5 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-black font-semibold h-8"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-500 mb-0.5">Price (e.g. ₹1450/per1KG)</label>
                    <input
                      type="text"
                      value={newColorPrice}
                      onChange={(e) => setNewColorPrice(e.target.value)}
                      placeholder="e.g. ₹1450/per1KG"
                      className="w-full text-xs bg-white border border-gray-300 rounded-xl py-1.5 px-2.5 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-black font-semibold h-8"
                    />
                  </div>
                </div>

                {colorPriceError && (
                  <p className="text-[9px] text-red-600 font-bold uppercase tracking-wider block">
                    ⚠️ {colorPriceError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full h-8 text-[10px] bg-black hover:bg-neutral-800 text-[#dfaf37] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus size={12} />
                  <span>Add Colour Entry</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl text-[11px] font-mono text-gray-500 text-center flex items-center justify-center gap-1 border border-gray-100">
              <Tag size={12} className="text-gray-400 shrink-0" />
              <span>Standard Pricing List. Locked to general users.</span>
            </div>
          )}
        </div>

      </div>

      {/* Add Fund Verification Modal Popup Overlay */}
      <AddFundModal
        isOpen={isAddFundOpen}
        onClose={() => setIsAddFundOpen(false)}
        currentUser={currentUser}
        isManager={isManager}
        onBalanceUpdated={handleReloadBalances}
      />

    </div>
  );
}
