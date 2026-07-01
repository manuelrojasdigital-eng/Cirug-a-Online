import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Scissors, CheckCircle, AlertCircle, 
  RefreshCw, Info, Lock, ChevronRight 
} from "lucide-react";
import { ProcedureType } from "../types";
import { PROCEDURES } from "../data";

interface RegistrationFormProps {
  selectedProcedureId: ProcedureType;
  onRegisteredSuccess: (patientData: any) => void;
}

export default function RegistrationForm({ 
  selectedProcedureId, 
  onRegisteredSuccess 
}: RegistrationFormProps) {
  // Form fields
  const [nombres, setNombres] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [procedimiento, setProcedimiento] = useState(selectedProcedureId);

  // States for verification & duplicate checks
  const [emailCheck, setEmailCheck] = useState<{ isDuplicate: boolean; checking: boolean; msg: string | null }>({
    isDuplicate: false,
    checking: false,
    msg: null
  });
  const [phoneCheck, setPhoneCheck] = useState<{ isDuplicate: boolean; checking: boolean; msg: string | null }>({
    isDuplicate: false,
    checking: false,
    msg: null
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync selected procedure from parent canvas trigger
  useEffect(() => {
    setProcedimiento(selectedProcedureId);
  }, [selectedProcedureId]);

  // Debounced Auto-validation of email duplicates
  useEffect(() => {
    if (!correo || !correo.includes("@") || !correo.includes(".")) {
      setEmailCheck({ isDuplicate: false, checking: false, msg: null });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setEmailCheck(prev => ({ ...prev, checking: true, msg: null }));
      try {
        const res = await fetch("/api/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo })
        });
        const data = await res.json();
        if (data.hasDuplicate && data.reasons.email) {
          setEmailCheck({ isDuplicate: true, checking: false, msg: data.reasons.email });
        } else {
          setEmailCheck({ isDuplicate: false, checking: false, msg: "✓ Correo disponible para admisión" });
        }
      } catch (err) {
        setEmailCheck({ isDuplicate: false, checking: false, msg: null });
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [correo]);

  // Debounced Auto-validation of phone duplicates
  useEffect(() => {
    if (telefono.length < 7) {
      setPhoneCheck({ isDuplicate: false, checking: false, msg: null });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setPhoneCheck(prev => ({ ...prev, checking: true, msg: null }));
      try {
        const res = await fetch("/api/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telefono })
        });
        const data = await res.json();
        if (data.hasDuplicate && data.reasons.phone) {
          setPhoneCheck({ isDuplicate: true, checking: false, msg: data.reasons.phone });
        } else {
          setPhoneCheck({ isDuplicate: false, checking: false, msg: "✓ Teléfono disponible para admisión" });
        }
      } catch (err) {
        setPhoneCheck({ isDuplicate: false, checking: false, msg: null });
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [telefono]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombres || !correo || !telefono || !procedimiento) {
      setFormError("Por favor completa todos los campos del panel de admisión.");
      return;
    }

    if (emailCheck.isDuplicate || phoneCheck.isDuplicate) {
      setFormError("Incapacidad de continuar: Se detectaron registros de duplicidad clínica activos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres,
          correo,
          telefono,
          ciudad,
          procedimiento
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error guardando el registro.");
      }

      setSuccess(true);
      onRegisteredSuccess(data.record);
    } catch (err: any) {
      setFormError(err.message || "Error de conexión saliente de la pasarela.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Decorative Golden Ambient Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent"></div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 py-0.5 bg-[#c5a059]/10 text-[#c5a059] text-[9px] rounded-sm border border-[#c5a059]/20 font-mono font-medium tracking-[0.15em] uppercase">
            REGISTRO DE ADMISIÓN
          </span>
        </div>
        <h3 className="text-white font-serif text-xl tracking-normal mb-1 font-light uppercase">
          Admisión Clínica Digital
        </h3>
        <p className="text-white/40 text-[11px] leading-normal font-light">
          Para realizar la simulación virtual o consultar a la IA médica, introduzca sus datos estéticos. El hospital validará duplicidades automáticamente.
        </p>
      </div>

      {success ? (
        <div className="py-6 text-center flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] shadow-lg shadow-[#c5a059]/10 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-white font-medium text-base uppercase tracking-wider">¡Paciente Registrado con Éxito!</h4>
          <p className="text-white/40 text-xs px-4 max-w-sm leading-relaxed font-light">
            Tu admisión médica está lista. Ahora puedes disfrutar de simulaciones faciales, interactuar con el lienzo de escultura y generar tu informe médico de IA con total libertad.
          </p>
          <div className="flex items-center gap-1.5 text-[#c5a059] text-[10px] font-mono uppercase tracking-widest select-all">
            <span>Sincronizado con base de datos en la Nube 24/7</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Nombres */}
          <div className="flex flex-col gap-1">
            <label className="text-white/30 text-[9px] uppercase tracking-widest font-mono">Nombres y Apellidos</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Nombres Completos"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 text-white py-2 text-xs outline-none focus:border-[#c5a059] transition-all placeholder:text-white/20 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Correo */}
            <div className="flex flex-col gap-1">
              <label className="text-white/30 text-[9px] uppercase tracking-widest font-mono">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={`w-full bg-transparent border-b text-xs py-2 outline-none transition-all placeholder:text-white/20 uppercase tracking-widest ${emailCheck.isDuplicate ? "border-red-500/50 focus:border-red-500 text-red-400" : "border-white/10 focus:border-[#c5a059]"}`}
                />
              </div>
              {/* Duplicate check info under mail */}
              {correo && (
                <div className={`text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 mt-0.5 ${emailCheck.checking ? "text-white/20" : emailCheck.isDuplicate ? "text-red-400" : "text-[#c5a059]"}`}>
                  {emailCheck.checking && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                  <span>{emailCheck.msg}</span>
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div className="flex flex-col gap-1">
              <label className="text-white/30 text-[9px] uppercase tracking-widest font-mono">Teléfono / WhatsApp</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/[^0-9+\s]/g, ""))}
                  className={`w-full bg-transparent border-b text-xs py-2 outline-none transition-all placeholder:text-white/20 uppercase tracking-widest ${phoneCheck.isDuplicate ? "border-red-500/50 focus:border-red-500 text-red-400" : "border-white/10 focus:border-[#c5a059]"}`}
                />
              </div>
              {/* Duplicate check phone */}
              {telefono && (
                <div className={`text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 mt-0.5 ${phoneCheck.checking ? "text-white/20" : phoneCheck.isDuplicate ? "text-red-400" : "text-[#c5a059]"}`}>
                  {phoneCheck.checking && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                  <span>{phoneCheck.msg}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ciudad */}
            <div className="flex flex-col gap-1">
              <label className="text-white/30 text-[9px] uppercase tracking-widest font-mono">Ciudad</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ciudad de residencia"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 text-white py-2 text-xs outline-none focus:border-[#c5a059] transition-all placeholder:text-white/20 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Procedimiento */}
            <div className="flex flex-col gap-1">
              <label className="text-white/30 text-[9px] uppercase tracking-widest font-mono">Procedimiento Deseado</label>
              <div className="relative">
                <select
                  value={procedimiento}
                  onChange={(e) => setProcedimiento(e.target.value as ProcedureType)}
                  className="w-full bg-transparent border-b border-white/10 text-white py-2 text-xs outline-none focus:border-[#c5a059] transition-all uppercase tracking-widest appearance-none cursor-pointer pr-6"
                >
                  {PROCEDURES.map(proc => (
                    <option key={proc.id} value={proc.id} className="bg-[#0a0a0a] text-white">
                      {proc.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[9px] select-none">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Form Error Messages */}
          {formError && (
            <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm text-red-400 text-[10.5px] uppercase tracking-wider flex gap-2 items-center animate-fade-in font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Guidelines disclaimer */}
          <div className="bg-white/[0.02] p-3.5 rounded-sm text-[10px] leading-relaxed text-white/40 border border-white/5 flex items-start gap-2.5 font-light">
            <Lock className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
            <div>
              <span className="text-[#c5a059] font-medium tracking-wider uppercase font-mono text-[9px] block mb-0.5">Cifrado Médico Encriptado</span>
              Su información es resguardada e integrada de manera segura 24/7 permitiendo la interoperabilidad autorizada con su historial en la nube.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || emailCheck.checking || phoneCheck.checking || emailCheck.isDuplicate || phoneCheck.isDuplicate}
              className={`w-full py-4 text-[10px] uppercase font-bold tracking-[0.3em] transition-all cursor-pointer ${isSubmitting ? "bg-white/10 text-white/70 cursor-wait" : "bg-[#c5a059] text-black hover:bg-[#d4b57a]"}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando Cloud Sync...</span>
                </div>
              ) : (
                <span>Guardar y Solicitar Cita</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-mono font-medium">Cloud Sync 24/7 Activo - Google Drive</span>
          </div>
        </form>
      )}
    </div>
  );
}
