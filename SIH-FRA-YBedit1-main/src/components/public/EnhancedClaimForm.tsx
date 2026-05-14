import React, { useRef, useState } from 'react';
import { supabaseClaimsService } from '../../services/supabaseClaimsService';
import { useAuth } from '../../contexts/AuthContext';
import { useTesseractOCR } from '../../hooks/useTesseractOCR';
import { extractFieldsFromText } from '../../utils/ocrExtract';
import { Upload, Eye, Loader2 } from 'lucide-react';

interface FileUploadProps {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
  currentFile: File | null;
  onFileSelected: (file: File) => void;
  error?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, name, required = false, accept = '', currentFile, onFileSelected, error = false }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      onFileSelected(file);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div className="mb-4">
      <label className="block text-sm text-forest-medium mb-2">
        {label}
        {required && <span className="text-error ml-1 text-xs">*</span>}
      </label>
      <div className={`group border ${error ? 'border-red-300' : 'border-green-200'} bg-white/80 rounded-lg transition-all duration-200 hover:border-green-400 shadow-sm p-3`} onDrop={handleDrop} onDragOver={handleDragOver}>
        <div className="flex items-center justify-between gap-3">
          <div className={`text-sm ${currentFile ? 'text-forest-dark' : 'text-forest-medium'} truncate`}>
            {currentFile ? currentFile.name : 'No file chosen'}
        </div>
          <div className="flex items-center gap-2">
            <button type="button" className="forest-button-secondary py-1 px-3" onClick={() => inputRef.current?.click()}>
              Choose file
            </button>
        </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelected(e.target.files[0]);
            }
          }}
        />
        {error && (
          <div className="mt-2 text-xs text-red-600">This document is required.</div>
        )}
      </div>
    </div>
  );
};

interface FormData {
  // Claim Details
  claimType: string;
  claimantName: string;
  guardianName: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  age: number | null;
  caste: string;

  // Location & Land
  village: string;
  district: string;
  state: string;
  landClaimed: string; // e.g. "2.5 hectares" or "3 acres"
  surveyOrGps: string; // Survey Number / GPS Coordinates

  // Mandatory Documents
  identityProof: File | null;
  tribeCertificate: File | null;
  fraFormA: File | null;
  gramSabhaResolution: File | null;
}

interface EnhancedClaimFormProps {
  onSubmitSuccess?: () => void;
}

const EnhancedClaimForm: React.FC<EnhancedClaimFormProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    claimType: '',
    claimantName: '',
    guardianName: '',
    gender: '',
    age: null,
    caste: '',
    village: '',
    district: '',
    state: '',
    landClaimed: '',
    surveyOrGps: '',
    identityProof: null,
    tribeCertificate: null,
    fraFormA: null,
    gramSabhaResolution: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [claimantNameInput, setClaimantNameInput] = useState<string>('');
  const [guardianNameInput, setGuardianNameInput] = useState<string>('');
  const [genderInput, setGenderInput] = useState<FormData['gender']>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [casteInput, setCasteInput] = useState<string>('');
  const [villageInput, setVillageInput] = useState<string>('');
  const [districtInput, setDistrictInput] = useState<string>('');
  const [stateInput, setStateInput] = useState<string>('');
  const [landClaimedInput, setLandClaimedInput] = useState<string>('');
  const [surveyOrGpsInput, setSurveyOrGpsInput] = useState<string>('');
  const { isProcessing, progress, runOnFile } = useTesseractOCR();
  const [sectionOcrFile, setSectionOcrFile] = useState<File | null>(null);
  const sharedOcrInputRef = useRef<HTMLInputElement>(null);
  const [manualText, setManualText] = useState<string>('');

  const applyExtracted = (text: string) => {
    const f = extractFieldsFromText(text);
    if (!touched.claimType && f.claimType) {
      setFormData(prev => ({ ...prev, claimType: f.claimType! }));
    }
    if (!touched.claimantName && f.claimantName) setClaimantNameInput(f.claimantName);
    if (!touched.guardianName && f.guardianName) setGuardianNameInput(f.guardianName);
    // Attempt to parse gender & age from a combined OCR field like "Male, 35"
    if (f.genderAge && !touched.gender) {
      const lower = f.genderAge.toLowerCase();
      if (lower.includes('male')) setGenderInput('Male');
      else if (lower.includes('female')) setGenderInput('Female');
      else if (lower.includes('other')) setGenderInput('Other');
      const num = (f.genderAge.match(/\d{1,3}/)?.[0]) || '';
      if (num && !touched.age) setAgeInput(num);
    }
    if (!touched.caste && f.caste) setCasteInput(f.caste);
    if (!touched.village && f.village) setVillageInput(f.village);
    if (!touched.district && f.district) setDistrictInput(f.district);
    if (!touched.state && f.state) setStateInput(f.state);
    const coords = f.surveyNumber ?? f.coordinates;
    if (!touched.surveyOrGps && coords) setSurveyOrGpsInput(coords);
    if (!touched.landClaimed && f.landClaimed) setLandClaimedInput(f.landClaimed);
  };

  const runSectionOCR = async () => {
    if (!sectionOcrFile) {
      sharedOcrInputRef.current?.click();
      return;
    }
    const text = await runOnFile(sectionOcrFile, 'eng');
    applyExtracted(text);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const setFileField = (field: keyof FormData) => (file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
    }));
  };

  // removed evidence checkbox logic as only 4 mandatory uploads are required

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      // explicit validation for four mandatory files
      if (!formData.identityProof || !formData.tribeCertificate || !formData.fraFormA || !formData.gramSabhaResolution) {
        setSubmitError('Please select all mandatory documents before submitting.');
        return;
      }
      // sync latest visible inputs into formData in case fields weren't blurred
      const synced = {
        claimantName: claimantNameInput,
        guardianName: guardianNameInput,
        gender: genderInput,
        age: ageInput ? Math.max(0, Math.min(120, Number(ageInput))) : null,
        caste: casteInput,
        village: villageInput,
        district: districtInput,
        state: stateInput,
        landClaimed: landClaimedInput,
        surveyOrGps: surveyOrGpsInput,
      };
      setFormData(prev => ({ ...prev, ...synced }));
      // Minimal payload to Supabase; map UI form to DB shape
      const areaNumber = parseFloat((synced.landClaimed || formData.landClaimed).replace(/[^0-9.]/g, '')) || 0;
      // Generate a short acknowledgment id (client-side) e.g., FRA-YYMMDD-xxxx
      const date = new Date();
      const yymmdd = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      const ackId = `FRA-${yymmdd}-${rand}`;

      const payload = {
        user_id: user?.id || 'public-guest',
        ack_id: ackId,
        village: synced.village || formData.village,
        area: areaNumber,
        coordinates: synced.surveyOrGps || formData.surveyOrGps,
        applicant_name: synced.claimantName || formData.claimantName,
        claim_type: formData.claimType || null,
        documents: [
          formData.identityProof ? 'identityProof' : '',
          formData.tribeCertificate ? 'tribeCertificate' : '',
          formData.fraFormA ? 'fraFormA' : '',
          formData.gramSabhaResolution ? 'gramSabhaResolution' : ''
        ].filter(Boolean),
        parent_name: synced.guardianName || formData.guardianName || null,
        // Normalize to lowercase to satisfy DB check
        gender: ((synced.gender || formData.gender) ? (synced.gender || formData.gender)!.toString().toLowerCase() : null),
        age: synced.age ?? formData.age ?? null,
        tribal_group: synced.caste || formData.caste || null,
        district: synced.district || formData.district || null,
        state: synced.state || formData.state || null,
        area_unit: (synced.landClaimed || formData.landClaimed).toLowerCase().includes('acre') ? 'acres' : 'hectares',
        survey_number: synced.surveyOrGps || formData.surveyOrGps || null
      } as const;
      console.log('Submitting claim payload:', payload);
      const claim = await supabaseClaimsService.create(payload);

      // Upload documents (3 MB enforced in service)
      if (user?.id && claim?.id) {
        const uploads: Array<[keyof typeof payload, File | null, 'identity_proof' | 'tribe_certificate' | 'claim_form_a' | 'gram_sabha_resolution']> = [
          ['identity_proof_url', formData.identityProof, 'identity_proof'],
          ['tribe_certificate_url', formData.tribeCertificate, 'tribe_certificate'],
          ['claim_form_a_url', formData.fraFormA, 'claim_form_a'],
          ['gram_sabha_resolution_url', formData.gramSabhaResolution, 'gram_sabha_resolution'],
        ];
        const urlUpdates: Record<string, string> = {};
        for (const [fieldKey, file, kind] of uploads) {
          if (!file) continue;
          const path = await supabaseClaimsService.uploadClaimDocument({ userId: user.id, claimId: claim.id, kind, file });
          urlUpdates[fieldKey as string] = path;
        }
        if (Object.keys(urlUpdates).length > 0) {
          await supabaseClaimsService.updateDocumentUrls(claim.id, urlUpdates as any);
        }
      }
      setSubmitted(true);
      // Show acknowledgment to user
      alert(`Your claim has been submitted. Acknowledgment ID: ${ackId}`);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(`Submission failed: ${message}`);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      claimType: '',
      claimantName: '',
      guardianName: '',
      gender: '',
      age: null,
      caste: '',
      village: '',
      district: '',
      state: '',
      landClaimed: '',
      surveyOrGps: '',
      identityProof: null,
      tribeCertificate: null,
      fraFormA: null,
      gramSabhaResolution: null,
    });
    setSectionOcrFile(null);
    setManualText('');
    setSubmitted(false);
    setSubmitError(null);
    setClaimantNameInput('');
    setGuardianNameInput('');
    setGenderInput('');
    setAgeInput('');
    setCasteInput('');
    setVillageInput('');
    setDistrictInput('');
    setStateInput('');
    setLandClaimedInput('');
    setSurveyOrGpsInput('');
  };

  // removed inline InputField and old FileUpload implementations to avoid remounts

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 animate-forest-fade-in bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-green-800">Form submitted</h2>
          <p className="mt-2 text-gray-600">Your claim has been recorded in the database.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={resetForm} className="forest-button-primary">Submit another claim</button>
        </div>
      </div>
  );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 animate-forest-fade-in bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="sr-only">Submit FRA Claim</h2>

      <input
        ref={sharedOcrInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.tif,.tiff,.bmp"
        className="hidden"
        onChange={(e) => setSectionOcrFile(e.target.files?.[0] || null)}
      />
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1.5 border border-gray-200 rounded-md cursor-pointer text-sm flex items-center gap-2 hover:bg-gray-50" onClick={() => sharedOcrInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
            Select Image for OCR
              </button>
              {sectionOcrFile && (
            <span className="text-xs text-gray-600 max-w-[240px] truncate" title={sectionOcrFile.name}>{sectionOcrFile.name}</span>
              )}
              <button type="button" onClick={runSectionOCR} disabled={!sectionOcrFile || isProcessing} className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-forest-spin"/> : <Eye className="h-4 w-4"/>}
                {isProcessing ? `Scanning ${progress}%` : 'Scan & Autofill'}
              </button>
            </div>
          </div>

      <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Or paste text to autofill</label>
            <div className="flex items-start gap-2">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-forest-primary"
            placeholder="Paste text here and click Parse"
              />
          <button type="button" onClick={() => { if (manualText.trim()) { applyExtracted(manualText); } }} className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">Parse</button>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <div className="text-sm text-gray-700 font-medium mb-2">Applicant Details</div>
          <div className="h-px w-full bg-gray-100 mb-4"></div>
        </div>
        <div className="md:col-span-2">
          <label className="forest-form-label">Type of Claim<span className="text-error ml-1 text-xs">*</span></label>
            <select
              name="claimType"
              value={formData.claimType}
            onChange={handleSelectChange}
              className="forest-select w-full"
            >
              <option value="">Select claim type</option>
              <option value="IFR">Individual Forest Rights (IFR)</option>
              <option value="CR">Community Rights (CR)</option>
              <option value="CFR">Community Forest Resource Rights (CFR)</option>
            </select>
          </div>

        <div>
          <label className="forest-form-label">Claimant Name<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={claimantNameInput} onChange={(e) => setClaimantNameInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, claimantName: true })); setFormData(prev => ({ ...prev, claimantName: claimantNameInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="forest-form-label">Father's/Mother's/Spouse's Name<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={guardianNameInput} onChange={(e) => setGuardianNameInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, guardianName: true })); setFormData(prev => ({ ...prev, guardianName: guardianNameInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
        </div>

        <div>
          <label className="forest-form-label">Gender<span className="text-error ml-1 text-xs">*</span></label>
          <select
            name="gender"
            value={genderInput}
            onChange={(e) => { setGenderInput(e.target.value as FormData['gender']); setFormData(prev => ({ ...prev, gender: e.target.value as FormData['gender'] })); setTouched(prev => ({ ...prev, gender: true })); }}
            className="forest-select w-full"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="forest-form-label">Age<span className="text-error ml-1 text-xs">*</span></label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={ageInput}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, '');
              setAgeInput(v);
              setSubmitError(null);
            }}
            onBlur={() => { setTouched(prev => ({ ...prev, age: true })); setFormData(prev => ({ ...prev, age: ageInput ? Math.max(0, Math.min(120, Number(ageInput))) : null })); }}
            className="forest-input"
          />
        </div>
        <div>
          <label className="forest-form-label">Caste / Tribal Group<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={casteInput} onChange={(e) => setCasteInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, caste: true })); setFormData(prev => ({ ...prev, caste: casteInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
        </div>

        <div>
          <label className="forest-form-label">Village<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={villageInput} onChange={(e) => setVillageInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, village: true })); setFormData(prev => ({ ...prev, village: villageInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
            </div>
        <div>
          <label className="forest-form-label">District<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={districtInput} onChange={(e) => setDistrictInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, district: true })); setFormData(prev => ({ ...prev, district: districtInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
          </div>
        <div>
          <label className="forest-form-label">State<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={stateInput} onChange={(e) => setStateInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, state: true })); setFormData(prev => ({ ...prev, state: stateInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
            </div>
        <div>
          <label className="forest-form-label">Land Claimed (area + unit)<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={landClaimedInput} onChange={(e) => setLandClaimedInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, landClaimed: true })); setFormData(prev => ({ ...prev, landClaimed: landClaimedInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
          </div>
        <div>
          <label className="forest-form-label">Survey Number / GPS Coordinates<span className="text-error ml-1 text-xs">*</span></label>
          <input type="text" value={surveyOrGpsInput} onChange={(e) => setSurveyOrGpsInput(e.target.value)} onBlur={() => { setTouched(prev => ({ ...prev, surveyOrGps: true })); setFormData(prev => ({ ...prev, surveyOrGps: surveyOrGpsInput })); }} className="block w-full px-4 py-3 text-forest-dark bg-white/80 border border-green-200 focus:border-green-600 rounded-md shadow-sm" />
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-700 font-medium mb-2">Mandatory Documents</div>
        <div className="h-px w-full bg-gray-100 mb-4"></div>
        <div className="space-y-4">
          <FileUpload label="Identity Proof" name="identityProof" required accept="image/*,application/pdf" currentFile={formData.identityProof} onFileSelected={(file) => { setSubmitError(null); setFileField('identityProof')(file); }} error={!formData.identityProof} />
          <FileUpload label="Tribe/Community Certificate" name="tribeCertificate" required accept="image/*,application/pdf" currentFile={formData.tribeCertificate} onFileSelected={(file) => { setSubmitError(null); setFileField('tribeCertificate')(file); }} error={!formData.tribeCertificate} />
          <FileUpload label="FRA Claim Form (Form-A)" name="fraFormA" required accept="image/*,application/pdf" currentFile={formData.fraFormA} onFileSelected={(file) => { setSubmitError(null); setFileField('fraFormA')(file); }} error={!formData.fraFormA} />
          <FileUpload label="Gram Sabha Resolution" name="gramSabhaResolution" required accept="image/*,application/pdf" currentFile={formData.gramSabhaResolution} onFileSelected={(file) => { setSubmitError(null); setFileField('gramSabhaResolution')(file); }} error={!formData.gramSabhaResolution} />
        </div>
      </div>

      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {submitError}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="forest-button-primary flex-1 justify-center"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Claim'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default EnhancedClaimForm;
