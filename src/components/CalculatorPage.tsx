import React, { useEffect, useState } from "react";
import { Calculator, History } from "lucide-react";

interface CalculatorPageProps {
  currentUser: string;
}

export default function CalculatorPage({ currentUser }: CalculatorPageProps) {
  // iPhone Calculator States
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcFormula, setCalcFormula] = useState("");
  const [calcHistory, setCalcHistory] = useState<{ id: string; formula: string; result: string; timestamp: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`faizan_calculator_history_${currentUser}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistorySection, setShowHistorySection] = useState(true);

  // Synchronize dynamic history logs when user changes
  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem(`faizan_calculator_history_${currentUser}`);
      setCalcHistory(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Failed to load user specific history", e);
      setCalcHistory([]);
    }
  }, [currentUser]);

  // Persist calculator history
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`faizan_calculator_history_${currentUser}`, JSON.stringify(calcHistory));
  }, [calcHistory, currentUser]);

  // iPhone Calculator Press Logic
  const handleCalcPress = (val: string) => {
    if (val === "C" || val === "AC") {
      setCalcDisplay("0");
      setCalcFormula("");
    } else if (val === "+/-") {
      if (calcDisplay !== "0") {
        if (calcDisplay.startsWith("-")) {
          setCalcDisplay(calcDisplay.substring(1));
        } else {
          setCalcDisplay("-" + calcDisplay);
        }
      }
    } else if (val === "%") {
      try {
        const num = parseFloat(calcDisplay);
        if (!isNaN(num)) {
          const res = (num / 100).toString();
          setCalcDisplay(res);
        }
      } catch (e) {
        setCalcDisplay("Error");
      }
    } else if (val === "=") {
      if (!calcFormula) return;
      const fullExpression = calcFormula + " " + calcDisplay;
      try {
        // Replace visual symbols
        let expr = fullExpression.replace(/×/g, "*").replace(/÷/g, "/");
        
        // Sanitize to arithmetic only expressions
        const sanitizedExpr = expr.replace(/[^0-9+\-*/().\s]/g, "");
        const computed = new Function(`return (${sanitizedExpr})`)();
        
        if (computed === undefined || isNaN(computed)) {
          setCalcDisplay("Error");
          return;
        }

        const formattedResult = Number(Number(computed).toFixed(4)).toString();
        
        // Add to history
        const newHistoryItem = {
          id: "hist-" + Date.now(),
          formula: fullExpression,
          result: formattedResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        };
        
        setCalcHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
        setCalcDisplay(formattedResult);
        setCalcFormula("");
      } catch (e) {
        setCalcDisplay("Error");
      }
    } else if (["+", "-", "×", "÷"].includes(val)) {
      setCalcFormula(calcDisplay + " " + val);
      setCalcDisplay("0");
    } else {
      if (val === ".") {
        if (calcDisplay.includes(".")) return;
        setCalcDisplay(calcDisplay + ".");
      } else {
        if (calcDisplay === "0" || calcDisplay === "Error") {
          setCalcDisplay(val);
        } else {
          setCalcDisplay(calcDisplay + val);
        }
      }
    }
  };

  const clearCalcHistory = () => {
    setCalcHistory([]);
  };

  return (
    <div id="calculator-page-container" className="w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-6">
      {/* Page Title Board */}
      <div className="bg-[#1c1c18]/90 border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <h1 className="text-2.5xl sm:text-4xl font-black uppercase tracking-widest text-[#D4AF37] drop-shadow-md">
          🧮 ROYAL COMMERCIAL BILLING SYSTEM
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-300 font-serif max-w-2xl mx-auto leading-relaxed">
          Full-screen production billing calculations tool for industrial glass, metal pipe estimations, custom itemization batch accounting &amp; secure ledger output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Calculations History */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1A1A] rounded-3xl p-6 border-2 border-[#D4AF37]/50 shadow-2xl text-white flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#dfaf37] flex items-center gap-1.5">
                <History size={18} /> Dynamic Calculations Ledger
              </span>
              {calcHistory.length > 0 && (
                <button
                  onClick={clearCalcHistory}
                  className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 hover:underline transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="max-h-[500px] lg:max-h-[550px] overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
              {calcHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center select-none space-y-3">
                  <span className="text-4xl">📜</span>
                  <p className="text-gray-500 text-xs font-mono italic">
                    No recent calculations recorded. Try solving something on the main terminal billing keypad!
                  </p>
                </div>
              ) : (
                calcHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center py-3 px-4 bg-black/40 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all font-mono"
                  >
                    <div className="flex flex-col text-left space-y-0.5">
                      <span className="text-[9px] text-gray-500 font-bold">{item.timestamp}</span>
                      <span className="text-gray-200 font-medium text-xs sm:text-sm break-all pr-2">{item.formula}</span>
                    </div>
                    <div className="text-right flex items-center gap-1 shrink-0 font-bold">
                      <span className="text-gray-500 text-xs">=</span>
                      <span className="text-[#dfaf37] font-black text-sm sm:text-base">₹{item.result}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-black/20 rounded-2xl text-[10px] sm:text-[11px] font-mono text-[#fcd975]/60 text-center border border-[#dfaf37]/10">
            💡 History profile linked to live account session: <span className="text-[#dfaf37] font-bold">@{currentUser}</span>
          </div>
        </div>

        {/* Right Side: Widescreen styled interactive Calculator Terminal */}
        <div className="col-span-12 lg:col-span-8 bg-[#0a0a09] rounded-3xl p-6 sm:p-8 border-2 border-[#dfaf37] flex flex-col justify-between shadow-2xl text-white relative min-h-[500px] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#dfaf37] to-transparent" />
          
          <div className="w-full flex flex-col justify-end space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[10px] font-black text-[#dfaf37] tracking-widest uppercase bg-neutral-900 border border-[#dfaf37]/40 px-3 py-1 rounded-full">
                👑 ROYAL HIGH-CAPACITY BILLING DESK
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                PRECISION MODE: Active
              </span>
            </div>

            {/* iOS style top formula preview - Enlarged */}
            <div className="h-6 text-right font-mono text-gray-400 pr-2 tracking-wider uppercase truncate text-sm sm:text-base font-semibold">
              {calcFormula || <span className="opacity-0">Formula Preview</span>}
            </div>

            {/* Display screen readout - Significantly Enlarged for Widescreen */}
            <div className="text-right text-4xl sm:text-6xl font-sans tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fcd975] to-[#dfaf37] py-2 pr-2 truncate font-mono select-all h-16 sm:h-24 flex items-center justify-end font-black drop-shadow-md border-b-2 border-[#dfaf37]/20 pb-4">
              {calcDisplay}
            </div>

            {/* Widescreen Responsive Calculator Buttons Grid */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-6 max-w-3xl mx-auto w-full">
              {/* Row 1 */}
              <button
                type="button"
                onClick={() => handleCalcPress("AC")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-neutral-800 text-[#dfaf37] hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center text-sm sm:text-xl font-black uppercase transition-all shadow-md duration-150 cursor-pointer active:scale-95 border border-[#dfaf37]/10"
              >
                AC
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("+/-")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-neutral-800 text-[#dfaf37] hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center text-sm sm:text-xl font-black transition-all shadow-md duration-150 cursor-pointer active:scale-95 border border-[#dfaf37]/10"
              >
                +/-
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("%")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-neutral-800 text-[#dfaf37] hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center text-sm sm:text-xl font-black transition-all shadow-md duration-150 cursor-pointer active:scale-95 border border-[#dfaf37]/10"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("÷")}
                className={`h-14 sm:h-20 lg:h-22 rounded-2xl text-black flex items-center justify-center text-lg sm:text-2xl font-black transition-all shadow-lg duration-150 cursor-pointer active:scale-95 border ${
                  calcFormula.endsWith("÷") ? "bg-[#fff] border-white text-[#FF9F0A]" : "bg-[#FF9F0A] border-[#FF9F0A] hover:bg-[#ffb43a] text-black"
                }`}
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                type="button"
                onClick={() => handleCalcPress("7")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("8")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("9")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("×")}
                className={`h-14 sm:h-20 lg:h-22 rounded-2xl text-black flex items-center justify-center text-lg sm:text-2xl font-black transition-all shadow-lg duration-150 cursor-pointer active:scale-95 border ${
                  calcFormula.endsWith("×") ? "bg-[#fff] border-white text-[#FF9F0A]" : "bg-[#FF9F0A] border-[#FF9F0A] hover:bg-[#ffb43a] text-black"
                }`}
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                type="button"
                onClick={() => handleCalcPress("4")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("5")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("6")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("-")}
                className={`h-14 sm:h-20 lg:h-22 rounded-2xl text-black flex items-center justify-center text-lg sm:text-2xl font-black transition-all shadow-lg duration-150 cursor-pointer active:scale-95 border ${
                  calcFormula.endsWith("-") ? "bg-[#fff] border-white text-[#FF9F0A]" : "bg-[#FF9F0A] border-[#FF9F0A] hover:bg-[#ffb43a] text-black"
                }`}
              >
                -
              </button>

              {/* Row 4 */}
              <button
                type="button"
                onClick={() => handleCalcPress("1")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("2")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("3")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("+")}
                className={`h-14 sm:h-20 lg:h-22 rounded-2xl text-black flex items-center justify-center text-lg sm:text-2xl font-black transition-all shadow-lg duration-150 cursor-pointer active:scale-95 border ${
                  calcFormula.endsWith("+") ? "bg-[#fff] border-white text-[#FF9F0A]" : "bg-[#FF9F0A] border-[#FF9F0A] hover:bg-[#ffb43a] text-black"
                }`}
              >
                +
              </button>

              {/* Row 5 */}
              <button
                type="button"
                onClick={() => handleCalcPress("0")}
                className="col-span-2 h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-start pl-6 sm:pl-10 text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress(".")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-[#1d1d1c]/80 text-white hover:bg-neutral-800 flex items-center justify-center text-base sm:text-2xl font-bold border border-white/5 transition-all shadow-md duration-150 cursor-pointer active:scale-95"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("=")}
                className="h-14 sm:h-20 lg:h-22 rounded-2xl bg-gradient-to-r from-[#dfaf37] to-[#b8860b] text-black hover:brightness-110 flex items-center justify-center text-lg sm:text-3xl font-black transition-all shadow-xl duration-150 cursor-pointer active:scale-95 border border-[#dfaf37]"
              >
                =
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
