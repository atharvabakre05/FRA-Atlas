import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { seedClaimsIfEmpty } from './services/db';
import { Claim } from './services/claimsService';

// seed initial claims into IndexedDB (non-blocking)
(async () => {
  const seed: any[] = [];
  try {
    // attempt to read existing mock claims via claimsService.getClaims if available
    // dynamic import to avoid circular deps
    const mod = await import('./services/claimsService');
    const existing: Claim[] = mod.claimsService.getClaims();
    seed.push(
      ...existing.map(c => ({
        id: c.id!,
        userId: c.user_id,
        village: c.village,
        area: c.area,
        coordinates: c.coordinates,
        documentUrl: c.document_url,
        status: c.status,
        createdAt: c.created_at!,
        approvedAt: c.approved_at,
        applicantName: c.applicantName,
        claimType: c.claimType,
        documents: c.documents
      }))
    );
  } catch {}
  try { await seedClaimsIfEmpty(seed); } catch {}
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
