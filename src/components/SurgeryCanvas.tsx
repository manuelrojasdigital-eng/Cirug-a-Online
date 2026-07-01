import React, { useRef, useState, useEffect } from "react";
import { 
  Upload, Scissors, Sparkles, Undo, Download,
  HelpCircle, Move, ChevronRight, AlertCircle, Info, Activity, ImageIcon, Loader2
} from "lucide-react";
import { ProcedureConfig } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SurgeryCanvasProps {
  selectedProcedure: ProcedureConfig;
  onAnalysisResult: (analysis: any) => void;
  isSubmittingRegistration: boolean;
  hasRegistered: boolean;
  onOpenRegister: () => void;
}

export default function SurgeryCanvas({ 
  selectedProcedure, 
  onAnalysisResult,
  hasRegistered,
  onOpenRegister
}: SurgeryCanvasProps) {
  const [image, setImage] = useState<string | null>(null);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  
  // Custom tool modes
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50); // percentage 0-100

  // AI assessment loader
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Use a canvas internally to downscale the image just in case it's huge, 
  // before sending to the backend, to save payload size.
  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = dataUrl;
    });
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImage(event.target.result as string);
          setImage(compressed);
          setSimulatedImage(null);
          setIsCompareMode(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImage(event.target.result as string);
          setImage(compressed);
          setSimulatedImage(null);
          setIsCompareMode(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
     // If the selected procedure changes, clear the simulated image so they can re-simulate
     setSimulatedImage(null);
     setIsCompareMode(false);
  }, [selectedProcedure]);


  const handleAISimulate = async () => {
    if (!image) return;
    setIsSimulating(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/simulate-surgery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: image,
          procedure: selectedProcedure.id,
          mimeType: "image/jpeg"
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Error al simular la imagen.");
      }

      const data = await response.json();
      setSimulatedImage(data.simulatedImage);
      setIsCompareMode(true);
      setCompareSplit(50);
      
      // Auto trigger the diagnostic dossier generation right after simulating
      handleAISmartEvaluate(data.simulatedImage);

    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "No se pudo realizar la simulación.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAISmartEvaluate = async (targetImageToAnalyze?: string) => {
    const dataToAnalyze = targetImageToAnalyze || simulatedImage || image;
    if (!dataToAnalyze) return;
    
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataToAnalyze,
          procedure: selectedProcedure.id,
          mimeType: "image/jpeg"
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Ocurrió un error consultando a la IA médica.");
      }

      const clientReport = await response.json();
      onAnalysisResult(clientReport);

      // Scroll smoothly to diagnostic panel
      setTimeout(() => {
        const element = document.getElementById("clinical-diagnostic-report");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);

    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "No se pudo realizar el análisis clínico.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadComparison = async () => {
    if (!image || !simulatedImage) return;
    
    // Create an offscreen canvas to merge both images side by side
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img1 = new Image();
    const img2 = new Image();

    // Load both images
    await Promise.all([
      new Promise(resolve => { img1.onload = resolve; img1.src = image; }),
      new Promise(resolve => { img2.onload = resolve; img2.src = simulatedImage; })
    ]);

    // Set side by side dimensions
    const w = img1.width;
    const h = img1.height;
    canvas.width = w * 2;
    canvas.height = h;

    // Draw images
    ctx.drawImage(img1, 0, 0, w, h);
    ctx.drawImage(img2, w, 0, w, h);

    // Draw labels
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(10, 10, 150, 40);
    ctx.fillRect(w + 10, 10, 180, 40);
    
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("ANTES", 30, 38);
    ctx.fillText("DESPUÉS", w + 30, 38);

    // Convert to JPG and download
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `comparacion_${selectedProcedure.id}_cirugia_online.jpg`;
    link.click();
  };

  return (
    <div id="surgical-simulator-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: The Simulator Viewers */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-[#0f0f0f] border border-white/5 rounded-sm overflow-hidden shadow-2xl relative">
          
          {/* Header Controls */}
          <div className="px-6 py-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-black/40 backdrop-blur-md z-10 relative">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
                Simulador IA Automático
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Before/After Split Compare Toggle */}
              {simulatedImage && (
                <button 
                  onClick={() => setIsCompareMode(!isCompareMode)} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${isCompareMode ? "bg-[#c5a059] text-black border-[#c5a059] font-semibold" : "text-white/40 border-white/10 hover:text-white hover:bg-white/5"}`}
                >
                  <span>Antes vs Después</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Simulation Window */}
          <div 
            className="relative flex items-center justify-center bg-black/60 min-h-[350px] sm:min-h-[450px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isSimulating && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 border border-[#c5a059]/20 rounded-sm">
                 <Loader2 className="w-10 h-10 text-[#c5a059] animate-spin mb-4" />
                 <h3 className="text-white font-serif text-lg uppercase tracking-widest mb-2">Simulando Resultado</h3>
                 <p className="text-white/50 text-[11px] max-w-sm leading-relaxed mb-4">
                   Nuestra inteligencia artificial médica está procesando la fotografía para proyectar un resultado realista y 100% natural de {selectedProcedure.title}.
                 </p>
              </div>
            )}

            {!image ? (
              // Empty state dropzone
              <div className="flex flex-col items-center text-center p-10 max-w-md w-full border border-dashed border-white/10 rounded-sm hover:border-[#c5a059]/40 hover:bg-white/[0.02] transition cursor-pointer relative group my-8">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] border border-white/10 group-hover:border-[#c5a059]/30 transition mb-4">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-white font-serif text-base mb-1.5 uppercase tracking-wider group-hover:text-[#c5a059] transition">
                  Cargar Fotografía Clave
                </h4>
                <p className="text-white/40 text-xs leading-relaxed mb-4 font-light">
                  Arrastra tu foto de referencia (rostro o cuerpo completo) o haz clic en este recuadro para explorar tus archivos.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[9px] font-mono rounded-sm border border-white/5 text-white/30 uppercase tracking-wider">
                  <Info className="w-3 h-3 text-[#c5a059]" />
                  Privacidad Asegurada
                </div>
              </div>
            ) : (
              // Loaded Image Container
              <div className="relative max-w-full overflow-hidden select-none group w-full h-full flex items-center justify-center min-h-[450px]">
                
                {simulatedImage ? (
                  <>
                    {/* Simulated Image (Base) */}
                    <img 
                      src={simulatedImage} 
                      alt="Simulación Clínica" 
                      className="absolute inset-0 w-full h-full object-contain block z-0" 
                    />
                    
                    {/* 1. Comparison Layer (Underneath Before Image) - Only shown in split slider mode */}
                    {isCompareMode && (
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden origin-top-left z-10"
                        style={{ clipPath: `polygon(0 0, ${compareSplit}% 0, ${compareSplit}% 100%, 0 100%)` }}
                      >
                        <img 
                           src={image} 
                           alt="Original" 
                           className="w-full h-full object-contain pointer-events-none" 
                        />
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/5 px-2 py-1 text-[9px] uppercase tracking-wider font-mono text-white/40 rounded-sm">
                          Antes (Original)
                        </div>
                      </div>
                    )}
                    
                    {/* Before vs After Sliding Line Overlay */}
                    {isCompareMode && (
                      <div className="absolute inset-0 z-20">
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-[#c5a059] cursor-ew-resize flex items-center justify-center pointer-events-none"
                          style={{ left: `${compareSplit}%` }}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#c5a059] border-4 border-[#0f0f0f] shadow-lg text-black flex items-center justify-center cursor-ew-resize">
                            <Move className="w-3 h-3" />
                          </div>
                        </div>
                        {/* Invisible slider interaction overlay across canvas */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={compareSplit} 
                          onChange={(e) => setCompareSplit(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                        />
                      </div>
                    )}

                    {!isCompareMode && (
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/5 px-2 py-1 text-[9px] uppercase tracking-wider font-mono text-[#c5a059] rounded-sm flex items-center gap-1.5 animate-fade-in z-20">
                        <Sparkles className="w-3 h-3 animate-spin text-[#c5a059]" />
                        IA Simulado
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Original Image Alone */}
                    <img src={image} className="max-h-[550px] max-w-full object-contain transition-all shadow-xl block rounded-sm relative z-0" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/5 px-2 py-1 text-[9px] uppercase tracking-wider font-mono text-white/40 rounded-sm z-20">
                      Original
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Footer for Uploader */}
          {image && (
            <div className="px-6 py-4 bg-black/30 border-t border-white/5 flex justify-between items-center text-xs text-white/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setImage(null);
                    setSimulatedImage(null);
                  }}
                  className="hover:text-white transition font-mono text-[9px] uppercase tracking-widest border border-white/10 py-1.5 px-3 rounded-sm hover:bg-white/5 cursor-pointer"
                >
                  Cambiar Fotografía
                </button>
              </div>

              {simulatedImage && (
                <button
                  onClick={handleDownloadComparison}
                  className="hover:bg-[#c5a059] hover:text-black transition font-mono text-[9px] uppercase tracking-widest border border-[#c5a059]/30 text-[#c5a059] py-1.5 px-3 rounded-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  Descargar Antes / Después (JPG)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Generation Tools */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Selected Procedure Spotlight */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-3 bg-[#c5a059]/10 border-l border-b border-white/5 text-[9px] font-mono text-[#c5a059] rounded-bl-sm uppercase tracking-widest font-semibold text-center">
             {selectedProcedure.area}
          </div>
          
          <h3 className="text-white font-serif text-2xl tracking-normal mb-1 font-light uppercase pr-16 leading-tight">
            {selectedProcedure.title}
          </h3>
          <p className="text-[10px] text-[#c5a059]/80 uppercase font-mono tracking-[0.2em] mb-3 font-semibold">
            {selectedProcedure.tagline}
          </p>
          <p className="text-white/40 text-[11px] leading-relaxed mb-4 font-light">
            {selectedProcedure.description}
          </p>
        </div>

        {/* Generative AI Tool Panel */}
        <div className="bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-serif tracking-widest uppercase text-xs">Transformación Inteligente</h4>
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
          </div>
          
          {!image ? (
            <div className="text-center py-8 bg-black/30 rounded border border-white/5 border-dashed">
              <ImageIcon className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-xs leading-relaxed font-light px-4">
                Sube tu fotografía para aplicar los resultados de la cirugía mediante nuestra IA.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-white/40 text-xs leading-relaxed font-light">
                Nuestro motor de IA procesará la fotografía, editará el área anatómica correspondiente a <strong>{selectedProcedure.title.toLowerCase()}</strong> preservando la integridad de la imagen y generará un resultado 100% natural.
              </p>

              {analysisError && (
                 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-sm text-xs mt-2">
                   {analysisError}
                 </div>
              )}

              <button 
                onClick={handleAISimulate}
                disabled={isSimulating}
                className={`w-full py-3.5 px-4 rounded-sm font-mono text-[11px] uppercase tracking-[0.15em] font-bold transition flex items-center justify-center gap-2 ${isSimulating ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/50" : "bg-[#c5a059] text-black hover:bg-white hover:text-black cursor-pointer shadow-lg"}`}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando Transformación...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generar Simulación Automática
                  </>
                )}
              </button>
              
              {simulatedImage && !isSimulating && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-xs mt-2 flex items-start gap-3">
                  <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">Dossier Clínico Analizado</span>
                    La vista comparativa y el reporte anatómico automático están listos en el panel inferior.
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
