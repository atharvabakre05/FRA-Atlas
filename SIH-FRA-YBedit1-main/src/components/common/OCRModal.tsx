import React, { useRef, useState } from 'react';
import { Eye, Upload, Loader2, Download, X } from 'lucide-react';
import { useTesseractOCR } from '../../hooks/useTesseractOCR';
import { dataStore } from '../../services/dataStore';

interface OCRModalProps {
  open: boolean;
  onClose: () => void;
}

export const OCRModal: React.FC<OCRModalProps> = ({ open, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isProcessing, progress, text, confidence, processingTimeMs, error, runOnFile, reset } = useTesseractOCR();

  if (!open) return null;

  const start = async () => {
    if (!selectedFile) return;
    const extracted = await runOnFile(selectedFile, 'eng');
    await dataStore.addOcrResult({
      createdAt: new Date().toISOString(),
      source: 'upload',
      filename: selectedFile.name,
      text: extracted,
      confidence,
      processingTimeSec: processingTimeMs ? Math.round(processingTimeMs / 1000) : undefined,
    });
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const close = () => {
    reset();
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center" onClick={close}>
      <div className="forest-modal-content max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="forest-modal-header">
          <h2 className="forest-modal-title">OCR</h2>
          <button onClick={close} className="p-2 rounded-lg hover:bg-forest-sage/10"><X className="h-5 w-5"/></button>
        </div>
        <div className="forest-modal-body space-y-4">
          <div className="forest-card">
            <div className="border-2 border-dashed border-forest-sage/30 rounded-lg p-6 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <Upload className="h-10 w-10 text-forest-medium mx-auto mb-2" />
              <div className="text-sm text-forest-dark">{selectedFile ? selectedFile.name : 'Click to select image'}</div>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-forest-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                <button onClick={start} disabled={isProcessing} className="forest-button-primary flex items-center space-x-2">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-forest-spin"/> : <Eye className="h-4 w-4"/>}
                  <span>{isProcessing ? `Processing ${progress}%` : 'Run OCR'}</span>
                </button>
              </div>
            )}
          </div>
          {text && (
            <div className="forest-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-forest-medium">{confidence ? `Confidence: ${Math.round(confidence)}%` : ''}</div>
                <button onClick={downloadText} className="p-2 hover:bg-forest-sage/10 rounded-lg"><Download className="h-4 w-4"/></button>
              </div>
              <pre className="bg-forest-sage/5 rounded p-3 max-h-80 overflow-auto whitespace-pre-wrap text-sm">{text}</pre>
              {processingTimeMs && <div className="mt-2 text-xs text-forest-medium">Time: {Math.round(processingTimeMs/1000)}s</div>}
            </div>
          )}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}
        </div>
        <div className="forest-modal-footer">
          <button onClick={close} className="forest-button-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};



