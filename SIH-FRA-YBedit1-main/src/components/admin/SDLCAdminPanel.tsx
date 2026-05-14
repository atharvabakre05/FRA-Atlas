import React from 'react';
import { AdminPanel } from './AdminPanel';

// Wrapper to keep SDLC panel independent while reusing logic
export const SDLCAdminPanel: React.FC = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-forest-deep">SDLC Admin Panel</h1>
        <p className="text-forest-medium">Sub-Divisional Level Committee</p>
      </div>
      <AdminPanel />
    </div>
  );
};

export default SDLCAdminPanel;

