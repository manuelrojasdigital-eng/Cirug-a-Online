import React, { useState, useEffect } from "react";
import { 
  Database, Download, Terminal, Search, Calendar, RefreshCw, Eye, Users, 
  MapPin, Clipboard, Check, Lock, Shield, FileSpreadsheet, ExternalLink 
} from "lucide-react";
import { PatientRegistration } from "../types";

interface AdminPanelProps {
  onRefreshTrigger?: number;
}

export default function AdminPanel({ onRefreshTrigger = 0 }: AdminPanelProps) {
  const [registrations, setRegistrations] = useState<PatientRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProcedure, setFilterProcedure] = useState("all");
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get base URL for sheets formula
  const getAppCsvUrl = () => {
    const origin = window.location.origin;
    return `${origin}/api/registrations/csv`;
  };

  const syncFormula = `=IMPORTDATA("${getAppCsvUrl()}")`;

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registrations");
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [onRefreshTrigger, isOpen]);

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(syncFormula);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filtered = registrations.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      item.nombres.toLowerCase().includes(query) || 
      item.correo.toLowerCase().includes(query) || 
      item.telefono.includes(query) ||
      (item.ciudad && item.ciudad.toLowerCase().includes(query));
    
    const matchesProcedure = filterProcedure === "all" || item.procedimiento === filterProcedure;

    return matchesQuery && matchesProcedure;
  });

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Decorative clinician header lines */}
      <div className="absolute top-0 right-0 p-3 bg-[#c5a059]/10 border-l border-b border-white/5 text-[9px] font-mono text-[#c5a059] rounded-bl-sm uppercase tracking-[0.15em] flex items-center gap-1.5 font-bold">
        <Shield className="w-3.5 h-3.5" />
        Nivel Consola Gubernamental
      </div>

      <div className="mb-6">
        <h3 className="text-white font-serif text-2xl tracking-normal mb-1 flex items-center gap-2">
          <Database className="w-6 h-6 text-[#c5a059]" />
          Sincronización & Respaldos 24/7
        </h3>
        <p className="text-white/40 text-xs leading-normal">
          Módulo de monitoreo administrativo para coordinadores médicos. Sincroniza en tiempo real todos los registros de admisiones estéticas directamente en tu Google Drive sin intermediarios.
        </p>
      </div>

      {/* Sync with Google Drive Section */}
      <div className="bg-[#0a0a0a] p-5 rounded-sm border border-white/5 mb-6 flex flex-col md:flex-row gap-5 items-start justify-between">
        <div className="flex-1">
          <h4 className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#c5a059]" />
            Integración de Tabla Inteligente en Google Drive (Sheets)
          </h4>
          <p className="text-white/40 text-[11px] leading-relaxed mb-3">
            Mantén tu base de datos clínica sincronizada 24/7 directamente en tu Google Sheets en la nube. Sigue estos simples pasos:
          </p>
          <ol className="text-white/30 text-[11px] list-decimal list-inside space-y-1 mb-2 font-light">
            <li>Crea o abre una hoja de cálculo en tu Google Drive.</li>
            <li>Haz doble clic en la primera celda superior izquierda (<span className="text-white font-semibold font-mono">A1</span>).</li>
            <li>Pega la fórmula dorada que ves a la derecha. Google Sheets sincronizará y cargará los registros automáticamente cada hora desde la nube de forma segura.</li>
          </ol>
        </div>

        {/* Sync Formula display card */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-sm p-4 w-full md:w-96 flex flex-col gap-3 relative overflow-hidden shrink-0">
          <div className="flex justify-between items-center font-mono">
            <span className="text-[9px] tracking-wider uppercase text-white/30">Fórmula de Enlace Drive</span>
            <div className="flex items-center gap-1 text-[9px] text-[#c5a059] bg-[#c5a059]/10 py-0.5 px-2 rounded-sm border border-[#c5a059]/20 uppercase tracking-widest">
              <span className="w-1 h-1 bg-[#c5a059] rounded-full animate-ping"></span>
              Live Sync 24/7
            </div>
          </div>
          <div className="font-mono text-[11px] p-2 text-white/80 bg-black/60 border border-white/5 rounded-sm select-all break-all leading-normal whitespace-pre-wrap">
            {syncFormula}
          </div>
          <div className="flex gap-2 font-mono">
            <button
              onClick={handleCopyFormula}
              className="flex-1 py-1.5 px-3 rounded-sm bg-[#c5a059] hover:bg-[#d4b57a] text-black text-[10px] font-semibold transition flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
              {isCopied ? "Copiado" : "Copiar"}
            </button>
            <a
              href="/api/registrations/csv"
              download
              className="py-1.5 px-3 rounded-sm bg-white/5 hover:bg-white/10 text-white text-[10px] transition flex items-center justify-center gap-1.5 border border-white/10 uppercase tracking-widest"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar CSV
            </a>
          </div>
        </div>
      </div>

      {/* Button to toggle registration grid drawer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-xs font-mono text-white/40">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#c5a059]" />
            <span>Admisiones Registradas: </span>
            <span className="text-white font-bold text-xs bg-black px-2 py-0.5 rounded-sm border border-white/5">{registrations.length}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if(!isOpen) fetchRegistrations();
          }}
          className="flex items-center gap-1.5 hover:text-[#d4b57a] transition text-[#c5a059] text-[10px] font-mono font-bold uppercase tracking-[0.15em] border border-[#c5a059]/25 py-2 px-4 rounded-sm hover:bg-[#c5a059]/5 cursor-pointer"
        >
          {isOpen ? "Cerrar Tablero Clínico" : "Ver Lista de Admisiones ↑"}
        </button>
      </div>

      {/* registrations grid data table */}
      {isOpen && (
        <div className="mt-6 border-t border-white/5 pt-6 animate-fade-in">
          
          {/* Filters & search bars */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center bg-[#0a0a0a] p-4 rounded-sm border border-white/5">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Buscar paciente o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 text-white py-1.5 pl-9 pr-4 text-xs outline-none focus:border-[#c5a059] transition placeholder:text-white/20 uppercase tracking-widest"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] text-white/30 whitespace-nowrap font-mono uppercase tracking-widest">Filtrar Cirugía:</span>
              <select
                value={filterProcedure}
                onChange={(e) => setFilterProcedure(e.target.value)}
                className="bg-transparent border-b border-white/10 text-white py-1.5 px-2 text-xs outline-none cursor-pointer focus:border-[#c5a059] uppercase tracking-wider font-mono"
              >
                <option value="all" className="bg-[#0a0a0a] text-white">Todos los procedimientos</option>
                <option value="Rinoplastia" className="bg-[#0a0a0a] text-white">Rinoplastia</option>
                <option value="Mamoplastia" className="bg-[#0a0a0a] text-white">Mamoplastia</option>
                <option value="Abdominoplastia" className="bg-[#0a0a0a] text-white">Abdominoplastia</option>
                <option value="Lipoescultura" className="bg-[#0a0a0a] text-white">Lipoescultura</option>
                <option value="Gluteoplastia" className="bg-[#0a0a0a] text-white">Gluteoplastia</option>
                <option value="Rejuvenecimiento Facial" className="bg-[#0a0a0a] text-white">Rejuvenecimiento Facial</option>
              </select>

              <button
                onClick={fetchRegistrations}
                className="p-1.5 border border-white/10 rounded-sm hover:text-white transition text-white/40 bg-white/5 cursor-pointer"
                title="Sincronizar manual"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Records Table view */}
          <div className="overflow-x-auto rounded-sm border border-white/5">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0a0a0a] border-b border-white/5 text-[9px] font-mono text-white/30 uppercase tracking-[0.15em]">
                  <th className="p-4 py-3">ID</th>
                  <th className="p-4 py-3">Nombre Completo</th>
                  <th className="p-4 py-3">Contacto Directo</th>
                  <th className="p-4 py-3">Procedimiento</th>
                  <th className="p-4 py-3">Ciudad / Región</th>
                  <th className="p-4 py-3">Registrado el</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-white/30">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#c5a059]" />
                      Consultando base de datos segura de Cirugía Online...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-white/30 font-mono text-xs">
                      No se encontraron admisiones clínicas para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/[0.01] text-white/85">
                      <td className="p-4 py-3.5 font-mono text-[9px] text-white/30">{item.id?.substring(0, 12)}...</td>
                      <td className="p-4 py-3.5 font-medium text-white">{item.nombres}</td>
                      <td className="p-4 py-3.5">
                        <div className="flex flex-col">
                          <span>{item.correo}</span>
                          <span className="text-[10px] text-white/30 font-mono">{item.telefono}</span>
                        </div>
                      </td>
                      <td className="p-4 py-3.5">
                        <span className="inline-flex py-0.5 px-2 rounded-sm bg-[#c5a059]/10 border border-[#c5a059]/15 text-[#c5a059] text-[9px] font-mono uppercase tracking-wider">
                          {item.procedimiento}
                        </span>
                      </td>
                      <td className="p-4 py-3.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          <span>{item.ciudad}</span>
                        </div>
                      </td>
                      <td className="p-4 py-3.5 font-mono text-[9px] text-white/30">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("es-ES") : "Sin fecha"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
