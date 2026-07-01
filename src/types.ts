/**
 * Shared types for Cirugía Online
 */

export interface PatientRegistration {
  id: string;
  nombres: string;
  correo: string;
  telefono: string;
  ciudad: string;
  procedimiento: string;
  createdAt: string;
}

export type ProcedureType = 
  | 'Rinoplastia'
  | 'Mamoplastia'
  | 'Abdominoplastia'
  | 'Lipoescultura'
  | 'Gluteoplastia'
  | 'Rejuvenecimiento Facial';

export interface ProcedureConfig {
  id: ProcedureType;
  title: string;
  tagline: string;
  description: string;
  area: string;
  sliders: {
    id: string;
    label: string;
    min: number;
    max: number;
    defaultValue: number;
    unit: string;
  }[];
  recoveryInfo: string;
}

export interface ClinicalAnalysis {
  eligibility: 'Excelente Candidato' | 'Apto con Precauciones' | 'Requiere Consulta Presencial';
  ratingColor: string;
  structuralSummary: string;
  landmarks: string[];
  simulatedDetails: string;
  recoveryTimeline: string[];
}
