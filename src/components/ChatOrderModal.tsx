import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, ShoppingBag, Send, AlertTriangle, AlertCircle, Coins, Gift, Tablet, Sparkles, CheckCircle2, Check, RefreshCw } from "lucide-react";
import { MachineItem, PipeItem, PipeConfig } from "../types";

interface ChatOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  isManager: boolean;
  machines: MachineItem[];
  pipesList: PipeItem[];
  pipeConfig: PipeConfig;
  onOrderPlaced?: () => void;
  initialTab?: "SELECT" | "CHAT" | "ORDER";
}

interface ChatMessage {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
}

interface OrderItem {
  id: string;
  username: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  fee: number;
  pipes: { size: string; color: string }[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
}

export default function ChatOrderModal({
  isOpen,
  onClose,
  currentUser,
  isManager,
  machines,
  pipesList,
  pipeConfig,
  onOrderPlaced,
  initialTab = "SELECT",
}: ChatOrderModalProps) {
  // 1. Core navigation & Modes within modal
  const [activeTab, setActiveTab] = useState<"SELECT" | "CHAT" | "ORDER">(initialTab);
  const [successOrder, setSuccessOrder] = useState<boolean>(false);

  // 2. Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [mobileChatView, setMobileChatView] = useState<"CHAT" | "UPDATES">("CHAT");

  // 3. Order States (10 Box layout)
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [boxConfigs, setBoxConfigs] = useState<{ size: string; color: string }[]>(
    Array(10).fill(null).map(() => ({ size: "", color: "" }))
  );
  const [userBalance, setUserBalance] = useState(0);
  const [localPipeSizes, setLocalPipeSizes] = useState<{ id: string; size: string; dais: string }[]>([]);

  const loadPipeSizes = () => {
    try {
      const saved = localStorage.getItem("faizan_pipe_sizes_table");
      if (saved) {
        setLocalPipeSizes(JSON.parse(saved));
      } else {
        setLocalPipeSizes([
          { id: "ps-1", size: "3-3", dais: "8DAIS" },
          { id: "ps-2", size: "2-15", dais: "7DAIS" },
          { id: "ps-3", size: "1-5", dais: "6DAIS" },
          { id: "ps-4", size: "1-2", dais: "8DAIS" }
        ]);
      }
    } catch {
      setLocalPipeSizes([
        { id: "ps-1", size: "3-3", dais: "8DAIS" },
        { id: "ps-2", size: "2-15", dais: "7DAIS" },
        { id: "ps-3", size: "1-5", dais: "6DAIS" },
        { id: "ps-4", size: "1-2", dais: "8DAIS" }
      ]);
    }
  };

  // Load user balance for validation
  const loadUserBalance = () => {
    try {
      const total = Number(localStorage.getItem(`faizan_finance_${currentUser}_total`) || "0");
      const spend = Number(localStorage.getItem(`faizan_finance_${currentUser}_spend`) || "0");
      setUserBalance(total - spend);
    } catch {
      setUserBalance(0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserBalance();
      loadChatMessages();
      loadPipeSizes();
      setActiveTab(initialTab);
      setSuccessOrder(false);
    }
  }, [isOpen, currentUser, initialTab]);

  useEffect(() => {
    if (isOpen) {
      if (machines.length > 0) {
        if (!selectedMachineId || !machines.some(m => m.id === selectedMachineId)) {
          setSelectedMachineId(machines[0].id);
        }
      } else {
        setSelectedMachineId("");
      }
    }
  }, [isOpen, machines, selectedMachineId]);

  useEffect(() => {
    window.addEventListener("pipe_sizes_refresh", loadPipeSizes);
    return () => {
      window.removeEventListener("pipe_sizes_refresh", loadPipeSizes);
    };
  }, []);

  // Load chat messages from localStorage
  const loadChatMessages = () => {
    try {
      const saved = localStorage.getItem("faizan_chat_messages");
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Sample welcome message from manager if empty
        const welcome: ChatMessage[] = [
          {
            id: "msg-welcome",
            sender: "faizan",
            recipient: "ALL",
            text: "Welcome to Faizan Bangles Portal! Ask queries, negotiate payments, or order customization directly.",
            timestamp: "2026-05-21 00:00",
          }
        ];
        setMessages(welcome);
        localStorage.setItem("faizan_chat_messages", JSON.stringify(welcome));
      }
    } catch {
      setMessages([]);
    }
  };

  // Scroll to bottom of chats
  useEffect(() => {
    if (activeTab === "CHAT") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  // Find selected machine details & parse its capacity limit
  const selectedMachine = machines.find(m => m.id === selectedMachineId) || machines[0];
  const getMachineCapacity = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  };
  const capacityLimit = selectedMachine ? getMachineCapacity(selectedMachine.name) : 10;

  // Determine if full-screen mode is requested for active views (CHAT or ORDER)
  const isFullScreenMode = activeTab === "CHAT" || activeTab === "ORDER";

  // Calculate active box counts (where both size and color are selected) based on Dais option
  const getDaisPipeWeight = (daisStr: string): number => {
    if (!daisStr) return 0;
    const match = daisStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const getDaisCount = (daisStr: string | undefined): number => {
    if (!daisStr) return 0;
    const match = daisStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const activeCount = boxConfigs.reduce((total, b) => {
    if (b.size && b.color) {
      return total + getDaisPipeWeight(b.color);
    }
    return total;
  }, 0);
  const isOverCapacity = activeCount > capacityLimit;

  // Parse sizes dynamic options list from home page
  const sizeOptions = Array.from(new Set(localPipeSizes.map(p => p.size))).filter(Boolean);

  // Parse dais dynamic options list from home page
  const daisOptions = Array.from(new Set(localPipeSizes.map(p => p.dais))).filter(Boolean);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const newMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: currentUser,
      recipient: isManager ? "USER" : "faizan", // If user is typing, recipient is faizan. If manager is typing, goes to specific context.
      text: newMsg.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem("faizan_chat_messages", JSON.stringify(updated));
    setNewMsg("");

    // Notify manager of new chat message
    if (!isManager) {
      const notification = {
        id: newMessage.id,
        type: "CHAT",
        sender: currentUser,
        text: newMessage.text,
        timestamp: Date.now(),
      };
      localStorage.setItem("faizan_latest_manager_notification", JSON.stringify(notification));
      window.dispatchEvent(
        new CustomEvent("faizan_new_message_alert", {
          detail: notification,
        })
      );
    }
  };

  // Filter messages to show only conversation between currentUser and 'faizan' (or list all if manager)
  // Since 'faizan' is the manager username, let's display only relevant ones
  const filteredMessages = messages.filter(m => {
    if (isManager) {
      // Manager sees messages where they are sender or recipient
      return true; 
    } else {
      // Normal user sees messages between themselves and 'faizan' (manager), or general announcements (recipient is 'ALL' or 'USER')
      return (
        m.sender === currentUser || 
        m.recipient === currentUser || 
        (m.sender === "faizan" && m.recipient === "USER") ||
        m.recipient === "ALL"
      );
    }
  });

  // Separate pure chat messages block from order updates
  const chatMessagesOnly = filteredMessages.filter(m => {
    const textLower = m.text.toLowerCase();
    const isOrderUpdate = 
      m.text.includes("[ORDER UPDATE]") || 
      textLower.includes("order status") || 
      textLower.includes("your order") || 
      textLower.includes("order update") || 
      m.text.includes("order (ID:") || 
      m.text.startsWith("🔔");
    return !isOrderUpdate;
  });

  const orderUpdatesOnly = filteredMessages.filter(m => {
    const textLower = m.text.toLowerCase();
    return (
      m.text.includes("[ORDER UPDATE]") || 
      textLower.includes("order status") || 
      textLower.includes("your order") || 
      textLower.includes("order update") || 
      m.text.includes("order (ID:") || 
      m.text.startsWith("🔔")
    );
  });

  // Handle Box change
  const handleBoxConfigChange = (index: number, field: "size" | "color", value: string) => {
    const updated = [...boxConfigs];
    if (field === "size") {
      // If the size is updated, clear the selected dais (color) to prevent cross-size invalid selections
      updated[index] = {
        size: value,
        color: ""
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setBoxConfigs(updated);
  };

  const handleResetBoxes = () => {
    setBoxConfigs(Array(10).fill(null).map(() => ({ size: "", color: "" })));
  };

  // Place Order Action
  const handlePlaceOrder = () => {
    if (activeCount === 0) {
      alert("Please configure at least 1 pipe box first.");
      return;
    }

    if (activeCount !== capacityLimit) {
      alert(`Invalid Pipes Sum! Selected Machine "${selectedMachine.name}" requires EXACTLY ${capacityLimit} pipes configured in total (currently got ${activeCount}). Please adjust Dais counts to sum up exactly to ${capacityLimit}.`);
      return;
    }

    // Validate each box's size and dais configuration limit
    for (let i = 0; i < boxConfigs.length; i++) {
      const box = boxConfigs[i];
      if (box.size || box.color) {
        if (!box.size) {
          alert(`Box #${i + 1} has a Dais selected but no Size. Please select a Size first.`);
          return;
        }
        if (!box.color) {
          alert(`Box #${i + 1} has a Size selected but no Dais. Please select a Dais count.`);
          return;
        }
        // Validate homepage table capacities
        const matchSize = localPipeSizes.find(p => p.size === box.size);
        if (!matchSize) {
          alert(`Size "${box.size}" in Box #${i + 1} is not found in the homepage "Pipes Size Available" list!`);
          return;
        }
        const maxDais = getDaisCount(matchSize.dais);
        const selectedDais = getDaisPipeWeight(box.color);
        if (selectedDais > maxDais) {
          alert(`Error in Box #${i + 1}: Size "${box.size}" only has ${maxDais} DAIS available on the home page. You cannot select ${selectedDais} DAIS (maximum is ${maxDais})!`);
          return;
        }
      }
    }

    if (userBalance < 29) {
      alert("Insufficient Balance! Minimum ₹29 fee is required.");
      return;
    }

    try {
      // 1. Deduct ₹29 from spend
      const currentSpend = Number(localStorage.getItem(`faizan_finance_${currentUser}_spend`) || "0");
      const newSpend = currentSpend + 29;
      localStorage.setItem(`faizan_finance_${currentUser}_spend`, String(newSpend));

      // 2. Compile order details
      const newOrder: OrderItem = {
        id: "ord-" + Date.now(),
        username: currentUser,
        machineId: selectedMachine.id,
        machineName: selectedMachine.name,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        fee: 29,
        pipes: boxConfigs.filter(b => b.size && b.color),
        status: "PENDING"
      };

      // 3. Save to faizan_orders bucket
      const existingOrdersRaw = localStorage.getItem("faizan_orders");
      const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      localStorage.setItem("faizan_orders", JSON.stringify([newOrder, ...existingOrders]));

      // 4. Send automated audit message into chat
      const autoMsg: ChatMessage = {
        id: "msg-order-" + Date.now(),
        sender: currentUser,
        recipient: "faizan",
        text: `📦 [ORDER PLACED] I have configured and ordered piping for "${selectedMachine.name}" containing ${activeCount} customized pipe(s). ₹29 Production Fee has been deducted from my balance.`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
      };
      
      const updatedMsgs = [...messages, autoMsg];
      setMessages(updatedMsgs);
      localStorage.setItem("faizan_chat_messages", JSON.stringify(updatedMsgs));

      // Notify manager of new order placed
      if (!isManager) {
        const notification = {
          id: newOrder.id,
          type: "ORDER",
          sender: currentUser,
          text: `Placed order for "${selectedMachine.name}" containing ${activeCount} Customized pipes.`,
          timestamp: Date.now(),
        };
        localStorage.setItem("faizan_latest_manager_notification", JSON.stringify(notification));
        window.dispatchEvent(
          new CustomEvent("faizan_new_order_alert", {
            detail: {
              id: newOrder.id,
              sender: currentUser,
              machineName: selectedMachine.name,
              count: activeCount,
              timestamp: Date.now(),
            },
          })
        );
      }

      // 5. Success screen + trigger update
      alert(`Success: Your order containing exactly ${capacityLimit} pipes on "${selectedMachine.name}" has been placed successfully!`);
      setSuccessOrder(true);
      loadUserBalance();
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (e) {
      console.error(e);
      alert("Order placement failed.");
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/95 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 ${isFullScreenMode ? "p-0" : "p-4"}`}>
      <div 
        id="royal-chat-order-pane" 
        className={`relative bg-gradient-to-b from-[#1C1C18] to-[#121210] border-2 border-[#dfaf37] w-full text-white font-sans flex flex-col overflow-hidden transition-all duration-300 ${isFullScreenMode ? "h-screen max-h-none uppercase-none rounded-none border-t-0 border-b-0 max-w-full" : "max-w-4xl rounded-2xl max-h-[90vh]"}`}
      >
        {/* Modal Top Ribbon Header */}
        <div className="bg-gradient-to-r from-[#1c1c18] via-[#2d281a] to-[#1c1c18] border-b border-[#dfaf37]/45 py-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#dfaf37]/15 rounded-xl border border-[#dfaf37]/40 text-[#dfaf37]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fcd975] to-[#dfaf37]">
                ROYAL CHAT & PRODUCTION PORTAL
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                Enterprise Customization Hub • @{currentUser}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Primary Interface Grid */}
        <div className={`flex-grow p-4 overflow-y-auto space-y-4 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4))] ${isFullScreenMode ? "max-h-[calc(100vh-80px)]" : "max-h-[calc(90vh-130px)]"}`}>
          
          {activeTab === "SELECT" && (
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
              <div className="space-y-2">
                <span className="bg-[#dfaf37]/20 border border-[#dfaf37]/30 text-[#dfaf37] text-[10px] px-3.5 py-1 rounded-full font-black uppercase tracking-wider">
                  Exclusive Services Menu
                </span>
                <p className="text-sm text-gray-300">
                  Select an operational mode below to connect with factory administration or customize industrial pipings for your machine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                {/* CHOICE 1: CHAT */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CHAT");
                    loadChatMessages();
                  }}
                  className="group flex flex-col items-center justify-between text-center bg-gradient-to-b from-[#23231F] to-[#141412] hover:to-[#221f15] border-2 border-[#dfaf37]/30 hover:border-[#dfaf37] p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-98 shadow-md cursor-pointer"
                >
                  <div className="p-4 bg-amber-950/40 rounded-full border border-[#dfaf37]/30 group-hover:scale-110 transition-transform">
                    <MessageSquare size={32} className="text-[#fcd975]" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="font-serif font-black text-base uppercase tracking-wider text-[#fcd975]">
                      💬 CHAT MANAGER
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Usi app ke andar manager se direct baat karein, receipts bhejein ya queries puchein.
                    </p>
                  </div>
                  <span className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#dfaf37]/80 group-hover:text-white transition-colors bg-[#dfaf37]/10 py-1.5 px-4 rounded-full border border-[#dfaf37]/20">
                    Open Chat Screen
                  </span>
                </button>

                {/* CHOICE 2: PRODUCTION ORDER */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("ORDER");
                    setSuccessOrder(false);
                    loadUserBalance();
                  }}
                  className="group flex flex-col items-center justify-between text-center bg-gradient-to-b from-[#23231F] to-[#141412] hover:to-[#221f15] border-2 border-[#dfaf37]/30 hover:border-[#dfaf37] p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-98 shadow-md cursor-pointer"
                >
                  <div className="p-4 bg-amber-950/40 rounded-full border border-[#dfaf37]/30 group-hover:scale-110 transition-transform">
                    <Tablet size={32} className="text-[#fcd975]" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="font-serif font-black text-base uppercase tracking-wider text-[#fcd975]">
                      📦 PLACE ORDER
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Dynamic tablet grid ke zarie machines ke pipes design karein and ₹29 custom order order karein.
                    </p>
                  </div>
                  <span className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#dfaf37]/80 group-hover:text-white transition-colors bg-[#dfaf37]/10 py-1.5 px-4 rounded-full border border-[#dfaf37]/20">
                    Open Order Tablet Form
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* CHAT TAB SECTOR */}
          {activeTab === "CHAT" && (
            <div className="flex flex-col h-[calc(100vh-170px)] md:h-[calc(100vh-180px)] min-h-[460px] gap-4">
              
              {/* Desktop and Mobile Sub-tab Navigation */}
              <div className="bg-neutral-900/90 border border-neutral-850 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs uppercase font-black text-[#fcd975] tracking-wider">Direct Messenger Chat Room</span>
                </div>
                
                {/* Mobile View Toggler Buttons */}
                <div className="flex items-center bg-black/60 p-1 rounded-xl border border-[#dfaf37]/20 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setMobileChatView("CHAT")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] uppercase font-black transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                      mobileChatView === "CHAT"
                        ? "bg-[#dfaf37] text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>💬 Chat Box ({chatMessagesOnly.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileChatView("UPDATES")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] uppercase font-black transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer relative ${
                      mobileChatView === "UPDATES"
                        ? "bg-[#dfaf37] text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>🔔 Order Status ({orderUpdatesOnly.length})</span>
                    {orderUpdatesOnly.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("SELECT")}
                  className="text-xs font-bold text-[#dfaf37] hover:underline self-end sm:self-auto"
                >
                  ◀ Change Mode
                </button>
              </div>

              {/* Responsive Grid Panel Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 flex-grow h-full min-h-0">
                
                {/* 1. CHAT MESSAGES PANEL */}
                <div className={`lg:col-span-1 xl:col-span-2 flex flex-col h-full bg-[#0E0E0C]/90 rounded-2xl border border-neutral-850 overflow-hidden min-h-0 ${
                  mobileChatView === "CHAT" ? "flex" : "hidden lg:flex"
                }`}>
                  {/* Chat Section Header */}
                  <div className="bg-neutral-900/60 px-4 py-2 border-b border-neutral-850 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Dialogue Conversational Feed</span>
                  </div>

                  {/* Message scroll log */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-3 font-sans bg-black/40">
                    {chatMessagesOnly.length === 0 ? (
                      <div className="text-center text-gray-400 text-xs py-10 uppercase italic">
                        No chat messages yet. Ask queries or write a massage to start!
                      </div>
                    ) : (
                      chatMessagesOnly.map((msg) => {
                        const isSelf = msg.sender === currentUser;
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[80%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <span className="text-[9px] text-gray-500 font-bold mb-0.5">
                              @{msg.sender} ({msg.timestamp})
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                              isSelf 
                                 ? "bg-[#2d2a20] border-[#dfaf37]/35 text-white rounded-br-none text-left" 
                                 : "bg-neutral-850 border-neutral-750 text-gray-200 rounded-bl-none text-left"
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-neutral-950/80 border-t border-neutral-850 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Apna massage likhein..."
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      className="flex-grow bg-neutral-900 border border-neutral-800 focus:border-[#dfaf37]/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-0 text-white"
                    />
                    <button
                      type="submit"
                      className="bg-[#dfaf37] text-black font-black uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-[#ebd04e] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send size={12} />
                      <span>Send</span>
                    </button>
                  </form>
                </div>

                {/* 2. ORDER UPDATES PANEL */}
                <div className={`lg:col-span-1 xl:col-span-1 flex flex-col h-full bg-[#141412]/95 rounded-2xl border-2 border-[#dfaf37]/30 overflow-hidden min-h-0 ${
                  mobileChatView === "UPDATES" ? "flex" : "hidden lg:flex"
                }`}>
                  
                  {/* Header Title */}
                  <div className="bg-neutral-900/80 px-4 py-2.5 border-b border-neutral-850 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#dfaf37] tracking-wider">📋 Pure Order Status Logs</span>
                    {orderUpdatesOnly.length > 0 && (
                      <span className="text-[9px] bg-[#dfaf37]/15 text-[#dfaf37] border border-[#dfaf37]/30 px-2 py-0.5 rounded-lg font-mono">
                        {orderUpdatesOnly.length} Alerts
                      </span>
                    )}
                  </div>

                  {/* Log stream history */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-black/60 custom-scrollbar text-left font-sans">
                    {orderUpdatesOnly.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-2">
                        <span className="text-3xl">📦</span>
                        <p className="text-gray-400 text-xs uppercase font-bold italic">
                          No Order Updates Yet
                        </p>
                        <p className="text-[10px] text-gray-500 leading-normal">
                          When Manager Faizan Raza accepts, processes, or rejects your custom config, the official alerts will appear instantly in this separate tracker.
                        </p>
                      </div>
                    ) : (
                      orderUpdatesOnly.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-3 bg-neutral-900 border-l-4 border-[#dfaf37] rounded-r-xl rounded-l-md space-y-1.5 shadow-xl"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[8.5px] bg-[#dfaf37]/10 text-[#fcd975] border border-[#dfaf37]/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                              ⚙️ Status Updated
                            </span>
                            <span className="text-[8px] text-gray-500 font-mono">
                              {msg.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-gray-200 leading-relaxed font-semibold">
                            {msg.text.replace(/^[🔔\s]*\[ORDER UPDATE\]\s*/, "")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ORDER TAB SYSTEM (10 BOXES TABLET REPRESENTATION) */}
          {activeTab === "ORDER" && (
            <div className="space-y-4">
              
              {/* Back navigation button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("SELECT");
                    setSuccessOrder(false);
                  }}
                  className="text-xs font-bold text-[#dfaf37] hover:underline cursor-pointer"
                >
                  ◀ Change Mode
                </button>
                <div className="flex items-center gap-2 bg-[#2d2a20] px-3 py-1 rounded-full border border-[#dfaf37]/30 text-xs text-[#fcd975]">
                  <Coins size={12} />
                  <span>Available Balance: <strong>₹{userBalance}</strong></span>
                </div>
              </div>

              {successOrder ? (
                /* Success screen representation */
                <div className="text-center py-10 px-4 bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl space-y-4 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-black text-lg text-emerald-400 uppercase tracking-widest">
                      ORDER PLACED SUCCESSFULLY 🎉
                    </h3>
                    <p className="text-xs text-gray-300">
                      Custom configured piping order registers securely. ₹29 dedicated Fee has been processed. Notification has been wired directly to the Manager's chat records.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessOrder(false);
                        handleResetBoxes();
                        loadUserBalance();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs tracking-wider py-2 px-5 rounded-full cursor-pointer transition-all"
                    >
                      Configure Another Order
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Tablet structure */
                <div className="space-y-4">
                  {/* Select Machine config */}
                  <div className="bg-[#1C1C18] p-4 rounded-xl border border-[#dfaf37]/35 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <label className="block text-[11px] font-black uppercase text-[#dfaf37] tracking-wider">
                        1. SELECT TARGET PIPING MACHINE
                      </label>
                      <span className="text-[10px] text-gray-400 block font-normal">
                        Select from machines operational on the main home panel list.
                      </span>
                    </div>

                    <select
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                      className="bg-black/80 border border-[#dfaf37]/50 text-[#fcd975] rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[#dfaf37] w-full sm:w-64"
                    >
                      {machines.length === 0 ? (
                        <option value="">No available machines</option>
                      ) : (
                        machines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.status})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Tablet Bezel Frame simulation of 10 configurable boxes */}
                  <div className="bg-[#242420] p-4 rounded-3xl border-4 border-neutral-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-neutral-900 border border-[#dfaf37]/30 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                    </div>

                    <div className="bg-black p-4 rounded-2xl border border-neutral-900 space-y-4 mt-2">
                      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#dfaf37]/20 pb-3 gap-2">
                        <div className="text-left">
                          <h4 className="text-xs uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#fcd975]">
                            Custom Piping Tablet Configurator
                          </h4>
                          <span className="text-[9px] text-[#fcd975] uppercase block font-bold mt-1">
                            ⚠️ Support machine limit: {capacityLimit} pipes capacity
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-serif font-black px-2.5 py-1 rounded-lg border tracking-wider ${
                            activeCount === capacityLimit 
                              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 font-extrabold"
                              : "bg-red-950/80 border-red-500/50 text-red-400 font-extrabold animate-pulse"
                          }`}>
                            Pipes Configured: {activeCount} / {capacityLimit}
                          </span>
                          <button
                            type="button"
                            onClick={handleResetBoxes}
                            className="bg-neutral-800 hover:bg-neutral-700 hover:text-white border border-neutral-700 p-1 rounded-lg text-[9px] uppercase font-bold cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Display error if capacity mismatch occurs */}
                      {activeCount !== capacityLimit && (
                        <div className="p-2.5 bg-red-950/60 border border-red-500/40 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-pulse uppercase font-sans font-black">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>Pipes capacity mismatch! Machine "${selectedMachine?.name}" requires EXACTLY {capacityLimit} pipes in total, but you configured {activeCount}. Please adjust individual box Dais counts to sum up exactly to {capacityLimit}.</span>
                        </div>
                      )}

                      {/* Explicit representation of the 10 grid inputs boxes with generous scrolling space */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[calc(100vh-420px)] md:max-h-[calc(100vh-460px)] min-h-[280px] overflow-y-auto pr-1">
                        {boxConfigs.map((box, idx) => {
                          const isConfigured = box.size && box.color;
                          return (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 text-left ${
                                isConfigured 
                                  ? "bg-amber-950/15 border-[#dfaf37]/50 text-white" 
                                  : "bg-neutral-900/60 border-neutral-800 text-gray-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-[10px] uppercase font-black text-[#dfaf37]">
                                  Bangle Pipe Box #{idx + 1}
                                </span>
                                {isConfigured && (
                                  <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded uppercase font-black tracking-widest flex items-center gap-1">
                                    <Check size={8} strokeWidth={4} /> Valid Box
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {/* Size select Dropdown */}
                                <div className="space-y-1">
                                  <label className="text-[8px] uppercase font-bold text-gray-400 block">Pipes Size</label>
                                  <select
                                    value={box.size}
                                    onChange={(e) => handleBoxConfigChange(idx, "size", e.target.value)}
                                    className="w-full bg-black border border-neutral-800 hover:border-[#dfaf37]/30 text-white text-[10.5px] rounded p-1 outline-none font-sans"
                                  >
                                    <option value="">-- Choose Size --</option>
                                    {sizeOptions.map((sz, i) => (
                                      <option key={i} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Available Dais dropdown */}
                                <div className="space-y-1">
                                  <label className="text-[8px] uppercase font-bold text-gray-400 block">Available Dais</label>
                                  <select
                                    value={box.color}
                                    onChange={(e) => handleBoxConfigChange(idx, "color", e.target.value)}
                                    disabled={!box.size}
                                    className="w-full bg-black border border-neutral-800 hover:border-[#dfaf37]/30 text-white text-[10.5px] rounded p-1 outline-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {!box.size ? (
                                      <option value="">-- Choose Size First --</option>
                                    ) : (
                                      (() => {
                                        const matchSize = localPipeSizes.find(p => p.size === box.size);
                                        const maxDaisCount = matchSize ? getDaisCount(matchSize.dais) : 0;
                                        const dropdownDaisOptions = [];
                                        for (let i = 1; i <= maxDaisCount; i++) {
                                          dropdownDaisOptions.push(`${i}DAIS`);
                                        }
                                        return (
                                          <>
                                            <option value="">-- Choose Dais --</option>
                                            {dropdownDaisOptions.map((opt, i) => (
                                              <option key={i} value={opt}>{opt}</option>
                                            ))}
                                          </>
                                        );
                                      })()
                                    )}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Tablet Bezel Footer with Pricing + Payment Validation Section */}
                  <div className="p-4 bg-gradient-to-r from-neutral-900 to-[#1e1d17] rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left space-y-1">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
                        💰 Custom Config Production Toll
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-serif text-[#dfaf37] font-black">₹29.00</span>
                        <span className="text-[9px] bg-[#dfaf37]/15 text-[#dfaf37] border border-[#dfaf37]/30 px-1.5 py-0.5 rounded font-black uppercase">
                          One-time Service fee
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 block">
                        Required available balance: ₹29. Your balance: ₹{userBalance}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      {userBalance < 29 ? (
                        <div className="bg-red-950/50 border border-red-500/30 py-2 px-4 rounded-xl text-red-400 font-bold text-xs uppercase flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Insufficient Balance</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={activeCount === 0 || activeCount !== capacityLimit}
                          className={`w-full sm:w-52 font-serif font-black uppercase text-xs tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md ${
                            activeCount === 0 || activeCount !== capacityLimit 
                              ? "bg-neutral-800 text-gray-500 border border-neutral-750 cursor-not-allowed" 
                              : "bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-black hover:scale-[1.03] active:scale-95 cursor-pointer hover:shadow-[#dfaf37]/20"
                          }`}
                        >
                          <ShoppingBag size={14} className="shrink-0" />
                          <span>ORDER NOW</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}



        </div>
      </div>
    </div>
  );
}
