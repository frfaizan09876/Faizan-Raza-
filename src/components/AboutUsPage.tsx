import { useState, useEffect } from "react";
import { Info, Phone, MapPin, Youtube, User, Edit3, Check, X, LogOut } from "lucide-react";
import { FactoryInfo } from "../types";

interface AboutUsPageProps {
  isManager: boolean;
  factoryInfo: FactoryInfo;
  onUpdateFactoryInfo: (newInfo: FactoryInfo) => void;
  onLogoutClick: () => void;
}

export default function AboutUsPage({
  isManager,
  factoryInfo,
  onUpdateFactoryInfo,
  onLogoutClick,
}: AboutUsPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(factoryInfo.phoneNumber);
  const [address, setAddress] = useState(factoryInfo.factoryAddress);
  const [ytId, setYtId] = useState(factoryInfo.youtubeId);
  const [ytUrl, setYtUrl] = useState(factoryInfo.youtubeUrl);
  const [owner, setOwner] = useState(factoryInfo.ownerName);

  // Keep internal states synced when edited outside
  useEffect(() => {
    setPhone(factoryInfo.phoneNumber);
    setAddress(factoryInfo.factoryAddress);
    setYtId(factoryInfo.youtubeId);
    setYtUrl(factoryInfo.youtubeUrl);
    setOwner(factoryInfo.ownerName);
  }, [factoryInfo]);

  const handleSave = () => {
    onUpdateFactoryInfo({
      phoneNumber: phone.trim() || "+91 ............",
      factoryAddress: address.trim() || "................",
      youtubeId: ytId.trim() || "@................",
      youtubeUrl: ytUrl.trim() || "https://youtube.com",
      ownerName: owner.trim() || "................"
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 mx-auto max-w-xl pb-16">
      
      {/* Title block */}
      <div className="text-center">
        <h2 id="about-page-title" className="font-serif text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <Info className="text-[#fcd975]" />
          <span>ABOUT US</span>
        </h2>
        <p id="about-page-desc" className="text-xs text-[#e8c87a] mt-1 uppercase tracking-widest font-sans font-semibold">
          ⚜️ ESTABLISHED HERITAGE &amp; CONTACT INFORMATION ⚜️
        </p>
      </div>

      {/* Bento styled Profile Card: Dark block, golden border, 3D brutalist borders */}
      <div className="relative bg-[#1A1A1A] border-4 border-[#dfaf37] p-6 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Glow corner circles */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#dfaf37]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-center pb-3 border-b border-[#dfaf37]/20 mb-5">
          <h3 className="font-serif font-black text-[#D4AF37] text-lg uppercase tracking-wider">
            Factory Profile
          </h3>
          
          {/* Edit Switch for authorized managers */}
          {isManager && !isEditing && (
            <button
              id="edit-about-btn"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#D4AF37] hover:bg-white text-black px-4 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <Edit3 size={11} />
              <span>Edit Info</span>
            </button>
          )}
        </div>

        {isEditing ? (
          /* Editor Layout */
          <div className="space-y-4 animate-in fade-in duration-200 bg-black/40 border border-[#dfaf37]/30 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider text-center">
              ✏️ UPDATE OFFICIAL CONTACT INFORMATION
            </h4>
            
            {/* Owner Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <User size={12} className="text-[#dfaf37]" /> Owner Name
              </label>
              <input
                id="edit-owner-input"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Owner full name"
                className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/35 text-[#fcd975] p-2.5 rounded-lg focus:outline-none focus:border-[#dfaf37]"
              />
            </div>

            {/* Mobile Phone Input Notice */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <Phone size={12} className="text-[#dfaf37]" /> Official Contacts
              </label>
              <div className="w-full text-xs font-sans bg-black/45 border border-[#dfaf37]/25 text-gray-300 p-2.5 rounded-lg">
                Hotlines (<span className="text-[#dfaf37]">9428272625</span> and <span className="text-[#dfaf37]">1234567890</span>) are configured for Dealing and Info.
              </div>
            </div>

            {/* Factory Address Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={12} className="text-[#dfaf37]" /> Factory Address
              </label>
              <textarea
                id="edit-address-input"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Industrial plant postal address"
                className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/35 text-[#fcd975] p-2.5 rounded-lg focus:outline-none focus:border-[#dfaf37]"
              />
            </div>

            {/* YouTube Channel ID Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <Youtube size={12} className="text-[#dfaf37]" /> YouTube Handle / ID
              </label>
              <input
                id="edit-ytid-input"
                type="text"
                value={ytId}
                onChange={(e) => setYtId(e.target.value)}
                placeholder="@FaizanBanglesOfficial"
                className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/35 text-[#fcd975] p-2.5 rounded-lg focus:outline-none focus:border-[#dfaf37]"
              />
            </div>

            {/* YouTube Full URL Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <Youtube size={12} className="text-[#dfaf37]" /> YouTube Channel Link (URL)
              </label>
              <input
                id="edit-yturl-input"
                type="text"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/channel-url"
                className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/35 text-[#fcd975] p-2.5 rounded-lg focus:outline-none focus:border-[#dfaf37]"
              />
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                id="discard-about-btn"
                onClick={() => {
                  setOwner(factoryInfo.ownerName);
                  setPhone(factoryInfo.phoneNumber);
                  setAddress(factoryInfo.factoryAddress);
                  setYtId(factoryInfo.youtubeId);
                  setYtUrl(factoryInfo.youtubeUrl);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-gray-950 border border-white/10 hover:bg-gray-800 text-gray-300 py-1.5 px-3 rounded-lg cursor-pointer"
              >
                <X size={12} />
                <span>Cancel</span>
              </button>
              <button
                id="save-about-btn"
                onClick={handleSave}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-[#13120f] font-bold py-1.5 px-4 rounded-lg cursor-pointer hover:brightness-110 shadow-lg"
              >
                <Check size={12} />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          /* Reader Layout Grid */
          <div className="space-y-4">
            
            {/* Owner Row: Bento Tile layout inside index */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-extrabold shadow-md">
                <User size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                  Owner Name
                </p>
                <p className="font-serif text-lg font-bold text-white leading-tight">
                  {factoryInfo.ownerName}
                </p>
              </div>
            </div>

            {/* Warning Announcement Alert */}
            <div className="col-span-1 sm:col-span-2 bg-[#dfaf37]/10 border-2 border-dashed border-[#dfaf37] text-center p-3 sm:py-4 rounded-2xl md:my-1 select-none animate-pulse">
              <span className="text-xs sm:text-sm font-black text-[#dfaf37] tracking-wider uppercase">
                📢 ONLY WHATSAPP CHAT ✅ NO CALL 📵📢
              </span>
            </div>

            {/* Phone Row 1: Dealing */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-extrabold shadow-md">
                <Phone size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                  Phone Number
                </p>
                <a
                  href="tel:9428272625"
                  className="font-mono text-base font-bold text-white hover:text-[#fcd975] hover:underline block"
                >
                  9428272625
                </a>
                <p className="text-[11px] font-black text-[#dfaf37] uppercase tracking-wide">
                  📢 FOR ONLY DEALING
                </p>
              </div>
            </div>

            {/* Phone Row 2: Information */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-extrabold shadow-md">
                <Phone size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                  Phone Number
                </p>
                <a
                  href="tel:1234567890"
                  className="font-mono text-base font-bold text-white hover:text-[#fcd975] hover:underline block"
                >
                  1234567890
                </a>
                <p className="text-[11px] font-black text-[#dfaf37] uppercase tracking-wide">
                  📢 FOR MORE INFORMATION
                </p>
              </div>
            </div>

            {/* Factory Address Row */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-extrabold shadow-md">
                <MapPin size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                  Factory Address
                </p>
                <p className="font-serif text-sm sm:text-base text-gray-100 leading-relaxed font-semibold">
                  {factoryInfo.factoryAddress}
                </p>
              </div>
            </div>

            {/* YouTube Row */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-extrabold shadow-md">
                <Youtube size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">
                  YouTube Channel ID
                </p>
                <a
                  href={factoryInfo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-sm text-[#fcd975] hover:text-white hover:underline font-bold flex items-center gap-1.5"
                >
                  <span>{factoryInfo.youtubeId}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-900 border border-red-500 font-sans text-red-200 shadow-sm">
                    Visit
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}

        {isManager && !isEditing && (
          <p className="mt-4 text-[10px] text-[#fcd975] italic text-center opacity-85">
            💡 You are logged in as Manager. Click the &ldquo;Edit Info&rdquo; button above to modify contacts.
          </p>
        )}
      </div>

      {/* Trust Signpost & Map Placeholder */}
      <div className="bg-white rounded-3xl p-6 border-b-8 border-r-8 border-[#1A1A1A] text-[#1A1A1A] space-y-3 shadow-xl">
        <h4 className="font-serif font-black text-sm uppercase tracking-widest text-[#1c1c18]">
          📍 GLOBAL EXPORT HUB
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          Faizan Bangles manufactures and processes world-class high-density glassware, rings, and electroplated heating tube coils. Operating high-end 25 and 29 pipe machinery configurations to meet standard global tolerances.
        </p>
      </div>

      {/* Logout button at the very end as requested */}
      <div className="pt-6 flex justify-center">
        <button
          id="about-logout-btn"
          onClick={onLogoutClick}
          className="flex items-center gap-2 font-sans font-black text-xs uppercase tracking-widest bg-red-950/90 text-red-300 hover:bg-red-900 border border-red-500/30 py-3.5 px-8 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 shadow-md hover:shadow-red-500/10 cursor-pointer"
        >
          <LogOut size={14} className="shrink-0" />
          <span>Logout From Account</span>
        </button>
      </div>

    </div>
  );
}
