import React, { useState, useEffect } from "react";
import { X, QrCode, Edit2, Trash2, Check, Send, AlertTriangle, AlertCircle, RefreshCw, Smartphone, Upload, Image } from "lucide-react";

interface AddFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  isManager: boolean;
  onBalanceUpdated: () => void;
}

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

export default function AddFundModal({
  isOpen,
  onClose,
  currentUser,
  isManager,
  onBalanceUpdated,
}: AddFundModalProps) {
  // 1. QR Configuration State
  const [qrConfig, setQrConfig] = useState<QrConfig>(() => {
    try {
      const saved = localStorage.getItem("faizan_qr_code_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      upiId: "9428272625@upi",
      businessName: "Faizan Bangles Official",
      customImageUrl: "",
      isActive: true,
    };
  });

  const [isEditingQr, setIsEditingQr] = useState(false);
  const [tempUpi, setTempUpi] = useState(qrConfig.upiId);
  const [tempName, setTempName] = useState(qrConfig.businessName);
  const [tempCustomUrl, setTempCustomUrl] = useState(qrConfig.customImageUrl);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }

    // Limit size to ~1.5MB for storage safety (localStorage limit is ~5MB total)
    if (file.size > 1.5 * 1024 * 1024) {
      setUploadError("Image is too large. Please upload an image file smaller than 1.5MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTempCustomUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // 2. User input states
  const [utr, setUtr] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 3. Deposit Requests State
  const [requests, setRequests] = useState<DepositRequest[]>(() => {
    try {
      const saved = localStorage.getItem("faizan_deposit_requests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-load requests & QR configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("faizan_deposit_requests");
        if (saved) {
          setRequests(JSON.parse(saved));
        }
      } catch {}

      try {
        const savedQr = localStorage.getItem("faizan_qr_code_config");
        if (savedQr) {
          const parsed = JSON.parse(savedQr);
          setQrConfig(parsed);
          setTempUpi(parsed.upiId);
          setTempName(parsed.businessName);
          setTempCustomUrl(parsed.customImageUrl);
        }
      } catch {}

      setFormError("");
      setSuccessMsg("");
      setUtr("");
      setAmountStr("");
    }
  }, [isOpen]);

  // Persist QR Config
  const saveQrConfig = (newConfig: QrConfig) => {
    setQrConfig(newConfig);
    localStorage.setItem("faizan_qr_code_config", JSON.stringify(newConfig));
    setIsEditingQr(false);
  };

  const handleEditQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUpi.trim() && !tempCustomUrl.trim()) {
      alert("Please enter a UPI ID or upload/paste a QR Code image.");
      return;
    }
    const updated = {
      upiId: tempUpi.trim() || "gallery-custom",
      businessName: tempName.trim() || "Faizan Bangles",
      customImageUrl: tempCustomUrl.trim(),
      isActive: true,
    };
    saveQrConfig(updated);
  };

  const handleDeleteQr = () => {
    // Show internal secure visual state dialog instead of blocked window.confirm inside sandbox
    setShowConfirmDelete(true);
  };

  const handleConfirmDeleteActual = () => {
    const updated = {
      ...qrConfig,
      isActive: false,
    };
    saveQrConfig(updated);
    setShowConfirmDelete(false);
  };

  const handleCreateQr = () => {
    const updated = {
      upiId: "9428272625@upi",
      businessName: "Faizan Bangles Official",
      customImageUrl: "",
      isActive: true,
    };
    setTempUpi(updated.upiId);
    setTempName(updated.businessName);
    setTempCustomUrl("");
    saveQrConfig(updated);
  };

  // 4. Request Submission Handler
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const parsedAmount = parseFloat(amountStr);
    if (!utr.trim()) {
      setFormError("Enter a valid UTR / transaction ID.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a valid payment amount greater than zero.");
      return;
    }

    const newRequest: DepositRequest = {
      id: "req-" + Date.now(),
      username: currentUser,
      utrNumber: utr.trim().toUpperCase(),
      amount: parsedAmount,
      timestamp: new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "pending",
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem("faizan_deposit_requests", JSON.stringify(updatedRequests));

    setSuccessMsg("👍 Fund deposit request submitted successfully! Pending approval from manager.");
    setUtr("");
    setAmountStr("");
  };

  // 5. Manager Action Handler (Accept or Close)
  const handleManagerAction = (id: string, action: "accept" | "close") => {
    const updatedRequests = requests.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status: action === "accept" ? ("accepted" as const) : ("rejected" as const),
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    localStorage.setItem("faizan_deposit_requests", JSON.stringify(updatedRequests));

    // If accepted, add amount to user's balance
    const match = requests.find((r) => r.id === id);
    if (match && action === "accept") {
      const reqUser = match.username;
      
      // Load current target user balance
      const currentTotal = Number(localStorage.getItem(`faizan_finance_${reqUser}_total`) || "0");
      const newTotal = currentTotal + match.amount;
      localStorage.setItem(`faizan_finance_${reqUser}_total`, String(newTotal));

      // Also update centrally in faizan_user_accounts list
      try {
        const rawAccounts = localStorage.getItem("faizan_user_accounts");
        if (rawAccounts) {
          const accounts = JSON.parse(rawAccounts);
          const updatedAccs = accounts.map((acc: any) => {
            if (acc.username.toLowerCase() === reqUser.toLowerCase()) {
              const oldTotal = acc.totalAmount || 0;
              const oldSpend = acc.totalSpend || 0;
              const nextTotal = oldTotal + match.amount;
              return {
                ...acc,
                totalAmount: nextTotal,
                availableAmount: nextTotal - oldSpend,
              };
            }
            return acc;
          });
          localStorage.setItem("faizan_user_accounts", JSON.stringify(updatedAccs));
        }
      } catch (e) {
        console.error("Failed to update user list store", e);
      }
    }

    onBalanceUpdated();
  };

  // Generate UPI URI
  const upiPayUri = `upi://pay?pa=${qrConfig.upiId}&pn=${encodeURIComponent(qrConfig.businessName)}&cu=INR`;
  // QR Server dynamic API for safe QR rendering
  const generatedQrUri = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayUri)}`;

  // Display QR Code image URL source
  const qrDisplaySource = qrConfig.customImageUrl ? qrConfig.customImageUrl : generatedQrUri;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative bg-neutral-900 border-4 border-[#D4AF37] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl text-white my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-black/40">
          <div className="flex items-center gap-2">
            <QrCode className="text-[#D4AF37] h-6 h-6 shrink-0" />
            <div>
              <h3 className="text-md font-black uppercase tracking-wide text-[#dfaf37]">
                🏦 DIRECT FUND BILLING PORTAL
              </h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Add money via secure UPI scan &amp; transfer verification
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
          
          {/* DISPLAY UPI QR CODE CONFIG */}
          <div className="bg-black/40 rounded-2xl p-4 border border-[#dfaf37]/25 flex flex-col items-center justify-center text-center space-y-4">
            
            {qrConfig.isActive ? (
              <>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase font-black text-gray-300 tracking-wider">
                    SCAN OFFICIAL QR TO DEPOSIT
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-mono font-bold">
                    UPI Address: {qrConfig.upiId}
                  </p>
                </div>

                {/* The QR Image */}
                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#dfaf37]/45 transition-transform hover:scale-105">
                  <img 
                    src={qrDisplaySource} 
                    alt="Faizan Bangles UPI Merchant QR Code" 
                    className="w-40 h-40 object-contain selection:bg-transparent"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="px-4 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-[10px] uppercase font-bold text-gray-400 tracking-wide flex items-center gap-1.5">
                  <Smartphone className="text-[#dfaf37]" size={12} />
                  <span>Beneficiary: <span className="text-[#dfaf37] font-black">{qrConfig.businessName}</span></span>
                </div>
              </>
            ) : (
              <div className="py-10 text-center space-y-2 select-none">
                <span className="text-4xl text-gray-400">🔇</span>
                <p className="text-xs text-red-400 font-black uppercase font-serif">
                  OFFICIAL QR CODE HAS BEEN DELETED / DISABLED
                </p>
                <p className="text-[10px] text-gray-500 font-medium font-sans">
                  Please ask manager directly for manual bank account transfer or offline invoice cash options.
                </p>
              </div>
            )}

            {/* MANAGER CONTROLS FOR QR CODE (Add, Edit, Delete) */}
            {isManager && (
              <div className="w-full pt-4 border-t border-dashed border-neutral-800/80 space-y-3">
                <div className="flex justify-center gap-2">
                  {qrConfig.isActive ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTempUpi(qrConfig.upiId);
                          setTempName(qrConfig.businessName);
                          setTempCustomUrl(qrConfig.customImageUrl);
                          setIsEditingQr(!isEditingQr);
                        }}
                        className="flex items-center gap-1.5 bg-[#dfaf37] hover:bg-[#aa7c11] text-black font-black text-[9px] uppercase tracking-wider py-1.5 px-3.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 size={10} />
                        <span>Edit QR Info</span>
                      </button>
                      {showConfirmDelete ? (
                        <div className="flex items-center gap-1.5 bg-red-950 p-1.5 rounded-xl border border-red-850 animate-pulse">
                          <span className="text-[8px] uppercase font-black text-red-400 px-1">Confirm Delete?</span>
                          <button
                            type="button"
                            onClick={handleConfirmDeleteActual}
                            className="bg-red-600 hover:bg-red-500 text-black font-black text-[9px] uppercase tracking-wider py-1 px-2.5 rounded-lg cursor-pointer transition-all"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirmDelete(false)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-[9px] uppercase py-1 px-2.5 rounded-lg cursor-pointer transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowConfirmDelete(true)}
                          className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-400 font-bold text-[9px] uppercase tracking-wider py-1.5 px-3.5 rounded-xl transition-all cursor-pointer border border-red-800/50"
                        >
                          <Trash2 size={10} />
                          <span>Delete QR</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTempUpi("");
                          setTempName("Faizan Bangles Official");
                          setTempCustomUrl("");
                          setIsEditingQr(true);
                        }}
                        className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-black text-[9.5px] uppercase tracking-wider py-1.5 px-4 rounded-xl transition-all cursor-pointer border border-emerald-800/50 animate-pulse"
                      >
                        <span>➕ ADD NEW QR CODE</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateQr}
                        className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-[9px] uppercase py-1.5 px-3.5 rounded-xl transition-all cursor-pointer border border-neutral-700"
                      >
                        <span>Reset Default QR</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingQr && (
                  <form onSubmit={handleEditQrSubmit} className="p-3 bg-black/60 rounded-xl border border-[#dfaf37]/35 text-left space-y-3 animate-in fade-in zoom-in-95">
                    <span className="text-[10px] font-black uppercase text-[#dfaf37] tracking-wider block">
                      📝 CONFIGURE MERCHANT UPI QR (MANAGER)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Merchant UPI ID</label>
                        <input
                          type="text"
                          value={tempUpi}
                          onChange={(e) => setTempUpi(e.target.value)}
                          placeholder="e.g. 9428272625@upi"
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 focus:outline-none focus:border-[#dfaf37] text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Merchant Name</label>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="e.g. Faizan Bangles"
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 focus:outline-none focus:border-[#dfaf37] text-xs"
                        />
                      </div>
                    </div>
                    {/* GALLERY QR CODE FILE UPLOADER */}
                    <div className="p-3 bg-neutral-950/50 rounded-xl border border-[#dfaf37]/20 space-y-2">
                      <label className="block text-[9px] text-gray-300 font-extrabold uppercase tracking-wider">
                        📱 Option 1: Mobile Gallery se QR Code Upload karein
                      </label>
                      
                      <div className="relative">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#dfaf37]/45 rounded-xl p-3 bg-neutral-900/60 hover:bg-neutral-900/95 cursor-pointer transition-all">
                          <div className="flex items-center gap-1.5 text-[#dfaf37] text-xs font-black">
                            <Upload size={14} className="animate-bounce" />
                            <span>CHOOSE QR FROM GALLERY / PHOTOS</span>
                          </div>
                          <span className="text-[8px] text-gray-400 mt-1 uppercase font-semibold">
                            Tap here or search device storage
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleGalleryUpload}
                          />
                        </label>
                      </div>

                      {uploadError && (
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-wide bg-red-950/20 p-1.5 rounded-lg">
                          ⚠️ {uploadError}
                        </p>
                      )}

                      {tempCustomUrl && tempCustomUrl.startsWith("data:image/") && (
                        <div className="flex items-center justify-between p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[9.5px]">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Image size={13} />
                            <span>QR loaded from GALLERY!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTempCustomUrl("");
                              setUploadError("");
                            }}
                            className="text-red-400 hover:text-red-300 font-bold underline uppercase text-[8px] cursor-pointer"
                          >
                            Remove QR
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-[10px] text-gray-500 font-black">
                      ─── OR / YA PHIR ───
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">
                        Option 2: Paste Direct Custom Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={tempCustomUrl.startsWith("data:image/") ? "" : tempCustomUrl}
                        onChange={(e) => setTempCustomUrl(e.target.value)}
                        placeholder="e.g. https://domain.com/my-qr.png"
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 focus:outline-none text-xs font-mono"
                        disabled={tempCustomUrl.startsWith("data:image/")}
                      />
                      <span className="text-[9px] text-gray-500 block mt-0.5">
                        {tempCustomUrl.startsWith("data:image/") 
                          ? "Using uploaded QR code above. To input a URL, remove the uploaded QR first."
                          : "Leaving this blank will auto-generate an interactive dynamic UPI payment QR for safety."
                        }
                      </span>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingQr(false);
                          setUploadError("");
                        }}
                        className="text-[9px] font-bold uppercase border border-red-500/20 text-red-400 bg-red-950/20 py-1 px-3.5 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="text-[9px] font-black uppercase bg-[#dfaf37] text-black py-1 px-3.5 rounded-lg cursor-pointer shadow-sm hover:bg-[#c99b2c]"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* USER PAYMENT CONFIRMATION FORM */}
          {qrConfig.isActive && (
            <div className="bg-neutral-950/65 rounded-2xl p-4.5 border border-neutral-850 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                <span className="text-xl">✍️</span>
                <span className="text-xs font-black uppercase tracking-wider text-[#dfaf37]">
                  SUBMIT TRANSACTION FOR APPROVAL
                </span>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-300 mb-1">
                      ENTER UTR NUMBER / PHONEPE TXN ID
                    </label>
                    <input
                      type="text"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="e.g. 314569871542"
                      className="w-full bg-neutral-900 text-white placeholder-gray-600 border border-[#dfaf37]/30 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaf37] font-mono text-xs uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-300 mb-1">
                      ENTER AMOUNT (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-xs">₹</span>
                      <input
                        type="number"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-neutral-900 text-white placeholder-gray-600 border border-[#dfaf37]/30 rounded-xl p-2.5 pl-7 focus:outline-none focus:border-[#dfaf37] font-mono text-xs font-bold"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle size={12} /> {formError}
                  </p>
                )}

                {successMsg && (
                  <p className="text-[10px] text-emerald-400 font-semibold tracking-wide border border-emerald-500/30 bg-emerald-950/20 p-2.5 rounded-xl flex items-start gap-1">
                    {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full h-10 text-xs bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md select-none mt-1 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Send size={13} />
                  <span>Submit Deposit Slip</span>
                </button>
              </form>
            </div>
          )}

          {/* MANAGER'S TRANSACTION APPROVAL REVIEW QUEUE */}
          {isManager && (
            <div className="bg-black/45 rounded-2xl p-4.5 border-2 border-dashed border-[#dfaf37]/50 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">📥</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#dfaf37] block">
                      PENDING AUDIT QUEUE
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Accept or reject user fund notifications
                    </span>
                  </div>
                </div>
                <span className="bg-[#dfaf37] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {requests.filter((r) => r.status === "pending").length} PENDING
                </span>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar text-xs">
                {requests.filter((r) => r.status === "pending").length === 0 ? (
                  <p className="text-gray-500 text-[10px] font-mono italic p-6 text-center select-none">
                    No pending deposit receipts in queue. Nice work!
                  </p>
                ) : (
                  requests
                    .filter((r) => r.status === "pending")
                    .map((req) => (
                      <div 
                        key={req.id} 
                        className="p-3 bg-neutral-900/90 border border-[#dfaf37]/35 rounded-xl space-y-2.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-gray-400 font-mono">{req.timestamp}</span>
                            <p className="text-[11px] font-extrabold text-white">
                              User: <span className="text-[#dfaf37] font-black">@{req.username}</span>
                            </p>
                          </div>
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            ₹{req.amount}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/40 px-2 px-2.5 py-1.5 rounded-lg border border-neutral-800 font-mono text-[10px]">
                          <span className="text-gray-500 font-bold">UTR NO:</span>
                          <span className="text-[#fcd975] font-black">{req.utrNumber}</span>
                        </div>

                        {/* Accept & Close actions requested by user */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleManagerAction(req.id, "accept")}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider rounded-lg transition-transform active:scale-95 cursor-pointer text-center"
                          >
                            Accept Approval
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManagerAction(req.id, "close")}
                            className="px-4 py-1.5 bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-gray-400 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center border border-neutral-800"
                          >
                            Close Receipt
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* USER'S RECENT DEPOSIT REQUESTS HISTORY */}
          <div className="bg-black/15 rounded-2xl p-4 border border-neutral-850 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#dfaf37]/80 block">
              📜 YOUR DEPOSIT REQUESTS HISTORY LOG
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar text-[10px] font-mono">
              {requests.filter((r) => isManager ? true : r.username === currentUser).length === 0 ? (
                <p className="text-gray-500 text-[10px] font-mono italic py-4 text-center select-none">
                  No requests reported yet.
                </p>
              ) : (
                requests
                  .filter((r) => isManager ? true : r.username === currentUser)
                  .map((r) => (
                    <div 
                      key={r.id} 
                      className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-neutral-850"
                    >
                      <div className="text-left space-y-0.5">
                        <span className="text-[9px] text-gray-500 block">{r.timestamp} {isManager && `(@${r.username})`}</span>
                        <span className="text-gray-300 font-bold block">UTR: {r.utrNumber}</span>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <span className="text-white font-black">₹{r.amount}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                          r.status === "accepted" 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" 
                            : r.status === "rejected" 
                              ? "bg-red-950 text-red-400 border border-red-500/20" 
                              : "bg-amber-950 text-amber-400 border border-amber-500/20 animate-pulse"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

        {/* Bottom Footer Notice */}
        <div className="p-4 bg-black/60 text-center border-t border-neutral-800 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider text-gray-500">
          <AlertTriangle className="text-[#dfaf37]" size={11} />
          <span>Verified Ledger under administrative supervision.</span>
        </div>
      </div>
    </div>
  );
}
