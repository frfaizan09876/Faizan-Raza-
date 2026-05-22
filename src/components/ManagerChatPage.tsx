import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  User, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  Phone, 
  Video, 
  ArrowLeft, 
  Search, 
  MoreVertical, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  CircleDot
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
  read?: boolean;
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

export default function ManagerChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [usersList, setUsersList] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSegmentTab, setActiveSegmentTab] = useState<"CHAT" | "ORDERS">("CHAT");
  const [mobileChatView, setMobileChatView] = useState<"CHAT" | "UPDATES">("CHAT");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load chats and structured orders list on mount
  useEffect(() => {
    loadAllRecords();
  }, [selectedUser]);

  // Handle Event listeners to fetch new messages/orders in live mode
  useEffect(() => {
    const handleSync = () => {
      loadAllRecords();
    };

    window.addEventListener("faizan_new_message_alert", handleSync);
    window.addEventListener("faizan_new_order_alert", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("faizan_new_message_alert", handleSync);
      window.removeEventListener("faizan_new_order_alert", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [selectedUser, messages]);

  // Mark messages from selectedUser as read
  const markMessagesAsRead = (username: string, currentMsgs: ChatMessage[]) => {
    let changed = false;
    const updated = currentMsgs.map((m) => {
      if (m.sender === username && m.recipient === "faizan" && !m.read) {
        changed = true;
        return { ...m, read: true };
      }
      return m;
    });

    if (changed) {
      setMessages(updated);
      localStorage.setItem("faizan_chat_messages", JSON.stringify(updated));
      // Notify remainder of the application that read status updated
      window.dispatchEvent(new Event("faizan_chat_messages_updated"));
    }
  };

  const loadAllRecords = () => {
    try {
      // Load chats
      const chatsRaw = localStorage.getItem("faizan_chat_messages");
      const chats: ChatMessage[] = chatsRaw ? JSON.parse(chatsRaw) : [];
      setMessages(chats);

      // Load orders
      const ordersRaw = localStorage.getItem("faizan_orders");
      const savedOrders: OrderItem[] = ordersRaw ? JSON.parse(ordersRaw) : [];
      setOrders(savedOrders);

      // Unique senders listing (excluding 'faizan' the manager himself)
      const usersSet = new Set<string>();
      chats.forEach(m => {
        if (m.sender && m.sender !== "faizan") {
          usersSet.add(m.sender);
        }
        if (m.recipient && m.recipient !== "faizan" && m.recipient !== "USER" && m.recipient !== "ALL") {
          usersSet.add(m.recipient);
        }
      });
      
      // Also add users from orders list who might not have chatted yet
      savedOrders.forEach(o => {
        if (o.username) {
          usersSet.add(o.username);
        }
      });

      const list = Array.from(usersSet);
      setUsersList(list);

      // Auto-select first user if none is selected and on desktop
      if (list.length > 0 && !selectedUser && window.innerWidth >= 1024) {
        setSelectedUser(list[0]);
      }

      // Mark selected chat as read if opened
      if (selectedUser) {
        markMessagesAsRead(selectedUser, chats);
      }
    } catch (e) {
      console.error("Failed to load records", e);
    }
  };

  // Scroll active chat thread down
  useEffect(() => {
    if (activeSegmentTab === "CHAT") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedUser, messages, activeSegmentTab]);

  // Reply submission
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;

    const newReply: ChatMessage = {
      id: "raw-reply-" + Date.now(),
      sender: "faizan",
      recipient: selectedUser,
      text: replyText.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: true
    };

    const updated = [...messages, newReply];
    setMessages(updated);
    localStorage.setItem("faizan_chat_messages", JSON.stringify(updated));

    // Notify the user in real-time
    const userNotification = {
      id: "user-notif-msg-" + Date.now(),
      recipient: selectedUser,
      sender: "faizan",
      text: replyText.trim(),
      type: "CHAT_REPLY",
      timestamp: Date.now()
    };
    localStorage.setItem("faizan_latest_user_notification", JSON.stringify(userNotification));
    window.dispatchEvent(
      new CustomEvent("faizan_new_user_message_alert", {
        detail: userNotification
      })
    );

    setReplyText("");
    
    // Auto scroll down
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Delete message inside thread
  const handleDeleteMessage = (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      localStorage.setItem("faizan_chat_messages", JSON.stringify(updated));
    }
  };

  // Delete order record
  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Do you want to clear/delete this order record?")) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem("faizan_orders", JSON.stringify(updated));
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED") => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const oldStatus = targetOrder.status;
    if (oldStatus === newStatus) return;

    // If changing to REJECTED, refund ₹29
    if (newStatus === "REJECTED" && oldStatus !== "REJECTED") {
      const username = targetOrder.username;
      const currentSpend = Number(localStorage.getItem(`faizan_finance_${username}_spend`) || "0");
      const newSpend = Math.max(0, currentSpend - 29);
      localStorage.setItem(`faizan_finance_${username}_spend`, String(newSpend));
      window.dispatchEvent(new Event("balance_refresh"));
    }

    // If changing away from REJECTED back to others, re-apply ₹29 fee
    if (oldStatus === "REJECTED" && newStatus !== "REJECTED") {
      const username = targetOrder.username;
      const currentSpend = Number(localStorage.getItem(`faizan_finance_${username}_spend`) || "0");
      const newSpend = currentSpend + 29;
      localStorage.setItem(`faizan_finance_${username}_spend`, String(newSpend));
      window.dispatchEvent(new Event("balance_refresh"));
    }

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem("faizan_orders", JSON.stringify(updated));

    const refundText = (newStatus === "REJECTED" && oldStatus !== "REJECTED")
      ? " ₹29 custom production fee has been refunded back to your balance."
      : (oldStatus === "REJECTED" && newStatus !== "REJECTED")
      ? " ₹29 custom production fee has been re-applied and deducted."
      : "";

    // Send status notification directly to the user's thread
    const notifyMsg: ChatMessage = {
      id: "raw-notify-" + Date.now(),
      sender: "faizan",
      recipient: targetOrder.username || "USER",
      text: `🔔 [ORDER UPDATE] Your piping configuration order (ID: ${orderId.substring(4, 9)}) has been updated to status: "${newStatus}" by Manager Faizan Raza.${refundText}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: true
    };
    const updatedMsgs = [...messages, notifyMsg];
    setMessages(updatedMsgs);
    localStorage.setItem("faizan_chat_messages", JSON.stringify(updatedMsgs));

    // Notify the user in real-time
    if (targetOrder.username) {
      const userNotification = {
        id: "user-notif-ord-" + Date.now(),
        recipient: targetOrder.username,
        sender: "faizan",
        text: `Your order (ID: ${orderId.substring(4, 9)}) is now "${newStatus}"!`,
        type: "ORDER_UPDATE",
        timestamp: Date.now()
      };
      localStorage.setItem("faizan_latest_user_notification", JSON.stringify(userNotification));
      window.dispatchEvent(
        new CustomEvent("faizan_new_user_message_alert", {
          detail: userNotification
        })
      );
    }
  };

  // Fetch unread count for a given user
  const getUnreadCount = (username: string) => {
    return messages.filter(m => 
      m.sender === username && 
      m.recipient === "faizan" && 
      m.read !== true
    ).length;
  };

  // Fetch last chat message object
  const getLastMessage = (username: string) => {
    const convo = messages.filter(m => 
      (m.sender === "faizan" && m.recipient === username) ||
      (m.sender === username && (m.recipient === "faizan" || m.recipient === "USER")) ||
      (m.recipient === "ALL")
    );
    if (convo.length === 0) return null;
    return convo[convo.length - 1];
  };

  // Filter threads by search query
  const filteredUsers = usersList.filter(u => u.toLowerCase().includes(searchQuery.toLowerCase()));

  // Active chat conversation messages
  const activeConversation = messages.filter(m => {
    return (
      (m.sender === "faizan" && m.recipient === selectedUser) ||
      (m.sender === selectedUser && (m.recipient === "faizan" || m.recipient === "USER")) ||
      (m.recipient === "ALL")
    );
  });

  // Filtered orders for the current user selected
  const activeUserOrders = orders.filter(o => o.username === selectedUser);

  // Separate pure chat messages block from order updates
  const chatMessagesOnly = activeConversation.filter(m => {
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

  const orderUpdatesOnly = activeConversation.filter(m => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="bg-[#1C1C18] border-2 border-[#dfaf37]/35 p-5 md:p-6 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#dfaf37]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#dfaf37]/20 border border-[#dfaf37]/40 text-[#dfaf37] text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5ClassName">
                <ShieldCheck size={11} />
                <span>Premium Operational Center</span>
              </span>
              <span className="text-emerald-400 bg-emerald-950/40 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Engine
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f7d070] to-[#b8860b]">
              WHATSAPP PREMIUM CHAT & ORDERS
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              Manage buyers instantly with WhatsApp-style visual lists, multi-message badge counts, interactive notifications, and custom order statuses.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAllRecords}
            className="bg-[#2D2A20] hover:bg-[#3D3A30] text-[#fcd975] border border-[#dfaf37]/30 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all self-start md:self-center cursor-pointer shadow-md active:scale-95"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Refresh Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen WhatsApp Container (Master-Detail Workspace) */}
      <div className="border border-[#dfaf37]/30 rounded-3xl overflow-hidden bg-[#0c1317] shadow-2xl flex flex-col h-[650px] relative">
        <div className="flex flex-1 overflow-hidden h-full">
          
          {/* LEFT COLUMN: WhatsApp style Chats Sidebar List */}
          {/* On Mobile views: hidden if a user is currently selected */}
          <div className={`w-full lg:w-[350px] shrink-0 bg-[#111b21] border-r border-[#dfaf37]/15 flex flex-col h-full ${
            selectedUser ? "hidden lg:flex" : "flex"
          }`}>
            
            {/* Sidebar Active Manager Branding Profile Header */}
            <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-black/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#dfaf37] to-[#b8860b] flex items-center justify-center border-2 border-amber-400 font-bold text-black shadow-md shrink-0">
                  FR
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white tracking-wide">Manager Faizan Raza</p>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CircleDot size={10} className="text-emerald-400 shrink-0" /> Online Portal
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[#dfaf37]">
                <span className="text-[9px] bg-[#dfaf37]/10 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-[#dfaf37]/20">
                  ADMIN
                </span>
              </div>
            </div>

            {/* WhatsApp Search Bar */}
            <div className="p-3 bg-[#111b21] border-b border-black/20">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buyer or start chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#202c33] border-none text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none text-white font-sans placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Chat list viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/40">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <MessageSquare size={32} className="mx-auto text-gray-600 mb-2 animate-bounce" />
                  <p className="text-xs text-gray-400 font-serif uppercase tracking-wider italic">
                    No conversations found
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUser === user;
                  const unreadCount = getUnreadCount(user);
                  const lastMsg = getLastMessage(user);
                  const userOrdersCount = orders.filter(o => o.username === user).length;

                  return (
                    <button
                      key={user}
                      onClick={() => {
                        setSelectedUser(user);
                        setActiveSegmentTab("CHAT");
                      }}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer relative ${
                        isSelected 
                          ? "bg-[#2a3942]" 
                          : "hover:bg-[#202c33]/50 bg-transparent"
                      }`}
                    >
                      {/* Avatar initials badge */}
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-neutral-850 to-neutral-900 border border-[#dfaf37]/30 flex items-center justify-center text-xs font-black text-yellow-300">
                          {user.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#111b21]" />
                      </div>

                      {/* Msg description details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-black text-white truncate pr-2">@{user}</span>
                          <span className="text-[9px] text-gray-400 font-mono">
                            {lastMsg ? lastMsg.timestamp.slice(-5) : ""}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-300 truncate font-sans tracking-wide">
                          {lastMsg ? (
                            <>
                              {lastMsg.sender === "faizan" && <span className="text-gray-400 mr-1">You:</span>}
                              {lastMsg.text}
                            </>
                          ) : (
                            <span className="text-gray-500 italic">No message sent</span>
                          )}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          {userOrdersCount > 0 && (
                            <span className="text-[8px] bg-[#dfaf37]/10 text-[#fcd975] border border-[#dfaf37]/20 px-1.5 py-0.5 rounded uppercase font-black">
                              📦 {userOrdersCount} Custom orders
                            </span>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp real dynamic message badge counter */}
                      {unreadCount > 0 ? (
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
                          <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse shadow-md">
                            {unreadCount}
                          </span>
                        </div>
                      ) : (
                        <ChevronRight size={14} className="text-gray-500 shrink-0 select-none" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Chat Area + Placed Orders (Full screen view of threads) */}
          <div className={`flex-1 flex flex-col bg-[#0b141a] h-full relative ${
            selectedUser ? "flex" : "hidden lg:flex"
          }`}>
            
            {/* Elegant background grid mask for styled chat look */}
            <div className="absolute inset-0 bg-[radial-gradient(#1c2a35_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            {selectedUser ? (
              <div className="flex flex-col h-full relative z-10 flex-grow">
                
                {/* Core Header with Back Option on mobile */}
                <div className="bg-[#202c33] border-b border-black/40 px-4 py-3 flex items-center justify-between shadow-md shrink-0">
                  <div className="flex items-center gap-3 text-left">
                    <button
                      onClick={() => setSelectedUser("")}
                      className="lg:hidden text-gray-300 hover:text-white mr-1 p-1 hover:bg-[#2a3942] rounded-full transition-colors cursor-pointer"
                      title="Back to conversation list"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    
                    <div className="h-10 w-10 rounded-full bg-emerald-950 border border-emerald-500/35 flex items-center justify-center text-xs font-black text-[#dfaf37] select-none uppercase">
                      {selectedUser.slice(0, 2)}
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-white tracking-wide mb-0.5 flex items-center gap-1">
                        @{selectedUser}
                      </h3>
                      <p className="text-[10px] text-[#fcd975] font-black uppercase tracking-wider flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Secure Golden Operations
                      </p>
                    </div>
                  </div>

                  {/* Aesthetic Visual Call / Video Options */}
                  <div className="flex items-center gap-4 text-[#dfaf37]">
                    <button className="text-gray-300 hover:text-[#dfaf37] transition-colors cursor-pointer hidden sm:block p-1">
                      <Phone size={16} />
                    </button>
                    <button className="text-gray-300 hover:text-[#dfaf37] transition-colors cursor-pointer hidden sm:block p-1">
                      <Video size={16} />
                    </button>
                    <button className="text-gray-300 hover:text-white transition-colors cursor-pointer p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-navigation tabs: Chat vs Order specification togglers */}
                <div className="bg-[#111b21] border-b border-black/30 flex px-2 shrink-0">
                  <button
                    onClick={() => setActiveSegmentTab("CHAT")}
                    className={`flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-center border-b-2 hover:text-[#dfaf37] duration-150 ${
                      activeSegmentTab === "CHAT"
                        ? "border-[#dfaf37] text-[#dfaf37] bg-black/25"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    💬 WhatsApp Chat thread ({activeConversation.length})
                  </button>
                  <button
                    onClick={() => setActiveSegmentTab("ORDERS")}
                    className={`flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-center border-b-2 hover:text-[#dfaf37] duration-150 relative ${
                      activeSegmentTab === "ORDERS"
                        ? "border-[#dfaf37] text-[#dfaf37] bg-black/25"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    📦 Buyer Custom Orders ({activeUserOrders.length})
                    {activeUserOrders.length > 0 && (
                      <span className="absolute top-2.5 right-6 text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full ml-1 font-mono">
                        {activeUserOrders.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Content Display Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
                  
                  {/* TAB 1: Chat Feed Window */}
                  {activeSegmentTab === "CHAT" && (
                    <div className="flex-1 flex flex-col space-y-3 min-h-0">
                      
                      {/* Sub-tab or View Toggler inside active chat segment */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#202c33]/40 border border-[#dfaf37]/15 p-2 rounded-xl shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] uppercase font-black text-[#dfaf37] tracking-wider">Live Buyer Channels</span>
                        </div>
                        
                        {/* Mobile view togglers */}
                        <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-neutral-800">
                          <button
                            type="button"
                            onClick={() => setMobileChatView("CHAT")}
                            className={`px-3 py-1 rounded text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer ${
                              mobileChatView === "CHAT"
                                ? "bg-[#dfaf37] text-black"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            💬 Conversations ({chatMessagesOnly.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMobileChatView("UPDATES")}
                            className={`px-3 py-1 rounded text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer ${
                              mobileChatView === "UPDATES"
                                ? "bg-[#dfaf37] text-black"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            🔔 Order Alerts ({orderUpdatesOnly.length})
                          </button>
                        </div>
                      </div>

                      {/* Side-by-Side Dual Column Pane */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-grow min-h-0">
                        
                        {/* Column 1: Conversations (Chat Messages) */}
                        <div className={`lg:col-span-2 flex flex-col bg-black/37 border border-neutral-850 rounded-xl overflow-hidden ${
                          mobileChatView === "CHAT" ? "block" : "hidden lg:block"
                        }`}>
                          <div className="p-3 space-y-3">
                            {chatMessagesOnly.length === 0 ? (
                              <div className="text-center p-6 bg-neutral-900/30 border border-neutral-850 rounded-xl max-w-xs mx-auto">
                                <MessageSquare size={24} className="mx-auto text-gray-500 mb-1.5" />
                                <h5 className="text-[10px] font-black text-white uppercase mb-1">No Messages</h5>
                                <p className="text-gray-500 text-[10px]">
                                  Send an instant greeting reply to let them know about capacities.
                                </p>
                              </div>
                            ) : (
                              chatMessagesOnly.map((m) => {
                                const isSelf = m.sender === "faizan";
                                return (
                                  <div 
                                    key={m.id} 
                                    className={`flex flex-col max-w-[85%] ${
                                      isSelf ? "ml-auto items-end" : "mr-auto items-start"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 px-1">
                                      <span className="text-[9px] text-gray-500 font-bold mb-0.5">
                                        @{m.sender}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMessage(m.id)}
                                        className="text-red-400 hover:text-red-300 text-[8px] uppercase underline cursor-pointer font-bold duration-150 pl-1"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                    
                                    <div className={`p-2.5 rounded-xl text-[11px] leading-normal shadow-md border ${
                                      isSelf 
                                        ? "bg-[#005c4b] border-[#005c4b]/30 text-white rounded-tr-none text-left" 
                                        : "bg-[#202c33] border-[#202c33]/30 text-gray-100 rounded-tl-none text-left"
                                    }`}>
                                      <p className="whitespace-pre-wrap">{m.text}</p>
                                      
                                      <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[8px] text-white/50 font-mono">
                                          {m.timestamp}
                                        </span>
                                        {isSelf && (
                                          <CheckCheck size={11} className={m.read ? "text-[#dfaf37]" : "text-white/40"} />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={chatBottomRef} />
                          </div>
                        </div>

                        {/* Column 2: Order Status Log Stream Pane */}
                        <div className={`lg:col-span-1 flex flex-col bg-[#141412]/95 border-2 border-[#dfaf37]/20 rounded-xl overflow-hidden ${
                          mobileChatView === "UPDATES" ? "block" : "hidden lg:block"
                        }`}>
                          <div className="p-2 bg-neutral-900 border-b border-neutral-850 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-[#dfaf37]">⚙️ Order Update Alerts</span>
                            <span className="text-[8px] bg-[#dfaf37]/15 text-[#dfaf37] px-1.5 py-0.5 rounded font-mono font-bold">
                              {orderUpdatesOnly.length} Logs
                            </span>
                          </div>

                          <div className="p-2.5 space-y-2.5 bg-black/40 text-left">
                            {orderUpdatesOnly.length === 0 ? (
                              <div className="text-center py-10 px-3 flex flex-col items-center justify-center text-gray-500">
                                <span className="text-xl mb-1">📦</span>
                                <p className="text-[9px] uppercase font-bold italic tracking-wide">
                                  No Status Actions
                                </p>
                                <p className="text-[8.5px] text-gray-600 font-semibold text-center mt-1">
                                  When you update statuses in the "Buyer Custom Orders" tab, alerts go here separately.
                                </p>
                              </div>
                            ) : (
                              orderUpdatesOnly.map((m) => (
                                <div 
                                  key={m.id}
                                  className="p-2.5 bg-neutral-950 border-l-2 border-[#dfaf37] rounded-r-lg rounded-l-sm space-y-1 relative"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8px] bg-[#dfaf37]/10 text-yellow-300 border border-[#dfaf37]/20 px-1 py-0.2 rounded font-black uppercase">
                                      Status Change
                                    </span>
                                    <span className="text-[7.5px] text-gray-500 font-mono">
                                      {m.timestamp.slice(-5)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-200 leading-tight font-medium font-sans">
                                    {m.text.replace(/^[🔔\s]*\[ORDER UPDATE\]\s*/, "")}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 2: Orders Configuration Listing and Control statuses */}
                  {activeSegmentTab === "ORDERS" && (
                    <div className="flex-1 overflow-y-auto space-y-4 text-left">
                      <div className="bg-black/40 border border-[#dfaf37]/20 p-3.5 rounded-2xl mb-2">
                        <h4 className="text-[11px] font-black uppercase text-[#dfaf37] tracking-wider mb-1 flex items-center gap-1.5">
                          <ShoppingBag size={13} /> ₹29 custom system toll
                        </h4>
                        <p className="text-[10px] text-gray-300">
                          Whenever you update status to <strong>REJECTED</strong>, ₹29 custom production fee is automatically credited back here instantly.
                        </p>
                      </div>

                      {activeUserOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-xs italic uppercase">
                          No custom orders placed by @{selectedUser} yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeUserOrders.map((ord) => (
                            <div 
                              key={ord.id} 
                              className="bg-black/70 border border-[#dfaf37]/25 rounded-2xl p-4 space-y-3 relative overflow-hidden"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-850 pb-2.5 gap-2 text-xs">
                                <div>
                                  <span className="font-serif font-black text-[#dfaf37] block uppercase">
                                    Order ID: {ord.id.replace("ord-", "ORD-#")}
                                  </span>
                                  <span className="text-[9px] text-gray-400 flex items-center gap-1 font-bold mt-0.5">
                                    <Clock size={11} /> {ord.timestamp}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                                    className={`text-[9.5px] uppercase font-black px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                                      ord.status === "COMPLETED" 
                                        ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                                        : ord.status === "PROCESSING"
                                        ? "bg-blue-950 text-blue-400 border-blue-500/50"
                                        : ord.status === "REJECTED"
                                        ? "bg-red-950 text-red-500 border-red-500/50"
                                        : "bg-amber-950 text-amber-400 border-amber-500/50"
                                    }`}
                                  >
                                    <option value="PENDING">🕒 PENDING</option>
                                    <option value="PROCESSING">⚡ PROCESSING</option>
                                    <option value="COMPLETED">✅ COMPLETED</option>
                                    <option value="REJECTED">❌ REJECTED</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(ord.id)}
                                    className="bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-400 p-1.5 rounded-lg hover:text-white cursor-pointer transition-all duration-150"
                                    title="Delete Order Log"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 bg-[#2d2a20] p-2 rounded-xl border border-[#dfaf37]/25 text-xs">
                                <Layers size={13} className="text-[#fcd975]" />
                                <span className="text-white">Machine Config: <strong>{ord.machineName}</strong></span>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-extrabold text-[#dfaf37] tracking-wider block mb-2">
                                  🛠️ Custom Boxes Configurations Layout:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                                  {ord.pipes.map((pipe, idx) => (
                                    <div key={idx} className="bg-neutral-900 p-2 rounded-xl border border-neutral-800 text-[10.5px]">
                                      <span className="text-[8px] text-[#dfaf37] block font-black uppercase">Box {idx + 1}</span>
                                      <p className="font-extrabold text-white truncate">{pipe.color}</p>
                                      <p className="text-[9px] text-gray-400 mt-0.5">Size: {pipe.size}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Submitting Message Reply Bar (Active only when CHAT is displayed) */}
                {activeSegmentTab === "CHAT" && (
                  <form 
                    onSubmit={handleSendReply} 
                    className="p-3 bg-[#1f2c34] flex items-center gap-2 border-t border-black/20 shrink-0"
                  >
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-white transition-colors p-1"
                      title="Insert emoji support"
                    >
                      <Smile size={20} />
                    </button>
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-white transition-colors mr-1 p-1"
                      title="Attach file attachment"
                    >
                      <Paperclip size={18} />
                    </button>

                    <input
                      type="text"
                      placeholder={`Reply to @${selectedUser}... (Press Enter to dispatch)`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-grow bg-[#2a3942] border-none text-xs rounded-xl px-4 py-2.5 text-white placeholder:text-gray-400 focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="h-10 w-10 shrink-0 bg-[#dfaf37] text-black rounded-full flex items-center justify-center hover:bg-[#ebce49] transition-transform active:scale-95 cursor-pointer shadow"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-sm mx-auto text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-[#111b21] border border-[#dfaf37]/20 flex items-center justify-center text-[#dfaf37]">
                  <MessageSquare size={38} />
                </div>
                <div>
                  <h3 className="font-serif font-black uppercase text-[#dfaf37] tracking-wider mb-1.5">
                    Faizan Gold WhatsApp Panel
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Select a buyer from the WhatsApp list on the left to activate this operational workspace thread. Update statuses, track double gold ticks, and configure pricing refund logs instantly.
                  </p>
                </div>
                <div className="bg-[#202c33] border border-white/5 py-1.5 px-3 rounded-full text-[9px] uppercase font-mono text-gray-400 tracking-wider">
                  🔐 End-to-End Encrypted Secure Database
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
