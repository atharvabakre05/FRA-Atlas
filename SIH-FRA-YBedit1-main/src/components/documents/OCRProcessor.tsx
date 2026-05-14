import React, { useState, useRef } from 'react';
import { Upload, FileText, Eye, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTesseractOCR } from '../../hooks/useTesseractOCR';
import { dataStore } from '../../services/dataStore';

interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

interface ExtractedData {
  [key: string]: string;
}

export const OCRProcessor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, progress, text, confidence, processingTimeMs, error, runOnFile, reset } = useTesseractOCR();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError('');
        setOcrResult(null);
        setExtractedData({});
      } else {
        setError('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;
    const recognized = await runOnFile(selectedFile, 'eng');
    const structuredData = extractStructuredData(recognized);
    setExtractedData(structuredData);
    setOcrResult({
      text: recognized,
      confidence: confidence ? Math.round(confidence) : 0,
      processingTime: processingTimeMs ? Math.round(processingTimeMs / 1000) : 0
    });
    try {
      await dataStore.addOcrResult({
        createdAt: new Date().toISOString(),
        source: 'upload',
        filename: selectedFile.name,
        text: recognized,
        confidence,
        processingTimeSec: processingTimeMs ? Math.round(processingTimeMs / 1000) : undefined,
        parsedFields: structuredData
      });
    } catch {}
  };

  const extractStructuredData = (text: string): ExtractedData => {
    const data: ExtractedData = {};
    
    // Common patterns for FRA documents
    const patterns = {
      name: /(?:name)[\s:]*([a-zA-Z\s]+)/i,
      age: /(?:age)[\s:]*(\d+)/i,
      village: /(?:village)[\s:]*([a-zA-Z\s]+)/i,
      area: /(?:area)[\s:]*([\d.]+)/i,
      coordinates: /(?:coordinates)[\s:]*([\d.,\s-]+)/i,
      claimType: /(?:claim type)[\s:]*([a-zA-Z\s]+)/i,
      date: /(?:date)[\s:]*([\d\/\-\.]+)/i,
      pattaNumber: /(?:patta number)[\s:]*([a-zA-Z0-9\s\/]+)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        data[key] = match[1].trim();
      }
    });

    return data;
  };

  const downloadText = () => {
    if (!ocrResult) return;

    const blob = new Blob([ocrResult.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadStructuredData = () => {
    if (Object.keys(extractedData).length === 0) return;

    const csvContent = [
      'Field,Value',
      ...Object.entries(extractedData).map(([key, value]) => `"${key}","${value}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_data_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="forest-card bg-gradient-to-r from-forest-sage/10 to-forest-medium/10 border-forest-medium/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest-dark mb-2">Tesseract OCR Processor</h1>
            <p className="text-forest-medium text-lg">Extract text and structured data from scanned FRA documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="forest-badge-success">
              <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse mr-2"></div>
              <span>AI-Powered (Demo Mode)</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="forest-card">
        <h3 className="text-lg font-semibold text-forest-dark mb-4">Upload Document Image</h3>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-forest-sage/30 rounded-lg p-8 text-center hover:border-forest-medium/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 text-forest-medium mx-auto mb-4" />
            <p className="text-forest-dark font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Click to upload image'}
            </p>
            <p className="text-sm text-forest-medium">
              Supports JPG, PNG, TIFF, and other image formats
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-forest-sage/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-forest-medium" />
                <div>
                  <p className="text-forest-dark font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-forest-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="forest-button-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-forest-spin" />
                    <span>Processing {progress}%</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Extract Text</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* OCR Results */}
      {ocrResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Text */}
          <div className="forest-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-forest-dark">Extracted Text</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-forest-medium">
                  Confidence: {ocrResult.confidence}%
                </span>
                <button
                  onClick={downloadText}
                  className="p-2 text-forest-medium hover:text-forest-dark rounded-lg hover:bg-forest-sage/10 transition-colors"
                  title="Download Text"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-forest-sage/5 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-forest-dark whitespace-pre-wrap font-mono">
                {ocrResult.text}
              </pre>
            </div>
            
            <div className="mt-4 text-xs text-forest-medium">
              Processing time: {ocrResult.processingTime}s
            </div>
          </div>

          {/* Structured Data */}
          <div className="forest-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-forest-dark">Structured Data</h3>
              {Object.keys(extractedData).length > 0 && (
                <button
                  onClick={downloadStructuredData}
                  className="p-2 text-forest-medium hover:text-forest-dark rounded-lg hover:bg-forest-sage/10 transition-colors"
                  title="Download CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {Object.keys(extractedData).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-forest-sage/5 rounded-lg">
                    <span className="text-forest-medium font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-forest-dark font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-forest-medium mx-auto mb-2" />
                <p className="text-forest-medium">No structured data detected</p>
                <p className="text-sm text-forest-medium mt-1">
                  The OCR text doesn't match common FRA document patterns
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="forest-card bg-forest-earth/10 border-forest-earth/30">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-forest-earth/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-forest-earth" />
          </div>
          <div>
            <h3 className="font-semibold text-forest-dark mb-2">Demo Mode</h3>
            <p className="text-sm text-forest-medium">
              This uses Tesseract.js to perform client-side OCR on uploaded images.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="forest-card bg-forest-earth/10 border-forest-earth/30">
        <h3 className="text-lg font-semibold text-forest-dark mb-4">How to Use OCR Processor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-forest-dark mb-2">Supported Documents:</h4>
            <ul className="text-sm text-forest-medium space-y-1">
              <li>• Scanned FRA claim forms</li>
              <li>• Land ownership documents</li>
              <li>• Identity certificates</li>
              <li>• Revenue records</li>
              <li>• Survey maps and sketches</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-forest-dark mb-2">Best Practices:</h4>
            <ul className="text-sm text-forest-medium space-y-1">
              <li>• Use high-resolution images (300+ DPI)</li>
              <li>• Ensure good lighting and contrast</li>
              <li>• Avoid shadows and reflections</li>
              <li>• Keep text horizontal and readable</li>
              <li>• Crop unnecessary background</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};