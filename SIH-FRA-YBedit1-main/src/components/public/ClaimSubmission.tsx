import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import EnhancedClaimForm from './EnhancedClaimForm';

interface ClaimSubmissionProps {
  onSuccess?: () => void;
}

export const ClaimSubmission: React.FC<ClaimSubmissionProps> = ({ onSuccess }) => {
  const { showSuccess } = useToast();
  const { t } = useTranslation();

  const handleClaimSubmitted = () => {
    showSuccess(t('claims.submission.success', 'Claim submitted successfully!'));
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      <div className="decor-flowers"></div>
      <div className="relative z-10">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-200 text-green-700 bg-green-50 text-xs mb-2">FRA</div>
              <h2 className="text-xl font-semibold text-gray-900">Submit FRA Claim</h2>
              <p className="text-sm text-gray-600">Fill the details and upload mandatory documents</p>
            </div>
          </div>
        </div>
        <EnhancedClaimForm onSubmitSuccess={handleClaimSubmitted} />
      </div>
    </div>
  );
}