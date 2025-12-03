/**
 * NaturalLanguageModal.tsx
 * 
 * Modal para traducir descripciones en lenguaje natural a pseudocódigo estilo Cormen.
 * Utiliza IA (Google Gemini) para la conversión.
 * 
 * @author EffiCode Analyzer
 */
import { useState } from 'react';
import { translateNaturalToPseudocode } from '../../../services/api';
import './NaturalLanguageModal.css';

interface NaturalLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPseudocodeGenerated: (pseudocode: string) => void;
}

export const NaturalLanguageModal = ({ 
    isOpen, 
    onClose, 
    onPseudocodeGenerated 
}: NaturalLanguageModalProps) => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const handleTranslate = async () => {
        if (inputText.trim().length < 10) {
            setError('Por favor, ingrese una descripción más detallada (mínimo 10 caracteres).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await translateNaturalToPseudocode(inputText);
            
            if (response.status === 'error') {
                setError(response.warning);
            } else {
                setResult(response.pseudocode);
            }
        } catch {
            setError('Error inesperado al procesar la solicitud.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseCode = () => {
        if (result) {
            onPseudocodeGenerated(result);
            handleClose();
        }
    };

    const handleClose = () => {
        setInputText('');
        setError(null);
        setResult(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="nl-modal-overlay" onClick={handleClose}>
            <div className="nl-modal-content" onClick={e => e.stopPropagation()}>
                <div className="nl-modal-header">
                    <h2>
                        <span className="nl-icon">🤖</span>
                        Lenguaje Natural → Pseudocódigo
                    </h2>
                    <button className="nl-close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="nl-warning-banner">
                    <span className="nl-warning-icon">⚠️</span>
                    <div>
                        <strong>Funcionalidad con IA</strong>
                        <p>Este servicio utiliza Google Gemini para la conversión. 
                           El resultado puede requerir ajustes manuales.</p>
                    </div>
                </div>

                <div className="nl-modal-body">
                    <label htmlFor="natural-input">
                        Describa el algoritmo en lenguaje natural:
                    </label>
                    <textarea
                        id="natural-input"
                        className="nl-textarea"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ejemplo: Un algoritmo que busca un elemento en una lista ordenada dividiendo repetidamente el rango de búsqueda a la mitad hasta encontrar el elemento o determinar que no existe."
                        rows={5}
                        disabled={isLoading}
                    />

                    {error && (
                        <div className="nl-error">
                            <span>❌</span> {error}
                        </div>
                    )}

                    {result && (
                        <div className="nl-result">
                            <label>Pseudocódigo generado:</label>
                            <pre className="nl-code-preview">{result}</pre>
                            <p className="nl-result-warning">
                                ⚠️ Verifique la sintaxis antes de usar este código.
                            </p>
                        </div>
                    )}
                </div>

                <div className="nl-modal-footer">
                    <button 
                        className="nl-btn nl-btn-secondary" 
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    
                    {!result ? (
                        <button 
                            className="nl-btn nl-btn-primary" 
                            onClick={handleTranslate}
                            disabled={isLoading || inputText.trim().length < 10}
                        >
                            {isLoading ? (
                                <>
                                    <span className="nl-spinner"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Generar Pseudocódigo
                                </>
                            )}
                        </button>
                    ) : (
                        <>
                            <button 
                                className="nl-btn nl-btn-secondary" 
                                onClick={() => setResult(null)}
                            >
                                Reintentar
                            </button>
                            <button 
                                className="nl-btn nl-btn-success" 
                                onClick={handleUseCode}
                            >
                                <span>✓</span>
                                Usar este código
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NaturalLanguageModal;
