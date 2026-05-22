import React, { useState, useRef } from "react";
import { Upload, Trash2, Palette, Sparkles, Check, AlertCircle, Image as ImageIcon, Edit3, X } from "lucide-react";
import { PipeItem } from "../types";

interface PipesColourPageProps {
  isManager: boolean;
  pipesList: PipeItem[];
  onAddPipe: (newPipe: PipeItem) => void;
  onDeletePipe: (id: string) => void;
  onUpdatePipe: (updatedPipe: PipeItem) => void;
}

export default function PipesColourPage({
  isManager,
  pipesList,
  onAddPipe,
  onDeletePipe,
  onUpdatePipe,
}: PipesColourPageProps) {
  // Input states for adding new pipes
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states for pipesList items
  const [editingPipeId, setEditingPipeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<string>("");
  const [editError, setEditError] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (pipe: PipeItem) => {
    setEditingPipeId(pipe.id);
    setEditTitle(pipe.title);
    setEditDescription(pipe.description || "");
    setEditImage(pipe.imageUrl);
    setEditError("");
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setEditError("Select a valid image (.jpg, .png, .webp).");
        return;
      }
      if (file.size > 1.2 * 1024 * 1024) {
        setEditError("Image must be under 1.2MB for system storage.");
        return;
      }
      setEditError("");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) {
      setEditError("Please write a title.");
      return;
    }
    const match = pipesList.find((p) => p.id === id);
    if (match) {
      const updated: PipeItem = {
        ...match,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        imageUrl: editImage,
      };
      onUpdatePipe(updated);
      setEditingPipeId(null);
    }
  };

  // Convert uploaded image file to base64
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (.jpg, .png, .jpeg, .webp).");
      return;
    }

    // Limit size to prevent localStorage limit saturation
    if (file.size > 1.2 * 1024 * 1024) {
      setErrorMessage("File is too large. Please select an image under 1.2MB for local storage save.");
      return;
    }

    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!base64Image) {
      setErrorMessage("Please select or drag-and-drop a photo first.");
      return;
    }

    if (!newTitle.trim()) {
      setErrorMessage("Please enter a title for the photo.");
      return;
    }

    const newPipe: PipeItem = {
      id: "pipe-custom-" + Date.now(),
      imageUrl: base64Image,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAddPipe(newPipe);

    // Reset fields
    setNewTitle("");
    setNewDescription("");
    setBase64Image(null);
    setSuccessMessage("Photo uploaded successfully to available pipes colour!");
    
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Preset quick palettes to auto-populate design ideas
  const useDemoBangles = (type: number) => {
    let img = "";
    let title = "";
    let desc = "";

    if (type === 1) {
      img = "https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=600";
      title = "Ruby Red Heat Crafted Pipe";
      desc = "Deep ruby red metallic glass formulation used in custom ornamental design.";
    } else if (type === 2) {
      img = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
      title = "Saffron Gold Satin Finished Coil";
      desc = "Premium matte saffron texture suited for export luxury bangles.";
    } else if (type === 3) {
      img = "https://images.unsplash.com/photo-1596541223130-5d31a4e5916c?auto=format&fit=crop&q=80&w=600";
      title = "Emerald Glass Smelted Pipe";
      desc = "Classic high-durability emerald glass molding rods.";
    }

    setBase64Image(img);
    setNewTitle(title);
    setNewDescription(desc);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 pb-16 max-w-6xl mx-auto">
      
      {/* Page Title */}
      <div className="text-center">
        <h2 id="gallery-page-title" className="font-serif text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <Palette className="text-[#fcd975]" />
          <span>AVAILABLE PIPES COLOUR</span>
        </h2>
        <p id="gallery-page-desc" className="text-xs text-[#e8c87a] mt-1 uppercase tracking-widest font-sans font-semibold">
          ⚜️ FACTORY SATIN COLOURED GLASS SELECTION ⚜️
        </p>
      </div>

      {/* Uploader section - Bento Dark Style with thick golden borders */}
      {isManager ? (
        <div 
          id="uploader-section"
          className="bg-[#1A1A1A] border-4 border-[#dfaf37] p-6 rounded-3xl shadow-2xl space-y-4 text-white animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#dfaf37]/35">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dfaf37] text-xs text-[#1c1c18] font-black">+</span>
            <h3 className="font-serif font-black text-sm sm:text-base text-[#D4AF37] uppercase tracking-wide">
              UPLOAD NEW PHOTO SPECIFICATION
            </h3>
          </div>

          <form id="upload-pipe-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Drag and Drop Box */}
            <div
              id="dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer py-6 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                dragActive 
                  ? "border-[#fcd975] bg-[#fcd975]/10" 
                  : base64Image 
                    ? "border-emerald-500 bg-emerald-500/10" 
                    : "border-[#dfaf37]/40 hover:border-[#dfaf37] bg-black/40"
              }`}
            >
              <input
                ref={fileInputRef}
                id="file-upload-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {base64Image ? (
                <div className="text-center space-y-2">
                  <div className="relative mx-auto w-32 h-20 rounded-xl overflow-hidden border-2 border-[#dfaf37]">
                    <img 
                      src={base64Image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <Check size={14} /> Photo Selected Successfully
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBase64Image(null);
                    }}
                    className="text-[10px] text-red-400 hover:underline block mx-auto underline uppercase font-bold tracking-wider"
                  >
                    Clear photo block
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-1.5 pointer-events-none">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#dfaf37]/10 text-[#fcd975]">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-semibold text-gray-300">
                    Drag and drop your image, or <span className="text-[#fcd975] hover:underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Supports PNG, JPG, JPEG or WEBP (Max 1.2MB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Presets / Help for testing easily */}
            <div className="p-3 bg-[#13120f] border border-[#dfaf37]/20 rounded-2xl">
              <span className="text-[10px] uppercase font-black text-gray-400 block mb-1.5 tracking-wider">
                ⚡ Quick Presets (Click to Auto-fill gorgeous testing photos!)
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => useDemoBangles(1)}
                  className="text-[10px] font-bold bg-[#dfaf37]/20 hover:bg-[#dfaf37]/45 text-[#fcd975] px-3 py-1.5 rounded-lg border border-[#dfaf37]/35 transition-all cursor-pointer"
                >
                  🔴 Ruby Red Pipe
                </button>
                <button
                  type="button"
                  onClick={() => useDemoBangles(2)}
                  className="text-[10px] font-bold bg-[#dfaf37]/20 hover:bg-[#dfaf37]/45 text-[#fcd975] px-3 py-1.5 rounded-lg border border-[#dfaf37]/35 transition-all cursor-pointer"
                >
                  🟡 Saffron Satin
                </button>
                <button
                  type="button"
                  onClick={() => useDemoBangles(3)}
                  className="text-[10px] font-bold bg-[#dfaf37]/20 hover:bg-[#dfaf37]/45 text-[#fcd975] px-3 py-1.5 rounded-lg border border-[#dfaf37]/35 transition-all cursor-pointer"
                >
                  🟢 Emerald Glass
                </button>
              </div>
            </div>

            {/* Title and Description Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide block">
                  Photo Title <span className="text-[#dfaf37]">*</span>
                </label>
                <input
                  id="new-bangle-title"
                  type="text"
                  placeholder="e.g. Amber Gold Smooth Satin Pipe"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/30 rounded-lg py-2.5 px-3 text-[#fcd975] focus:outline-none focus:border-[#dfaf37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide block">
                  Short Subtitle/Details (Optional)
                </label>
                <input
                  id="new-desc-input"
                  type="text"
                  placeholder="e.g. Available in all standard export lot sizes"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs font-sans bg-[#13120f] border border-[#dfaf37]/30 rounded-lg py-2.5 px-3 text-[#fcd975] focus:outline-none focus:border-[#dfaf37]"
                />
              </div>
            </div>

            {errorMessage && (
              <p id="uploader-error-banner" className="text-xs bg-red-950/40 border border-red-500/20 text-red-300 rounded p-2.5 text-center flex items-center justify-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            {successMessage && (
              <p id="uploader-success-banner" className="text-xs bg-emerald-950/40 border border-emerald-500/25 text-emerald-300 rounded p-2.5 text-center flex items-center justify-center gap-1.5 font-bold animate-pulse">
                <Check size={14} className="shrink-0" />
                <span>{successMessage}</span>
              </p>
            )}

            <button
              id="upload-pipe-submit"
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#dfaf37] via-[#fcd975] to-[#aa7c11] text-[#1c1c18] font-black text-xs uppercase tracking-widest rounded-lg shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Save Category Photo Box</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-[#dfaf37]/60 py-4 px-6 rounded-3xl text-center shadow-lg max-w-2xl mx-auto">
          <p className="text-xs text-[#fcd975] font-serif tracking-widest uppercase font-black">
            🔒 Log in as Manager to upload custom factory colors or specifications.
          </p>
        </div>
      )}

      {/* Pipes Layout Grid: Bento styled White/Black thick offset cards layout */}
      <div 
        id="pipes-grid" 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2"
      >
        {pipesList.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-black/45 border-4 border-[#dfaf37] rounded-3xl space-y-2">
            <ImageIcon className="mx-auto text-[#dfaf37] h-10 w-10 animate-pulse" />
            <p className="text-sm font-black text-[#fcd975] uppercase tracking-wider">No factory colors listed.</p>
            <p className="text-xs text-gray-400">Log in as Manager to upload custom designs.</p>
          </div>
        ) : (
          pipesList.map((pipe) => {
            const isEditingThis = editingPipeId === pipe.id;

            if (isEditingThis) {
              return (
                <div
                  key={pipe.id}
                  id={`pipe-box-edit-${pipe.id}`}
                  className="bg-[#1A1A1A] text-white rounded-3xl border-b-8 border-r-8 border-[#dfaf37] border-t border-l border-[#dfaf37]/45 p-5 overflow-hidden shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-left"
                >
                  <div className="text-center pb-2 border-b border-[#dfaf37]/35">
                    <span className="text-xs text-[#fcd975] font-serif font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Edit3 size={11} className="animate-pulse text-[#dfaf37]" /> Edit Pipe Specs
                    </span>
                  </div>

                  {/* Edit Image Container */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Item Photograph</span>
                    <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden border border-[#dfaf37]/25 flex items-center justify-center shadow-inner">
                      {editImage ? (
                        <img
                          src={editImage}
                          alt="Edit Thumbnail Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-[#dfaf37]/50" />
                      )}
                      
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-black/90 hover:bg-black text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider border border-[#dfaf37] transition-all cursor-pointer shadow-lg active:scale-95"
                      >
                        Change Photo
                      </button>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditFileChange}
                      />
                    </div>
                  </div>

                  {/* Title field */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Title Text</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-xs font-sans bg-black border border-[#dfaf37]/30 rounded-lg py-2 px-3 text-[#fcd975] focus:outline-none focus:border-[#dfaf37]"
                      placeholder="e.g. Amber Gold Smooth Satin"
                      required
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Short description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-xs font-sans bg-black border border-[#dfaf37]/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#dfaf37] resize-none"
                      placeholder="Lot details, formulation specs..."
                      rows={2}
                    />
                  </div>

                  {editError && (
                    <p className="text-[9px] text-red-400 bg-red-950/60 border border-red-500/20 py-1 px-2 rounded font-extrabold text-center uppercase tracking-wide">
                      ⚠️ {editError}
                    </p>
                  )}

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-800 mt-auto">
                    <button
                      type="button"
                      onClick={() => setEditingPipeId(null)}
                      className="flex-1 py-1.5 px-2 bg-gray-950 border border-white/10 hover:bg-gray-900 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(pipe.id)}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#dfaf37] to-[#aa7c11] text-[#1c1c18] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center hover:brightness-110 active:scale-95 shadow-md"
                    >
                      Save Specs
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pipe.id}
                id={`pipe-box-${pipe.id}`}
                className="group/card bg-white rounded-3xl border-b-8 border-r-8 border-[#1A1A1A] border-t border-l border-[#1A1A1A]/10 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] flex flex-col relative text-[#1A1A1A]"
              >
                {/* Photo/Image Container */}
                <div className="relative w-full aspect-square bg-[#1A1A1A] overflow-hidden border-b-4 border-[#1A1A1A] select-none">
                  <img
                    src={pipe.imageUrl}
                    alt={pipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Secure stateful confirm delete overlay inside container to bypass browser confirm blocks */}
                  {confirmDeleteId === pipe.id ? (
                    <div className="absolute inset-0 bg-[#1c1c18]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in duration-200">
                      <Trash2 className="text-red-500 h-8 w-8 animate-bounce mb-2" />
                      <p className="text-xs font-serif font-black text-white uppercase tracking-wider">Are you sure?</p>
                      <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-normal">This removes "{pipe.title}" from the gallery catalogue</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="bg-gray-800 hover:bg-gray-700 text-white border border-white/10 py-1.5 px-3.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePipe(pipe.id);
                            setConfirmDeleteId(null);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded-xl text-[10px] font-black uppercase cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    isManager && (
                      <div className="absolute top-3 right-3 flex gap-1.5 z-10 bg-black/85 rounded-xl p-1.5 border border-white/10 shadow-lg matches-action-btn">
                        {/* Edit Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(pipe);
                          }}
                          className="bg-gray-900 hover:bg-gray-800 text-[#fcd975] hover:text-white p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-white/5 shadow-inner"
                          title="Edit specifications"
                        >
                          <Edit3 size={11} />
                        </button>

                        {/* Delete Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(pipe.id);
                          }}
                          className="bg-red-950/90 text-red-300 hover:bg-red-900 duration-150 p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-red-500/20"
                          title="Delete item from factory gallery"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )
                  )}
                  
                  {/* Visual Glow Indicator */}
                  <span className="absolute bottom-3 left-3 flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>

                {/* Title and Detail Box underneath the photo */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-[#1A1A1A] font-black text-base leading-tight tracking-tight uppercase">
                      {pipe.title}
                    </h4>
                    {pipe.description && (
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        {pipe.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>ID: {pipe.id.slice(0, 10).toUpperCase()}</span>
                    <span className="font-bold text-[#D4AF37] bg-[#1A1A1A] text-white px-2 py-0.5 rounded uppercase tracking-wider scale-95">
                      Ready Stock
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
