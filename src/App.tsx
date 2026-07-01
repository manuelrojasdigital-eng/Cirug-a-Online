import React, { useState } from "react";
import { 
  Scissors, Activity, Sparkles, Clock, Lock, Plus, ChevronRight, 
  ShieldAlert, UserCheck, Heart, User, CheckCircle2, RefreshCw, BarChart, 
  Sliders, Star
} from "lucide-react";
import { PROCEDURES } from "./data";
import { ClinicalAnalysis, ProcedureConfig, ProcedureType } from "./types";
import SurgeryCanvas from "./components/SurgeryCanvas";
import RegistrationForm from "./components/RegistrationForm";
import AdminPanel from "./components/AdminPanel";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Check if admin mode is enabled via URL parameter
  const isAdmin = typeof window !== 'undefined' && window.location.search.includes("admin=true");

  // Selection states
  const [selectedProc, setSelectedProc] = useState<ProcedureConfig>(PROCEDURES[0]);
  
  // Registration and diagnostic report parameters
  const [patientData, setPatientData] = useState<any | null>(null);
  const [clinicalDoc, setClinicalDoc] = useState<ClinicalAnalysis | null>(null);

  // Administrative trigger to sync list count on creation
  const [adminSyncTrigger, setAdminSyncTrigger] = useState(0);

  const handleRegistrationSuccess = (data: any) => {
    setPatientData(data);
    setAdminSyncTrigger(prev => prev + 1);
  };

  const handleAnalysisResult = (report: ClinicalAnalysis) => {
    setClinicalDoc(report);
  };

  // Helper to get eligibility tag styles
  const getEligibilityBadgeStyle = (eligibility: string) => {
    switch (eligibility) {
      case "Excelente Candidato":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Apto con Precauciones":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
  };

  const hasRegistered = !!patientData;

  const scrollToRegistration = () => {
    const element = document.getElementById("clinical-registration-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] selection:bg-[#c5a059] selection:text-black pb-12 font-sans">
      
      {/* 1. Header Banner of "Cirugía Online" */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#c5a059] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-serif text-lg tracking-[0.2em] uppercase font-light">
                Cirugía <span className="text-[#c5a059]">Online</span>
              </h1>
              <span className="text-[9px] uppercase font-mono tracking-[0.15em] text-white/40 block -mt-1 font-bold">
                Simulador & Diagnóstico de IA
              </span>
            </div>
          </div>

          {/* Symmetrical Navigation Links as specified in the theme HTML */}
          <nav className="hidden lg:flex gap-8 text-[11px] uppercase tracking-[0.15em] text-white/50 font-mono">
            <span className="text-white border-b border-[#c5a059] pb-1 cursor-pointer">Simulador</span>
            <span className="hover:text-white transition cursor-pointer">Galería</span>
            <span className="hover:text-white transition cursor-pointer">Especialistas</span>
            <span className="hover:text-white transition cursor-pointer">Contacto</span>
          </nav>

          {/* Quick System Navigation Indicators */}
          <div className="hidden md:flex items-center gap-6 text-xs text-white/40 font-mono">
            {/* Indicators removed per user request */}
          </div>
        </div>
      </header>

      {/* 2. Brand Hero Segment Banner */}
      <section className="relative overflow-hidden py-10 md:py-16 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#c5a059] font-mono leading-none w-fit uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-[#c5a059]" />
              Visualiza los resultados de tu cirugía
            </div>
            <h2 className="text-white font-serif text-3xl md:text-5xl tracking-normal leading-tight font-light">
              Simulador Estético de <br className="hidden md:inline" />
              Resultados en Tiempo Real
            </h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl font-light">
              Carga tu foto de referencia, selecciona tu procedimiento y calibra los resultados de forma 100% natural. Nuestra tecnología de simulación por conservación conserva tus facciones originales, texturas de piel, iluminación ambiental e integridad geométrica.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 flex flex-col gap-10 mt-10">

        {/* 3. SURGERY PROCEDURES DIRECT SELECTOR (Tabs Grid) */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-medium font-mono">
                Seleccione Procedimiento Quirúrgico
              </h3>
              <p className="text-[10px] text-white/20 italic">Haz clic para calibrar su simulación anatómica específica</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROCEDURES.map((item) => {
              const isActive = selectedProc.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedProc(item);
                    setClinicalDoc(null);
                  }}
                  className={`p-3.5 rounded bg-[#0f0f0f] flex flex-col items-start gap-4 text-left transition border group/btn relative cursor-pointer overflow-hidden ${isActive ? "border-[#c5a059] bg-[#c5a059]/5 text-[#c5a059] shadow-[0_0_40px_rgba(197,160,89,0.05)]" : "border-white/5 text-white/60 hover:border-white/20 hover:bg-white/[0.02]"}`}
                >
                  {/* Decorative card glow */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#c5a059]/10 rounded-full blur-xl pointer-events-none"></div>
                  )}

                  <div className={`w-8 h-8 rounded border transition ${isActive ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30" : "bg-[#0a0a0a] text-white/30 border-white/5"}`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <Scissors className="w-3.5 h-3.5 rotate-45" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest block">
                      {item.title}
                    </h4>
                    <span className="text-[9px] text-white/30 font-mono block mt-0.5 uppercase tracking-wider">
                      {item.area}
                    </span>
                  </div>
                  
                  {isActive && (
                    <span className="absolute bottom-2.5 right-2.5 text-[#c5a059] text-[9px] font-mono uppercase bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 font-bold tracking-widest">
                      Activo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CLINICAL WORKSPACE CANVAS GRID */}
        <section className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 md:p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
          
          <SurgeryCanvas 
            selectedProcedure={selectedProc}
            onAnalysisResult={handleAnalysisResult}
            isSubmittingRegistration={false}
            hasRegistered={hasRegistered}
            onOpenRegister={scrollToRegistration}
          />
        </section>

        {/* 5. CLINICAL DIAGNOSTIC DOSSIER & PATIENT ADMISSION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: AI Diagnostic Dossier Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {clinicalDoc ? (
                <motion.div
                  id="clinical-diagnostic-report"
                  key="diagnostic-report"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                  {/* Blueprint grid accent background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.05),transparent)] pointer-events-none"></div>

                  {/* Document Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-white/5 relative z-10">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#c5a059] block font-bold mb-1">
                        IA Clínico Médico • Informe Preliminar
                      </span>
                      <h3 className="text-white font-serif text-2xl tracking-normal">
                        Dossier Analítico de Candidatura
                      </h3>
                      <div className="text-white/40 text-xs font-mono mt-1 uppercase tracking-wider">
                        Paciente: <span className="text-white font-sans font-medium">{patientData?.nombres || "Paciente Admitido"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 font-mono">
                      <span className="text-[9px] text-white/30 tracking-widest">INDICE DE APTITUD</span>
                      <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getEligibilityBadgeStyle(clinicalDoc.eligibility)}`}>
                        {clinicalDoc.eligibility}
                      </div>
                    </div>
                  </div>

                  {/* Document Dossier Sections */}
                  <div className="flex flex-col gap-6 relative z-10">
                    
                    {/* Summary */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#c5a059] font-bold">
                        1. Resumen de Estructura Anatómica
                      </h4>
                      <p className="text-white/80 text-xs leading-relaxed pl-4 border-l-2 border-[#c5a059]/20">
                        {clinicalDoc.structuralSummary}
                      </p>
                    </div>

                    {/* Landmarks / Marcadores */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#c5a059] font-bold">
                        2. Marcadores Físicos de Simulación
                      </h4>
                      <ul className="text-white/60 text-xs space-y-2.5 pl-4 md:pl-6 leading-relaxed">
                        {clinicalDoc.landmarks.map((mark, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#c5a059] shrink-0 mt-1 font-bold">✦</span>
                            <span>{mark}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recovery Road map */}
                    <div className="flex flex-col gap-3 pt-2">
                      <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#c5a059] font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                        3. Hoja de Ruta de Recuperación Post-Operatorio
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-4">
                        {clinicalDoc.recoveryTimeline.map((step, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-sm border border-white/5">
                            <div className="text-[9px] font-mono text-[#c5a059] font-bold mb-1 uppercase tracking-widest">
                              Fase 0{i + 1}
                            </div>
                            <p className="text-white/50 text-[10.5px] leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Dossier Footer Warning */}
                  <div className="mt-8 bg-white/[0.02] rounded-sm p-4 border border-white/5 text-[10.5px] text-white/40 leading-normal flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white/60 font-semibold font-mono tracking-wider">Advertencia Profesional Obligatoria:</span> Este análisis preliminar es generado por inteligencia artificial médica mediante simulación de pixeles de elasticidad y no sustituye en ningún caso el diagnóstico de un especialista certificado en un quirófano real. Consulte siempre con su cirujano local autorizado.
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="dossier-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0f0f0f]/30 border border-white/5 border-dashed rounded-sm p-8 py-14 text-center flex flex-col items-center justify-center min-h-[350px]"
                >
                  <Activity className="w-12 h-12 text-[#c5a059]/30 mb-4 animate-pulse" />
                  <h4 className="text-white font-serif text-lg mb-1.5 uppercase tracking-wider">Consola de Evaluación IA Inactiva</h4>
                  <p className="text-white/40 text-[11px] leading-relaxed max-w-sm mb-4 font-light">
                    Cuando cargues tu fotografía a la izquierda y presiones el botón "Analizar mi Fotografía con IA", nuestro simulador médico y el cerebro Gemini evaluarán tus rasgos para generar un dossier estético automatizado con marcas geométricas.
                  </p>
                  
                  {!hasRegistered && (
                    <button
                      onClick={scrollToRegistration}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition border border-[#c5a059]/30 rounded-sm font-mono text-[9px] uppercase font-semibold tracking-widest"
                    >
                      Completa tu Admisión Primero
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT AREA: Registration Admission Form */}
          <div id="clinical-registration-form" className="lg:col-span-5 h-full">
            <RegistrationForm 
              selectedProcedureId={selectedProc.id}
              onRegisteredSuccess={handleRegistrationSuccess}
            />
          </div>

        </div>

        {/* 6. ADMINISTRATIVE DRIVE DATABASE SYNCHRONIZER */}
        {isAdmin && (
          <section className="mt-8 border-t border-white/5 pt-10 animate-fade-in">
            <AdminPanel onRefreshTrigger={adminSyncTrigger} />
          </section>
        )}

      </main>

      {/* 7. Beautiful Elegant Footer */}
      <footer className="mt-20 border-t border-white/10 py-8 bg-[#050505] text-white/30 text-[10px] uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#c5a059] font-serif font-bold uppercase tracking-[0.2em] text-xs1">
              Cirugía <span className="text-[#c5a059]">Online</span>
            </span>
            <span className="text-white/10">|</span>
            <span>Estética Digital & Armonía Natural © 2026</span>
          </div>

          <div className="flex gap-6 font-mono text-[9px] text-white/20 uppercase tracking-[0.15em] items-center">
            <span>Engine v2.4.1</span>
            <span>Photorealistic Skin Renderer Active</span>
            <span className="text-[#c5a059] font-semibold">Privacidad Médica Encriptada</span>
            {/* Hidden admin toggle: clicking the lock icon prompts for password to view backend */}
            <Lock 
              className="w-3 h-3 text-white/10 hover:text-[#c5a059] transition cursor-pointer ml-4" 
              onClick={() => {
                if(!isAdmin) {
                  const pass = prompt("Contraseña de Administrador:");
                  if(pass === "1234") {
                    window.location.search = "?admin=true";
                  }
                } else {
                  window.location.search = "";
                }
              }}
            />
          </div>
        </div>
      </footer>

    </div>
  );
}
