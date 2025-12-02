import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface AnalysisRequest {
    pseudocode: string;
}

export interface ResolutionStep {
    step: number;
    title: string;
    description: string;
    latex: string;
    explanation: string;
}

export interface AnalysisResponse {
    complexity_o: string;
    complexity_omega: string;
    complexity_theta: string;
    justification: string;
    justification_data: {
        worst_case_function: string;
        best_case_function: string;
        line_costs: Array<{
            line: number;
            description: string;
            cost: string;
        }>;
        resolution_steps: {
            worst_case: ResolutionStep[];
            best_case: ResolutionStep[];
        };
        conclusion: {
            worst_case: { dominant_term: string; complexity: string };
            best_case: { dominant_term: string; complexity: string };
            average_case: { complexity: string; description: string };
        };
    };
    validation: string | null;
    ast_image: string;
}

export interface ValidationRequest {
    pseudocode: string;
    complexity_o: string;
    complexity_omega: string;
    complexity_theta: string;
    justification: string;
}

export interface ValidationResponse {
    validation: string;
    status: 'completed' | 'error';
}

export const analyzePseudocode = async (pseudocode: string): Promise<AnalysisResponse> => {
    try {
        const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze`, { pseudocode });
        return response.data;
    } catch (error) {
        console.error("Error analyzing pseudocode:", error);
        throw error;
    }
};

/**
 * Valida el análisis con IA de forma asíncrona.
 * Se llama después de obtener los resultados principales.
 */
export const validateWithAI = async (request: ValidationRequest): Promise<ValidationResponse> => {
    try {
        const response = await axios.post<ValidationResponse>(`${API_URL}/validate`, request);
        return response.data;
    } catch (error) {
        console.error("Error validating with AI:", error);
        return {
            validation: "Error al conectar con el servicio de validación IA",
            status: 'error'
        };
    }
};
