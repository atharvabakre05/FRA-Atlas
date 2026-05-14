import React from 'react';
import { AdminPanel } from './AdminPanel';

export const SLMCAdminPanel: React.FC = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-forest-deep">SLMC Admin Panel</h1>
        <p className="text-forest-medium">State Level Monitoring Committee</p>
      </div>
      <AdminPanel />
    </div>
  );
};

export default SLMCAdminPanel;

