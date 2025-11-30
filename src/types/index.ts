// Tipos compartidos para toda la aplicación
// Estructura basada en Backend/Modelos/Analizador.py
// Incluye soporte para caso promedio (Cormen Cap. 5)

export interface ResolutionStep {
  step: number;
  title: string;
  description: string;
  latex: string;
  explanation: string;
}

export interface LineCost {
  line: number | null;
  description: string;
  cost: string;
}

export interface CaseConclusion {
  dominant_term: string;
  complexity: string;
}

export interface AverageCase {
  complexity: string;
  dominant_term?: string;
  description: string;
  distribution_assumed?: string;
  constant_factor?: string;
}

export interface Conclusion {
  worst_case: CaseConclusion;
  best_case: CaseConclusion;
  average_case: AverageCase;
}

export interface ResolutionSteps {
  worst_case: ResolutionStep[];
  best_case: ResolutionStep[];
  average_case?: ResolutionStep[];  // NUEVO: pasos del caso promedio
}

export interface JustificationData {
  worst_case_function?: string;
  best_case_function?: string;
  line_costs?: LineCost[];
  resolution_steps?: ResolutionSteps;
  conclusion?: Conclusion;
  // Campos adicionales para algoritmos recursivos
  recurrence_equation?: string;
  recursion_type?: string;
  method_used?: string;
  references?: string;
}

export interface AnalysisResult {
  complexity_o?: string;
  complexity_omega?: string;
  complexity_theta?: string;
  complexity_average?: string;  // NUEVO: complejidad del caso promedio
  justification?: string;
  justification_data?: JustificationData;
  validation?: string;
  ast_image?: string;
  is_valid?: boolean;
  errors?: string[];
  warnings?: string[];
}

export type CaseType = 'worst' | 'best' | 'average';  // NUEVO: incluir 'average'
