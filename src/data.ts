import { ProcedureConfig } from "./types";

export const PROCEDURES: ProcedureConfig[] = [
  {
    id: "Rinoplastia",
    title: "Rinoplastia",
    tagline: "Escultura nasal precisa para máxima armonía facial",
    description: "Modificación estética de la pirámide nasal, refinando la punta, eliminando el caballete o giba y corrigiendo desviaciones, manteniendo siempre tu identidad y expresión natural.",
    area: "Rostro (Nariz)",
    sliders: [
      { id: "tipRefine", label: "Afinamiento de Punta Nasal", min: -25, max: 25, defaultValue: 0, unit: "%" },
      { id: "bridgeHump", label: "Reducción de Caballete (Giba)", min: -20, max: 20, defaultValue: 0, unit: "mm" },
      { id: "tipLift", label: "Rotación / Elevación de Punta", min: -15, max: 15, defaultValue: 0, unit: "°" }
    ],
    recoveryInfo: "Evolución favorable rápida. Uso de férula protectora los primeros 7 días. La inflamación principal disminuye en 2 semanas revelando un perfil totalmente simétrico y natural."
  },
  {
    id: "Mamoplastia",
    title: "Mamoplastia",
    tagline: "Volumen, proyección y elevación simétrica optimizada",
    description: "Modelado estético de mamas mediante incremento controlado de volumen o elevación (Mastopexia) para un contorno corporal proporcional, con transiciones suaves y naturales.",
    area: "Torso (Busto)",
    sliders: [
      { id: "breastVolume", label: "Aumento de Proyección / Volumen", min: -30, max: 30, defaultValue: 0, unit: "cc" },
      { id: "breastLift", label: "Elevación de Complejo (Lift)", min: -20, max: 20, defaultValue: 0, unit: "cm" }
    ],
    recoveryInfo: "Uso de sujetador postquirúrgico especial durante 1 mes. Evitar levantar cargas pesadas durante 3 semanas. Textura y movilidad idénticas a las naturales del tejido mamaria (not used but match anyway if needed)"
  },
  {
    id: "Abdominoplastia",
    title: "Abdominoplastia",
    tagline: "Reconstrucción y aplanamiento de pared abdominal",
    description: "Eliminación de flacidez cutánea, exceso de grasa abdominal y reconstrucción (plicatura) de los músculos rectos del abdomen para recuperar un perfil plano y firme.",
    area: "Abdomen",
    sliders: [
      { id: "abFlatness", label: "Aplanado de Pared Abdominal", min: -40, max: 40, defaultValue: 0, unit: "%" },
      { id: "waistTight", label: "Definición del Contorno de Cintura", min: -30, max: 30, defaultValue: 0, unit: "cm" }
    ],
    recoveryInfo: "Reposo relativo aconsejado en las primeras 2 semanas. Uso de faja de compresión por 4 semanas. Excelentes resultados de aplanamiento conservando la elasticidad cutánea natural."
  },
  {
    id: "Lipoescultura",
    title: "Lipoescultura",
    tagline: "Remodelación corporal en zonas de grasa localizada",
    description: "Evasión estética de grasa localizada en flancos, espalda and abdomen, tallando contornos sublimes con sombras musculares suaves de apariencia atlética y armónica.",
    area: "Corporal General",
    sliders: [
      { id: "lipidReduction", label: "Reducción de Tejido Adiposo", min: -45, max: 45, defaultValue: 0, unit: "%" },
      { id: "muscleDefinition", label: "Sombreado / Definición Corporal", min: -25, max: 25, defaultValue: 0, unit: "%" }
    ],
    recoveryInfo: "Uso de prenda de control elástica post-procedimiento. Los masajes de drenaje linfático optimizan el proceso. Resultados visibles en un mes con una estructura firme e iluminada de forma natural."
  },
  {
    id: "Gluteoplastia",
    title: "Gluteoplastia",
    tagline: "Volumen, proyección y elevación simétrica optimizada",
    description: "Proyección y elevación de la región glútea mediante modelado o lipotransferencia, logrando curvas naturales de transiciones anatómicas perfectas sin texturas artificiales.",
    area: "Glúteos",
    sliders: [
      { id: "gluteVolume", label: "Proyección / Volumen Glúteo", min: -35, max: 35, defaultValue: 0, unit: "%" },
      { id: "gluteLift", label: "Efecto Push-Up (Elevación)", min: -20, max: 20, defaultValue: 0, unit: "%" }
    ],
    recoveryInfo: "Evitar presión directa durante las primeras 2 semanas mediante almohada especial. Incorporación al trabajo físico progresivo. Resultados naturales sin pérdida de firmeza ni pliegues ficticios."
  },
  {
    id: "Rejuvenecimiento Facial",
    title: "Rejuvenecimiento Facial",
    tagline: "Lifting integral y firmeza estructural",
    description: "Rejuvenecimiento facial completo incluyendo cirugía de párpados (blefaroplastia), reducción de papada, realce de pómulos, reducción de arrugas y readaptación o reafirmación cutánea para recuperar la tensión juvenil del rostro.",
    area: "Rostro Completo",
    sliders: [
      { id: "skinFirmness", label: "Reafirmación de la Piel", min: -30, max: 30, defaultValue: 0, unit: "%" },
      { id: "featureRefine", label: "Afilamiento Cervicofacial y Párpados", min: -20, max: 20, defaultValue: 0, unit: "%" }
    ],
    recoveryInfo: "Cuidados post-operatorios enfocados en disminuir la inflamación. Uso de mentonera si aplica reducción de papada. Resultados evidentes y muy naturales en pocas semanas, logrando un aspecto descansado y vital."
  }
];
