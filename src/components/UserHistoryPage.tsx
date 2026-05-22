import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Calendar, 
  Shield, 
  Phone, 
  Key, 
  UserCheck, 
  RefreshCw, 
  AlertCircle, 
  Ban, 
  CheckCircle2, 
  Users, 
  FileText,
  Coins,
  Wallet,
  PlusCircle,
  ArrowUpRight,
  Check,
  XCircle,
  TrendingUp,
  Award,
  ArrowDownRight,
  UserPlus,
  QrCode,
  Edit2,
  Smartphone,
  ShieldAlert
} from "lucide-react";
import { AuthHistoryItem } from "../types";

interface QrConfig {
  upiId: string;
  businessName: string;
  customImageUrl: string;
  isActive: boolean;
}

interface DepositRequest {
  id: string;
  username: string;
  utrNumber: string;
  amount: number;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

export default function UserHistoryPage() {
  const [historyList, setHistoryList] = useState<AuthHistoryItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signup" | "login">("all");
  const [activeSubTab, setActiveSubTab] = useState<"history" | "accounts" | "balances">("balances");

  // Balance management states
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [targetUsername, setTargetUsername] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditMemo, setCreditMemo] = useState("");
  const [balanceSearchTerm, setBalanceSearchTerm] = useState("");
  const [balanceStatusFilter, setBalanceStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [manualSuccessMsg, setManualSuccessMsg] = useState("");
  const [manualErrorMsg, setManualErrorMsg] = useState("");

  // Debit/Withdrawal management states
  const [debitUsername, setDebitUsername] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitMemo, setDebitMemo] = useState("");
  const [debitSuccessMsg, setDebitSuccessMsg] = useState("");
  const [debitErrorMsg, setDebitErrorMsg] = useState("");

  // QR Configuration States
  const [qrConfig, setQrConfig] = useState<QrConfig>({
    upiId: "9428272625@upi",
    businessName: "Faizan Bangles Official",
    customImageUrl: "",
    isActive: true,
  });
  const [tempQrUpi, setTempQrUpi] = useState("");
  const [tempQrName, setTempQrName] = useState("");
  const [tempQrUrl, setTempQrUrl] = useState("");
  const [qrSuccessMsg, setQrSuccessMsg] = useState("");

  const loadData = () => {
    try {
      // Load History Log List
      const historyData = localStorage.getItem("faizan_auth_history");
      if (historyData) {
        setHistoryList(JSON.parse(historyData));
      } else {
        setHistoryList([]);
      }

      // Load Registered User Accounts List
      const accountsData = localStorage.getItem("faizan_user_accounts");
      if (accountsData) {
        setAccounts(JSON.parse(accountsData));
      } else {
        setAccounts([]);
      }

      // Load Deposit & manual requests list
      const depData = localStorage.getItem("faizan_deposit_requests");
      if (depData) {
        setDepositRequests(JSON.parse(depData));
      } else {
        setDepositRequests([]);
      }

      // Load QR Code Configuration
      const qrData = localStorage.getItem("faizan_qr_code_config");
      if (qrData) {
        const parsed = JSON.parse(qrData);
        setQrConfig(parsed);
        setTempQrUpi(parsed.upiId || "9428272625@upi");
        setTempQrName(parsed.businessName || "Faizan Bangles Official");
        setTempQrUrl(parsed.customImageUrl || "");
      } else {
        const defaultQr = {
          upiId: "9428272625@upi",
          businessName: "Faizan Bangles Official",
          customImageUrl: "",
          isActive: true,
        };
        setQrConfig(defaultQr);
        setTempQrUpi(defaultQr.upiId);
        setTempQrName(defaultQr.businessName);
        setTempQrUrl(defaultQr.customImageUrl);
      }
    } catch (e) {
      console.error("Failed to parse local storage data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all login and signup history logs? This cannot be undone.")) {
      localStorage.removeItem("faizan_auth_history");
      setHistoryList([]);
    }
  };

  const toggleAccountStatus = (username: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("faizan_user_accounts") || "[]");
      const updatedUsers = storedUsers.map((user: any) => {
        if (user.username.toLowerCase() === username.toLowerCase()) {
          const currentlySuspended = !!user.isSuspended;
          return {
            ...user,
            isSuspended: !currentlySuspended
          };
        }
        return user;
      });
      localStorage.setItem("faizan_user_accounts", JSON.stringify(updatedUsers));
      setAccounts(updatedUsers);
      loadData();
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };

  const deleteAccount = (username: string) => {
    if (window.confirm(`Are you absolutely sure you want to completely DELETE the account of "${username}"? They will instantly lose application access.`)) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem("faizan_user_accounts") || "[]");
        const filtered = storedUsers.filter((u: any) => u.username.toLowerCase() !== username.toLowerCase());
        localStorage.setItem("faizan_user_accounts", JSON.stringify(filtered));
        setAccounts(filtered);
        loadData();
      } catch (e) {
        console.error("Failed to delete account", e);
      }
    }
  };

  // Balance Direct Action Logic: "enter username, set amount, click add" -> Autosave into user specific key & list
  const handleManualCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualSuccessMsg("");
    setManualErrorMsg("");

    const parsedAmount = parseFloat(creditAmount);
    const userTrimmed = targetUsername.trim();

    if (!userTrimmed) {
      setManualErrorMsg("Please specify a valid username.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setManualErrorMsg("Amount must be a positive number.");
      return;
    }

    // Verify if username exists in registered database (case-insensitive)
    let matchedUser = accounts.find(
      (acc) => acc.username.toLowerCase() === userTrimmed.toLowerCase()
    );

    let updatedAccountsList = [...accounts];
    if (!matchedUser) {
      // Create user or manager account dynamically to ensure payment always completes successfully
      const isMg = userTrimmed.toLowerCase() === "faizan" || userTrimmed.toLowerCase() === "manager";
      const newAcc = {
        username: userTrimmed,
        fullName: isMg ? "Manager Faizan" : userTrimmed,
        phone: "",
        createdAt: new Date().toISOString(),
        totalAmount: 0,
        totalSpend: 0,
        availableAmount: 0,
        isSuspended: false
      };
      updatedAccountsList.push(newAcc);
      matchedUser = newAcc;
    }

    const memoText = creditMemo.trim() || "Manual Store Credit By Manager";
    const timestampStr = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create a permanent audit request entry with status "accepted" immediately
    const newRequest: DepositRequest = {
      id: "req-manual-" + Date.now(),
      username: matchedUser.username,
      utrNumber: `DIRECT_CREDIT_(${memoText.toUpperCase()})`,
      amount: parsedAmount,
      timestamp: timestampStr,
      status: "accepted",
    };

    // 2. Fetch & increment individual key-value total balance
    const userTotalKey = `faizan_finance_${matchedUser.username}_total`;
    const userSpendKey = `faizan_finance_${matchedUser.username}_spend`;
    const oldTotal = Number(localStorage.getItem(userTotalKey) || "0");
    const nextTotal = oldTotal + parsedAmount;
    localStorage.setItem(userTotalKey, String(nextTotal));

    // 3. Central user account update
    const updatedAccounts = updatedAccountsList.map((acc: any) => {
      if (acc.username.toLowerCase() === matchedUser.username.toLowerCase()) {
        const accTotal = (acc.totalAmount || 0) + parsedAmount;
        const accSpend = acc.totalSpend || 0;
        return {
          ...acc,
          totalAmount: accTotal,
          availableAmount: accTotal - accSpend,
        };
      }
      return acc;
    });
    localStorage.setItem("faizan_user_accounts", JSON.stringify(updatedAccounts));
    setAccounts(updatedAccounts);

    // 4. Update the collective transaction log state & persisted ledger
    const updatedRequests = [newRequest, ...depositRequests];
    setDepositRequests(updatedRequests);
    localStorage.setItem("faizan_deposit_requests", JSON.stringify(updatedRequests));

    // Store details of this manager transfer for the 30-second homepage alert
    const alertData = {
      id: "credit-alert-" + Date.now(),
      recipient: matchedUser.username,
      amount: parsedAmount,
      description: memoText,
      timestamp: Date.now()
    };
    localStorage.setItem("faizan_latest_credit_alert", JSON.stringify(alertData));
    window.dispatchEvent(new Event("faizan_new_credit_alert"));

    setManualSuccessMsg(`✅ Successfully credited ₹${parsedAmount} to User @${matchedUser.username}! Ledger updated.`);
    setTargetUsername("");
    setCreditAmount("");
    setCreditMemo("");
  };

  // Balance Direct Debit Logic: "enter username, set amount, click debit"
  const handleManualDebit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebitSuccessMsg("");
    setDebitErrorMsg("");

    const parsedAmount = parseFloat(debitAmount);
    const userTrimmed = debitUsername.trim();

    if (!userTrimmed) {
      setDebitErrorMsg("Please specify a valid username.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setDebitErrorMsg("Amount must be a positive number.");
      return;
    }

    // Verify if username exists in registered database (case-insensitive)
    let matchedUser = accounts.find(
      (acc) => acc.username.toLowerCase() === userTrimmed.toLowerCase()
    );

    let updatedAccountsList = [...accounts];
    if (!matchedUser) {
      // Create user or manager account dynamically to ensure system integrity
      const isMg = userTrimmed.toLowerCase() === "faizan" || userTrimmed.toLowerCase() === "manager";
      const newAcc = {
        username: userTrimmed,
        fullName: isMg ? "Manager Faizan" : userTrimmed,
        phone: "",
        createdAt: new Date().toISOString(),
        totalAmount: 0,
        totalSpend: 0,
        availableAmount: 0,
        isSuspended: false
      };
      updatedAccountsList.push(newAcc);
      matchedUser = newAcc;
    }

    const userTotalKey = `faizan_finance_${matchedUser.username}_total`;
    const userSpendKey = `faizan_finance_${matchedUser.username}_spend`;
    const oldTotal = Number(localStorage.getItem(userTotalKey) || "0");
    const oldSpend = Number(localStorage.getItem(userSpendKey) || "0");
    const currentAvailable = oldTotal - oldSpend;

    if (currentAvailable < parsedAmount) {
      if (!window.confirm(`⚠️ Alert: User @${matchedUser.username} has an available balance of ₹${currentAvailable}. Deducting ₹${parsedAmount} will push their balance to ₹${currentAvailable - parsedAmount}. This may result in a negative balance. Do you want to proceed?`)) {
        return;
      }
    }

    const memoText = debitMemo.trim() || "Manual Store Debit By Manager";
    const timestampStr = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create a permanent audit entry with a negative amount for financial summary tracing
    const newRequest: DepositRequest = {
      id: "req-manual-debit-" + Date.now(),
      username: matchedUser.username,
      utrNumber: `DIRECT_DEBIT_(${memoText.toUpperCase()})`,
      amount: -parsedAmount,
      timestamp: timestampStr,
      status: "accepted",
    };

    // 2. Fetch & update the individual key-value total balance
    const nextTotal = oldTotal - parsedAmount;
    localStorage.setItem(userTotalKey, String(nextTotal));

    // 3. Central user account update
    const updatedAccounts = updatedAccountsList.map((acc: any) => {
      if (acc.username.toLowerCase() === matchedUser.username.toLowerCase()) {
        const accTotal = (acc.totalAmount || 0) - parsedAmount;
        const accSpend = acc.totalSpend || 0;
        return {
          ...acc,
          totalAmount: accTotal,
          availableAmount: accTotal - accSpend,
        };
      }
      return acc;
    });
    localStorage.setItem("faizan_user_accounts", JSON.stringify(updatedAccounts));
    setAccounts(updatedAccounts);

    // 4. Update collective requests ledger for tracking
    const updatedRequests = [newRequest, ...depositRequests];
    setDepositRequests(updatedRequests);
    localStorage.setItem("faizan_deposit_requests", JSON.stringify(updatedRequests));

    // 5. Store alert specifically typed as "debit" for recipient-only home display
    const alertData = {
      id: "debit-alert-" + Date.now(),
      recipient: matchedUser.username,
      amount: parsedAmount,
      description: memoText,
      timestamp: Date.now(),
      type: "debit"
    };
    localStorage.setItem("faizan_latest_credit_alert", JSON.stringify(alertData));
    
    // Dispatch custom event to notify homepage live
    window.dispatchEvent(new Event("faizan_new_credit_alert"));

    setDebitSuccessMsg(`✅ Successfully debited ₹${parsedAmount} from User @${matchedUser.username}! Ledger updated.`);
    setDebitUsername("");
    setDebitAmount("");
    setDebitMemo("");
  };

  const handleUpdateQrConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setQrSuccessMsg("");

    if (!tempQrUpi.trim()) {
      alert("UPI ID cannot be blank.");
      return;
    }

    const updated: QrConfig = {
      upiId: tempQrUpi.trim(),
      businessName: tempQrName.trim() || "Faizan Bangles Official",
      customImageUrl: tempQrUrl.trim(),
      isActive: qrConfig.isActive,
    };

    setQrConfig(updated);
    localStorage.setItem("faizan_qr_code_config", JSON.stringify(updated));
    setQrSuccessMsg("✅ QR Code Details Updated Successfully!");
    
    setTimeout(() => {
      setQrSuccessMsg("");
    }, 4000);
  };

  const handleToggleQrActive = () => {
    setQrSuccessMsg("");
    const updated = {
      ...qrConfig,
      isActive: !qrConfig.isActive,
    };
    setQrConfig(updated);
    localStorage.setItem("faizan_qr_code_config", JSON.stringify(updated));
    
    setQrSuccessMsg(
      updated.isActive 
        ? "✅ QR Code Activated & Enabled!" 
        : "⚠️ QR Code Suspended/Disabled!"
    );

    setTimeout(() => {
      setQrSuccessMsg("");
    }, 4000);
  };

  // Interactive Reversible Action Engine: Approve or Reject a specific notification
  const handleToggleRequestStatus = (requestId: string, targetStatus: "accepted" | "rejected") => {
    let oldStatus: string = "pending";
    let txnAmount = 0;
    let txnUser = "";

    const updatedRequests = depositRequests.map((req) => {
      if (req.id === requestId) {
        oldStatus = req.status;
        txnAmount = req.amount;
        txnUser = req.username;
        return {
          ...req,
          status: targetStatus,
        };
      }
      return req;
    });

    if (!txnUser) return;

    // Apply the mathematical math correction to the user's balances
    let balanceAction: "add" | "subtract" | "none" = "none";

    if (targetStatus === "accepted") {
      if (oldStatus !== "accepted") {
        balanceAction = "add";
      }
    } else if (targetStatus === "rejected") {
      if (oldStatus === "accepted") {
        balanceAction = "subtract";
      }
    }

    if (balanceAction !== "none") {
      const userTotalKey = `faizan_finance_${txnUser}_total`;
      const currentTotal = Number(localStorage.getItem(userTotalKey) || "0");
      let nextTotal = currentTotal;

      if (balanceAction === "add") {
        nextTotal = currentTotal + txnAmount;
      } else {
        nextTotal = Math.max(0, currentTotal - txnAmount);
      }
      localStorage.setItem(userTotalKey, String(nextTotal));

      // Central register balance synchronizer
      const updatedAccounts = accounts.map((acc: any) => {
        if (acc.username.toLowerCase() === txnUser.toLowerCase()) {
          const spend = acc.totalSpend || 0;
          return {
            ...acc,
            totalAmount: nextTotal,
            availableAmount: nextTotal - spend,
          };
        }
        return acc;
      });
      localStorage.setItem("faizan_user_accounts", JSON.stringify(updatedAccounts));
      setAccounts(updatedAccounts);
    }

    // Save requests
    setDepositRequests(updatedRequests);
    localStorage.setItem("faizan_deposit_requests", JSON.stringify(updatedRequests));
  };

  // Search filter tools
  const term = searchTerm.toLowerCase();

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(term) ||
      item.username.toLowerCase().includes(term) ||
      (item.password && item.password.toLowerCase().includes(term)) ||
      (item.phoneNumber && item.phoneNumber.toLowerCase().includes(term));
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && item.eventType === filterType;
  });

  const filteredAccounts = accounts.filter((item: any) => {
    return (
      item.fullName.toLowerCase().includes(term) ||
      item.username.toLowerCase().includes(term) ||
      (item.password && item.password.toLowerCase().includes(term)) ||
      (item.phoneNumber && item.phoneNumber.toLowerCase().includes(term))
    );
  });

  // Balance Tab Ledger Filter
  const filteredLedger = depositRequests.filter((item) => {
    const balTerm = balanceSearchTerm.toLowerCase();
    const matchesSearch = 
      item.username.toLowerCase().includes(balTerm) ||
      item.utrNumber.toLowerCase().includes(balTerm) ||
      String(item.amount).includes(balTerm);
    
    if (balanceStatusFilter === "all") return matchesSearch;
    return matchesSearch && item.status === balanceStatusFilter;
  });

  const totals = {
    all: historyList.length,
    signup: historyList.filter(h => h.eventType === "signup").length,
    login: historyList.filter(h => h.eventType === "login").length,
    activeAccounts: accounts.filter(a => !a.isSuspended).length,
    suspendedAccounts: accounts.filter(a => !!a.isSuspended).length,
    totalLedgerVolume: depositRequests.reduce((acc, current) => {
      return current.status === "accepted" ? acc + current.amount : acc;
    }, 0),
    pendingLedgerRequests: depositRequests.filter(d => d.status === "pending").length,
  };

  // Secure ironclad guard ensuring regular users can never load or inspect overall logs & funds
  const isUserActualManager = localStorage.getItem("faizan_bangles_is_manager") === "true";
  if (!isUserActualManager) {
    return (
      <div className="bg-[#1c1c18] rounded-3xl p-8 border-r-8 border-b-8 border-red-500 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/80 border border-red-500/30 text-red-400">
          <ShieldAlert size={28} />
        </div>
        <h3 className="font-serif font-black text-xl text-white uppercase tracking-wider">
          Access Restricted Since Manager Only
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          You are not authorized to view the accounts list, money totals, or financial histories of other users. Only the administrator is allowed to configure payment channels and manage ledger credits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Hero Banner */}
      <div className="bg-white rounded-3xl p-6 border-b-8 border-r-8 border-[#1A1A1A] text-[#1D1D1B] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <Shield size={250} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#dfaf37] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Manager Control
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Real-time Audited
              </span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-black uppercase tracking-wider">
              REGISTRATION &amp; SECURITY PORTAL
            </h2>
            <p className="text-xs text-gray-600 max-w-xl font-medium leading-relaxed mt-1">
              Complete administrative workspace. Monitor portal entry logs, manage registered user account locks, and audit/manually assign account financial ledger weights.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              aria-label="Refresh data"
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            {activeSubTab === "history" && historyList.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 py-3 px-5 bg-red-950 text-red-200 hover:bg-red-900 border border-red-500/30 font-sans font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete All Logs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap bg-[#1c1c18] p-1.5 rounded-2xl border border-[#D4AF37]/30 max-w-2xl shadow-lg gap-1.5">
        <button
          onClick={() => {
            setActiveSubTab("balances");
            setSearchTerm("");
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === "balances"
              ? "bg-[#dfaf37] text-black shadow-md"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Coins size={13} />
          <span>💰 BALANCE CONSOLE</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab("accounts");
            setSearchTerm("");
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === "accounts"
              ? "bg-[#dfaf37] text-black shadow-md"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users size={13} />
          <span>👥 USER ACCOUNTS ({accounts.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab("history");
            setSearchTerm("");
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === "history"
              ? "bg-[#dfaf37] text-black shadow-md"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText size={13} />
          <span>⏱️ ENTRY LOGS ({historyList.length})</span>
        </button>
      </div>

      {/* Sub-Page Content 3: Balance Console (brand new section) */}
      {activeSubTab === "balances" && (
        <div className="space-y-6">
          {/* Quick Balance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1c1c18] border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Total Approved User Funds</span>
                <span className="text-3xl font-mono font-black text-emerald-400">₹{totals.totalLedgerVolume}</span>
                <span className="text-[9px] text-gray-500 block">Sum total of all accepted credits on live accounts</span>
              </div>
              <Wallet className="text-emerald-400 h-10 w-10 opacity-70" />
            </div>

            <div className="bg-[#1c1c18] border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Pending Approvals Queue</span>
                <span className="text-3xl font-mono font-black text-amber-400">{totals.pendingLedgerRequests} Pending</span>
                <span className="text-[9px] text-gray-500 block">Transactions submitted by customers awaiting audit</span>
              </div>
              <RefreshCw className="text-amber-400 h-8 w-8 animate-spin" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Direct Manual balance adder form & QR Code Config */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Credit Station */}
              <div className="bg-[#1A1A1A] rounded-3xl p-5 border-4 border-[#B8860B] shadow-2xl space-y-5">
                <div className="flex items-center gap-2 border-b border-[#dfaf37]/20 pb-3">
                  <PlusCircle className="text-[#D4AF37] h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-[#dfaf37] tracking-wider">
                      🪙 DIRECT USER CREDIT STATION
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">INSTANTLY MOD BALANCES PERMANENTLY</p>
                  </div>
                </div>

                <form onSubmit={handleManualCredit} className="space-y-4 text-xs font-sans text-white">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Enter Username
                    </label>
                    <input
                      type="text"
                      value={targetUsername}
                      onChange={(e) => setTargetUsername(e.target.value)}
                      placeholder="e.g. Rahul, User123, Amit"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-[#dfaf37] text-white text-xs font-mono"
                      required
                    />
                    {/* Dropdown helper suggestion layout */}
                    {accounts.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Registered Users:</span>
                        {accounts.slice(0, 5).map((acc) => (
                          <button
                            key={acc.username}
                            type="button"
                            onClick={() => setTargetUsername(acc.username)}
                            className="bg-[#dfaf37]/10 hover:bg-[#dfaf37]/30 border border-[#dfaf37]/35 text-[#dfaf37] text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors"
                          >
                            @{acc.username}
                          </button>
                        ))}
                        {accounts.length > 5 && <span className="text-[9px] text-gray-600 font-bold">...+{accounts.length - 5} more</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Enter Amount to Add (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-serif font-black">₹</span>
                      <input
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 pl-7 focus:outline-none focus:border-[#dfaf37] text-white text-xs font-mono font-bold"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Add Description / Memo (Optional)
                    </label>
                    <input
                      type="text"
                      value={creditMemo}
                      onChange={(e) => setCreditMemo(e.target.value)}
                      placeholder="e.g. Received Cash Offline, Diwali Bonus..."
                      className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaf37] text-white text-xs"
                    />
                    <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">
                      This leaves a permanent audit record in the register history.
                    </span>
                  </div>

                  {manualErrorMsg && (
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-wide bg-red-950/20 p-2.5 rounded-xl border border-red-500/20 flex items-center gap-1.5 animate-pulse">
                      <AlertCircle size={12} />
                      <span>{manualErrorMsg}</span>
                    </p>
                  )}

                  {manualSuccessMsg && (
                    <p className="text-[10px] text-emerald-400 font-bold tracking-wide bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 flex items-start gap-1.5">
                      <span>{manualSuccessMsg}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] hover:brightness-110 active:scale-95 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={14} />
                    <span>➕ CREDIT BALANCE IMMEDIATELY</span>
                  </button>
                </form>
              </div>

              {/* Debit/Withdrawal Station */}
              <div className="bg-[#1A1A1A] rounded-3xl p-5 border-4 border-red-500 shadow-2xl space-y-5">
                <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
                  <ArrowDownRight className="text-red-500 h-5 w-5 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-red-500 tracking-wider">
                      🪙 DIRECT USER DEBIT STATION
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">SECURELY WITHDRAW/CUT USER BALANCES</p>
                  </div>
                </div>

                <form onSubmit={handleManualDebit} className="space-y-4 text-xs font-sans text-white">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Enter Username to Debit
                    </label>
                    <input
                      type="text"
                      value={debitUsername}
                      onChange={(e) => setDebitUsername(e.target.value)}
                      placeholder="e.g. Rahul, User123, Amit"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-red-500 text-white text-xs font-mono"
                      required
                    />
                    {/* Dropdown helper suggestion layout */}
                    {accounts.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Registered Users:</span>
                        {accounts.slice(0, 5).map((acc) => (
                          <button
                            key={acc.username}
                            type="button"
                            onClick={() => setDebitUsername(acc.username)}
                            className="bg-red-500/10 hover:bg-red-500/30 border border-red-500/35 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors"
                          >
                            @{acc.username}
                          </button>
                        ))}
                        {accounts.length > 5 && <span className="text-[9px] text-gray-600 font-bold">...+{accounts.length - 5} more</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Enter Amount to Deduct (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-serif font-black">₹</span>
                      <input
                        type="number"
                        value={debitAmount}
                        onChange={(e) => setDebitAmount(e.target.value)}
                        placeholder="e.g. 2000"
                        className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 pl-7 focus:outline-none focus:border-red-500 text-white text-xs font-mono font-bold"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Reason / Memo for Debit (Optional)
                    </label>
                    <input
                      type="text"
                      value={debitMemo}
                      onChange={(e) => setDebitMemo(e.target.value)}
                      placeholder="e.g. Offline cash refund, weight adjustment..."
                      className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-red-500 text-white text-xs"
                    />
                    <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">
                      This deducts amount permanently and acts as a secure debit audit log.
                    </span>
                  </div>

                  {debitErrorMsg && (
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-wide bg-red-950/20 p-2.5 rounded-xl border border-red-500/20 flex items-center gap-1.5 animate-pulse">
                      <AlertCircle size={12} />
                      <span>{debitErrorMsg}</span>
                    </p>
                  )}

                  {debitSuccessMsg && (
                    <p className="text-[10px] text-emerald-400 font-bold tracking-wide bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 flex items-start gap-1.5">
                      <span>{debitSuccessMsg}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-1.5 border border-red-500/40"
                  >
                    <ArrowDownRight size={14} />
                    <span>➖ DEBIT BALANCE IMMEDIATELY</span>
                  </button>
                </form>
              </div>

              {/* QR Code and UPI Setup Panel */}
              <div className="bg-[#1A1A1A] rounded-3xl p-5 border-4 border-[#dfaf37] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfaf37]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="text-[#dfaf37] h-5 w-5" />
                    <div>
                      <h3 className="text-sm font-black uppercase text-[#dfaf37] tracking-wider">
                        📱 QR &amp; UPI SETTINGS
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">CONFIGURE DEPOSIT DETAILS</p>
                    </div>
                  </div>
                  
                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleQrActive}
                    className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                      qrConfig.isActive
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                        : "bg-red-950/80 text-red-400 border-red-500/30"
                    }`}
                  >
                    {qrConfig.isActive ? "● Active" : "○ Disabled"}
                  </button>
                </div>

                <form onSubmit={handleUpdateQrConfig} className="space-y-4 text-xs font-sans text-white">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      value={tempQrUpi}
                      onChange={(e) => setTempQrUpi(e.target.value)}
                      placeholder="e.g. 9428272625@upi"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaf37] text-white text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Business / Payee Display Name
                    </label>
                    <input
                      type="text"
                      value={tempQrName}
                      onChange={(e) => setTempQrName(e.target.value)}
                      placeholder="e.g. Faizan Bangles Official"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaf37] text-white text-xs font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                      Custom QR Image URL (Optional URL or Base64)
                    </label>
                    <input
                      type="text"
                      value={tempQrUrl}
                      onChange={(e) => setTempQrUrl(e.target.value)}
                      placeholder="Leave blank to auto-generate standard UPI QR Code"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaf37] text-white text-xs font-mono text-ellipsis overflow-hidden"
                    />
                    <span className="text-[9px] text-gray-500 block mt-1 leading-normal">
                      By default, a scanable UPI link dynamic QR is created. Paste an image URL here to show a custom image/logo instead.
                    </span>
                  </div>

                  {qrSuccessMsg && (
                    <p className={`text-[10px] font-bold tracking-wide p-2.5 rounded-xl border flex items-start gap-1.5 transition-all ${
                      qrSuccessMsg.startsWith("✅")
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                        : "text-amber-400 bg-amber-950/20 border-amber-500/20"
                    }`}>
                      <span>{qrSuccessMsg}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-10 bg-white hover:bg-white/90 text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Edit2 size={12} />
                    <span>💼 SAVE QR PAYMENT CONFIG</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Dynamic audited live ledger queue list */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-[#1c1c18] border border-[#dfaf37]/35 p-5 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <FileText className="text-[#dfaf37] h-5 w-5" />
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wider block">
                        📜 ALL LIVE DEPOSITS &amp; AUDIT LEDGER
                      </h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">TRANSACTION HISTORY &amp; APPROVAL ACTIONS</p>
                    </div>
                  </div>

                  <select
                    value={balanceStatusFilter}
                    onChange={(e: any) => setBalanceStatusFilter(e.target.value)}
                    className="bg-black text-[9px] font-black uppercase border border-neutral-800 text-[#dfaf37] rounded-xl p-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="all">📁 ALL LEDGER</option>
                    <option value="pending">⏳ PENDING</option>
                    <option value="accepted">💚 ACCEPTED</option>
                    <option value="rejected">🛑 REJECTED</option>
                  </select>
                </div>

                {/* Sub Search inside Ledger list */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 text-gray-500" size={13} />
                  <input
                    type="text"
                    value={balanceSearchTerm}
                    onChange={(e) => setBalanceSearchTerm(e.target.value)}
                    placeholder="Filter ledger ledger by username, code, or amount..."
                    className="w-full pl-9 pr-3 py-2 bg-black border border-neutral-850 rounded-xl text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-[#dfaf37]"
                  />
                </div>

                {filteredLedger.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-mono text-xs italic">
                    No matching deposit transactions loaded.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredLedger.map((item) => {
                      const isManualCreditItem = item.utrNumber.startsWith("DIRECT_CREDIT_");
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl p-4 border transition-all space-y-3 ${
                            item.status === "accepted"
                              ? "bg-emerald-950/15 border-emerald-500/20"
                              : item.status === "rejected"
                                ? "bg-red-950/15 border-red-500/10"
                                : "bg-amber-950/20 border-amber-500/30 font-semibold"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-[#dfaf37] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                                  @{item.username}
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono italic">
                                  {item.timestamp}
                                </span>
                              </div>
                              <h5 className="text-[11px] text-gray-200 mt-1 font-mono break-all font-bold">
                                {isManualCreditItem ? (
                                  <span className="text-[#dfaf37] font-black">👔 DIRECT MANAGER ASSIGNMENT</span>
                                ) : (
                                  <>
                                    <span className="text-gray-400 font-bold">UTR:</span> <span className="text-[#fcd975] font-black">{item.utrNumber}</span>
                                  </>
                                )}
                              </h5>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-md sm:text-lg font-mono font-black text-emerald-400 block">
                                ₹{item.amount}
                              </span>
                              <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                                item.status === "accepted"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                  : item.status === "rejected"
                                    ? "bg-red-950 text-red-500 border border-red-500/20"
                                    : "bg-amber-950 text-amber-500 border border-amber-500/20"
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          {/* Action controls - Allows direct reject / accept toggling at any time */}
                          <div className="pt-2 border-t border-dashed border-white/5 flex flex-wrap items-center gap-2 justify-between">
                            <span className="text-[9px] text-gray-500 font-mono">
                              ID: {item.id}
                            </span>
                            
                            <div className="flex gap-2">
                              {item.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRequestStatus(item.id, "accepted")}
                                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                  >
                                    <Check size={10} />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRequestStatus(item.id, "rejected")}
                                    className="flex items-center gap-1 bg-red-950 hover:bg-neutral-800 text-red-400 border border-red-500/20 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                  >
                                    <XCircle size={10} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {item.status === "accepted" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to REJECT and DESTRUCT ₹${item.amount} from @${item.username}'s active balance?`)) {
                                      handleToggleRequestStatus(item.id, "rejected");
                                    }
                                  }}
                                  className="flex items-center gap-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                >
                                  <XCircle size={10} />
                                  <span>Deduct &amp; Reject</span>
                                </button>
                              )}

                              {item.status === "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRequestStatus(item.id, "accepted")}
                                  className="flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                >
                                  <Check size={10} />
                                  <span>Re-Approve &amp; Credit</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Sub-Page Content 1: Entry Logs */}
      {activeSubTab === "history" && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFilterType("all")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterType === "all"
                  ? "bg-[#1c1c18] border-[#dfaf37] text-white shadow-lg"
                  : "bg-white/80 border-[#1c1c18]/10 text-gray-800 hover:bg-white"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Logs</div>
              <div className={`text-xl sm:text-2xl font-serif font-black ${filterType === "all" ? "text-[#dfaf37]" : "text-black"}`}>
                {totals.all}
              </div>
            </button>

            <button
              onClick={() => setFilterType("signup")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterType === "signup"
                  ? "bg-[#1c1c18] border-purple-400 text-white shadow-lg"
                  : "bg-white/80 border-[#1c1c18]/10 text-gray-800 hover:bg-white"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-gray-400">New Sign Ups</div>
              <div className={`text-xl sm:text-2xl font-serif font-black ${filterType === "signup" ? "text-purple-400" : "text-black"}`}>
                {totals.signup}
              </div>
            </button>

            <button
              onClick={() => setFilterType("login")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterType === "login"
                  ? "bg-[#1c1c18] border-emerald-400 text-white shadow-lg"
                  : "bg-white/80 border-[#1c1c18]/10 text-gray-800 hover:bg-white"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Logins</div>
              <div className={`text-xl sm:text-2xl font-serif font-black ${filterType === "login" ? "text-emerald-400" : "text-black"}`}>
                {totals.login}
              </div>
            </button>
          </div>

          {/* Search Logs */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="bento search log by username, user name, password or mobile number..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#1A1A1A] rounded-2xl text-xs text-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#dfaf37] focus:border-[#dfaf37] shadow-inner font-medium"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-[#1c1c18] rounded-3xl p-8 border-r-8 border-b-8 border-black text-center space-y-3">
              <AlertCircle className="mx-auto text-[#dfaf37]" size={42} />
              <h3 className="font-serif font-black text-lg text-white uppercase tracking-widest">
                No Logs Found
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {searchTerm 
                  ? "No entry records match your search criteria." 
                  : "Authenticating logs are empty. Users register or login to populate this list."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => {
                const isSignup = item.eventType === "signup";
                const isManagerLogin = item.username.toLowerCase() === "faizan";
                const matchedAccount = accounts.find(
                  (acc) => acc.username.toLowerCase() === item.username.toLowerCase()
                );

                return (
                  <div 
                    key={item.id}
                    className={`rounded-3xl p-5 border-2 border-[#1c1c18] shadow-md flex flex-col justify-between transition-all hover:scale-[1.01] ${
                      isManagerLogin
                        ? "bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-black/20 border-[#dfaf37]"
                        : isSignup 
                          ? "bg-purple-950/20 border-purple-500/20"
                          : "bg-emerald-950/20 border-emerald-500/20"
                    }`}
                  >
                    {/* Header info bar */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1">
                          <Calendar size={11} />
                          {item.timestamp}
                        </span>
                        <h4 className="font-serif font-black text-base text-white mt-1 uppercase flex items-center gap-2">
                          {item.fullName}
                          {isManagerLogin && (
                            <span className="bg-[#dfaf37] text-black text-[8px] font-black px-1.5 py-0.5 rounded">
                              MANAGER
                            </span>
                          )}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                        isSignup
                          ? "bg-purple-950/80 text-purple-300 border border-purple-500/30"
                          : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {isSignup ? "Sign Up" : "Logged In"}
                      </span>
                    </div>

                    {/* Audit variables info block */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-black/40 rounded-xl p-2.5 border border-white/5">
                          <span className="text-[9px] uppercase font-black text-gray-500 block">Username</span>
                          <strong className="text-white font-mono break-all font-bold">{item.username}</strong>
                        </div>

                        <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 relative group block">
                          <span className="text-[9px] uppercase font-black text-gray-500 block">Password</span>
                          <strong className="text-red-300 font-mono break-all font-black flex items-center gap-1 select-all">
                            <Key size={10} className="text-yellow-500" />
                            {item.password || "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
                        <Phone className="text-[#dfaf37] shrink-0" size={13} />
                        <div className="flex-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">Mobile Account Number</span>
                          <strong className="text-yellow-105 font-sans text-xs font-black tracking-wide text-white">
                            {item.phoneNumber || "No Mobile Specified"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Suspension Action integrated directly on entry cards for superb control */}
                    {matchedAccount ? (
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                            matchedAccount.isSuspended 
                              ? "bg-red-950 text-red-400 border border-red-500/30" 
                              : "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {matchedAccount.isSuspended ? (
                              <>
                                <Ban size={10} />
                                <span>SUSPENDED</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={10} />
                                <span>ACTIVE</span>
                              </>
                            )}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => toggleAccountStatus(item.username)}
                          className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            matchedAccount.isSuspended
                              ? "bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                              : "bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40"
                          }`}
                        >
                          {matchedAccount.isSuspended ? "Activate User" : "Suspend User"}
                        </button>
                      </div>
                    ) : (
                      !isManagerLogin && (
                        <div className="mt-4 pt-2 border-t border-white/5 text-[9px] text-gray-500 italic uppercase font-bold">
                          Account has been fully deleted
                        </div>
                      )
                    )}

                    {/* Footer confirmation */}
                    <div className="mt-3 text-right text-[9px] text-gray-400 flex items-center justify-end gap-1 font-bold">
                      <UserCheck size={10} className="text-emerald-400" />
                      <span>Log Index: {item.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Page Content 2: Registered User Accounts list with detailed commands */}
      {activeSubTab === "accounts" && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#1c1c18] border border-emerald-500/20 rounded-2xl text-left">
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">Active Standard Users</span>
              <div className="text-2xl font-serif font-black text-white">{totals.activeAccounts}</div>
              <p className="text-[9px] text-gray-400 mt-1 leading-none">Users with unblocked entry authorization</p>
            </div>
            <div className="p-4 bg-[#1c1c18] border border-red-500/20 rounded-2xl text-left">
              <span className="text-[9px] uppercase font-black text-red-400 tracking-wider">Suspended Logins</span>
              <div className="text-2xl font-serif font-black text-white">{totals.suspendedAccounts}</div>
              <p className="text-[9px] text-gray-400 mt-1 leading-none">Frozen accounts blocked from the portal</p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user accounts by full name, phone number, username or password..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#1A1A1A] rounded-2xl text-xs text-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#dfaf37] focus:border-[#dfaf37] shadow-inner font-medium"
            />
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="bg-[#1c1c18] rounded-3xl p-8 border-r-8 border-b-8 border-black text-center space-y-3">
              <AlertCircle className="mx-auto text-[#dfaf37]" size={42} />
              <h3 className="font-serif font-black text-lg text-white uppercase tracking-widest">
                No Accounts Found
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                There are no registered user accounts. New users can sign up using the portal signup page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((user: any) => {
                const isSuspended = !!user.isSuspended;
                
                // Load this user's finance details dynamically for administrator audit
                const userTotalVal = Number(localStorage.getItem(`faizan_finance_${user.username}_total`) || "0");
                const userSpendVal = Number(localStorage.getItem(`faizan_finance_${user.username}_spend`) || "0");
                const userAvailableVal = userTotalVal - userSpendVal;

                return (
                  <div
                    key={user.username}
                    className={`rounded-3xl p-5 border-2 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isSuspended
                        ? "bg-red-950/20 border-red-500/20"
                        : "bg-[#1c1c18] border-[#dfaf37]/30 shadow-md"
                    }`}
                  >
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif font-black text-base text-white uppercase">
                          {user.fullName}
                        </h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          isSuspended
                            ? "bg-red-950 text-red-400 border border-red-500/30"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {isSuspended ? "⚠️ Suspended" : "⚡ Active"}
                        </span>
                      </div>

                      {/* Display detail tags */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-gray-400">Username:</span>
                          <strong className="text-white font-mono">{user.username}</strong>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Key size={12} className="text-gray-400" />
                          <span className="text-gray-400">Password:</span>
                          <strong className="text-red-300 font-mono tracking-wide">{user.password}</strong>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span className="text-gray-400">Mobile:</span>
                          <strong className="text-yellow-101/90 text-yellow-105 font-mono">{user.phoneNumber || "No Phone"}</strong>
                        </div>
                      </div>

                      {/* Display Financial status tag summary (Strictly limited for Mgr Eyes) */}
                      <div className="bg-black/45 rounded-2xl p-3 border border-neutral-800 flex flex-wrap gap-4 text-[10px] items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-bold uppercase font-sans">Total Ledger:</span>
                          <span className="font-mono font-black text-[#fcd975]">₹{userTotalVal}</span>
                        </div>
                        <div className="h-3 w-px bg-neutral-800" />
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-bold uppercase font-sans">Spend:</span>
                          <span className="font-mono font-black text-red-400">₹{userSpendVal}</span>
                        </div>
                        <div className="h-3 w-px bg-neutral-800" />
                        <div className="flex items-center gap-1">
                          <span className="text-[#dfaf37] font-bold uppercase font-sans">Available Balance:</span>
                          <span className="font-mono font-black text-emerald-400">₹{userAvailableVal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Commands */}
                    <div className="flex items-center gap-2 py-1 select-none border-t border-white/5 lg:border-0 pt-3 lg:pt-0">
                      <button
                        onClick={() => toggleAccountStatus(user.username)}
                        className={`flex-1 sm:flex-initial text-[10px] uppercase font-black tracking-widest py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.03] active:scale-95 ${
                          isSuspended
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold"
                            : "bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {isSuspended ? "Activate Account" : "Suspend Account"}
                      </button>

                      <button
                        onClick={() => deleteAccount(user.username)}
                        aria-label="Delete Account"
                        className="py-2 px-3 bg-[#261515] hover:bg-red-650 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                        title="Delete User Completely"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
