import { useCallback, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

export interface UseOCRResult {
  isProcessing: boolean;
  progress: number;
  text: string;
  confidence?: number;
  processingTimeMs?: number;
  error?: string;
  runOnFile: (file: File, lang?: string) => Promise<string>;
  reset: () => void;
}

export function useTesseractOCR(): UseOCRResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setText('');
    setConfidence(undefined);
    setProcessingTimeMs(undefined);
    setError(undefined);
  }, []);

  const runOnFile = useCallback(async (file: File, lang: string = 'eng') => {
    setIsProcessing(true);
    setError(undefined);
    setProgress(0);
    startTimeRef.current = Date.now();
    try {
      const apiUrl = (import.meta as any)?.env?.VITE_OCR_API_URL as string | undefined;
      if (apiUrl) {
        const form = new FormData();
        form.append('file', file);
        form.append('lang', lang);
        const resp = await fetch(apiUrl, { method: 'POST', body: form });
        if (!resp.ok) throw new Error(`OCR API error: ${resp.status}`);
        const payload = await resp.json();
        const apiText = payload?.text || '';
        setText(apiText);
        if (typeof payload?.confidence === 'number') setConfidence(payload.confidence);
        setProcessingTimeMs(Date.now() - startTimeRef.current);
        setIsProcessing(false);
        return apiText;
      }
      const { data } = await Tesseract.recognize(file, lang, {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress) {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      setText(data.text || '');
      setConfidence(data.confidence);
      setProcessingTimeMs(Date.now() - startTimeRef.current);
      setIsProcessing(false);
      return data.text || '';
    } catch (e: any) {
      const msg = e?.message || 'OCR failed';
      setError(msg);
      setIsProcessing(false);
      throw e;
    }
  }, []);

  return { isProcessing, progress, text, confidence, processingTimeMs, error, runOnFile, reset };
}


